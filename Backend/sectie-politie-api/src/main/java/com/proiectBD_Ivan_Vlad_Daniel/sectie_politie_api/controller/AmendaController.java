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

    // 1. GET ONE (Pentru a pre-completa formularul de editare)
    @GetMapping("/{id}")
    public Amenda getAmendaById(@PathVariable Integer id) {
        return amendaRepository.findById(id).orElse(null);
    }

    // 2. UPDATE (Pentru a salva modificările)
    @PutMapping("/{id}")
    public Amenda updateAmenda(@PathVariable Integer id, @RequestBody Amenda amendaNoua) {
        return amendaRepository.findById(id).map(amenda -> {
            amenda.setMotiv(amendaNoua.getMotiv());
            amenda.setSuma(amendaNoua.getSuma());
            amenda.setStarePlata(amendaNoua.getStarePlata());
            amenda.setDataEmitere(amendaNoua.getDataEmitere());

            // Aici e important: JPA va face update la Foreign Key doar pe baza ID-ului din obiect
            amenda.setPolitist(amendaNoua.getPolitist());
            amenda.setPersoana(amendaNoua.getPersoana());

            return amendaRepository.save(amenda);
        }).orElseThrow(() -> new RuntimeException("Amenda nu a fost găsită!"));
    }
}