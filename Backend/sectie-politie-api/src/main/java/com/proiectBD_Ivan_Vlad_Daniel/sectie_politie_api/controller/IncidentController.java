package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation; // Asigura-te ca ai importul
import java.util.Collections;
import java.time.LocalDateTime;
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

    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;

    // --- VERIFICARE STERGERE ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        Incident incident = incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu există!"));

        String status = incident.getStatus();

        if ("Activ".equalsIgnoreCase(status)) {
            return new DeleteConfirmation(
                    false, "BLOCKED", "Ștergere Blocată",
                    "Acest incident este încă în stadiul 'Activ'. Nu puteți șterge un dosar aflat în lucru.", null
            );
        } else if ("Închis".equalsIgnoreCase(status)) {
            return new DeleteConfirmation(
                    true, "WARNING", "Atenție - Ștergere Dosar",
                    "Incidentul este marcat ca 'Închis'. Ștergerea lui este permanentă.", null
            );
        } else {
            return new DeleteConfirmation(
                    true, "SAFE", "Ștergere Sigură",
                    "Incidentul este arhivat. Poate fi șters fără probleme.", null
            );
        }
    }

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

    // --- INSERT SQL FOLOSIND DTO (Pastrat logica ta de parsare) ---
    @PostMapping
    public String createIncident(@RequestBody IncidentRequest req) {
        // 1. Parsăm data manual (Codul tau original)
        LocalDateTime data;
        try {
            data = LocalDateTime.parse(req.dataEmitere);
        } catch (Exception e) {
            // Fallback: dacă vine fără secunde sau format gresit
            data = LocalDateTime.now();
        }

        // 2. Verificam statusul (NOU)
        // Daca nu vine nimic de la frontend, punem default "Activ"
        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";

        // 3. Apelăm SQL-ul manual (Repository-ul trebuie sa aiba parametrul status adaugat!)
        incidentRepository.insertIncident(
                req.tipIncident,
                data,
                req.descriereLocatie,
                req.descriereIncident,
                req.idPolitist,
                req.idAdresa,
                statusDeSalvat // <--- Parametrul NOU
        );
        return "Incident creat prin SQL!";
    }

    // --- UPDATE SQL ---
    @PutMapping("/{id}")
    public String updateIncident(@PathVariable Integer id, @RequestBody IncidentRequest req) {
        incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu exista!"));

        LocalDateTime data = (req.dataEmitere != null) ? LocalDateTime.parse(req.dataEmitere) : LocalDateTime.now();

        // Preluam statusul nou sau pastram "Activ" daca e gol (NOU)
        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";

        incidentRepository.updateIncident(
                id,
                req.tipIncident,
                data,
                req.descriereLocatie,
                req.descriereIncident,
                req.idPolitist,
                req.idAdresa,
                statusDeSalvat // <--- Parametrul NOU
        );
        return "Incident modificat prin SQL!";
    }

    // --- DELETE INCIDENT (REPARAT) ---
    @DeleteMapping("/{id}")
    public String deleteIncident(@PathVariable Integer id) {
        // 1. Stergem DOAR legaturile (nu oamenii)
        persoanaIncidentRepository.deleteByIncidentId(id);

        // 2. Stergem incidentul
        incidentRepository.deleteIncidentNative(id);

        // MESAJ SCURT, FIX CUM AI CERUT
        return "Incidentul a fost șters cu succes!";
    }

    // === CLASA DTO (Data Transfer Object) ===
    public static class IncidentRequest {
        public String tipIncident;
        public String dataEmitere;
        public String descriereLocatie;
        public String descriereIncident;
        public Integer idPolitist;
        public Integer idAdresa;
        public String status; // <--- CAMPUL NOU ADAUGAT AICI
    }

    // --- ENDPOINT PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Incident> getIncidentePaginat(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere"));
        return incidentRepository.findAllNativePaginat(pageable);
    }
}