package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.BlockingItem;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Politist;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaIncidentRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PolitistRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AmendaRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for managing Human Resources (Police Officers).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@RestController
@RequestMapping("/api/politisti")
@CrossOrigin(origins = "http://localhost:3000")
public class PolitistController {

    @Autowired
    private PolitistRepository politistRepository;
    @Autowired
    private AmendaRepository amendaRepository;
    @Autowired
    private IncidentRepository incidentRepository;
    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;

    // --- GET METHODS ---
    @GetMapping
    public List<Politist> getAllPolitisti() { return politistRepository.toataListaPolitisti(); }

    @GetMapping("/cauta")
    public List<Politist> cautaPolitisti(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) return politistRepository.toataListaPolitisti();
        return politistRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Politist getPolitistById(@PathVariable Integer id) {
        return politistRepository.findByIdNative(id).orElseThrow(() -> new RuntimeException("Officer not found!"));
    }

    // --- ADD POLITIST ---
    @PostMapping
    public ResponseEntity<?> addPolitist(@RequestBody Politist p) {
        curataDatePolitist(p);
        Map<String, String> errors = valideazaPolitist(p);

        // I ensure work phone numbers are unique.
        if (p.getTelefon_serviciu() != null && !errors.containsKey("telefon_serviciu")) {
            if (politistRepository.verificaTelefonUnic(p.getTelefon_serviciu(), null) > 0) {
                errors.put("telefon_serviciu", "This phone number is already in use!");
            }
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        politistRepository.adaugaPolitistManual(
                p.getNume(), p.getPrenume(), p.getGrad(), p.getFunctie(), p.getTelefon_serviciu()
        );

        Integer newId = politistRepository.getLastInsertedId();
        p.setIdPolitist(newId);

        return ResponseEntity.ok(p);
    }

    // --- UPDATE POLITIST ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePolitist(@PathVariable Integer id, @RequestBody Politist p) {
        curataDatePolitist(p);
        Map<String, String> errors = valideazaPolitist(p);

        if (p.getTelefon_serviciu() != null && !errors.containsKey("telefon_serviciu")) {
            if (politistRepository.verificaTelefonUnic(p.getTelefon_serviciu(), id) > 0) {
                errors.put("telefon_serviciu", "This phone number is already in use!");
            }
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        politistRepository.updatePolitist(
                id, p.getNume(), p.getPrenume(), p.getGrad(), p.getFunctie(), p.getTelefon_serviciu()
        );

        Politist updatedPolitist = politistRepository.findByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Error fetching updated officer"));

        return ResponseEntity.ok(updatedPolitist);
    }

    // --- VALIDATION HELPER ---
    private Map<String, String> valideazaPolitist(Politist p) {
        Map<String, String> errors = new HashMap<>();
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";

        if (p.getNume() == null || p.getNume().trim().isEmpty()) {
            errors.put("nume", "Name required!");
        } else if (!p.getNume().matches(doarLitereRegex)) {
            errors.put("nume", "Name can only contain letters!");
        } else if (p.getNume().length() > 50) {
            errors.put("nume", "Max 50 chars!");
        }

        if (p.getPrenume() == null || p.getPrenume().trim().isEmpty()) {
            errors.put("prenume", "Surname required!");
        } else if (!p.getPrenume().matches(doarLitereRegex)) {
            errors.put("prenume", "Surname can only contain letters!");
        } else if (p.getPrenume().length() > 50) {
            errors.put("prenume", "Max 50 chars!");
        }

        if (p.getGrad() != null && !p.getGrad().trim().isEmpty()) {
            if (!p.getGrad().matches(doarLitereRegex)) {
                errors.put("grad", "Rank can only contain letters!");
            }
        }

        if (p.getTelefon_serviciu() != null && !p.getTelefon_serviciu().matches("^07\\d{8}$")) {
            errors.put("telefon_serviciu", "Invalid format (07xxxxxxxx).");
        }

        return errors;
    }

    private void curataDatePolitist(Politist p) {
        if (p.getTelefon_serviciu() != null && p.getTelefon_serviciu().trim().isEmpty()) p.setTelefon_serviciu(null);
        if (p.getGrad() != null && p.getGrad().trim().isEmpty()) p.setGrad(null);
        if (p.getFunctie() != null && p.getFunctie().trim().isEmpty()) p.setFunctie(null);
    }

    // --- DELETE ---
    @DeleteMapping("/{id}")
    public String deletePolitist(@PathVariable Integer id) {
        Politist p = politistRepository.findByIdNative(id).orElse(null);
        String numeComplet = (p != null) ? p.getNume() + " " + p.getPrenume() : "Officer";

        // I clean up all work records associated with the officer before deleting their profile.
        persoanaIncidentRepository.stergeParticipantiDupaPolitist(id);
        incidentRepository.stergeIncidenteDupaPolitist(id);
        amendaRepository.stergeAmenziDupaPolitist(id);
        politistRepository.stergePolitistManual(id);

        return "Success: " + numeComplet + " was deleted permanently!";
    }

    // --- DELETE VERIFICATION (SMART DELETE LOGIC) ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();
        boolean hasRed = false;    // Blocks deletion (Active cases/Unpaid fines)
        boolean hasOrange = false; // Warns (Closed cases) -> Archived ones are ignored (Green)

        // 1. Check Fines
        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPolitist(id);
        for (Amenda a : toateAmenzile) {
            String status = a.getStarePlata();
            String desc = status + " - " + a.getSuma() + " RON";

            listaTotala.add(new BlockingItem("Fine", a.getIdAmenda(), desc));

            if ("Neplatita".equalsIgnoreCase(status)) {
                hasRed = true;
            } else if ("Platita".equalsIgnoreCase(status)) {
                hasOrange = true;
            }
        }

        // 2. Check Incidents
        List<Incident> toateIncidentele = incidentRepository.findAllNativeByPolitist(id);
        for (Incident i : toateIncidentele) {
            String status = i.getStatus();
            String desc = i.getTipIncident() + " (" + status + ")";

            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));

