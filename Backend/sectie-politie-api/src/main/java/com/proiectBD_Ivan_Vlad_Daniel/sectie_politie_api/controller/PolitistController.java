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
        // Regex pentru litere (include diacritice românești), spații și cratimă
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";

        // --- VALIDARE NUME (Obligatoriu, Litere, Max 50) ---
        if (p.getNume() == null || p.getNume().trim().isEmpty()) {
            errors.put("nume", "Numele este obligatoriu!");
        } else if (!p.getNume().matches(doarLitereRegex)) {
            errors.put("nume", "Numele poate conține doar litere!");
        } else if (p.getNume().length() > 50) {
            errors.put("nume", "Maxim 50 de caractere!");
        }

        // --- VALIDARE PRENUME (Obligatoriu, Litere, Max 50) ---
        if (p.getPrenume() == null || p.getPrenume().trim().isEmpty()) {
            errors.put("prenume", "Prenumele este obligatoriu!");
        } else if (!p.getPrenume().matches(doarLitereRegex)) {
            errors.put("prenume", "Prenumele poate conține doar litere!");
        } else if (p.getPrenume().length() > 50) {
            errors.put("prenume", "Maxim 50 de caractere!");
        }

        // --- VALIDARE GRAD (Opțional, Litere, Max 50) ---
        if (p.getGrad() != null && !p.getGrad().trim().isEmpty()) {
            if (!p.getGrad().matches(doarLitereRegex)) {
                errors.put("grad", "Gradul poate conține doar litere!");
            } else if (p.getGrad().length() > 50) {
                errors.put("grad", "Maxim 50 de caractere!");
            }
        }

        // --- VALIDARE FUNCȚIE (Opțional, Litere, Max 100) ---
        if (p.getFunctie() != null && !p.getFunctie().trim().isEmpty()) {
            if (!p.getFunctie().matches(doarLitereRegex)) {
                errors.put("functie", "Funcția poate conține doar litere!");
            } else if (p.getFunctie().length() > 100) {
                errors.put("functie", "Maxim 100 de caractere!");
            }
        }

        // --- VALIDARE TELEFON (Format fix) ---
        if (p.getTelefon_serviciu() != null && !p.getTelefon_serviciu().trim().isEmpty()) {
            if (!p.getTelefon_serviciu().matches("^07\\d{8}$")) {
                errors.put("telefon_serviciu", "Format telefon invalid (07xxxxxxxx).");
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

        // 1. Verificăm Amenzile
        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPolitist(id);
        for (Amenda a : toateAmenzile) {
            String desc = a.getStarePlata() + " - " + a.getSuma() + " RON";
            listaTotala.add(new BlockingItem("Amendă", a.getIdAmenda(), desc));
        }

        // 2. Verificăm Incidentele
        List<Incident> toateIncidentele = incidentRepository.findAllNativeByPolitist(id);
        for (Incident i : toateIncidentele) {
            String desc = i.getTipIncident() + " (" + i.getStatus() + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));
        }

        // 3. Analizăm dacă există elemente care blochează ștergerea ("Active" sau "Neplatite")
        // Verificăm textul din descriere pentru a determina gravitatea
        boolean areActive = listaTotala.stream()
                .anyMatch(item -> item.getDescriere().contains("Activ") || item.getDescriere().contains("Neplatita"));

        boolean areIstoric = !listaTotala.isEmpty();

        // 4. Returnăm rezultatul
        if (areActive) {
            return new DeleteConfirmation(
                    false,
                    "BLOCKED",
                    "Ștergere Blocată",
                    "Polițistul are elemente active (Incidente în lucru sau Amenzi neplătite). Nu poate fi șters până la rezolvarea lor!",
                    listaTotala
            );
        } else if (areIstoric) {
            return new DeleteConfirmation(
                    true,
                    "WARNING",
                    "Atenție - Ștergere Istoric",
                    "Polițistul nu mai are cazuri active, dar are istoric. Ștergerea lui va duce la ștergerea definitivă din baza de date a următoarelor înregistrări:",
                    listaTotala
            );
        } else {
            return new DeleteConfirmation(
                    true,
                    "SAFE",
                    "Ștergere Sigură",
                    "Nu există date asociate acestui polițist. Ștergerea se poate face fără probleme!",
                    listaTotala
            );
        }
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

    @GetMapping("/{id}/dosar-personal")
    public ResponseEntity<?> getDosarPersonal(@PathVariable Integer id) {

        // 1. TRATARE SPECIALĂ PENTRU ADMINUL BACKDOOR (ID -1)
        if (id == -1) {
            Map<String, Object> emptyDosar = new HashMap<>();
            emptyDosar.put("incidente", new ArrayList<>());
            emptyDosar.put("amenzi", new ArrayList<>());
            emptyDosar.put("totalAmenziValoare", BigDecimal.ZERO);
            emptyDosar.put("totalIncidente", 0);
            emptyDosar.put("totalAmenziCount", 0);
            return ResponseEntity.ok(emptyDosar);
        }

        // 2. Verificăm existența în DB (Pentru polițiști reali)
        politistRepository.findByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Polițistul nu există!"));

        // 3. Extragem datele
        List<Incident> incidente = incidentRepository.findAllNativeByPolitist(id);
        List<Amenda> amenzi = amendaRepository.findAllNativeByPolitist(id);

        // 4. Calculăm totalul
        BigDecimal totalValoare = BigDecimal.ZERO;
        for (Amenda a : amenzi) {
            if (a.getSuma() != null) {
                totalValoare = totalValoare.add(a.getSuma());
            }
        }

        // 5. Construim răspunsul
        Map<String, Object> dosar = new HashMap<>();
        dosar.put("incidente", incidente);
        dosar.put("amenzi", amenzi);
        dosar.put("totalAmenziValoare", totalValoare);
        dosar.put("totalIncidente", incidente.size());
        dosar.put("totalAmenziCount", amenzi.size());

        return ResponseEntity.ok(dosar);
    }
}