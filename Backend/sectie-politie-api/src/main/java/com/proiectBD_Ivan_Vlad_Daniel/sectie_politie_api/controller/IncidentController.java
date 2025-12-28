package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/incidente")
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping
    public List<Incident> getAllIncidente() {
        return incidentRepository.findAll();
    }

    // --- METODA NOUA: GET BY ID (Necesara pentru Editare) ---
    @GetMapping("/{id}")
    public Incident getIncidentById(@PathVariable Integer id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu a fost gasit cu id: " + id));
    }

    @PostMapping
    public Incident createIncident(@RequestBody Incident incident) {
        if(incident.getDataEmitere() == null) {
            incident.setDataEmitere(LocalDateTime.now());
        }
        return incidentRepository.save(incident);
    }

    // --- METODA NOUA: UPDATE (PUT) ---
    @PutMapping("/{id}")
    public Incident updateIncident(@PathVariable Integer id, @RequestBody Incident detaliiIncident) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incidentul nu exista cu id: " + id));

        // Actualizam campurile
        incident.setTipIncident(detaliiIncident.getTipIncident());
        incident.setDataEmitere(detaliiIncident.getDataEmitere());
        incident.setDescriereLocatie(detaliiIncident.getDescriereLocatie());
        incident.setDescriereIncident(detaliiIncident.getDescriereIncident());

        // Actualizam relatiile (Politist si Adresa)
        incident.setPolitistResponsabil(detaliiIncident.getPolitistResponsabil());
        incident.setAdresaIncident(detaliiIncident.getAdresaIncident());

        return incidentRepository.save(incident);
    }

    @DeleteMapping("/{id}")
    public void deleteIncident(@PathVariable Integer id) {
        incidentRepository.deleteById(id);
    }

    @GetMapping("/cauta")
    public List<Incident> cautaIncidente(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return incidentRepository.findAll();
        }
        return incidentRepository.cautaDupaInceput(termen);
    }
}