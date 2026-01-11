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

/** Controller pentru gestionarea resursei umane (Politisti)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
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
        return politistRepository.findByIdNative(id).orElseThrow(() -> new RuntimeException("Polițistul nu există!"));
    }

    // --- ADD POLITIST ---
    @PostMapping
    public ResponseEntity<?> addPolitist(@RequestBody Politist p) {
        curataDatePolitist(p);
        Map<String, String> errors = valideazaPolitist(p);

        if (p.getTelefon_serviciu() != null && !errors.containsKey("telefon_serviciu")) {
            if (politistRepository.verificaTelefonUnic(p.getTelefon_serviciu(), null) > 0) {
                errors.put("telefon_serviciu", "Acest număr de telefon este deja folosit!");
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
                errors.put("telefon_serviciu", "Acest număr de telefon este deja folosit!");
            }
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        politistRepository.updatePolitist(
                id, p.getNume(), p.getPrenume(), p.getGrad(), p.getFunctie(), p.getTelefon_serviciu()
        );

        Politist updatedPolitist = politistRepository.findByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Eroare la regăsirea polițistului după update"));

        return ResponseEntity.ok(updatedPolitist);
    }

    // --- HELPER VALIDARE ---
    private Map<String, String> valideazaPolitist(Politist p) {
        Map<String, String> errors = new HashMap<>();
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";

        if (p.getNume() == null || p.getNume().trim().isEmpty()) {
            errors.put("nume", "Numele este obligatoriu!");
        } else if (!p.getNume().matches(doarLitereRegex)) {
            errors.put("nume", "Numele poate conține doar litere!");
        } else if (p.getNume().length() > 50) {
            errors.put("nume", "Maxim 50 de caractere!");
        }

        if (p.getPrenume() == null || p.getPrenume().trim().isEmpty()) {
            errors.put("prenume", "Prenumele este obligatoriu!");
        } else if (!p.getPrenume().matches(doarLitereRegex)) {
            errors.put("prenume", "Prenumele poate conține doar litere!");
        } else if (p.getPrenume().length() > 50) {
            errors.put("prenume", "Maxim 50 de caractere!");
        }

        if (p.getGrad() != null && !p.getGrad().trim().isEmpty()) {
            if (!p.getGrad().matches(doarLitereRegex)) {
                errors.put("grad", "Gradul poate conține doar litere!");
            }
        }

        if (p.getTelefon_serviciu() != null && !p.getTelefon_serviciu().matches("^07\\d{8}$")) {
            errors.put("telefon_serviciu", "Format telefon invalid (07xxxxxxxx).");
        }

        return errors;
    }

    private void curataDatePolitist(Politist p) {
        if (p.getTelefon_serviciu() != null && p.getTelefon_serviciu().trim().isEmpty()) p.setTelefon_serviciu(null);
        if (p.getGrad() != null && p.getGrad().trim().isEmpty()) p.setGrad(null);
        if (p.getFunctie() != null && p.getFunctie().trim().isEmpty()) p.setFunctie(null);
    }

    // --- STERGERE ---
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

    // --- VERIFICARE STERGERE ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();

        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPolitist(id);
        for (Amenda a : toateAmenzile) {
            String desc = a.getStarePlata() + " - " + a.getSuma() + " RON";
            listaTotala.add(new BlockingItem("Amendă", a.getIdAmenda(), desc));
        }

        List<Incident> toateIncidentele = incidentRepository.findAllNativeByPolitist(id);
        for (Incident i : toateIncidentele) {
            String desc = i.getTipIncident() + " (" + i.getStatus() + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));
        }

        boolean areActive = listaTotala.stream()
                .anyMatch(item -> item.getDescriere().contains("Activ") || item.getDescriere().contains("Neplatita"));

        if (areActive) {
            return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată", "Polițistul are elemente active.", listaTotala);
        } else if (!listaTotala.isEmpty()) {
            return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere Istoric", "Polițistul are istoric. Confirmati stergerea?", listaTotala);
        } else {
            return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Nu există date asociate.", listaTotala);
        }
    }

    @GetMapping("/lista-paginata")
    public Page<Politist> getPolitistiPaginati(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Sort sortare = Sort.by(Sort.Direction.ASC, "nume").and(Sort.by(Sort.Direction.ASC, "prenume"));
        return politistRepository.findAllNative(PageRequest.of(page, size, sortare));
    }

    // Aduc dosarul complet al politistului (incidente + amenzi)
    @GetMapping("/{id}/dosar-personal")
    public ResponseEntity<?> getDosarPersonal(@PathVariable Integer id) {
        if (id == -1) {
            return ResponseEntity.ok(Map.of("incidente", new ArrayList<>(), "amenzi", new ArrayList<>()));
        }

        politistRepository.findByIdNative(id).orElseThrow(() -> new RuntimeException("Polițistul nu există!"));

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