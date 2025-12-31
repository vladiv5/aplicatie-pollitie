package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Adresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AdresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;

@RestController
@RequestMapping("/api/adrese")
@CrossOrigin(origins = "http://localhost:3000")
public class AdresaController {

    @Autowired
    private AdresaRepository adresaRepository;

    @GetMapping
    public List<Adresa> getAllAdrese() {
        return adresaRepository.getAllAdreseNative();
    }

    @GetMapping("/cauta")
    public List<Adresa> cautaAdrese(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return adresaRepository.getAllAdreseNative();
        }
        return adresaRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Adresa getAdresaById(@PathVariable Integer id) {
        return adresaRepository.getAdresaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Adresa nu exista!"));
    }

    // INSERT SQL
    @PostMapping
    public String addAdresa(@RequestBody Adresa a) {
        adresaRepository.insertAdresa(
                a.getJudetSauSector(),
                a.getLocalitate(),
                a.getStrada(),
                a.getNumar(),
                a.getBloc(),
                a.getApartament()
        );
        return "Adresa salvată prin SQL!";
    }

    // UPDATE SQL
    @PutMapping("/{id}")
    public String updateAdresa(@PathVariable Integer id, @RequestBody Adresa a) {
        adresaRepository.getAdresaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Adresa nu exista!"));

        adresaRepository.updateAdresa(
                id,
                a.getJudetSauSector(),
                a.getLocalitate(),
                a.getStrada(),
                a.getNumar(),
                a.getBloc(),
                a.getApartament()
        );
        return "Adresa actualizată prin SQL!";
    }

    // DELETE SQL
    @DeleteMapping("/{id}")
    public String deleteAdresa(@PathVariable Integer id) {
        adresaRepository.deleteAdresaNative(id);
        return "Adresa ștearsă prin SQL!";
    }

    // --- ENDPOINT PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Adresa> getAdresePaginat(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Sortare Tripla: Localitate -> Judet -> Strada
        // Nota: Folosim numele coloanelor din Baza de Date pentru siguranta la Query Nativ
        Sort sortare = Sort.by(Sort.Direction.ASC, "localitate")
                .and(Sort.by(Sort.Direction.ASC, "judet_sau_sector"))
                .and(Sort.by(Sort.Direction.ASC, "strada"));

        Pageable pageable = PageRequest.of(page, size, sortare);

        return adresaRepository.findAllNativePaginat(pageable);
    }
}