package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaIncidentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
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

@RestController
@RequestMapping("/api/incidente")
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;

    // --- VERIFICARE STERGERE (NEMODIFICAT) ---
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

    // --- GET METHODS (NEMODIFICAT) ---
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

    // --- INSERT SQL (MODIFICAT PT VALIDARI) ---
    // Am schimbat return type in ResponseEntity<?> ca sa putem trimite erori
    @PostMapping
    public ResponseEntity<?> createIncident(@Valid @RequestBody IncidentRequest req) {
        // 1. Transformam textul gol in NULL (pt locatii, descrieri)
        if (req.descriereLocatie != null && req.descriereLocatie.trim().isEmpty()) req.descriereLocatie = null;

        // 2. Validari Logice (Data 15 ani)
        Map<String, String> eroriLogice = new HashMap<>();

        // Parsăm data
        LocalDateTime data;
        try {
            data = LocalDateTime.parse(req.dataEmitere);
        } catch (Exception e) {
            // Daca formatul e gresit, punem data curenta ca fallback SAU dam eroare
            // Aici dam eroare ca sa stie userul
            return ResponseEntity.badRequest().body(Map.of("dataEmitere", "Format dată invalid!"));
        }

        // Verificam regula de 15 ani
        if (!isDataValida(data)) {
            eroriLogice.put("dataEmitere", "Incidentul este mai vechi de 15 ani sau din viitor!");
        }

        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        // 3. Verificam statusul
        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";

        // 4. Apelăm SQL-ul
        incidentRepository.insertIncident(
                req.tipIncident,
                data,
                req.descriereLocatie,
                req.descriereIncident,
                req.idPolitist,
                req.idAdresa,
                statusDeSalvat
        );
        return ResponseEntity.ok("Incident creat cu succes!");
    }

    // --- UPDATE SQL (MODIFICAT PT VALIDARI) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncident(@PathVariable Integer id, @Valid @RequestBody IncidentRequest req) {
        incidentRepository.getIncidentByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu exista!"));

        // 1. Corectie Empty -> Null
        if (req.descriereLocatie != null && req.descriereLocatie.trim().isEmpty()) req.descriereLocatie = null;

        // 2. Validari Data
        Map<String, String> eroriLogice = new HashMap<>();
        LocalDateTime data;
        try {
            data = LocalDateTime.parse(req.dataEmitere);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("dataEmitere", "Format dată invalid!"));
        }

        if (!isDataValida(data)) {
            eroriLogice.put("dataEmitere", "Dată invalidă (> 15 ani vechime sau viitor).");
        }

        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        String statusDeSalvat = (req.status != null && !req.status.trim().isEmpty()) ? req.status : "Activ";

        // 3. Update
        incidentRepository.updateIncident(
                id,
                req.tipIncident,
                data,
                req.descriereLocatie,
                req.descriereIncident,
                req.idPolitist,
                req.idAdresa,
                statusDeSalvat
        );
        return ResponseEntity.ok("Incident modificat cu succes!");
    }

    // --- DELETE INCIDENT (NEMODIFICAT) ---
    @DeleteMapping("/{id}")
    public String deleteIncident(@PathVariable Integer id) {
        persoanaIncidentRepository.deleteByIncidentId(id);
        incidentRepository.deleteIncidentNative(id);
        return "Incidentul a fost șters cu succes!";
    }

    // --- ENDPOINT PAGINARE (NEMODIFICAT) ---
    @GetMapping("/lista-paginata")
    public Page<Incident> getIncidentePaginat(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "data_emitere"));
        return incidentRepository.findAllNativePaginat(pageable);
    }

    // --- METODA AJUTATOARE (NOU) ---
    private boolean isDataValida(LocalDateTime data) {
        if (data == null) return false;
        LocalDateTime acum = LocalDateTime.now();
        LocalDateTime limitaTrecut = acum.minusYears(15);
        // Sa nu fie mai vechi de 15 ani SI sa nu fie din viitor (cu 1 zi marja)
        return data.isAfter(limitaTrecut) && data.isBefore(acum.plusDays(1));
    }

    // === CLASA DTO (MODIFICATA cu Adnotari) ===
    public static class IncidentRequest {
        @Pattern(regexp = "^[a-zA-ZăâîșțĂÂÎȘȚ -]+$", message = "Tipul incidentului poate conține doar litere.")
        public String tipIncident;

        public String dataEmitere;

        @Size(max = 255, message = "Descrierea locației e prea lungă (max 255 caractere).")
        public String descriereLocatie;

        @NotBlank(message = "Descrierea incidentului este obligatorie!")
        public String descriereIncident; // Fara limita (Text)
        public Integer idPolitist;
        public Integer idAdresa;
        public String status;
    }
}