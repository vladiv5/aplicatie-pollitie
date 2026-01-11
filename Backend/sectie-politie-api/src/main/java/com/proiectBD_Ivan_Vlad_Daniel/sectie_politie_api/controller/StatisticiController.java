package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Controller pentru generarea rapoartelor complexe si statisticilor
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@RestController
@RequestMapping("/api/statistici")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticiController {

    @Autowired private PolitistRepository politistRepo;
    @Autowired private IncidentRepository incidentRepo;
    @Autowired private PersoanaRepository persoanaRepo;
    @Autowired private AmendaRepository amendaRepo;

    // --- FIX CRITIC: Parsing robust pentru date ---
    private LocalDateTime parseDate(String dateStr) {
        try {
            // Verificam daca stringul este gol, null, sau textul "undefined"/"null" trimis de JS
            if (dateStr == null || dateStr.trim().isEmpty() ||
                    dateStr.equalsIgnoreCase("null") || dateStr.equalsIgnoreCase("undefined")) {
                return null;
            }
            // Daca formatul e doar YYYY-MM-DD, adaugam ora de start
            if (dateStr.length() == 10) {
                return LocalDateTime.parse(dateStr + "T00:00:00");
            }
            return LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            // Daca apare orice eroare de formatare, returnam null (fara filtru) in loc sa dam crash
            return null;
        }
    }

    private LocalDateTime parseDateEnd(String dateStr) {
        try {
            if (dateStr == null || dateStr.trim().isEmpty() ||
                    dateStr.equalsIgnoreCase("null") || dateStr.equalsIgnoreCase("undefined")) {
                return null;
            }
            if (dateStr.length() == 10) {
                return LocalDateTime.parse(dateStr + "T23:59:59");
            }
            return LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    // --- ENDPOINTS ---

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

    // --- RAPOARTE DOSAR (AICI ERA PROBLEMA) ---

    @GetMapping("/incidente-politist")
    public List<Map<String, Object>> getIncidentePolitist(@RequestParam Integer id, @RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        // Acum parseDate nu va mai da crash daca start e "undefined"
        return incidentRepo.getIncidenteByPolitist(id, parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/istoric-cnp")
    public List<Map<String, Object>> getIstoricCNP(@RequestParam String cnp, @RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return amendaRepo.getAmenziByCNP(cnp, parseDate(start), parseDateEnd(end));
    }

    // --- RAPOARTE COMPLEXE ---

    @GetMapping("/zone-sigure")
    public List<Map<String, Object>> getZoneSigure(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return incidentRepo.getZoneSigure(parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/agenti-severi")
    public List<Map<String, Object>> getAgentiSeveri(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return politistRepo.getAgentiSeveri(parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/recidivisti")
    public List<Map<String, Object>> getRecidivisti(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return persoanaRepo.getRecidivisti(parseDate(start), parseDateEnd(end));
    }

    @GetMapping("/zile-critice")
    public List<Map<String, Object>> getZileCritice(@RequestParam(required=false) String start, @RequestParam(required=false) String end) {
        return incidentRepo.getZileCritice(parseDate(start), parseDateEnd(end));
    }
}