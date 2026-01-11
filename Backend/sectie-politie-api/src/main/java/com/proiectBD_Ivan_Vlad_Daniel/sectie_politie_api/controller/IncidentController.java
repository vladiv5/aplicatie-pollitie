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

/** Controller pentru gestionarea incidentelor
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
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

    // --- INSERT (VALIDARE MANUALA) ---
    @PostMapping
    public ResponseEntity<?> createIncident(@RequestBody IncidentRequest req) {
        Map<String, String> errors = valideazaIncident(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        String locFinal = (req.descriereLocatie != null && req.descriereLocatie.trim().isEmpty()) ? null : req.descriereLocatie;
        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";

        LocalDateTime dataFinala = (req.dataEmitere != null) ? LocalDateTime.parse(req.dataEmitere) : LocalDateTime.now();

        incidentRepository.insertIncident(
                req.tipIncident, dataFinala, locFinal, req.descriereIncident,
                req.idPolitist, req.idAdresa, statusDeSalvat
        );

        Integer newId = incidentRepository.getLastInsertedId();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Incident creat cu succes!");
        response.put("idIncident", newId);

        return ResponseEntity.ok(response);
    }

    // --- UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncident(@PathVariable Integer id, @RequestBody IncidentRequest req) {
        incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu exista!"));

        Map<String, String> errors = valideazaIncident(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        String locFinal = (req.descriereLocatie != null && req.descriereLocatie.trim().isEmpty()) ? null : req.descriereLocatie;
        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";
        LocalDateTime dataFinala = LocalDateTime.parse(req.dataEmitere);

        incidentRepository.updateIncident(
                id, req.tipIncident, dataFinala, locFinal, req.descriereIncident,
                req.idPolitist, req.idAdresa, statusDeSalvat
        );

        Incident updated = incidentRepository.getIncidentByIdNative(id).orElse(null);
        return ResponseEntity.ok(updated);
    }

    // --- HELPER VALIDARE ---
    private Map<String, String> valideazaIncident(IncidentRequest req) {
        Map<String, String> errors = new HashMap<>();
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";

        // 1. Tip Incident
        if (req.tipIncident == null || req.tipIncident.trim().isEmpty()) {
            errors.put("tipIncident", "Tipul incidentului este obligatoriu!");
        } else if (!req.tipIncident.matches(doarLitereRegex)) {
            errors.put("tipIncident", "Tipul incidentului poate conține doar litere!");
        } else if (req.tipIncident.length() > 100) {
            errors.put("tipIncident", "Maxim 100 de caractere!");
        }

        // 2. Descriere
        if (req.descriereIncident == null || req.descriereIncident.trim().isEmpty()) {
            errors.put("descriereIncident", "Descrierea incidentului este obligatorie!");
        }

        // 3. Locatie
        if (req.descriereLocatie != null && req.descriereLocatie.length() > 255) {
            errors.put("descriereLocatie", "Maxim 255 de caractere!");
        }

        // 4. Data
        try {
            if (req.dataEmitere == null || req.dataEmitere.trim().isEmpty()) {
                errors.put("dataEmitere", "Data și ora sunt obligatorii!");
            } else {
                LocalDateTime data = LocalDateTime.parse(req.dataEmitere);
                if (!isDataValida(data)) {
                    errors.put("dataEmitere", "Incidentul este mai vechi de 15 ani sau din viitor!");
                }
            }
        } catch (Exception e) {
            errors.put("dataEmitere", "Format dată invalid!");
        }

        return errors;
    }

    // --- STERGERE ---
    @DeleteMapping("/{id}")
    public String deleteIncident(@PathVariable Integer id) {
        persoanaIncidentRepository.deleteByIncidentId(id);
        incidentRepository.deleteIncidentNative(id);
        return "Incidentul a fost șters cu succes!";
    }

    // --- PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Incident> getIncidentePaginat(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere"));
        return incidentRepository.findAllNativePaginat(pageable);
    }

    // --- VERIFICARE STERGERE ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        Incident incident = incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu există!"));

        String status = incident.getStatus();

        if ("Activ".equalsIgnoreCase(status)) {
            return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată", "Acest incident este încă în stadiul 'Activ'. Nu puteți șterge un dosar aflat în lucru.", null);
        } else if ("Închis".equalsIgnoreCase(status)) {
            return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere Dosar", "Incidentul este marcat ca 'Închis'. Ștergerea lui este permanentă.", null);
        } else {
            return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Incidentul este arhivat. Poate fi șters fără probleme.", null);
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