package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AmendaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*; // Importam validarile
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
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

    // --- VERIFICARE STERGERE ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        Amenda amenda = amendaRepository.getAmendaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Amenda nu există!"));
        String stare = amenda.getStarePlata();

        if ("Neplatita".equalsIgnoreCase(stare)) {
            return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată - Debit Activ", "Această amendă figurează ca NEPLĂTITĂ.", null);
        } else if ("Platita".equalsIgnoreCase(stare)) {
            return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere Document Fiscal", "Amenda a fost plătită. Ștergerea ei va elimina dovada.", null);
        } else {
            return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Amenda este anulată juridic. Poate fi ștearsă.", null);
        }
    }

    // --- GET METHODS ---
    @GetMapping
    public List<Amenda> getAllAmenzi() { return amendaRepository.getAllAmenziNative(); }

    @GetMapping("/{id}")
    public Amenda getAmendaById(@PathVariable Integer id) {
        return amendaRepository.getAmendaByIdNative(id).orElseThrow(() -> new RuntimeException("Amenda nu a fost gasita!"));
    }

    @GetMapping("/cauta")
    public List<Amenda> cautaAmenzi(@RequestParam String termen) {
        return (termen == null || termen.trim().isEmpty()) ? amendaRepository.getAllAmenziNative() : amendaRepository.cautaDupaInceput(termen);
    }

    // --- INSERT SQL (DTO) ---
    @PostMapping
    public ResponseEntity<?> createAmenda(@Valid @RequestBody AmendaRequest req) {
        Map<String, String> eroriLogice = new HashMap<>();

        // 1. Validare Data (15 ani)
        LocalDateTime data;
        try {
            data = LocalDateTime.parse(req.dataEmitere);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("dataEmitere", "Format dată invalid!"));
        }
        if (!isDataValida(data)) {
            eroriLogice.put("dataEmitere", "Dată invalidă (> 15 ani vechime sau viitor).");
        }

        // 2. REGULA NOUA: Multiplu de 25
        // Verificam: suma % 25 != 0
        if (req.suma != null && req.suma.remainder(new BigDecimal("25")).compareTo(BigDecimal.ZERO) != 0) {
            eroriLogice.put("suma", "Suma trebuie să fie un multiplu de 25 (ex: 100, 125, 250)!");
        }

        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        amendaRepository.insertAmenda(
                req.motiv,
                req.suma,
                req.starePlata,
                data,
                req.idPolitist,
                req.idPersoana
        );
        return ResponseEntity.ok("Amenda salvată cu succes!");
    }

    // --- UPDATE SQL (DTO) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAmenda(@PathVariable Integer id, @Valid @RequestBody AmendaRequest req) {
        amendaRepository.getAmendaByIdNative(id).orElseThrow(() -> new RuntimeException("Amenda nu exista!"));

        Map<String, String> eroriLogice = new HashMap<>();

        // 1. Validare Data
        LocalDateTime data;
        try {
            data = LocalDateTime.parse(req.dataEmitere);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("dataEmitere", "Format dată invalid!"));
        }
        if (!isDataValida(data)) {
            eroriLogice.put("dataEmitere", "Dată invalidă (> 15 ani vechime sau viitor).");
        }

        // 2. REGULA NOUA: Multiplu de 25
        if (req.suma != null && req.suma.remainder(new BigDecimal("25")).compareTo(BigDecimal.ZERO) != 0) {
            eroriLogice.put("suma", "Suma trebuie să fie un multiplu de 25!");
        }

        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        amendaRepository.updateAmenda(
                id,
                req.motiv,
                req.suma,
                req.starePlata,
                data,
                req.idPolitist,
                req.idPersoana
        );
        return ResponseEntity.ok("Amenda modificată cu succes!");
    }

    // --- DELETE ---
    @DeleteMapping("/{id}")
    public String deleteAmenda(@PathVariable Integer id) {
        amendaRepository.deleteAmendaNative(id);
        return "Amenda a fost ștearsă cu succes!";
    }

    // --- PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Amenda> getAmenziPaginat(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return amendaRepository.findAllNativePaginat(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere")));
    }

    // --- HELPER & DTO ---
    private boolean isDataValida(LocalDateTime data) {
        if (data == null) return false;
        LocalDateTime acum = LocalDateTime.now();
        LocalDateTime limitaTrecut = acum.minusYears(15);
        return data.isAfter(limitaTrecut) && data.isBefore(acum.plusDays(1));
    }

    public static class AmendaRequest {
        @NotBlank(message = "Motivul este obligatoriu!")
        // REGULA: Doar litere si spatii
        @Pattern(regexp = "^[a-zA-ZăâîșțĂÂÎȘȚ ]+$", message = "Motivul poate conține doar litere și spații.")
        public String motiv;

        @NotNull(message = "Suma este obligatorie!")
        @Positive(message = "Suma trebuie să fie pozitivă!")
        // REGULA: Max 3000
        @Max(value = 3000, message = "Suma maximă este 3000 RON.")
        public BigDecimal suma;

        @NotBlank(message = "Starea este obligatorie!")
        public String starePlata;

        public String dataEmitere;
        public Integer idPolitist;
        public Integer idPersoana;
    }
}