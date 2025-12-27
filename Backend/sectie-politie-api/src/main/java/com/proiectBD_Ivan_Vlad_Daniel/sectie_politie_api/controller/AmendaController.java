package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AmendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/amenzi")
@CrossOrigin(origins = "http://localhost:3000")
public class AmendaController {
    @Autowired
    private AmendaRepository amendaRepository;

    @GetMapping
    public List<Amenda> getAllAmenzi() {
        return amendaRepository.findAll();
    }

    // --- NOUL ENDPOINT DE CĂUTARE ---
    @GetMapping("/cauta")
    public List<Amenda> cautaAmenzi(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return amendaRepository.findAll();
        }
        return amendaRepository.cautaDupaInceput(termen);
    }

    @PostMapping
    public Amenda addAmenda(@RequestBody Amenda amenda) {
        // Asigurăm data curentă dacă nu e trimisă
        if (amenda.getDataEmitere() == null) {
            amenda.setDataEmitere(java.time.LocalDateTime.now());
        }
        return amendaRepository.save(amenda);
    }

    @DeleteMapping("/{id}")
    public void deleteAmenda(@PathVariable Integer id) {
        amendaRepository.deleteById(id);
    }

    @GetMapping("/statistici")
    public List<Map<String, Object>> raportAmenzi() {
        return amendaRepository.raportAmenzi();
    }
}