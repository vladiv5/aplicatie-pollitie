package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistici")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticiController {

    @Autowired
    private PolitistRepository politistRepo;
    @Autowired
    private IncidentRepository incidentRepo;
    @Autowired
    private PersoanaRepository persoanaRepo;
    @Autowired
    private AmendaRepository amendaRepo;

    // 1. Top Polițiști (Performanță)
    @GetMapping("/top-politisti")
    public List<Map<String, Object>> getTopPolitisti() {
        return politistRepo.getTopPolitistiAmenzi();
    }

    // 2. Top Străzi (Zone de Risc)
    @GetMapping("/top-strazi")
    public List<Map<String, Object>> getTopStrazi() {
        return incidentRepo.getTopStraziIncidente();
    }

    // 3. Rău Platnici
    @GetMapping("/rau-platnici")
    public List<Map<String, Object>> getRauPlatnici() {
        return persoanaRepo.getRauPlatnici();
    }

    // 4. Statistici per Grad
    @GetMapping("/amenzi-grad")
    public List<Map<String, Object>> getAmenziGrad() {
        return politistRepo.getStatisticiPerGrad();
    }

    // 5. Raport Dinamic: Incidente per Polițist
    @GetMapping("/incidente-politist")
    public List<Map<String, Object>> getIncidentePolitist(@RequestParam Integer id) {
        return incidentRepo.getIncidenteByPolitist(id);
    }

    // 6. Raport Dinamic: Amenzi per CNP
    @GetMapping("/istoric-cnp")
    public List<Map<String, Object>> getIstoricCNP(@RequestParam String cnp) {
        return amendaRepo.getAmenziByCNP(cnp);
    }
}