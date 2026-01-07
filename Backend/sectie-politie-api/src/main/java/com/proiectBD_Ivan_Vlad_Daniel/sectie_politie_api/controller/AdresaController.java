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

    // --- GETTERS (Neschimbate) ---
    @GetMapping
    public List<Adresa> getAllAdrese() { return adresaRepository.getAllAdreseNative(); }

    @GetMapping("/cauta")
    public List<Adresa> cautaAdrese(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) return adresaRepository.getAllAdreseNative();
        return adresaRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Adresa getAdresaById(@PathVariable Integer id) {
        return adresaRepository.getAdresaByIdNative(id).orElseThrow(() -> new RuntimeException("Adresa nu exista!"));
    }

    // --- INSERT (VALIDARE MANUALA) ---
    @PostMapping
    public ResponseEntity<?> addAdresa(@RequestBody AdresaRequest req) {
        Map<String, String> errors = valideazaAdresa(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        String blocFinal = (req.bloc != null && req.bloc.trim().isEmpty()) ? null : req.bloc;
        Integer apInt = (req.apartament != null && !req.apartament.trim().isEmpty()) ? Integer.parseInt(req.apartament) : null;

        // 1. INSERT MANUAL
        adresaRepository.insertAdresa(
                req.judetSauSector, req.localitate, req.strada, req.numar, blocFinal, apInt
        );

        // 2. RECUPERARE ID
        Integer newId = adresaRepository.getLastInsertedId();

        // 3. RETURNARE RĂSPUNS
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Adresa salvată cu succes!");
        response.put("idAdresa", newId); // <--- Cheia pentru Frontend

        return ResponseEntity.ok(response);
    }

    // --- UPDATE (MODIFICAT) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdresa(@PathVariable Integer id, @RequestBody AdresaRequest req) {
        adresaRepository.getAdresaByIdNative(id).orElseThrow(() -> new RuntimeException("Adresa nu exista!"));

        Map<String, String> errors = valideazaAdresa(req);
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        String blocFinal = (req.bloc != null && req.bloc.trim().isEmpty()) ? null : req.bloc;
        Integer apInt = (req.apartament != null && !req.apartament.trim().isEmpty()) ? Integer.parseInt(req.apartament) : null;

        // 1. UPDATE MANUAL
        adresaRepository.updateAdresa(
                id, req.judetSauSector, req.localitate, req.strada, req.numar, blocFinal, apInt
        );

        // 2. RETURNARE OBIECT
        Adresa updated = adresaRepository.getAdresaByIdNative(id).orElse(null);
        return ResponseEntity.ok(updated);
    }

    // --- LOGICA DE VALIDARE COMUNA ---
    private Map<String, String> valideazaAdresa(AdresaRequest req) {
        Map<String, String> errors = new HashMap<>();
        String doarLitereRegex = "^[a-zA-ZăâîșțĂÂÎȘȚ\\s\\-]+$";
        String litereCifreRegex = "^[a-zA-Z0-9\\s\\-]+$";

        // --- 1. JUDEȚ / SECTOR (Obligatoriu, Litere/Cifre, Max 50) ---
        if (req.judetSauSector == null || req.judetSauSector.trim().isEmpty()) {
            errors.put("judetSauSector", "Județul/Sectorul este obligatoriu!");
        } else if (!req.judetSauSector.matches(litereCifreRegex)) {
            errors.put("judetSauSector", "Câmpul poate conține doar litere, cifre și spații.");
        } else if (req.judetSauSector.length() > 50) {
            errors.put("judetSauSector", "Maxim 50 de caractere!");
        }

        // --- 2. LOCALITATE (Obligatoriu, Litere, Max 50) ---
        if (req.localitate == null || req.localitate.trim().isEmpty()) {
            errors.put("localitate", "Localitatea este obligatorie!");
        } else if (!req.localitate.matches(doarLitereRegex)) {
            errors.put("localitate", "Localitatea poate conține doar litere!");
        } else if (req.localitate.length() > 50) {
            errors.put("localitate", "Maxim 50 de caractere!");
        }

        // --- 3. STRADA (Obligatoriu, Litere, Max 100) ---
        if (req.strada == null || req.strada.trim().isEmpty()) {
            errors.put("strada", "Strada este obligatorie!");
        } else if (!req.strada.matches(doarLitereRegex)) {
            errors.put("strada", "Strada poate conține doar litere!");
        } else if (req.strada.length() > 100) {
            errors.put("strada", "Maxim 100 de caractere!");
        }

        // --- 4. NUMĂR (Obligatoriu, Litere/Cifre, Max 10) ---
        if (req.numar == null || req.numar.trim().isEmpty()) {
            errors.put("numar", "Numărul este obligatoriu!");
        } else if (!req.numar.matches("^[a-zA-Z0-9]+$")) {
            errors.put("numar", "Nr. poate conține doar litere și cifre.");
        } else if (req.numar.length() > 10) {
            errors.put("numar", "Maxim 10 caractere!");
        }

        // --- 5. BLOC (Opțional, Litere/Cifre, Max 10) ---
        if (req.bloc != null && !req.bloc.trim().isEmpty()) {
            if (!req.bloc.matches("^[a-zA-Z0-9\\s]+$")) {
                errors.put("bloc", "Blocul poate conține doar litere și cifre.");
            } else if (req.bloc.length() > 10) {
                errors.put("bloc", "Maxim 10 caractere!");
            }
        }

        // --- 6. APARTAMENT (Opțional, Cifre) ---
        if (req.apartament != null && !req.apartament.trim().isEmpty()) {
            if (!req.apartament.matches("^\\d+$")) {
                errors.put("apartament", "Apartamentul poate conține doar cifre.");
            }
        }

        return errors;
    }

    // DELETE (Raman neschimbate)
    @DeleteMapping("/{id}")
    public String deleteAdresa(@PathVariable Integer id) {
        persoanaAdresaRepository.deleteByAdresaId(id);
        persoanaIncidentRepository.deleteParticipantiByAdresa(id);
        incidentRepository.deleteByAdresaId(id);
        adresaRepository.deleteAdresaNative(id);
        return "Adresa și toate incidentele asociate au fost șterse!";
    }

    @GetMapping("/lista-paginata")
    public Page<Adresa> getAdresePaginat(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Sort sortare = Sort.by(Sort.Direction.ASC, "localitate")
                .and(Sort.by(Sort.Direction.ASC, "judet_sau_sector"))
                .and(Sort.by(Sort.Direction.ASC, "strada"));
        return adresaRepository.findAllNativePaginat(PageRequest.of(page, size, sortare));
    }

    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();
        boolean hasRed = false;
        boolean hasOrange = false;
        List<Incident> incidente = incidentRepository.findByAdresaId(id);
        for (Incident i : incidente) {
            String status = i.getStatus();
            String desc = i.getTipIncident() + " (" + status + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));
            if ("Activ".equalsIgnoreCase(status)) hasRed = true;
            else if ("Închis".equalsIgnoreCase(status)) hasOrange = true;
        }
        if (hasRed) return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată", "Această adresă are incidente active asociate! Ștergerea ei nu este posibila!", listaTotala);
        else if (hasOrange) return new DeleteConfirmation(true, "WARNING", "Ștergere riscantă", "Această adresă are incidente inchise asociate. Ștergerea ei duce la ștergerea acestor incidente din baza de date: ", listaTotala);
        else return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Această adresă nu este asociată niciunui incident și nu are niciun locatar. Se poate șterge fără probleme!", listaTotala);
    }

    // === CLASA DTO (FARA ADNOTARI - ACUM ESTE "POJO") ===
    public static class AdresaRequest {
        public String strada;
        public String numar;
        public String bloc;
        public String apartament; // String pt a putea verifica regex
        public String localitate;
        public String judetSauSector;
    }
}