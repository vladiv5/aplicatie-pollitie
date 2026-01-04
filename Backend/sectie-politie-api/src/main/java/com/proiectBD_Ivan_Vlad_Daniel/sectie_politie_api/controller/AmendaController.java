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

    // --- INSERT SQL (VALIDARE MANUALA) ---
    @PostMapping
    public ResponseEntity<?> createAmenda(@RequestBody AmendaRequest req) {
        Map<String, String> eroriLogice = new HashMap<>();

        // 1. VALIDARE MOTIV (Gol -> Regex -> Lungime)
        String motiv = req.motiv;
        if (motiv == null || motiv.trim().isEmpty()) {
            eroriLogice.put("motiv", "Motivul amenzii este obligatoriu!");
        } else if (!motiv.matches("^[a-zA-ZăâîșțĂÂÎȘȚ ]+$")) {
            eroriLogice.put("motiv", "Motivul poate conține doar litere și spații.");
        } else if (motiv.length() > 255) { // <--- ADAUGĂ ACEST BLOC
            eroriLogice.put("motiv", "Motivul este prea lung (max 255 caractere).");
        }

        // 2. VALIDARE SUMA (Gol -> Pozitiv -> Max -> Multiplu)
        BigDecimal suma = req.suma;
        if (suma == null) {
            eroriLogice.put("suma", "Suma este obligatorie!");
        } else {
            // Verificare Pozitiv
            if (suma.compareTo(BigDecimal.ZERO) <= 0) {
                eroriLogice.put("suma", "Suma trebuie să fie pozitivă!");
            }
            // Verificare Max (3000)
            else if (suma.compareTo(new BigDecimal("3000")) > 0) {
                eroriLogice.put("suma", "Suma maximă este 3000 RON.");
            }
            // Verificare Multiplu de 25
            else if (suma.remainder(new BigDecimal("25")).compareTo(BigDecimal.ZERO) != 0) {
                eroriLogice.put("suma", "Suma trebuie să fie un multiplu de 25!");
            }
        }

        // 3. VALIDARE STARE PLATA
        if (req.starePlata == null || req.starePlata.trim().isEmpty()) {
            eroriLogice.put("starePlata", "Starea plății este obligatorie!");
        }

        // 4. VALIDARE DATA
        LocalDateTime data = null;
        try {
            if (req.dataEmitere != null) {
                data = LocalDateTime.parse(req.dataEmitere);
                if (!isDataValida(data)) {
                    eroriLogice.put("dataEmitere", "Dată invalidă (> 15 ani vechime sau viitor).");
                }
            } else {
                data = LocalDateTime.now();
            }
        } catch (Exception e) {
            eroriLogice.put("dataEmitere", "Format dată invalid!");
        }

        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        amendaRepository.insertAmenda(
                req.motiv,
                suma,
                req.starePlata,
                data,
                req.idPolitist,
                req.idPersoana
        );
        return ResponseEntity.ok("Amenda salvată cu succes!");
    }

    // --- UPDATE SQL (VALIDARE MANUALA) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAmenda(@PathVariable Integer id, @RequestBody AmendaRequest req) {
        amendaRepository.getAmendaByIdNative(id).orElseThrow(() -> new RuntimeException("Amenda nu exista!"));

        Map<String, String> eroriLogice = new HashMap<>();

        // 1. VALIDARE MOTIV
        String motiv = req.motiv;
        if (motiv == null || motiv.trim().isEmpty()) {
            eroriLogice.put("motiv", "Motivul amenzii este obligatoriu!");
        } else if (!motiv.matches("^[a-zA-ZăâîșțĂÂÎȘȚ ]+$")) {
            eroriLogice.put("motiv", "Motivul poate conține doar litere și spații.");
        } else if (motiv.length() > 255) { // <--- ADAUGĂ ACEST BLOC
            eroriLogice.put("motiv", "Motivul este prea lung (max 255 caractere).");
        }

        // 2. VALIDARE SUMA
        BigDecimal suma = req.suma;
        if (suma == null) {
            eroriLogice.put("suma", "Suma este obligatorie!");
        } else {
            if (suma.compareTo(BigDecimal.ZERO) <= 0) {
                eroriLogice.put("suma", "Suma trebuie să fie pozitivă!");
            } else if (suma.compareTo(new BigDecimal("3000")) > 0) {
                eroriLogice.put("suma", "Suma maximă este 3000 RON.");
            } else if (suma.remainder(new BigDecimal("25")).compareTo(BigDecimal.ZERO) != 0) {
                eroriLogice.put("suma", "Suma trebuie să fie un multiplu de 25!");
            }
        }

        // 3. VALIDARE STARE PLATA
        if (req.starePlata == null || req.starePlata.trim().isEmpty()) {
            eroriLogice.put("starePlata", "Starea plății este obligatorie!");
        }

        // 4. VALIDARE DATA
        LocalDateTime data = null;
        try {
            if (req.dataEmitere != null) {
                data = LocalDateTime.parse(req.dataEmitere);
                if (!isDataValida(data)) {
                    eroriLogice.put("dataEmitere", "Dată invalidă (> 15 ani vechime sau viitor).");
                }
            }
        } catch (Exception e) {
            eroriLogice.put("dataEmitere", "Format dată invalid!");
        }

        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        amendaRepository.updateAmenda(
                id,
                req.motiv,
                suma,
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

    private boolean isDataValida(LocalDateTime data) {
        if (data == null) return false;
        LocalDateTime acum = LocalDateTime.now();
        LocalDateTime limitaTrecut = acum.minusYears(15);
        return data.isAfter(limitaTrecut) && data.isBefore(acum.plusDays(1));
    }

    // === DTO FARA ADNOTARI - VALIDAM IN CONTROLLER ===
    public static class AmendaRequest {
        public String motiv;
        public BigDecimal suma;
        public String starePlata;
        public String dataEmitere;
        public Integer idPolitist;
        public Integer idPersoana;
    }
}