package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Adresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AdresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adrese")
@CrossOrigin(origins = "http://localhost:3000")
public class AdresaController {
    @Autowired
    private AdresaRepository adresaRepository;

    @GetMapping
    public List<Adresa> getAllAdrese() {
        return adresaRepository.findAll();
    }

    @PostMapping
    public Adresa addAdresa(@RequestBody Adresa adresa) {
        return adresaRepository.save(adresa);
    }

    @DeleteMapping("/{id}")
    public void deleteAdresa(@PathVariable Integer id) {
        adresaRepository.deleteById(id);
    }

    // MODIFICAT: Acum folosește SQL-ul din Repository ("Starts With")
    @GetMapping("/cauta")
    public List<Adresa> cautaAdresa(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return adresaRepository.findAll();
        }
        return adresaRepository.cautaDupaInceput(termen);
    }

    // 1. PENTRU EDITARE: Aducem datele unei singure adrese
    @GetMapping("/{id}")
    public Adresa getAdresaById(@PathVariable Integer id) {
        return adresaRepository.findById(id).orElse(null);
    }

    // 2. PENTRU SALVARE MODIFICĂRI (UPDATE)
    @PutMapping("/{id}")
    public Adresa updateAdresa(@PathVariable Integer id, @RequestBody Adresa adresaNoua) {
        return adresaRepository.findById(id).map(adresa -> {
            adresa.setJudetSauSector(adresaNoua.getJudetSauSector());
            adresa.setLocalitate(adresaNoua.getLocalitate());
            adresa.setStrada(adresaNoua.getStrada());
            adresa.setNumar(adresaNoua.getNumar());
            adresa.setBloc(adresaNoua.getBloc());
            adresa.setApartament(adresaNoua.getApartament());
            return adresaRepository.save(adresa);
        }).orElse(null);
    }
}