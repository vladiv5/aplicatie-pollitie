package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.PersoanaAdresa;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaAdresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adrese-persoane")
@CrossOrigin(origins = "http://localhost:3000")
public class AdresePersoaneController {

    @Autowired
    private PersoanaAdresaRepository repo;

    @GetMapping("/persoana/{idPersoana}")
    public List<PersoanaAdresa> getAdreseForPersoana(@PathVariable Integer idPersoana) {
        return repo.findByPersoana_IdPersoana(idPersoana);
    }

    @GetMapping("/adresa/{idAdresa}")
    public List<PersoanaAdresa> getPersoaneAtAdresa(@PathVariable Integer idAdresa) {
        return repo.findByAdresa_IdAdresa(idAdresa);
    }
}