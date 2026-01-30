package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AmendaRepository;
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
import org.springframework.data.domain.Sort;

/**
 * Controller for managing Fines (CRUD + Mathematical Validation).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@RestController
@RequestMapping("/api/amenzi")
@CrossOrigin(origins = "http://localhost:3000")
public class AmendaController {

    @Autowired
    private AmendaRepository amendaRepository;

    // --- VALIDATION HELPER (BUSINESS LOGIC) ---
    private Map<String, String> valideazaAmenda(AmendaRequest req) {
        Map<String, String> errors = new HashMap<>();

        // 1. Validation for Reason
        if (req.motiv == null || req.motiv.trim().isEmpty()) {
            errors.put("motiv", "Fine reason is mandatory!");
        } else if (req.motiv.length() > 255) {
            errors.put("motiv", "Max 255 chars!");
        } else if (req.motiv.matches(".*\\d.*")) {
            errors.put("motiv", "Reason cannot contain digits!");
        }

        // 2. Validation for Amount (Range 50-3000, Multiple of 25)
        // I enforced these specific mathematical rules to simulate real-world legal constraints.
        if (req.suma == null) {
            errors.put("suma", "Amount is mandatory!");
        } else {
            BigDecimal min = new BigDecimal("50");
            BigDecimal max = new BigDecimal("3000");
            BigDecimal multiplu = new BigDecimal("25");

            boolean inRange = req.suma.compareTo(min) >= 0 && req.suma.compareTo(max) <= 0;
            boolean isMultiplu = req.suma.remainder(multiplu).compareTo(BigDecimal.ZERO) == 0;

            if (!inRange || !isMultiplu) {
                errors.put("suma", "Amount must be a multiple of 25 and between 50 and 3000 RON.");
            }
        }

        // 3. Date Validation
        try {
            if (req.dataEmitere == null || req.dataEmitere.trim().isEmpty()) {
                errors.put("dataEmitere", "Issue date is mandatory!");
            } else {
                LocalDateTime data = LocalDateTime.parse(req.dataEmitere);
                if (!isDataValida(data)) {
                    errors.put("dataEmitere", "Fine date is either too old (>15 years) or in the future!");
                }
            }
        } catch (Exception e) {
            errors.put("dataEmitere", "Invalid date format!");
        }

        return errors;
    }

    // --- INSERT ---
    @PostMapping
    public ResponseEntity<?> createAmenda(@RequestBody AmendaRequest req) {
        Map<String, String> errors = valideazaAmenda(req);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        LocalDateTime data = LocalDateTime.parse(req.dataEmitere);

        // I insert the fine into the database using the repository.
        amendaRepository.insertAmenda(
                req.motiv, req.suma, req.starePlata, data, req.idPolitist, req.idPersoana
        );
        Integer newId = amendaRepository.getLastInsertedId();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Fine saved successfully!");
        response.put("idAmenda", newId);

        return ResponseEntity.ok(response);
    }

    // --- UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAmenda(@PathVariable Integer id, @RequestBody AmendaRequest req) {
        amendaRepository.getAmendaByIdNative(id).orElseThrow(() -> new RuntimeException("Fine does not exist!"));

        Map<String, String> errors = valideazaAmenda(req);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        LocalDateTime data = LocalDateTime.parse(req.dataEmitere);

        amendaRepository.updateAmenda(
                id, req.motiv, req.suma, req.starePlata, data, req.idPolitist, req.idPersoana
        );

        Amenda updated = amendaRepository.getAmendaByIdNative(id).orElse(null);
        return ResponseEntity.ok(updated);
    }

    // --- DELETE VERIFICATION ---
    // I implemented logic to prevent deletion of unpaid fines to maintain fiscal integrity.
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        Amenda amenda = amendaRepository.getAmendaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Fine does not exist!"));
        String stare = amenda.getStarePlata();

        if ("Neplatita".equalsIgnoreCase(stare)) {
            return new DeleteConfirmation(false, "BLOCKED", "Deletion Blocked", "This fine is unpaid and cannot be removed from the system!", null);
        } else if ("Platita".equalsIgnoreCase(stare)) {
            return new DeleteConfirmation(true, "WARNING", "Warning - Fiscal Document", "This fine was paid. Deleting it removes fiscal proof!", null);
        } else {
            return new DeleteConfirmation(true, "SAFE", "Safe Deletion", "Fine is legally void/cancelled. Safe to delete!", null);
        }
    }

    // --- Standard GET/DELETE Methods ---
    @GetMapping
    public List<Amenda> getAllAmenzi() { return amendaRepository.getAllAmenziNative(); }

    @GetMapping("/{id}")
    public Amenda getAmendaById(@PathVariable Integer id) {
        return amendaRepository.getAmendaByIdNative(id).orElseThrow(() -> new RuntimeException("Fine not found!"));
    }

    @GetMapping("/cauta")
    public List<Amenda> cautaAmenzi(@RequestParam String termen) {
        return (termen == null || termen.trim().isEmpty()) ? amendaRepository.getAllAmenziNative() : amendaRepository.cautaDupaInceput(termen);
    }

    @DeleteMapping("/{id}")
    public String deleteAmenda(@PathVariable Integer id) {
        amendaRepository.deleteAmendaNative(id);
        return "Fine deleted successfully!";
    }

    @GetMapping("/lista-paginata")
    public Page<Amenda> getAmenziPaginat(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return amendaRepository.findAllNativePaginat(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere")));
    }

    // Helper to validate that the date is reasonable (not too old, not in future).
    private boolean isDataValida(LocalDateTime data) {
        if (data == null) return false;
        LocalDateTime acum = LocalDateTime.now();
        LocalDateTime limitaTrecut = acum.minusYears(15);
        return data.isAfter(limitaTrecut) && data.isBefore(acum.plusDays(1));
    }

    public static class AmendaRequest {
        public String motiv;
        public BigDecimal suma;
        public String starePlata;
        public String dataEmitere;
        public Integer idPolitist;
        public Integer idPersoana;
    }
}