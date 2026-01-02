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
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;


import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/politisti")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
public class PolitistController {

    @Autowired
    private PolitistRepository politistRepository;

    @Autowired
    private AmendaRepository amendaRepository;

    @Autowired
    private IncidentRepository incidentRepository; // <--- AM ADAUGAT ASTA (lipsea sau era static inainte)

    @Autowired
    private PersoanaIncidentRepository persoanaIncidentRepository;
    // =====================================================================
    // 1. VERIFICAREA (Logica Rafinata: Blocaj vs Avertisment)
    // =====================================================================
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();

        // 1. Colectam AMENZI (Toate tipurile)
        List<Amenda> amenziNeplatite = amendaRepository.findUnpaidAmenziByPolitist(id); // Ai nevoie de metoda asta in repo sa returneze List<Amenda>
        // Nota: Asigura-te ca in AmendaRepository ai metoda findByPolitist_IdPolitist(id) sau folosesti query nativ
        // Aici presupunem ca adunam toate amenzile asociate:
        List<Amenda> toateAmenzile = amendaRepository.findAllNativeByPolitist(id); // <--- FA O METODA CARE LE ADUCE PE TOATE

        for (Amenda a : toateAmenzile) {
            String desc = a.getStarePlata() + " - " + a.getSuma() + " RON";
            listaTotala.add(new BlockingItem("Amendă", a.getIdAmenda(), desc));
        }

        // 2. Colectam INCIDENTE (Toate tipurile)
        List<Incident> toateIncidentele = incidentRepository.findAllNativeByPolitist(id); // <--- FA O METODA CARE LE ADUCE PE TOATE

        for (Incident i : toateIncidentele) {
            String desc = i.getTipIncident() + " (" + i.getStatus() + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));
        }

        // 3. Determinam CULOAREA (Severitatea)
        boolean areActive = listaTotala.stream().anyMatch(item -> item.getDescriere().contains("Activ") || item.getDescriere().contains("Neplatita"));
        boolean areIstoric = !listaTotala.isEmpty();

        if (areActive) {
            return new DeleteConfirmation(false, "BLOCKED", "Ștergere Blocată",
                    "Polițistul are elemente ACTIVE. Trebuie rezolvate mai întâi.", listaTotala);
        } else if (areIstoric) {
            return new DeleteConfirmation(true, "WARNING", "Atenție - Ștergere Istoric",
                    "Polițistul are istoric (închis/plătit). Ștergerea va elimina aceste date.", listaTotala);
        } else {
            return new DeleteConfirmation(true, "SAFE", "Ștergere Sigură",
                    "Nu există date asociate. Puteți șterge.", listaTotala);
        }
    }

    // STERGEREA EFECTIVA (CASCADE)
    @DeleteMapping("/{id}")
    public String deletePolitist(@PathVariable Integer id) {
        // Luam numele inainte sa il stergem
        Politist p = politistRepository.findByIdNative(id).orElse(null);
        String numeComplet = (p != null) ? p.getNume() + " " + p.getPrenume() : "Polițistul";

        // Executam stergerea in cascada (metodele din pasii anteriori)
        persoanaIncidentRepository.stergeParticipantiDupaPolitist(id);
        incidentRepository.stergeIncidenteDupaPolitist(id);
        amendaRepository.stergeAmenziDupaPolitist(id);
        politistRepository.stergePolitistManual(id);

        return "Succes: " + numeComplet + " a fost șters definitiv din sistem!";
    }

    // =====================================================================
    // METODE STANDARD (GET, POST, PUT, PAGINARE)
    // =====================================================================

    @GetMapping
    public List<Politist> getAllPolitisti() {
        return politistRepository.toataListaPolitisti();
    }

    @GetMapping("/cauta")
    public List<Politist> cautaPolitisti(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return politistRepository.toataListaPolitisti();
        }
        return politistRepository.cautaDupaInceput(termen);
    }

    @PostMapping
    public String addPolitist(@RequestBody Politist p) {
        politistRepository.adaugaPolitistManual(
                p.getNume(),
                p.getPrenume(),
                p.getGrad(),
                p.getFunctie(),
                p.getTelefon_serviciu()
        );
        return "Politist adăugat prin SQL!";
    }

    @PutMapping("/{id}")
    public String updatePolitist(@PathVariable Integer id, @RequestBody Politist p) {
        politistRepository.updatePolitist(
                id,
                p.getNume(),
                p.getPrenume(),
                p.getGrad(),
                p.getFunctie(),
                p.getTelefon_serviciu()
        );
        return "Politist modificat prin SQL!";
    }

    @GetMapping("/{id}")
    public Politist getPolitistById(@PathVariable Integer id) {
        return politistRepository.findByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Polițistul nu există!"));
    }

    @GetMapping("/lista-paginata")
    public Page<Politist> getPolitistiPaginati(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nume") String sortBy,
            @RequestParam(defaultValue = "asc") String dir
    ) {
        Sort.Direction direction = dir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sortare = Sort.by(direction, sortBy)
                .and(Sort.by(Sort.Direction.ASC, "prenume"));

        Pageable pageable = PageRequest.of(page, size, sortare);

        return politistRepository.findAllNative(pageable);
    }
}