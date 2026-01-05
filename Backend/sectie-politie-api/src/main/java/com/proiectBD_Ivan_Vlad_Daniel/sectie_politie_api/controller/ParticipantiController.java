package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.*;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participanti")
@CrossOrigin(origins = "http://localhost:3000")
public class ParticipantiController {

    @Autowired
    private PersoanaIncidentRepository repo;
    @Autowired
    private IncidentRepository incidentRepo;
    @Autowired
    private PersoanaRepository persoanaRepo;

    // 1. Vezi toți participanții unui incident
    @GetMapping("/incident/{idIncident}")
    public List<PersoanaIncident> getParticipanti(@PathVariable Integer idIncident) {
        return repo.findByIncident_IdIncident(idIncident);
    }

    // 2. Adăugați un participant la un incident
    @PostMapping
    public PersoanaIncident addParticipant(@RequestBody ParticipantRequest req) {
        Incident incident = incidentRepo.findById(req.incidentId).orElseThrow();
        Persoana persoana = persoanaRepo.findById(req.persoanaId).orElseThrow();

        PersoanaIncident pi = new PersoanaIncident();
        pi.setId(new PersoanaIncidentId(req.persoanaId, req.incidentId));
        pi.setIncident(incident);
        pi.setPersoana(persoana);
        pi.setCalitate(req.calitate); // Ex: "Martor", "Suspect"

        return repo.save(pi);
    }

    // 3. Șterge un participant
    @DeleteMapping("/{idIncident}/{idPersoana}")
    public void deleteParticipant(@PathVariable Integer idIncident, @PathVariable Integer idPersoana) {
        PersoanaIncidentId id = new PersoanaIncidentId(idPersoana, idIncident);
        repo.deleteById(id);
    }

    // ... în interiorul clasei ParticipantiController ...

    // 4. Vezi toate incidentele unei persoane (Endpoint NOU)
    @GetMapping("/persoana/{idPersoana}")
    public List<PersoanaIncident> getIncidentePersoana(@PathVariable Integer idPersoana) {
        return repo.findByPersoana_IdPersoana(idPersoana);
    }

    // DTO simplu pentru cerere
    public static class ParticipantRequest {
        public Integer incidentId;
        public Integer persoanaId;
        public String calitate;
    }
}