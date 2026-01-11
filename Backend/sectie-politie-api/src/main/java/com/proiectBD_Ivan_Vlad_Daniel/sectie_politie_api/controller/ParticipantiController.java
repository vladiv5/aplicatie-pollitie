package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.*;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Controller pentru gestionarea participantilor la incidente (Martori, Suspecti)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
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

    // Aduc toti participantii implicati intr-un incident specific
    @GetMapping("/incident/{idIncident}")
    public List<PersoanaIncident> getParticipanti(@PathVariable Integer idIncident) {
        return repo.findByIncident_IdIncident(idIncident);
    }

    // Adaug un participant (ex: Martor) la un incident
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

    // Sterg un participant dintr-un incident
    @DeleteMapping("/{idIncident}/{idPersoana}")
    public void deleteParticipant(@PathVariable Integer idIncident, @PathVariable Integer idPersoana) {
        PersoanaIncidentId id = new PersoanaIncidentId(idPersoana, idIncident);
        repo.deleteById(id);
    }

    // Vad toate incidentele in care a fost implicata o persoana
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