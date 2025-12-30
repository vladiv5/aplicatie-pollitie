package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persoane")
@CrossOrigin(origins = "http://localhost:3000")
public class PersoanaController {

    @Autowired
    private PersoanaRepository persoanaRepository;

    // SELECT SQL
    @GetMapping
    public List<Persoana> getAllPersoane() {
        return persoanaRepository.getAllPersoaneNative();
    }

    // SEARCH SQL
    @GetMapping("/cauta")
    public List<Persoana> cautaPersoane(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return persoanaRepository.getAllPersoaneNative();
        }
        return persoanaRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Persoana getPersoanaById(@PathVariable Integer id) {
        return persoanaRepository.getPersoanaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Persoana nu exista!"));
    }

    // INSERT SQL (MANUAL)
    @PostMapping
    public String addPersoana(@RequestBody Persoana p) {
        persoanaRepository.insertPersoana(
                p.getNume(),
                p.getPrenume(),
                p.getCnp(),
                p.getDataNasterii(),
                p.getTelefon()
        );
        return "Persoana adăugată cu succes prin SQL!";
    }

    // UPDATE SQL (MANUAL)
    @PutMapping("/{id}")
    public String updatePersoana(@PathVariable Integer id, @RequestBody Persoana p) {
        // Verificăm dacă există (opțional, dar bun pentru siguranță)
        persoanaRepository.getPersoanaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Persoana nu exista!"));

        persoanaRepository.updatePersoana(
                id,
                p.getNume(),
                p.getPrenume(),
                p.getCnp(),
                p.getDataNasterii(),
                p.getTelefon()
        );
        return "Persoana modificată cu succes prin SQL!";
    }

    // DELETE SQL (MANUAL)
    @DeleteMapping("/{id}")
    public String deletePersoana(@PathVariable Integer id) {
        persoanaRepository.deletePersoanaNative(id);
        return "Persoana ștearsă prin SQL!";
    }
}