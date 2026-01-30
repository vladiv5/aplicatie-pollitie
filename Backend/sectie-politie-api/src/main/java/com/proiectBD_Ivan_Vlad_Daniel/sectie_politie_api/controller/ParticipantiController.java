package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.*;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing incident participants (Witnesses, Suspects).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
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

    // I fetch all participants involved in a specific incident ID.
    @GetMapping("/incident/{idIncident}")
    public List<PersoanaIncident> getParticipanti(@PathVariable Integer idIncident) {
        return repo.findByIncident_IdIncident(idIncident);
    }

    // I link a person to an incident with a specific role (e.g., Witness).
    @PostMapping
    public PersoanaIncident addParticipant(@RequestBody ParticipantRequest req) {
        Incident incident = incidentRepo.findById(req.incidentId).orElseThrow();
        Persoana persoana = persoanaRepo.findById(req.persoanaId).orElseThrow();

        PersoanaIncident pi = new PersoanaIncident();
        pi.setId(new PersoanaIncidentId(req.persoanaId, req.incidentId));
        pi.setIncident(incident);
        pi.setPersoana(persoana);
        pi.setCalitate(req.calitate);

        return repo.save(pi);
    }

    // I remove a participant from an incident.
    @DeleteMapping("/{idIncident}/{idPersoana}")
    public void deleteParticipant(@PathVariable Integer idIncident, @PathVariable Integer idPersoana) {
        PersoanaIncidentId id = new PersoanaIncidentId(idPersoana, idIncident);
        repo.deleteById(id);
    }

    // I retrieve all incidents a person has been involved in (Criminal Record check).
    @GetMapping("/persoana/{idPersoana}")
    public List<PersoanaIncident> getIncidentePersoana(@PathVariable Integer idPersoana) {
        return repo.findByPersoana_IdPersoana(idPersoana);
    }

    public static class ParticipantRequest {
        public Integer incidentId;
        public Integer persoanaId;
        public String calitate;
    }
}