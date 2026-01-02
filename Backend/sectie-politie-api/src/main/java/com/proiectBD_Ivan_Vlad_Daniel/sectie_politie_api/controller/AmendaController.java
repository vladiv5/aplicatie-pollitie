package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AmendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/amenzi")
@CrossOrigin(origins = "http://localhost:3000")
public class AmendaController {

    @Autowired
    private AmendaRepository amendaRepository;

    // --- VERIFICARE STERGERE (TEXT MODIFICAT) ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        Amenda amenda = amendaRepository.getAmendaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Amenda nu există!"));

        String stare = amenda.getStarePlata();

        if ("Neplatita".equalsIgnoreCase(stare)) {
            // TEXTUL NOU CERUT DE TINE:
            return new DeleteConfirmation(
                    false, "BLOCKED", "Ștergere Blocată - Debit Activ",
                    "Această amendă figurează ca NEPLĂTITĂ. Nu o puteți șterge din sistem, ci trebuie mai intai anulata sau platita.",
                    null
            );
        } else if ("Platita".equalsIgnoreCase(stare)) {
            return new DeleteConfirmation(
                    true, "WARNING", "Atenție - Ștergere Document Fiscal",
                    "Amenda a fost plătită. Ștergerea ei va elimina dovada plății din sistemul operativ.", null
            );
        } else {
            return new DeleteConfirmation(
                    true, "SAFE", "Ștergere Sigură",
                    "Amenda este anulată juridic. Poate fi ștearsă din baza de date.", null
            );
        }
    }

    @GetMapping
    public List<Amenda> getAllAmenzi() {
        return amendaRepository.getAllAmenziNative();
    }

    @GetMapping("/{id}")
    public Amenda getAmendaById(@PathVariable Integer id) {
        return amendaRepository.getAmendaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Amenda nu a fost gasita!"));
    }

    @GetMapping("/cauta")
    public List<Amenda> cautaAmenzi(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return amendaRepository.getAllAmenziNative();
        }
        return amendaRepository.cautaDupaInceput(termen);
    }

    // INSERT SQL
    @PostMapping
    public String createAmenda(@RequestBody Amenda amenda) {
        LocalDateTime data = amenda.getDataEmitere() != null ? amenda.getDataEmitere() : LocalDateTime.now();

        // Extragem FK
        Integer idPolitist = (amenda.getPolitist() != null) ? amenda.getPolitist().getIdPolitist() : null;
        Integer idPersoana = (amenda.getPersoana() != null) ? amenda.getPersoana().getIdPersoana() : null;

        amendaRepository.insertAmenda(
                amenda.getMotiv(),
                amenda.getSuma(),
                amenda.getStarePlata(),
                data,
                idPolitist,
                idPersoana
        );
        return "Amenda salvată prin SQL!";
    }

    // UPDATE SQL
    @PutMapping("/{id}")
    public String updateAmenda(@PathVariable Integer id, @RequestBody Amenda detalii) {
        amendaRepository.getAmendaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Amenda nu exista!"));

        Integer idPolitist = (detalii.getPolitist() != null) ? detalii.getPolitist().getIdPolitist() : null;
        Integer idPersoana = (detalii.getPersoana() != null) ? detalii.getPersoana().getIdPersoana() : null;

        amendaRepository.updateAmenda(
                id,
                detalii.getMotiv(),
                detalii.getSuma(),
                detalii.getStarePlata(),
                detalii.getDataEmitere(),
                idPolitist,
                idPersoana
        );
        return "Amenda modificată prin SQL!";
    }

    // --- DELETE AMENDA (CU MESAJ PERSONALIZAT) ---
    @DeleteMapping("/{id}")
    public String deleteAmenda(@PathVariable Integer id) {
        // Luam detalii inainte sa stergem pentru mesaj
        Amenda a = amendaRepository.getAmendaByIdNative(id).orElse(null);
        String info = (a != null) ? " (ID: " + id + ", Suma: " + a.getSuma() + " RON)" : "";

        amendaRepository.deleteAmendaNative(id);

        return "Amenda a fost ștearsă cu succes!";
    }

    // --- ENDPOINT PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Amenda> getAmenziPaginat(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Sortare: Data Emitere DESC (Cele mai recente sus)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere"));

        return amendaRepository.findAllNativePaginat(pageable);
    }
}