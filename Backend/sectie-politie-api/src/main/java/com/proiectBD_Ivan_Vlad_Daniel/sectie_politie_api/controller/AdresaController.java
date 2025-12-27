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
}
