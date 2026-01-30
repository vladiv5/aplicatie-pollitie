package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.BlockingItem;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Adresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AdresaRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaAdresaRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing Addresses.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@RestController
@RequestMapping("/api/adrese")
@CrossOrigin(origins = "http://localhost:3000")
public class AdresaController {

    @Autowired
    private AdresaRepository adresaRepository;
    @Autowired
    private IncidentRepository incidentRepository;
    @Autowired
    private PersoanaAdresaRepository persoanaAdresaRepository;
    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;

    // --- GETTERS ---

    // I return all addresses without pagination for simple dropdowns or small lists.
    @GetMapping
    public List<Adresa> getAllAdrese() { return adresaRepository.getAllAdreseNative(); }

    // I search addresses by a specific term (street, city, county) for autocomplete functionality.
    @GetMapping("/cauta")
    public List<Adresa> cautaAdrese(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) return adresaRepository.getAllAdreseNative();
        return adresaRepository.cautaDupaInceput(termen);
    }

    // I retrieve a single address by its ID for detailed view or editing.
    @GetMapping("/{id}")
    public Adresa getAdresaById(@PathVariable Integer id) {
        return adresaRepository.getAdresaByIdNative(id).orElseThrow(() -> new RuntimeException("Address not found!"));
    }

    // --- INSERT (MANUAL VALIDATION) ---
    @PostMapping
    public ResponseEntity<?> addAdresa(@RequestBody AdresaRequest req) {
        // I validate all fields before attempting insertion to ensure data integrity.
        Map<String, String> errors = valideazaAdresa(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // I handle optional fields (block, apartment) by converting empty strings to null for cleaner database storage.
        String blocFinal = (req.bloc != null && req.bloc.trim().isEmpty()) ? null : req.bloc;
        Integer apInt = (req.apartament != null && !req.apartament.trim().isEmpty()) ? Integer.parseInt(req.apartament) : null;

        // 1. I perform a manual insert using a custom native query repository method.
        adresaRepository.insertAdresa(
                req.judetSauSector, req.localitate, req.strada, req.numar, blocFinal, apInt
        );

        // 2. I retrieve the newly generated ID to send it back to the frontend immediately.
        Integer newId = adresaRepository.getLastInsertedId();

        // 3. I construct the JSON response.
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Address saved successfully!");
        response.put("idAdresa", newId);

        return ResponseEntity.ok(response);
    }

    // --- UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdresa(@PathVariable Integer id, @RequestBody AdresaRequest req) {
        // I verify the address exists before trying to update it.
        adresaRepository.getAdresaByIdNative(id).orElseThrow(() -> new RuntimeException("Address not found!"));

        Map<String, String> errors = valideazaAdresa(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        String blocFinal = (req.bloc != null && req.bloc.trim().isEmpty()) ? null : req.bloc;
        Integer apInt = (req.apartament != null && !req.apartament.trim().isEmpty()) ? Integer.parseInt(req.apartament) : null;

        // Manual update execution.
        adresaRepository.updateAdresa(
                id, req.judetSauSector, req.localitate, req.strada, req.numar, blocFinal, apInt
        );

        // I return the updated object to refresh the frontend state.
        Adresa updated = adresaRepository.getAdresaByIdNative(id).orElse(null);
        return ResponseEntity.ok(updated);
    }

    // --- SHARED VALIDATION LOGIC ---
    private Map<String, String> valideazaAdresa(AdresaRequest req) {
        Map<String, String> errors = new HashMap<>();
        // I define strict regex patterns to prevent invalid data entry (e.g., numbers in city names).
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";
        String litereCifreRegex = "^[a-zA-Z0-9\\s\\-]+$";

        // 1. COUNTY / SECTOR
        if (req.judetSauSector == null || req.judetSauSector.trim().isEmpty()) {
            errors.put("judetSauSector", "County/Sector is mandatory!");
        } else if (!req.judetSauSector.matches(litereCifreRegex)) {
            errors.put("judetSauSector", "Only letters, numbers, and spaces allowed.");
        } else if (req.judetSauSector.length() > 50) {
            errors.put("judetSauSector", "Max 50 chars!");
        }

        // 2. CITY
        if (req.localitate == null || req.localitate.trim().isEmpty()) {
            errors.put("localitate", "City is mandatory!");
        } else if (!req.localitate.matches(doarLitereRegex)) {
            errors.put("localitate", "City name can only contain letters!");
        } else if (req.localitate.length() > 50) {
            errors.put("localitate", "Max 50 chars!");
        }

        // 3. STREET
        if (req.strada == null || req.strada.trim().isEmpty()) {
            errors.put("strada", "Street is mandatory!");
        } else if (!req.strada.matches(doarLitereRegex)) {
            errors.put("strada", "Street name can only contain letters!");
        } else if (req.strada.length() > 100) {
            errors.put("strada", "Max 100 chars!");
        }

        // 4. NUMBER
        if (req.numar == null || req.numar.trim().isEmpty()) {
            errors.put("numar", "Number is mandatory!");
        } else if (!req.numar.matches("^[a-zA-Z0-9]+$")) {
            errors.put("numar", "Number allows only letters and digits.");
        } else if (req.numar.length() > 10) {
            errors.put("numar", "Max 10 chars!");
        }

        // 5. BLOCK (Optional)
        if (req.bloc != null && !req.bloc.trim().isEmpty()) {
            if (!req.bloc.matches("^[a-zA-Z0-9\\s]+$")) {
                errors.put("bloc", "Block allows only letters and digits.");
            } else if (req.bloc.length() > 10) {
                errors.put("bloc", "Max 10 chars!");
            }
        }

        // 6. APARTMENT (Optional)
        if (req.apartament != null && !req.apartament.trim().isEmpty()) {
            if (!req.apartament.matches("^\\d+$")) {
                errors.put("apartament", "Apartment must be a number.");
            }
        }

        return errors;
    }

    // --- DELETE ---
    @DeleteMapping("/{id}")
    public String deleteAdresa(@PathVariable Integer id) {
        // I perform a cascading delete manually to ensure referential integrity:
        // 1. Delete links between people and addresses.
        // 2. Delete incident participants linked to this address context.
        // 3. Delete incidents at this address.
        // 4. Finally, delete the address itself.
        persoanaAdresaRepository.deleteByAdresaId(id);
        persoanaIncidentRepository.deleteParticipantiByAdresa(id);
        incidentRepository.deleteByAdresaId(id);
        adresaRepository.deleteAdresaNative(id);
        return "Address and all associated records have been deleted!";
    }

    // I implemented pagination with a default sorting strategy (City -> County -> Street).
    @GetMapping("/lista-paginata")
    public Page<Adresa> getAdresePaginat(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Sort sortare = Sort.by(Sort.Direction.ASC, "localitate")
                .and(Sort.by(Sort.Direction.ASC, "judet_sau_sector"))
                .and(Sort.by(Sort.Direction.ASC, "strada"));
        return adresaRepository.findAllNativePaginat(PageRequest.of(page, size, sortare));
    }

    // I implemented a 'Smart Delete' check to warn users before deleting an address linked to critical data.
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();
        boolean hasRed = false;
        boolean hasOrange = false;

        // I check for any incidents registered at this address.
        List<Incident> incidente = incidentRepository.findByAdresaId(id);
        for (Incident i : incidente) {
            String status = i.getStatus();
            String desc = i.getTipIncident() + " (" + status + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));
            if ("Activ".equalsIgnoreCase(status)) hasRed = true;
            else if ("Închis".equalsIgnoreCase(status)) hasOrange = true;
        }

        if (hasRed) return new DeleteConfirmation(false, "BLOCKED", "Deletion Blocked", "This address has active incidents! Cannot delete.", listaTotala);
        else if (hasOrange) return new DeleteConfirmation(true, "WARNING", "Risky Deletion", "This address has closed incidents. Deleting it will remove these historical records:", listaTotala);
        else return new DeleteConfirmation(true, "SAFE", "Safe Deletion", "This address is not linked to any incidents or residents. Safe to delete.", listaTotala);
    }

    // Simple DTO class to capture incoming request data.
    public static class AdresaRequest {
        public String strada;
        public String numar;
        public String bloc;
        public String apartament;
        public String localitate;
        public String judetSauSector;
    }
}