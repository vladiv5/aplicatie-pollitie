package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Politist;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PolitistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/politisti")
@CrossOrigin(origins = "http://localhost:3000")
public class PolitistController {

    @Autowired
    private PolitistRepository politistRepository;

    @GetMapping
    public List<Politist> getAllPolitisti() {
        return politistRepository.toataListaPolitisti(); // Metoda SQL nativă din repo-ul tău
    }

    @GetMapping("/cauta")
    public List<Politist> cautaPolitisti(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return politistRepository.toataListaPolitisti();
        }
        return politistRepository.cautaDupaInceput(termen);
    }

    // INSERT SQL
    @PostMapping
    public String addPolitist(@RequestBody Politist p) {
        politistRepository.adaugaPolitistManual(
                p.getNume(),
                p.getPrenume(),
                p.getGrad(),
                p.getFunctie(),
                p.getTelefon_serviciu()
        );
        return "Politist adăugat prin SQL!";
    }

    // UPDATE SQL
    @PutMapping("/{id}")
    public String updatePolitist(@PathVariable Integer id, @RequestBody Politist p) {
        // Actualizăm folosind metoda SQL nativă
        politistRepository.updatePolitist(
                id,
                p.getNume(),
                p.getPrenume(),
                p.getGrad(),
                p.getFunctie(),
                p.getTelefon_serviciu()
        );
        return "Politist modificat prin SQL!";
    }

    // DELETE SQL
    @DeleteMapping("/{id}")
    public String deletePolitist(@PathVariable Integer id) {
        politistRepository.stergePolitistManual(id);
        return "Politist șters prin SQL!";
    }

    @GetMapping("/{id}")
    public Politist getPolitistById(@PathVariable Integer id) {
        return politistRepository.findByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Polițistul nu există!"));
    }
}