            if ("Activ".equalsIgnoreCase(status)) {
                hasRed = true;
            } else if ("Închis".equalsIgnoreCase(status)) {
                hasOrange = true;
            }
        }

        // 3. Decide Severity
        if (hasRed) {
            return new DeleteConfirmation(
                    false,
                    "BLOCKED",
                    "Deletion Blocked",
                    "Officer has ACTIVE items (open cases or unpaid fines). Resolve them first!",
                    listaTotala
            );
        } else if (hasOrange) {
            return new DeleteConfirmation(
                    true,
                    "WARNING",
                    "Warning - History Deletion",
                    "Officer has closed/paid history. Deletion allowed but irreversible.",
                    listaTotala
            );
        } else {
            return new DeleteConfirmation(
                    true,
                    "SAFE",
                    "Safe Deletion",
                    "No critical data found. Safe to delete.",
                    listaTotala
            );
        }
    }

    @GetMapping("/lista-paginata")
    public Page<Politist> getPolitistiPaginati(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Sort sortare = Sort.by(Sort.Direction.ASC, "nume").and(Sort.by(Sort.Direction.ASC, "prenume"));
        return politistRepository.findAllNative(PageRequest.of(page, size, sortare));
    }

    // I fetch the officer's full file (incidents + fines issued).
    @GetMapping("/{id}/dosar-personal")
    public ResponseEntity<?> getDosarPersonal(@PathVariable Integer id) {
        if (id == -1) {
            return ResponseEntity.ok(Map.of("incidente", new ArrayList<>(), "amenzi", new ArrayList<>()));
        }

        politistRepository.findByIdNative(id).orElseThrow(() -> new RuntimeException("Officer not found!"));

        List<Incident> incidente = incidentRepository.findAllNativeByPolitist(id);
        List<Amenda> amenzi = amendaRepository.findAllNativeByPolitist(id);

        BigDecimal totalValoare = BigDecimal.ZERO;
        for (Amenda a : amenzi) {
            if (a.getSuma() != null) totalValoare = totalValoare.add(a.getSuma());
        }

        Map<String, Object> dosar = new HashMap<>();
        dosar.put("incidente", incidente);
        dosar.put("amenzi", amenzi);
        dosar.put("totalAmenziValoare", totalValoare);
        dosar.put("totalIncidente", incidente.size());
        dosar.put("totalAmenziCount", amenzi.size());

        return ResponseEntity.ok(dosar);
    }
}