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

    // INSERT SQL (MANUAL)
    @PostMapping
    public String addPersoana(@RequestBody Persoana p) {
        persoanaRepository.insertPersoana(
                p.getNume(),
                p.getPrenume(),
                p.getCnp(),
                p.getDataNasterii(),
                p.getTelefon()
        );
        return "Persoana adăugată cu succes prin SQL!";
    }

    // UPDATE SQL (MANUAL)
    @PutMapping("/{id}")
    public String updatePersoana(@PathVariable Integer id, @RequestBody Persoana p) {
        // Verificăm dacă există (opțional, dar bun pentru siguranță)
        persoanaRepository.getPersoanaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Persoana nu exista!"));

        persoanaRepository.updatePersoana(
                id,
                p.getNume(),
                p.getPrenume(),
                p.getCnp(),
                p.getDataNasterii(),
                p.getTelefon()
        );
        return "Persoana modificată cu succes prin SQL!";
    }

    // --- ENDPOINT NOU ---
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

    // --- VERIFICARE STERGERE SMART (LOGICA ALINIATA CU POLITISTII) ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();

        boolean hasRed = false;    // Activ sau Neplatit
        boolean hasOrange = false; // Inchis sau Platit

        // 1. Analizam AMENZILE
        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPersoana(id);

        for (Amenda a : toateAmenzile) {
            String status = a.getStarePlata(); // Neplatita, Platita, Anulata
            String desc = status + " - " + a.getSuma() + " RON";
            listaTotala.add(new BlockingItem("Amendă", a.getIdAmenda(), desc));

            if ("Neplatita".equalsIgnoreCase(status)) {
                hasRed = true;
            } else if ("Platita".equalsIgnoreCase(status)) {
                hasOrange = true;
            }
            // "Anulata" e Safe (Verde), nu seteaza flag-uri
        }

        // 2. Analizam INCIDENTELE
        List<Incident> incidenteImplicate = incidentRepository.findIncidenteByPersoana(id);

        for (Incident i : incidenteImplicate) {
            String status = i.getStatus(); // Activ, Închis, Arhivat
            String desc = i.getTipIncident() + " (" + status + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));

            if ("Activ".equalsIgnoreCase(status)) {
                hasRed = true;
            } else if ("Închis".equalsIgnoreCase(status)) {
                hasOrange = true;
            }
            // "Arhivat" e Safe (Verde)
        }

        // 3. Decidem Culoarea Finala (Prioritate: Rosu > Portocaliu > Verde)
        if (hasRed) {
            return new DeleteConfirmation(
                    false,
                    "BLOCKED",
                    "Ștergere Blocată - Elemente Active",
                    "Persoana este implicată în incidente ACTIVE sau are amenzi NEPLĂTITE. Nu poate fi ștearsă până la rezolvarea acestora.",
                    listaTotala
            );
        } else if (hasOrange) {
            return new DeleteConfirmation(
                    true,
                    "WARNING",
                    "Atenție - Ștergere cu Istoric",
                    "Persoana are istoric (amenzi plătite sau incidente închise). Ștergerea va elimina definitiv aceste legături din sistem.",
                    listaTotala
            );
        } else {
            // Verde (Doar Arhivate/Anulate sau Nimic)
            return new DeleteConfirmation(
                    true,
                    "SAFE",
                    "Ștergere Sigură",
                    "Persoana nu are istoric activ sau relevant (doar cazuri arhivate sau anulate). Poate fi ștearsă.",
                    listaTotala
            );
        }
    }

    // --- DELETE CASCADE ---
    @DeleteMapping("/{id}")
    public String deletePersoana(@PathVariable Integer id) {
        // Luam numele pentru mesaj
        Persoana p = persoanaRepository.getPersoanaByIdNative(id).orElse(null);
        String nume = (p != null) ? p.getNume() + " " + p.getPrenume() : "Persoana";

        // 1. Stergem legaturile cu Adresele
        persoanaAdresaRepository.deleteByPersoanaId(id);

        // 2. Stergem legaturile cu Incidentele (Participantii)
        persoanaIncidentRepository.deleteByPersoanaId(id);

        // 3. Stergem Amenzile (Sunt pe nume personal, dispar odata cu omul)
        amendaRepository.deleteByPersoanaId(id);

        // 4. Stergem Persoana
        persoanaRepository.deletePersoanaNative(id);

        return "Succes: " + nume + " a fost șters(ă) din sistem!";
    }
}