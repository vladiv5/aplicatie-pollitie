package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistici")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticiController {

    @Autowired private PolitistRepository politistRepo;
    @Autowired private IncidentRepository incidentRepo;
    @Autowired private PersoanaRepository persoanaRepo;
    @Autowired private AmendaRepository amendaRepo;

    // Helper: Convertește String în LocalDateTime (sau null dacă e gol)
    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty() || dateStr.equals("null")) {
            return null;
        }
        // Frontend trimite de obicei YYYY-MM-DD
        return LocalDateTime.parse(dateStr + "T00:00:00");
    }

    private LocalDateTime parseDateEnd(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty() || dateStr.equals("null")) {
            return null;
        }
        // Sfârșitul zilei
        return LocalDateTime.parse(dateStr + "T23:59:59");
    }

    // --- RAPOARTE SIMPLE (Actualizate cu filtre) ---

    @GetMapping("/top-politisti")
    public List<Map<String, Object>> getTopPolitisti(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return politistRepo.getTopPolitistiAmenzi(parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/top-strazi")
    public List<Map<String, Object>> getTopStrazi(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return incidentRepo.getTopStraziIncidente(parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/rau-platnici")
    public List<Map<String, Object>> getRauPlatnici(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return persoanaRepo.getRauPlatnici(parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/amenzi-grad")
    public List<Map<String, Object>> getAmenziGrad(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return politistRepo.getStatisticiPerGrad(parseDate(start), parseDateEnd(end));
    }

    // --- RAPOARTE DINAMICE ---

    @GetMapping("/incidente-politist")
    public List<Map<String, Object>> getIncidentePolitist(@RequestParam Integer id, @RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return incidentRepo.getIncidenteByPolitist(id, parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/istoric-cnp")
    public List<Map<String, Object>> getIstoricCNP(@RequestParam String cnp, @RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return amendaRepo.getAmenziByCNP(cnp, parseDate(start), parseDateEnd(end));
    }

    // --- RAPOARTE COMPLEXE (NOI) ---

    // 1. Zone Sigure (Subcerere NOT IN)
    @GetMapping("/zone-sigure")
    public List<Map<String, Object>> getZoneSigure(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return incidentRepo.getZoneSigure(parseDate(start), parseDateEnd(end));
    }

    // 2. Agenți Severi (Subcerere in HAVING)
    @GetMapping("/agenti-severi")
    public List<Map<String, Object>> getAgentiSeveri(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return politistRepo.getAgentiSeveri(parseDate(start), parseDateEnd(end));
    }

    // 3. Recidiviști (Subcerere in HAVING)
    @GetMapping("/recidivisti")
    public List<Map<String, Object>> getRecidivisti(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return persoanaRepo.getRecidivisti(parseDate(start), parseDateEnd(end));
    }

    // 4. Zile Critice (Subcerere pe Agregare)
    @GetMapping("/zile-critice")
    public List<Map<String, Object>> getZileCritice(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return incidentRepo.getZileCritice(parseDate(start), parseDateEnd(end));
    }
}