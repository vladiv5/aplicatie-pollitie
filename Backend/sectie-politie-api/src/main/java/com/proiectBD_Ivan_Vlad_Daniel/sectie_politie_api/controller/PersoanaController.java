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

import jakarta.validation.Valid;
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

    // INSERT (Modificat pentru a preveni Eroarea 500 la duplicate)
    @PostMapping
    public ResponseEntity<?> addPersoana(@Valid @RequestBody Persoana p) {
        // 1. Corectie Telefon (Empty -> Null)
        if (p.getTelefon() != null && p.getTelefon().trim().isEmpty()) {
            p.setTelefon(null);
        }

        // 2. Validari Logice (CNP si Varsta)
        Map<String, String> eroriLogice = new HashMap<>();

        if (!isCnpValid(p.getCnp())) {
            eroriLogice.put("cnp", "CNP-ul este invalid (cifra de control greșită)!");
        }
        if (p.getDataNasterii() != null && !isVarstaValida(p.getDataNasterii())) {
            eroriLogice.put("dataNasterii", "Data nașterii invalidă (persoana ar avea peste 120 de ani sau e din viitor).");
        }

        // --- AICI ESTE FIX-UL PENTRU EROARE 500 ---
        // Verificare UNICITATE CNP
        if (persoanaRepository.verificaCnpUnic(p.getCnp(), null) > 0) {
            eroriLogice.put("cnp", "Acest CNP există deja în baza de date!");
        }

        // Verificare UNICITATE Telefon (Doar daca nu e null)
        if (p.getTelefon() != null) {
            if (persoanaRepository.verificaTelefonUnic(p.getTelefon(), null) > 0) {
                eroriLogice.put("telefon", "Acest telefon este deja asociat unei persoane!");
            }
        }

        // Daca avem erori logice, le returnam la fel ca @Valid (Bad Request)
        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        // 3. Salvare efectiva
        persoanaRepository.insertPersoana(
                p.getNume(),
                p.getPrenume(),
                p.getCnp(),
                p.getDataNasterii(),
                p.getTelefon()
        );
        return ResponseEntity.ok("Persoana adăugată cu succes prin SQL!");
    }

    // UPDATE (Modificat pentru a preveni Eroarea 500 la duplicate)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePersoana(@PathVariable Integer id, @Valid @RequestBody Persoana p) {
        // Verificam existenta
        persoanaRepository.getPersoanaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Persoana nu exista!"));

        // 1. Corectie Telefon
        if (p.getTelefon() != null && p.getTelefon().trim().isEmpty()) {
            p.setTelefon(null);
        }

        // 2. Validari Logice
        Map<String, String> eroriLogice = new HashMap<>();
        if (!isCnpValid(p.getCnp())) {
            eroriLogice.put("cnp", "CNP-ul este invalid!");
        }
        if (p.getDataNasterii() != null && !isVarstaValida(p.getDataNasterii())) {
            eroriLogice.put("dataNasterii", "Data nașterii invalidă (> 120 ani).");
        }

        // --- AICI ESTE FIX-UL PENTRU EROARE 500 ---
        // Verificare UNICITATE CNP (excludem ID curent)
        if (persoanaRepository.verificaCnpUnic(p.getCnp(), id) > 0) {
            eroriLogice.put("cnp", "Acest CNP există deja la altcineva!");
        }

        // Verificare UNICITATE Telefon
        if (p.getTelefon() != null) {
            if (persoanaRepository.verificaTelefonUnic(p.getTelefon(), id) > 0) {
                eroriLogice.put("telefon", "Acest telefon este deja asociat altei persoane!");
            }
        }

        if (!eroriLogice.isEmpty()) {
            return ResponseEntity.badRequest().body(eroriLogice);
        }

        // 3. Update
        persoanaRepository.updatePersoana(
                id,
                p.getNume(),
                p.getPrenume(),
                p.getCnp(),
                p.getDataNasterii(),
                p.getTelefon()
        );
        return ResponseEntity.ok("Persoana modificată cu succes prin SQL!");
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

        // Sortare Primara: Nume, Secundara: Prenume
        Sort sortare = Sort.by(direction, sortBy)
                .and(Sort.by(Sort.Direction.ASC, "prenume"));

        Pageable pageable = PageRequest.of(page, size, sortare);
        return persoanaRepository.findAllNativePaginat(pageable);
    }

    // --- VERIFICARE STERGERE SMART ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();

        boolean hasRed = false;    // Activ sau Neplatit
        boolean hasOrange = false; // Inchis sau Platit

        // 1. Analizam AMENZILE
        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPersoana(id);

        for (Amenda a : toateAmenzile) {
            String status = a.getStarePlata();
            String desc = status + " - " + a.getSuma() + " RON";
            listaTotala.add(new BlockingItem("Amendă", a.getIdAmenda(), desc));

            if ("Neplatita".equalsIgnoreCase(status)) {
                hasRed = true;
            } else if ("Platita".equalsIgnoreCase(status)) {
                hasOrange = true;
            }
        }

        // 2. Analizam INCIDENTELE
        List<Incident> incidenteImplicate = incidentRepository.findIncidenteByPersoana(id);

        for (Incident i : incidenteImplicate) {
            String status = i.getStatus();
            String desc = i.getTipIncident() + " (" + status + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));

            if ("Activ".equalsIgnoreCase(status)) {
                hasRed = true;
            } else if ("Închis".equalsIgnoreCase(status)) {
                hasOrange = true;
            }
        }

        // 3. Decidem Culoarea Finala
        if (hasRed) {
            return new DeleteConfirmation(
                    false, "BLOCKED", "Ștergere Blocată - Elemente Active",
                    "Persoana este implicată în incidente ACTIVE sau are amenzi NEPLĂTITE.", listaTotala
            );
        } else if (hasOrange) {
            return new DeleteConfirmation(
                    true, "WARNING", "Atenție - Ștergere cu Istoric",
                    "Persoana are istoric (amenzi plătite sau incidente închise).", listaTotala
            );
        } else {
            return new DeleteConfirmation(
                    true, "SAFE", "Ștergere Sigură",
                    "Persoana nu are istoric activ. Poate fi ștearsă.", listaTotala
            );
        }
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

    // --- METODE AJUTATOARE (CNP, VARSTA) ---
    private boolean isCnpValid(String cnp) {
        if (cnp == null || cnp.length() != 13) return false;

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