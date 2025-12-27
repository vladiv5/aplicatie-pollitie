package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/persoane")
@CrossOrigin(origins = "http://localhost:3000")
public class PersoanaController {

    @Autowired
    private PersoanaRepository persoanaRepository;

    @GetMapping
    public List<Persoana> getAllPersoane() {
        return persoanaRepository.findAll();
    }

    // 1. ADĂUGARE (Formular) - Am păstrat doar această metodă pentru POST
    @PostMapping
    public Persoana createPersoana(@RequestBody Persoana persoana) {
        return persoanaRepository.save(persoana);
    }

    @DeleteMapping("/{id}")
    public void deletePersoana(@PathVariable Integer id) {
        persoanaRepository.deleteById(id);
    }

    @GetMapping("/cauta")
    public List<Persoana> cautaPersoane(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return persoanaRepository.findAll();
        }
        // Apelăm metoda SQL din Repository
        return persoanaRepository.cautaDupaInceput(termen);
    }
}