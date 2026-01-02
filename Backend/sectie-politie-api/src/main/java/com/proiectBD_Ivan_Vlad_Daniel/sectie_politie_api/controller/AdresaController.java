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
    public List<Adresa> getAllAdrese() {
        return adresaRepository.getAllAdreseNative();
    }



    @GetMapping("/cauta")
    public List<Adresa> cautaAdrese(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return adresaRepository.getAllAdreseNative();
        }
        return adresaRepository.cautaDupaInceput(termen);
    }

    @GetMapping("/{id}")
    public Adresa getAdresaById(@PathVariable Integer id) {
        return adresaRepository.getAdresaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Adresa nu exista!"));
    }

    // INSERT SQL
    @PostMapping
    public String addAdresa(@RequestBody Adresa a) {
        adresaRepository.insertAdresa(
                a.getJudetSauSector(),
                a.getLocalitate(),
                a.getStrada(),
                a.getNumar(),
                a.getBloc(),
                a.getApartament()
        );
        return "Adresa salvată prin SQL!";
    }

    // UPDATE SQL
    @PutMapping("/{id}")
    public String updateAdresa(@PathVariable Integer id, @RequestBody Adresa a) {
        adresaRepository.getAdresaByIdNative(id)
                .orElseThrow(() -> new RuntimeException("Adresa nu exista!"));

        adresaRepository.updateAdresa(
                id,
                a.getJudetSauSector(),
                a.getLocalitate(),
                a.getStrada(),
                a.getNumar(),
                a.getBloc(),
                a.getApartament()
        );
        return "Adresa actualizată prin SQL!";
    }

    // --- DELETE CASCADE (FARA NULL, STERGERE TOTALA) ---
    @DeleteMapping("/{id}")
    public String deleteAdresa(@PathVariable Integer id) {

        // 1. Stergem locatarii (legatura)
        persoanaAdresaRepository.deleteByAdresaId(id);

        // 2. Stergem participantii de la incidentele care au avut loc aici
        // (Altfel crapa stergerea incidentelor din cauza FK Persoane_Incidente)
        persoanaIncidentRepository.deleteParticipantiByAdresa(id);

        // 3. Stergem Incidentele de la aceasta adresa
        incidentRepository.deleteByAdresaId(id);

        // 4. Stergem Adresa fizic
        adresaRepository.deleteAdresaNative(id);

        return "Adresa și toate incidentele asociate au fost șterse!";
    }

    // --- ENDPOINT PAGINARE ---
    @GetMapping("/lista-paginata")
    public Page<Adresa> getAdresePaginat(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Sortare Tripla: Localitate -> Judet -> Strada
        // Nota: Folosim numele coloanelor din Baza de Date pentru siguranta la Query Nativ
        Sort sortare = Sort.by(Sort.Direction.ASC, "localitate")
                .and(Sort.by(Sort.Direction.ASC, "judet_sau_sector"))
                .and(Sort.by(Sort.Direction.ASC, "strada"));

        Pageable pageable = PageRequest.of(page, size, sortare);

        return adresaRepository.findAllNativePaginat(pageable);
    }

    // --- VERIFICARE STERGERE SMART ---
    @GetMapping("/verifica-stergere/{id}")
    public DeleteConfirmation verificaStergere(@PathVariable Integer id) {
        List<BlockingItem> listaTotala = new ArrayList<>();
        boolean hasRed = false;    // Activ
        boolean hasOrange = false; // Inchis

        // 1. Verificam Incidentele de la adresa
        List<Incident> incidente = incidentRepository.findByAdresaId(id);

        for (Incident i : incidente) {
            String status = i.getStatus(); // Activ, Inchis, Arhivat
            String desc = i.getTipIncident() + " (" + status + ")";
            listaTotala.add(new BlockingItem("Incident", i.getIdIncident(), desc));

            if ("Activ".equalsIgnoreCase(status)) {
                hasRed = true;
            } else if ("Închis".equalsIgnoreCase(status)) {
                hasOrange = true;
            }
        }

        if (hasRed) {
            return new DeleteConfirmation(
                    false, "BLOCKED", "Ștergere Blocată",
                    "Această adresă este locul unor incidente ACTIVE. Nu poate fi ștearsă până nu se rezolvă cazurile.", listaTotala
            );
        } else if (hasOrange) {
            return new DeleteConfirmation(
                    true, "WARNING", "Atenție - Ștergere Cascadă",
                    "La această adresă există incidente ÎNCHISE. Dacă ștergeți adresa, TOATE aceste incidente vor fi șterse definitiv din sistem!", listaTotala
            );
        } else {
            return new DeleteConfirmation(
                    true, "SAFE", "Ștergere Sigură",
                    "Adresa nu are incidente active sau importante. Poate fi ștearsă (incidentele arhivate se vor șterge automat).", listaTotala
            );
        }
    }
}