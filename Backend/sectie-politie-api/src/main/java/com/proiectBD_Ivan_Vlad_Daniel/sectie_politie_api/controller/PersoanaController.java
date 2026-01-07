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

    // SELECT SQL
    @GetMapping
    public List<Persoana> getAllPersoane() {
        return persoanaRepository.getAllPersoaneNative();
    }

    // SEARCH SQL
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
                .orElseThrow(() -> new RuntimeException("Persoana nu exista!"));
    }

    // INSERT (VALIDARE MANUALA)
    @PostMapping
    public ResponseEntity<?> addPersoana(@RequestBody Persoana p) {
        curataDatePersoana(p);
        Map<String, String> errors = valideazaPersoana(p);

        // Validări unicitate
        if (!errors.containsKey("cnp") && persoanaRepository.verificaCnpUnic(p.getCnp(), null) > 0) {
            errors.put("cnp", "Acest CNP există deja!");
        }
        if (p.getTelefon() != null && !errors.containsKey("telefon") && persoanaRepository.verificaTelefonUnic(p.getTelefon(), null) > 0) {
            errors.put("telefon", "Telefon deja existent!");
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // 1. INSERT MANUAL (SQL PUR)
        persoanaRepository.insertPersoana(
                p.getNume(), p.getPrenume(), p.getCnp(), p.getDataNasterii(), p.getTelefon()
        );

        // 2. RECUPERARE ID (SQL PUR)
        Integer newId = persoanaRepository.getLastInsertedId();
        p.setIdPersoana(newId);

        // 3. RETURNARE OBIECT
        return ResponseEntity.ok(p);
    }

    // UPDATE (VALIDARE MANUALA)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePersoana(@PathVariable Integer id, @RequestBody Persoana p) {
        persoanaRepository.getPersoanaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Persoana nu exista!"));

        curataDatePersoana(p);
        Map<String, String> errors = valideazaPersoana(p);

        if (!errors.containsKey("cnp") && persoanaRepository.verificaCnpUnic(p.getCnp(), id) > 0) {
            errors.put("cnp", "CNP deja existent!");
        }
        if (p.getTelefon() != null && !errors.containsKey("telefon") && persoanaRepository.verificaTelefonUnic(p.getTelefon(), id) > 0) {
            errors.put("telefon", "Telefon deja existent!");
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // 1. UPDATE MANUAL
        persoanaRepository.updatePersoana(
                id, p.getNume(), p.getPrenume(), p.getCnp(), p.getDataNasterii(), p.getTelefon()
        );

        // 2. RETURNARE OBIECT ACTUALIZAT
        Persoana updated = persoanaRepository.getPersoanaByIdNative(id).orElse(p);
        return ResponseEntity.ok(updated);
    }

    // --- HELPER: Curatare ---
    private void curataDatePersoana(Persoana p) {
        if (p.getTelefon() != null && p.getTelefon().trim().isEmpty()) {
            p.setTelefon(null);
        }
    }

    // --- HELPER: Validare "Babeasca" ---
    private Map<String, String> valideazaPersoana(Persoana p) {
        Map<String, String> errors = new HashMap<>();
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";

        // --- 1. NUME (Obligatoriu, Litere, Max 50) ---
        if (p.getNume() == null || p.getNume().trim().isEmpty()) {
            errors.put("nume", "Numele este obligatoriu!");
        } else if (!p.getNume().matches(doarLitereRegex)) {
            errors.put("nume", "Numele poate conține doar litere!");
        } else if (p.getNume().length() > 50) {
            errors.put("nume", "Maxim 50 de caractere!");
        }

        // --- 2. PRENUME (Obligatoriu, Litere, Max 50) ---
        if (p.getPrenume() == null || p.getPrenume().trim().isEmpty()) {
            errors.put("prenume", "Prenumele este obligatoriu!");
        } else if (!p.getPrenume().matches(doarLitereRegex)) {
            errors.put("prenume", "Prenumele poate conține doar litere!");
        } else if (p.getPrenume().length() > 50) {
            errors.put("prenume", "Maxim 50 de caractere!");
        }

        // --- 3. CNP (Obligatoriu, 13 Cifre, Validare Matematică) ---
        if (p.getCnp() == null || p.getCnp().trim().isEmpty()) {
            errors.put("cnp", "CNP-ul este obligatoriu!");
        } else if (!p.getCnp().matches("^\\d{13}$")) {
            errors.put("cnp", "CNP-ul trebuie să aibă exact 13 cifre!");
        } else if (!isCnpValidMatematic(p.getCnp())) {
            errors.put("cnp", "CNP invalid (eroare control matematic)!");
        }

        // --- 4. DATA NAȘTERII (Obligatorie, Varstă Reală) ---
        if (p.getDataNasterii() == null) {
            errors.put("dataNasterii", "Data nașterii este obligatorie!");
        } else if (!isVarstaValida(p.getDataNasterii())) {
            errors.put("dataNasterii", "Data invalidă (max 120 ani sau din viitor)!");
        }

        // --- 5. TELEFON (Opțional, Format 07xxxxxxxx) ---
        if (p.getTelefon() != null && !p.getTelefon().trim().isEmpty()) {
            if (!p.getTelefon().matches("^07\\d{8}$")) {
                errors.put("telefon", "Format telefon invalid (07xxxxxxxx)!");
            }
        }

        return errors;
    }

    // --- ENDPOINT PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Persoana> getPersoanePaginat(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nume") String sortBy,
            @RequestParam(defaultValue = "asc") String dir
    ) {
        Sort.Direction direction = dir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sortare = Sort.by(direction, sortBy).and(Sort.by(Sort.Direction.ASC, "prenume"));
        Pageable pageable = PageRequest.of(page, size, sortare);
        return persoanaRepository.findAllNativePaginat(pageable);
    }

    // --- VERIFICARE STERGERE ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();
        boolean hasRed = false;
        boolean hasOrange = false;

        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPersoana(id);
        for (Amenda a : toateAmenzile) {
            String status = a.getStarePlata();
            String desc = status + " - " + a.getSuma() + " RON";
            listaTotala.add(new BlockingItem("Amendă", a.getIdAmenda(), desc));
            if ("Neplatita".equalsIgnoreCase(status)) hasRed = true;
            else if ("Platita".equalsIgnoreCase(status)) hasOrange = true;
        }

        List<Incident> incidenteImplicate = incidentRepository.findIncidenteByPersoana(id);
        for (Incident i : incidenteImplicate) {
            String status = i.getStatus();
            String desc = i.getTipIncident() + " (" + status + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));
            if ("Activ".equalsIgnoreCase(status)) hasRed = true;
            else if ("Închis".equalsIgnoreCase(status)) hasOrange = true;
        }

        if (hasRed) return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată - Elemente Active", "Persoana are incidente active sau amenzi neplătite. Ștergerea acesteia nu este posibilă până la rezolvarea lor.", listaTotala);
        else if (hasOrange) return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere cu Istoric", "Persoana are istoric. Ștergerea acesteia va duce la ștergerea din baza de date a următoarelor incidente și amenzi: ", listaTotala);
        else return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Nu există date asociate acestei persoane. Ștergerea sa se poate face fără probleme!", listaTotala);
    }

    // --- DELETE CASCADE ---
    @DeleteMapping("/{id}")
    public String deletePersoana(@PathVariable Integer id) {
        Persoana p = persoanaRepository.getPersoanaByIdNative(id).orElse(null);
        String nume = (p != null) ? p.getNume() + " " + p.getPrenume() : "Persoana";

        persoanaAdresaRepository.deleteByPersoanaId(id);
        persoanaIncidentRepository.deleteByPersoanaId(id);
        amendaRepository.deleteByPersoanaId(id);
        persoanaRepository.deletePersoanaNative(id);

        return "Succes: " + nume + " a fost șters(ă) din sistem!";
    }

    // --- VALIDARI LOGICE ---
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