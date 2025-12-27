package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Politist;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PolitistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.PathMatcher;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/politisti")
@CrossOrigin(origins = "http://localhost:3000")
public class PolitistController {

    @Autowired
    private PolitistRepository politistRepository;
    @Autowired
    private PathMatcher pathMatcher;

    // 1. GET
    @GetMapping
    public List<Politist> getAllPolitisti() {
        return politistRepository.toataListaPolitisti();
    }

    @GetMapping("/{id}")
    public Politist getPolitistById(@PathVariable Integer id) {
        return politistRepository.findById(id).get();
    }

    // 2. POST (Insert)
    @PostMapping
    public void createPolitist(@RequestBody Politist politist) {
        // Apelăm metoda noastră SQL de INSERT
        politistRepository.adaugaPolitistManual(
                politist.getNume(),
                politist.getPrenume(),
                politist.getGrad(),
                politist.getFunctie(),
                politist.getTelefon_serviciu()
        );
    }

    // 3. DELETE
    @DeleteMapping("/{id}")
    public void deletePolitist(@PathVariable Integer id) {
        politistRepository.stergePolitistManual(id);
    }

    // 4. UPDATE
    @PutMapping("/{id}")
    public void updatePolitist(@PathVariable Integer id, @RequestBody Politist politist) {
        politistRepository.updatePolitist(
                id,
                politist.getNume(),
                politist.getPrenume(),
                politist.getGrad(),
                politist.getFunctie(),
                politist.getTelefon_serviciu()
        );
    }

    // 5. SEARCH
    @GetMapping("/cauta")
    public List<Politist> searchPolitisti(@RequestParam String termen) {
        return politistRepository.cautaPolitistiDupaNume(termen);
    }
}