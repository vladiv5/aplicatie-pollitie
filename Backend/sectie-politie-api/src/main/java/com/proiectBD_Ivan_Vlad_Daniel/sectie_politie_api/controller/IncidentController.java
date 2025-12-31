package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/incidente")
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping
    public List<Incident> getAllIncidente() {
        return incidentRepository.getAllIncidenteNative();
    }

    @GetMapping("/{id}")
    public Incident getIncidentById(@PathVariable Integer id) {
        return incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu a fost gasit!"));
    }

    @GetMapping("/cauta")
    public List<Incident> cautaIncidente(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return incidentRepository.getAllIncidenteNative();
        }
        return incidentRepository.cautaDupaInceput(termen);
    }

    // --- INSERT SQL FOLOSIND DTO (REPARAT EROAREA 400) ---
    @PostMapping
    public String createIncident(@RequestBody IncidentRequest req) {
        // 1. Parsăm data manual ca să fim siguri (Java vrea secunde, React uneori nu le trimite)
        LocalDateTime data;
        try {
            // Încercăm formatul standard
            data = LocalDateTime.parse(req.dataEmitere);
        } catch (Exception e) {
            // Fallback: dacă vine fără secunde, adăugăm noi
            data = LocalDateTime.now();
        }

        // 2. Apelăm SQL-ul manual cu ID-urile primite direct
        incidentRepository.insertIncident(
                req.tipIncident,
                data,
                req.descriereLocatie,
                req.descriereIncident,
                req.idPolitist, // ID direct (Integer)
                req.idAdresa    // ID direct (Integer)
        );
        return "Incident creat prin SQL!";
    }

    // --- UPDATE SQL ---
    @PutMapping("/{id}")
    public String updateIncident(@PathVariable Integer id, @RequestBody IncidentRequest req) {
        incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu exista!"));

        LocalDateTime data = (req.dataEmitere != null) ? LocalDateTime.parse(req.dataEmitere) : LocalDateTime.now();

        incidentRepository.updateIncident(
                id,
                req.tipIncident,
                data,
                req.descriereLocatie,
                req.descriereIncident,
                req.idPolitist,
                req.idAdresa
        );
        return "Incident modificat prin SQL!";
    }

    // DELETE SQL
    @DeleteMapping("/{id}")
    public String deleteIncident(@PathVariable Integer id) {
        incidentRepository.deleteIncidentNative(id);
        return "Incident șters prin SQL!";
    }

    // === CLASA DTO (Data Transfer Object) ===
    // Aceasta ne ajută să primim JSON-ul curat, fără erori de mapare
    public static class IncidentRequest {
        public String tipIncident;
        public String dataEmitere; // Primim ca String, convertim noi
        public String descriereLocatie;
        public String descriereIncident;
        public Integer idPolitist; // Primim direct ID-ul
        public Integer idAdresa;   // Primim direct ID-ul
    }

    // --- ENDPOINT PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Incident> getIncidentePaginat(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Logica Sortare: Data Emitere DESC (Cele mai noi sus)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere"));

        return incidentRepository.findAllNativePaginat(pageable);
    }
}