package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.BlockingItem;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto.DeleteConfirmation;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Adresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AdresaRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaAdresaRepository;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaIncidentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

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

    // INSERT (Folosim Request DTO)
    @PostMapping
    public ResponseEntity<?> addAdresa(@Valid @RequestBody AdresaRequest req) {
        // Corectie Empty -> Null
        if (req.bloc != null && req.bloc.trim().isEmpty()) req.bloc = null;

        // Conversie Apartament String -> Integer (Sigur e valid aici datorita Regex)
        Integer apInt = null;
        if (req.apartament != null && !req.apartament.trim().isEmpty()) {
            apInt = Integer.parseInt(req.apartament);
        }

        adresaRepository.insertAdresa(
                req.judetSauSector,
                req.localitate,
                req.strada,
                req.numar,
                req.bloc,
                apInt // <--- Trimitem Integer
        );
        return ResponseEntity.ok("Adresa salvată cu succes!");
    }

    // UPDATE (Folosim Request DTO)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdresa(@PathVariable Integer id, @Valid @RequestBody AdresaRequest req) {
        adresaRepository.getAdresaByIdNative(id).orElseThrow(() -> new RuntimeException("Adresa nu exista!"));

        if (req.bloc != null && req.bloc.trim().isEmpty()) req.bloc = null;

        Integer apInt = null;
        if (req.apartament != null && !req.apartament.trim().isEmpty()) {
            apInt = Integer.parseInt(req.apartament);
        }

        adresaRepository.updateAdresa(
                id,
                req.judetSauSector,
                req.localitate,
                req.strada,
                req.numar,
                req.bloc,
                apInt
        );
        return ResponseEntity.ok("Adresa actualizată cu succes!");
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
        if (hasRed) return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată", "Incidente ACTIVE prezente.", listaTotala);
        else if (hasOrange) return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere Cascadă", "Incidente ÎNCHISE prezente.", listaTotala);
        else return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură", "Se poate șterge.", listaTotala);
    }

    // === CLASA DTO INTERNA ===
    public static class AdresaRequest {
        @NotBlank(message = "Strada este obligatorie!")
        @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ ]+$", message = "Strada poate conține doar litere și spații.")
        public String strada;

        @NotBlank(message = "Numărul este obligatoriu!")
        @Pattern(regexp = "^$|^[a-zA-Z0-9]+$", message = "Nr. poate conține doar litere și cifre.")
        public String numar;

        public String bloc; // Optional

        // AICI E CHEIA: Primim String, validam Regex, apoi in controller facem Int
        @Pattern(regexp = "^$|^\\d+$", message = "Apartamentul poate conține doar cifre.")
        public String apartament;

        @NotBlank(message = "Localitatea este obligatorie!")
        @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ -]+$", message = "Localitatea poate conține doar litere, spații sau cratimă.")
        public String localitate;

        @NotBlank(message = "Județul/Sectorul este obligatoriu!")
        @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ0-9 ]+$", message = "Câmpul poate conține doar litere, cifre și spații.")
        public String judetSauSector;
    }
}