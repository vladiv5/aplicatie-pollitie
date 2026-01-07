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
            return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată", "Această amendă figurează ca neplătită și nu poate fi ștearsă din sistem!", null);
        } else if ("Platita".equalsIgnoreCase(stare)) {
            return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere Document Fiscal", "Amenda a fost plătită. Ștergerea ei va elimina dovada!", null);
        } else {
            return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Amenda este anulată juridic. Poate fi ștearsă fără probleme!", null);
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

    // --- HELPER VALIDARE ---
    private Map<String, String> valideazaAmenda(AmendaRequest req) {
        Map<String, String> errors = new HashMap<>();

        // --- 1. MOTIV (Obligatoriu, Max 255) ---
        if (req.motiv == null || req.motiv.trim().isEmpty()) {
            errors.put("motiv", "Motivul amenzii este obligatoriu!");
        } else if (req.motiv.length() > 255) {
            errors.put("motiv", "Maxim 255 de caractere!");
        }

        // --- 2. SUMA (Obligatoriu, Pozitivă) ---
        if (req.suma == null) {
            errors.put("suma", "Suma este obligatorie!");
        } else if (req.suma.compareTo(BigDecimal.ZERO) <= 0) {
            errors.put("suma", "Suma trebuie să fie un număr pozitiv!");
        }

        // --- 3. DATA (Format + Logica 15 ani) ---
        try {
            if (req.dataEmitere == null || req.dataEmitere.trim().isEmpty()) {
                errors.put("dataEmitere", "Data acordării este obligatorie!");
            } else {
                LocalDateTime data = LocalDateTime.parse(req.dataEmitere);
                if (!isDataValida(data)) {
                    errors.put("dataEmitere", "Amenda este mai veche de 15 ani sau din viitor!");
                }
            }
        } catch (Exception e) {
            errors.put("dataEmitere", "Format dată invalid!");
        }

        // --- 4. RELAȚII (Obligatorii) ---
        if (req.idPolitist == null) {
            errors.put("idPolitist", "Selectați agentul constatator!");
        }
        if (req.idPersoana == null) {
            errors.put("idPersoana", "Selectați persoana amendată!");
        }

        return errors;
    }

    // --- INSERT SQL (VALIDARE MANUALA) ---
    @PostMapping
    public ResponseEntity<?> createAmenda(@RequestBody AmendaRequest req) {
        // AICI ESTE SCHIMBAREA: Apelăm funcția de validare
        Map<String, String> errors = valideazaAmenda(req);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // Parse Data
        LocalDateTime data = LocalDateTime.parse(req.dataEmitere);

        // 1. INSERT MANUAL (SQL PUR)
        amendaRepository.insertAmenda(
                req.motiv, req.suma, req.starePlata, data, req.idPolitist, req.idPersoana
        );

        // 2. RECUPERARE ID
        Integer newId = amendaRepository.getLastInsertedId();

        // 3. RETURNARE RĂSPUNS CU ID
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Amenda salvată cu succes!");
        response.put("idAmenda", newId);

        return ResponseEntity.ok(response);
    }

    // --- UPDATE (MODIFICAT) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAmenda(@PathVariable Integer id, @RequestBody AmendaRequest req) {
        amendaRepository.getAmendaByIdNative(id).orElseThrow(() -> new RuntimeException("Amenda nu exista!"));

        // AICI ESTE SCHIMBAREA: Apelăm funcția de validare și la update
        Map<String, String> errors = valideazaAmenda(req);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        LocalDateTime data = LocalDateTime.parse(req.dataEmitere);

        // 1. UPDATE MANUAL
        amendaRepository.updateAmenda(
                id, req.motiv, req.suma, req.starePlata, data, req.idPolitist, req.idPersoana
        );

        // 2. RETURNARE OBIECT ACTUALIZAT
        Amenda updated = amendaRepository.getAmendaByIdNative(id).orElse(null);
        return ResponseEntity.ok(updated);
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

    private boolean isDataValida(LocalDateTime data) {
        if (data == null) return false;
        LocalDateTime acum = LocalDateTime.now();
        LocalDateTime limitaTrecut = acum.minusYears(15);
        return data.isAfter(limitaTrecut) && data.isBefore(acum.plusDays(1));
    }

    // === DTO ===
    public static class AmendaRequest {
        public String motiv;
        public BigDecimal suma;
        public String starePlata;
        public String dataEmitere;
        public Integer idPolitist;
        public Integer idPersoana;
    }
}