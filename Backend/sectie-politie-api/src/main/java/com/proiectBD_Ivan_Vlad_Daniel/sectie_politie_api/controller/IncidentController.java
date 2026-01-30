package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Controller for managing Incidents (Cases).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@RestController
@RequestMapping("/api/incidente")
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;

    // --- GET METHODS ---
    @GetMapping
    public List<Incident> getAllIncidente() {
        // I fetch all incidents directly from the database.
        return incidentRepository.getAllIncidenteNative();
    }

    @GetMapping("/{id}")
    public Incident getIncidentById(@PathVariable Integer id) {
        // I retrieve a specific incident or throw an error if not found.
        return incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incident not found!"));
    }

    @GetMapping("/cauta")
    public List<Incident> cautaIncidente(@RequestParam String termen) {
        // I implemented a search feature that returns all records if the search term is empty.
        if (termen == null || termen.trim().isEmpty()) {
            return incidentRepository.getAllIncidenteNative();
        }
        return incidentRepository.cautaDupaInceput(termen);
    }

    // --- INSERT (MANUAL VALIDATION) ---
    @PostMapping
    public ResponseEntity<?> createIncident(@RequestBody IncidentRequest req) {
        // I perform validation before attempting to save to maintain data integrity.
        Map<String, String> errors = valideazaIncident(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // I sanitize the input data, converting empty strings to null.
        String locFinal = (req.descriereLocatie != null && req.descriereLocatie.trim().isEmpty()) ? null : req.descriereLocatie;
        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";

        // I default to the current timestamp if no date is provided.
        LocalDateTime dataFinala = (req.dataEmitere != null) ? LocalDateTime.parse(req.dataEmitere) : LocalDateTime.now();

        // I call the custom insert method in the repository.
        incidentRepository.insertIncident(
                req.tipIncident, dataFinala, locFinal, req.descriereIncident,
                req.idPolitist, req.idAdresa, statusDeSalvat
        );

        // I retrieve the generated ID to return it to the client.
        Integer newId = incidentRepository.getLastInsertedId();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Incident created successfully!");
        response.put("idIncident", newId);

        return ResponseEntity.ok(response);
    }

    // --- UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncident(@PathVariable Integer id, @RequestBody IncidentRequest req) {
        // I check existence before updating.
        incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incident does not exist!"));

        Map<String, String> errors = valideazaIncident(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        String locFinal = (req.descriereLocatie != null && req.descriereLocatie.trim().isEmpty()) ? null : req.descriereLocatie;
        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";
        LocalDateTime dataFinala = LocalDateTime.parse(req.dataEmitere);

        // I execute the update query.
        incidentRepository.updateIncident(
                id, req.tipIncident, dataFinala, locFinal, req.descriereIncident,
                req.idPolitist, req.idAdresa, statusDeSalvat
        );

        Incident updated = incidentRepository.getIncidentByIdNative(id).orElse(null);
        return ResponseEntity.ok(updated);
    }

    // --- VALIDATION HELPER ---
    private Map<String, String> valideazaIncident(IncidentRequest req) {
        Map<String, String> errors = new HashMap<>();
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";

        // 1. Incident Type
        if (req.tipIncident == null || req.tipIncident.trim().isEmpty()) {
            errors.put("tipIncident", "Type is mandatory!");
        } else if (!req.tipIncident.matches(doarLitereRegex)) {
            errors.put("tipIncident", "Type can only contain letters!");
        } else if (req.tipIncident.length() > 100) {
            errors.put("tipIncident", "Max 100 chars!");
        }

        // 2. Description
        if (req.descriereIncident == null || req.descriereIncident.trim().isEmpty()) {
            errors.put("descriereIncident", "Description is mandatory!");
        }

        // 3. Location
        if (req.descriereLocatie != null && req.descriereLocatie.length() > 255) {
            errors.put("descriereLocatie", "Max 255 chars!");
        }

        // 4. Date
        try {
            if (req.dataEmitere == null || req.dataEmitere.trim().isEmpty()) {
                errors.put("dataEmitere", "Date and time are mandatory!");
            } else {
                LocalDateTime data = LocalDateTime.parse(req.dataEmitere);
                if (!isDataValida(data)) {
                    errors.put("dataEmitere", "Date is either too old (>15 years) or in the future!");
                }
            }
        } catch (Exception e) {
            errors.put("dataEmitere", "Invalid date format!");
        }

        return errors;
    }

    // --- DELETE ---
    @DeleteMapping("/{id}")
    public String deleteIncident(@PathVariable Integer id) {
        // I manually delete associated participants first to maintain referential integrity.
        persoanaIncidentRepository.deleteByIncidentId(id);
        incidentRepository.deleteIncidentNative(id);
        return "Incident deleted successfully!";
    }

    // --- PAGINATION ---
    @GetMapping("/lista-paginata")
    public Page<Incident> getIncidentePaginat(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere"));
        return incidentRepository.findAllNativePaginat(pageable);
    }

    // --- DELETE VERIFICATION (SMART DELETE) ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        Incident incident = incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incident does not exist!"));

        String status = incident.getStatus();

        // I prevent deletion of active cases to comply with procedure.
        if ("Activ".equalsIgnoreCase(status)) {
            return new DeleteConfirmation(false, "BLOCKED", "Deletion Blocked", "This incident is ACTIVE. Cannot delete an open case.", null);
        } else if ("Închis".equalsIgnoreCase(status)) {
            return new DeleteConfirmation(true, "WARNING", "Warning - Deleting Case File", "This incident is CLOSED. Deletion is permanent.", null);
        } else {
            return new DeleteConfirmation(true, "SAFE", "Safe Deletion", "Incident is archived. Safe to delete.", null);
        }
    }

    private boolean isDataValida(LocalDateTime data) {
        if (data == null) return false;
        LocalDateTime acum = LocalDateTime.now();
        LocalDateTime limitaTrecut = acum.minusYears(15);
        return data.isAfter(limitaTrecut) && data.isBefore(acum.plusDays(1));
    }

    public static class IncidentRequest {
        public String tipIncident;
        public String dataEmitere;
        public String descriereLocatie;
        public String descriereIncident;
        public Integer idPolitist;
        public Integer idAdresa;
        public String status;
    }
}