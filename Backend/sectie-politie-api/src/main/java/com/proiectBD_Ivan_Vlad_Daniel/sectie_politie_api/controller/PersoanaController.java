package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.BlockingItem;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.Map;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller for managing Persons (Citizens).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@RestController
@RequestMapping("/api/persoane")
@CrossOrigin(origins = "http://localhost:3000")
public class PersoanaController {

    @Autowired
    private PersoanaRepository persoanaRepository;
    @Autowired
    private AmendaRepository amendaRepository;
    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;
    @Autowired
    private PersoanaAdresaRepository persoanaAdresaRepository;
    @Autowired
    private IncidentRepository incidentRepository;

    // --- GETTERS ---
    @GetMapping
    public List<Persoana> getAllPersoane() {
        return persoanaRepository.getAllPersoaneNative();
    }

    @GetMapping("/cauta")
    public List<Persoana> cautaPersoane(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return persoanaRepository.getAllPersoaneNative();
        }
        return persoanaRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Persoana getPersoanaById(@PathVariable Integer id) {
        return persoanaRepository.getPersoanaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Person does not exist!"));
    }

    // --- INSERT ---
    @PostMapping
    public ResponseEntity<?> addPersoana(@RequestBody Persoana p) {
        curataDatePersoana(p);
        Map<String, String> errors = valideazaPersoana(p);

        // I perform uniqueness checks for CNP and Phone number.
        if (!errors.containsKey("cnp") && persoanaRepository.verificaCnpUnic(p.getCnp(), null) > 0) {
            errors.put("cnp", "This CNP already exists!");
        }
        if (p.getTelefon() != null && !errors.containsKey("telefon") && persoanaRepository.verificaTelefonUnic(p.getTelefon(), null) > 0) {
            errors.put("telefon", "Phone number already exists!");
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        persoanaRepository.insertPersoana(
                p.getNume(), p.getPrenume(), p.getCnp(), p.getDataNasterii(), p.getTelefon()
        );

        Integer newId = persoanaRepository.getLastInsertedId();
        p.setIdPersoana(newId);

        return ResponseEntity.ok(p);
    }

    // --- UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePersoana(@PathVariable Integer id, @RequestBody Persoana p) {
        persoanaRepository.getPersoanaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Person does not exist!"));

        curataDatePersoana(p);
        Map<String, String> errors = valideazaPersoana(p);

        // I ensure the updated CNP/Phone doesn't conflict with another person's record (excluding self).
        if (!errors.containsKey("cnp") && persoanaRepository.verificaCnpUnic(p.getCnp(), id) > 0) {
            errors.put("cnp", "CNP already exists!");
        }
        if (p.getTelefon() != null && !errors.containsKey("telefon") && persoanaRepository.verificaTelefonUnic(p.getTelefon(), id) > 0) {
            errors.put("telefon", "Phone number already exists!");
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        persoanaRepository.updatePersoana(
                id, p.getNume(), p.getPrenume(), p.getCnp(), p.getDataNasterii(), p.getTelefon()
        );

        Persoana updated = persoanaRepository.getPersoanaByIdNative(id).orElse(p);
        return ResponseEntity.ok(updated);
    }

    // --- VALIDATION HELPER ---
    private Map<String, String> valideazaPersoana(Persoana p) {
        Map<String, String> errors = new HashMap<>();
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";

        // 1. Name
        if (p.getNume() == null || p.getNume().trim().isEmpty()) {
            errors.put("nume", "Last name is mandatory!");
        } else if (!p.getNume().matches(doarLitereRegex)) {
            errors.put("nume", "Last name allows only letters!");
        } else if (p.getNume().length() > 50) {
            errors.put("nume", "Max 50 chars!");
        }

        // 2. Surname
        if (p.getPrenume() == null || p.getPrenume().trim().isEmpty()) {
            errors.put("prenume", "First name is mandatory!");
        } else if (!p.getPrenume().matches(doarLitereRegex)) {
            errors.put("prenume", "First name allows only letters!");
        } else if (p.getPrenume().length() > 50) {
            errors.put("prenume", "Max 50 chars!");
        }

        // 3. CNP
        if (p.getCnp() == null || p.getCnp().trim().isEmpty()) {
            errors.put("cnp", "CNP is mandatory!");
        } else if (!p.getCnp().matches("^\\d{13}$")) {
            errors.put("cnp", "CNP must be exactly 13 digits!");
        } else if (!isCnpValidMatematic(p.getCnp())) {
            errors.put("cnp", "Invalid CNP (Control digit mismatch)!");
        }

        // 4. Birth Date
        if (p.getDataNasterii() == null) {
            errors.put("dataNasterii", "Birth date is mandatory!");
        } else if (!isVarstaValida(p.getDataNasterii())) {
            errors.put("dataNasterii", "Invalid date (future or > 120 years ago)!");
        }

        // 5. Phone
        if (p.getTelefon() != null && !p.getTelefon().trim().isEmpty()) {
            if (!p.getTelefon().matches("^07\\d{8}$")) {
                errors.put("telefon", "Invalid format (07xxxxxxxx)!");
            }
        }

        return errors;
    }

    private void curataDatePersoana(Persoana p) {
        if (p.getTelefon() != null && p.getTelefon().trim().isEmpty()) {
            p.setTelefon(null);
        }
    }

    // --- DELETE ---
    @DeleteMapping("/{id}")
    public String deletePersoana(@PathVariable Integer id) {
        Persoana p = persoanaRepository.getPersoanaByIdNative(id).orElse(null);
        String nume = (p != null) ? p.getNume() + " " + p.getPrenume() : "Person";

        // I clean up all references (addresses, incidents, fines) before deleting the person.
        persoanaAdresaRepository.deleteByPersoanaId(id);
        persoanaIncidentRepository.deleteByPersoanaId(id);
        amendaRepository.deleteByPersoanaId(id);
        persoanaRepository.deletePersoanaNative(id);

        return "Success: " + nume + " has been deleted from the system!";
    }

    // --- DELETE VERIFICATION ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();
        boolean hasRed = false;
        boolean hasOrange = false;

        // I scan for unpaid fines.
        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPersoana(id);
        for (Amenda a : toateAmenzile) {
            String status = a.getStarePlata();
            String desc = status + " - " + a.getSuma() + " RON";
            listaTotala.add(new BlockingItem("Fine", a.getIdAmenda(), desc));
            if ("Neplatita".equalsIgnoreCase(status)) hasRed = true;
            else if ("Platita".equalsIgnoreCase(status)) hasOrange = true;
        }

        // I scan for active incidents.
        List<Incident> incidenteImplicate = incidentRepository.findIncidenteByPersoana(id);
        for (Incident i : incidenteImplicate) {
            String status = i.getStatus();
            String desc = i.getTipIncident() + " (" + status + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));
            if ("Activ".equalsIgnoreCase(status)) hasRed = true;
            else if ("Închis".equalsIgnoreCase(status)) hasOrange = true;
        }

        if (hasRed) return new DeleteConfirmation(false, "BLOCKED", "Deletion Blocked", "Person has active incidents or unpaid fines.", listaTotala);
        else if (hasOrange) return new DeleteConfirmation(true, "WARNING", "Warning - History Deletion", "Person has history records. Deletion is irreversible.", listaTotala);
        else return new DeleteConfirmation(true, "SAFE", "Safe Deletion", "No associated data found.", listaTotala);
    }

    // --- PAGINATION ---
    @GetMapping("/lista-paginata")
    public Page<Persoana> getPersoanePaginat(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Sort sortare = Sort.by(Sort.Direction.ASC, "nume").and(Sort.by(Sort.Direction.ASC, "prenume"));
        return persoanaRepository.findAllNativePaginat(PageRequest.of(page, size, sortare));
    }

    // --- MATHEMATICAL VALIDATIONS ---
    // I implemented the standard Romanian CNP control digit algorithm.
    private boolean isCnpValidMatematic(String cnp) {
        String constanta = "279146358279";
        int suma = 0;
        for (int i = 0; i < 12; i++) {
            int cifraCNP = Character.getNumericValue(cnp.charAt(i));
            int cifraConst = Character.getNumericValue(constanta.charAt(i));
            suma += cifraCNP * cifraConst;
        }
        int rest = suma % 11;
        int cifraControl = (rest == 10) ? 1 : rest;
        int cifraControlReala = Character.getNumericValue(cnp.charAt(12));
        return cifraControl == cifraControlReala;
    }

    private boolean isVarstaValida(LocalDate dataNasterii) {
        if (dataNasterii == null) return true;
        LocalDate acum = LocalDate.now();
        int varsta = Period.between(dataNasterii, acum).getYears();
        return varsta <= 120 && varsta >= 0;
    }
}