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

    @GetMapping("/cauta")
    public List<Politist> cautaPolitisti(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) return politistRepository.toataListaPolitisti();
        return politistRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Politist getPolitistById(@PathVariable Integer id) {
        return politistRepository.findByIdNative(id).orElseThrow(() -> new RuntimeException("Polițistul nu există!"));
    }

    // --- ADD POLITIST (VALIDARE MANUALA) ---
    @PostMapping
    public ResponseEntity<?> addPolitist(@RequestBody Politist p) {
        // 1. Curatare date (Empty -> Null)
        curataDatePolitist(p);

        // 2. Validare Manuala (Format + Lungime)
        Map<String, String> errors = valideazaPolitist(p);

        // 3. Validare Unicitate Telefon (Doar daca e valid formatul si nu e null)
        if (p.getTelefon_serviciu() != null && !errors.containsKey("telefon_serviciu")) {
            if (politistRepository.verificaTelefonUnic(p.getTelefon_serviciu(), null) > 0) {
                errors.put("telefon_serviciu", "Acest număr de telefon este deja folosit!");
            }
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // 4. Salvare
        politistRepository.adaugaPolitistManual(
                p.getNume(), p.getPrenume(), p.getGrad(), p.getFunctie(), p.getTelefon_serviciu()
        );
        return ResponseEntity.ok("Politist adăugat cu succes!");
    }

    // --- UPDATE POLITIST (VALIDARE MANUALA) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePolitist(@PathVariable Integer id, @RequestBody Politist p) {
        // 1. Curatare date
        curataDatePolitist(p);

        // 2. Validare Manuala
        Map<String, String> errors = valideazaPolitist(p);

        // 3. Validare Unicitate Telefon
        if (p.getTelefon_serviciu() != null && !errors.containsKey("telefon_serviciu")) {
            if (politistRepository.verificaTelefonUnic(p.getTelefon_serviciu(), id) > 0) {
                errors.put("telefon_serviciu", "Acest număr de telefon este deja folosit!");
            }
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // 4. Update
        politistRepository.updatePolitist(
                id, p.getNume(), p.getPrenume(), p.getGrad(), p.getFunctie(), p.getTelefon_serviciu()
        );
        return ResponseEntity.ok("Politist modificat cu succes!");
    }

    // --- METODA AJUTATOARE: CURATARE ---
    private void curataDatePolitist(Politist p) {
        if (p.getTelefon_serviciu() != null && p.getTelefon_serviciu().trim().isEmpty()) p.setTelefon_serviciu(null);
        if (p.getGrad() != null && p.getGrad().trim().isEmpty()) p.setGrad(null);
        if (p.getFunctie() != null && p.getFunctie().trim().isEmpty()) p.setFunctie(null);
    }

    // --- METODA AJUTATOARE: VALIDARE BABEASCA ---
    private Map<String, String> valideazaPolitist(Politist p) {
        Map<String, String> errors = new HashMap<>();

        // 1. NUME (Obligatoriu, Litere/Spatii/Cratima, Max 50)
        if (p.getNume() == null || p.getNume().trim().isEmpty()) {
            errors.put("nume", "Numele este obligatoriu!");
        } else {
            if (!p.getNume().matches("^[a-zA-ZăâîșțĂÂÎȘȚ -]+$")) {
                errors.put("nume", "Numele poate conține doar litere, spații sau cratimă.");
            } else if (p.getNume().length() > 50) {
                errors.put("nume", "Numele este prea lung (max 50 caractere).");
            }
        }

        // 2. PRENUME (Obligatoriu, Litere/Spatii/Cratima, Max 50)
        if (p.getPrenume() == null || p.getPrenume().trim().isEmpty()) {
            errors.put("prenume", "Prenumele este obligatoriu!");
        } else {
            if (!p.getPrenume().matches("^[a-zA-ZăâîșțĂÂÎȘȚ -]+$")) {
                errors.put("prenume", "Prenumele poate conține doar litere, spații sau cratimă.");
            } else if (p.getPrenume().length() > 50) {
                errors.put("prenume", "Prenumele este prea lung (max 50 caractere).");
            }
        }

        // 3. GRAD (Optional, Litere/Punct/Cratima/Spatii, Max 50)
        if (p.getGrad() != null) {
            if (!p.getGrad().matches("^[a-zA-ZăâîșțĂÂÎȘȚ .-]+$")) {
                errors.put("grad", "Gradul poate conține doar litere, puncte sau spații.");
            } else if (p.getGrad().length() > 50) {
                errors.put("grad", "Gradul este prea lung (max 50 caractere).");
            }
        }

        // 4. FUNCTIE (Optional, Litere/Punct/Cratima/Spatii, Max 100)
        if (p.getFunctie() != null) {
            if (!p.getFunctie().matches("^[a-zA-ZăâîșțĂÂÎȘȚ .-]+$")) {
                errors.put("functie", "Funcția poate conține doar litere, puncte sau spații.");
            } else if (p.getFunctie().length() > 100) {
                errors.put("functie", "Funcția este prea lungă (max 100 caractere).");
            }
        }

        // 5. TELEFON (Optional, fix 10 cifre, incepe cu 07)
        if (p.getTelefon_serviciu() != null) {
            if (!p.getTelefon_serviciu().matches("^07\\d{8}$")) {
                errors.put("telefon_serviciu", "Telefonul trebuie să înceapă cu '07' și să aibă 10 cifre.");
            }
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

    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();
        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPolitist(id);
        for (Amenda a : toateAmenzile) {
            listaTotala.add(new BlockingItem("Amendă", a.getIdAmenda(), a.getStarePlata() + " - " + a.getSuma() + " RON"));
        }
        List<Incident> toateIncidentele = incidentRepository.findAllNativeByPolitist(id);
        for (Incident i : toateIncidentele) {
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), i.getTipIncident() + " (" + i.getStatus() + ")"));
        }
        boolean areActive = listaTotala.stream().anyMatch(item -> item.getDescriere().contains("Activ") || item.getDescriere().contains("Neplatita"));
        boolean areIstoric = !listaTotala.isEmpty();

        if (areActive) return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată", "Polițistul are elemente ACTIVE.", listaTotala);
        else if (areIstoric) return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere Istoric", "Polițistul are istoric.", listaTotala);
        else return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Nu există date asociate.", listaTotala);
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