package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaAdresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaAdresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing the Many-to-Many relationship between Persons and Addresses.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@RestController
@RequestMapping("/api/adrese-persoane")
@CrossOrigin(origins = "http://localhost:3000")
public class AdresePersoaneController {

    @Autowired
    private PersoanaAdresaRepository repo;

    // I fetch all addresses associated with a specific person (e.g., Domicile, Residence).
    @GetMapping("/persoana/{idPersoana}")
    public List<PersoanaAdresa> getAdreseForPersoana(@PathVariable Integer idPersoana) {
        return repo.findByPersoana_IdPersoana(idPersoana);
    }

    // I fetch all residents registered at a specific address ID.
    @GetMapping("/adresa/{idAdresa}")
    public List<PersoanaAdresa> getPersoaneAtAdresa(@PathVariable Integer idAdresa) {
        return repo.findByAdresa_IdAdresa(idAdresa);
    }
}