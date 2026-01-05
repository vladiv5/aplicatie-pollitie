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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/politisti")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
public class PolitistController {

    @Autowired
    private PolitistRepository politistRepository;
    @Autowired
    private AmendaRepository amendaRepository;
    @Autowired
    private IncidentRepository incidentRepository;
    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;

    // --- METODE GET STANDARD (Neschimbate) ---
    @GetMapping
    public List<Politist> getAllPolitisti() { return politistRepository.toataListaPolitisti(); }

    @GetMapping("/toata-lista")
    public List<Politist> getToataLista() {
        return politistRepository.toataListaPolitisti();
    }

    @GetMapping("/cauta")
    public List<Politist> cautaPolitisti(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) return politistRepository.toataListaPolitisti();
        return politistRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Politist getPolitistById(@PathVariable Integer id) {
        return politistRepository.findByIdNative(id).orElseThrow(() -> new RuntimeException("Polițistul nu există!"));
    }

    // --- ADD POLITIST (SQL PUR + RETURNARE OBIECT) ---
    @PostMapping
    public ResponseEntity<?> addPolitist(@RequestBody Politist p) {
        // 1. Curatare & Validare (Codul tau vechi)
        curataDatePolitist(p);
        Map<String, String> errors = valideazaPolitist(p);

        if (p.getTelefon_serviciu() != null && !errors.containsKey("telefon_serviciu")) {
            if (politistRepository.verificaTelefonUnic(p.getTelefon_serviciu(), null) > 0) {
                errors.put("telefon_serviciu", "Acest număr de telefon este deja folosit!");
            }
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // 2. INSERT MANUAL (SQL PUR)
        politistRepository.adaugaPolitistManual(
                p.getNume(), p.getPrenume(), p.getGrad(), p.getFunctie(), p.getTelefon_serviciu()
        );

        // 3. RECUPERARE ID (SQL PUR)
        // Selectam ID-ul maxim imediat dupa inserare
        Integer newId = politistRepository.getLastInsertedId();

        // 4. Setam ID-ul pe obiectul primit si il returnam
        p.setIdPolitist(newId);

        return ResponseEntity.ok(p);
    }

    // --- UPDATE POLITIST (SQL PUR + RETURNARE OBIECT) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePolitist(@PathVariable Integer id, @RequestBody Politist p) {
        // 1. Curatare & Validare
        curataDatePolitist(p);
        Map<String, String> errors = valideazaPolitist(p);

        if (p.getTelefon_serviciu() != null && !errors.containsKey("telefon_serviciu")) {
            if (politistRepository.verificaTelefonUnic(p.getTelefon_serviciu(), id) > 0) {
                errors.put("telefon_serviciu", "Acest număr de telefon este deja folosit!");
            }
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // 2. UPDATE MANUAL (SQL PUR)
        politistRepository.updatePolitist(
                id, p.getNume(), p.getPrenume(), p.getGrad(), p.getFunctie(), p.getTelefon_serviciu()
        );

        // 3. RETURNARE OBIECT ACTUALIZAT
        // Folosim findByIdNative care e SQL Pur
        Politist updatedPolitist = politistRepository.findByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Eroare la regăsirea polițistului după update"));

        return ResponseEntity.ok(updatedPolitist);
    }

    // ... METODELE AJUTATOARE (curataDatePolitist, valideazaPolitist) raman IDENTICE ...
    // Le poți copia din fișierul tău vechi, nu s-au schimbat.

    private void curataDatePolitist(Politist p) {
        if (p.getTelefon_serviciu() != null && p.getTelefon_serviciu().trim().isEmpty()) p.setTelefon_serviciu(null);
        if (p.getGrad() != null && p.getGrad().trim().isEmpty()) p.setGrad(null);
        if (p.getFunctie() != null && p.getFunctie().trim().isEmpty()) p.setFunctie(null);
    }

    private Map<String, String> valideazaPolitist(Politist p) {
        Map<String, String> errors = new HashMap<>();
        if (p.getNume() == null || p.getNume().trim().isEmpty()) errors.put("nume", "Numele este obligatoriu!");
        if (p.getPrenume() == null || p.getPrenume().trim().isEmpty()) errors.put("prenume", "Prenumele este obligatoriu!");

        if (p.getTelefon_serviciu() != null && !p.getTelefon_serviciu().matches("^07\\d{8}$")) {
            errors.put("telefon_serviciu", "Telefon invalid (07xxxxxxxx).");
        }
        return errors;
    }

    // --- STERGERE (Neschimbat) ---
    @DeleteMapping("/{id}")
    public String deletePolitist(@PathVariable Integer id) {
        Politist p = politistRepository.findByIdNative(id).orElse(null);
        String numeComplet = (p != null) ? p.getNume() + " " + p.getPrenume() : "Polițistul";

        persoanaIncidentRepository.stergeParticipantiDupaPolitist(id);
        incidentRepository.stergeIncidenteDupaPolitist(id);
        amendaRepository.stergeAmenziDupaPolitist(id);
        politistRepository.stergePolitistManual(id);

        return "Succes: " + numeComplet + " a fost șters definitiv din sistem!";
    }

    // ... Restul metodelor (verificaStergere, getPolitistiPaginati) raman la fel ...
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        // (Pastreaza codul tau existent aici)
        return new DeleteConfirmation(true, "SAFE", "Dummy Check", "Verificare...", new ArrayList<>());
        // Am pus dummy doar ca sa fie scurt aici, tu pastreaza-l pe al tau complet!
    }

    @GetMapping("/lista-paginata")
    public Page<Politist> getPolitistiPaginati(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nume") String sortBy,
            @RequestParam(defaultValue = "asc") String dir
    ) {
        Sort.Direction direction = dir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sortare = Sort.by(direction, sortBy).and(Sort.by(Sort.Direction.ASC, "prenume"));
        Pageable pageable = PageRequest.of(page, size, sortare);
        return politistRepository.findAllNative(pageable);
    }
}