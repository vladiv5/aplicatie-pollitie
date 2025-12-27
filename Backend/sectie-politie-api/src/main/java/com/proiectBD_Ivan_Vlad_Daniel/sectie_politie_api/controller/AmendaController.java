package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Amenda;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.AmendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/amenzi")
@CrossOrigin(origins = "http://localhost:3000")
public class AmendaController {
    @Autowired
    private AmendaRepository amendaRepository;

    @GetMapping
    public List<Amenda> getAllAmenzi() {
        return amendaRepository.findAll();
    }

    @PostMapping
    public Amenda addAmenda(@RequestBody Amenda amenda) {
        return amendaRepository.save(amenda);
    }

    @DeleteMapping("/{id}")
    public void deleteAmenda(@PathVariable Integer id) {
        amendaRepository.deleteById(id);
    }

    @GetMapping("/statistici")
    public List<Map<String, Object>> raportAmenzi() {return amendaRepository.raportAmenzi(); }
}
