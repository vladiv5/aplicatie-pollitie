package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AmendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    // GET BY ID (Modelat dupa Incident)
    @GetMapping("/{id}")
    public Amenda getAmendaById(@PathVariable Integer id) {
        return amendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amenda nu a fost găsită cu id: " + id));
    }

    // CREATE (Modelat exact dupa Incident - primeste Entitatea, nu DTO)
    @PostMapping
    public Amenda createAmenda(@RequestBody Amenda amenda) {
        if (amenda.getDataEmitere() == null) {
            amenda.setDataEmitere(LocalDateTime.now());
        }
        return amendaRepository.save(amenda);
    }

    // UPDATE (Modelat dupa Incident)
    @PutMapping("/{id}")
    public Amenda updateAmenda(@PathVariable Integer id, @RequestBody Amenda detaliiAmenda) {
        Amenda amenda = amendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amenda nu există cu id: " + id));

        // Actualizam campurile simple
        amenda.setMotiv(detaliiAmenda.getMotiv());
        amenda.setSuma(detaliiAmenda.getSuma());
        amenda.setStarePlata(detaliiAmenda.getStarePlata());
        amenda.setDataEmitere(detaliiAmenda.getDataEmitere());

        // Actualizam relatiile (Politist si Persoana) - exact cum faci la Incident cu Adresa
        amenda.setPolitist(detaliiAmenda.getPolitist());
        amenda.setPersoana(detaliiAmenda.getPersoana());

        return amendaRepository.save(amenda);
    }

    @DeleteMapping("/{id}")
    public void deleteAmenda(@PathVariable Integer id) {
        amendaRepository.deleteById(id);
    }

    @GetMapping("/cauta")
    public List<Amenda> cautaAmenzi(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return amendaRepository.findAll();
        }
        return amendaRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/statistici")
    public List<Map<String, Object>> raportAmenzi() {
        return amendaRepository.raportAmenzi();
    }
}