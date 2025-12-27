package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Incident;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.*;

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

    @PostMapping
    public Incident createIncident(@RequestBody Incident incident) {
        if(incident.getDataEmitere() == null) {
            incident.setDataEmitere(LocalDateTime.now());
        }

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