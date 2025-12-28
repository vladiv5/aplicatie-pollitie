package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Persoana;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PersoanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persoane")
@CrossOrigin(origins = "http://localhost:3000")
public class PersoanaController {

    @Autowired
    private PersoanaRepository persoanaRepository;

    // 1. GET ALL
    @GetMapping
    public List<Persoana> getAllPersoane() {
        return persoanaRepository.findAll();
    }

    // 2. GET BY ID (Asta lipsea pentru pre-completarea formularului!)
    @GetMapping("/{id}")
    public Persoana getPersoanaById(@PathVariable Integer id) {
        return persoanaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Persoana nu a fost gasită cu id: " + id));
    }

    // 3. ADĂUGARE
    @PostMapping
    public Persoana createPersoana(@RequestBody Persoana persoana) {
        return persoanaRepository.save(persoana);
    }

    // 4. UPDATE (Asta lipsea pentru salvarea modificărilor!)
    @PutMapping("/{id}")
    public Persoana updatePersoana(@PathVariable Integer id, @RequestBody Persoana detaliiPersoana) {
        Persoana persoana = persoanaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Persoana nu există cu id: " + id));

        // Actualizăm câmpurile
        persoana.setNume(detaliiPersoana.getNume());
        persoana.setPrenume(detaliiPersoana.getPrenume());
        persoana.setCnp(detaliiPersoana.getCnp());
        persoana.setDataNasterii(detaliiPersoana.getDataNasterii());
        persoana.setTelefon(detaliiPersoana.getTelefon());

        return persoanaRepository.save(persoana);
    }

    // 5. STERGERE
    @DeleteMapping("/{id}")
    public void deletePersoana(@PathVariable Integer id) {
        persoanaRepository.deleteById(id);
    }

    // 6. CAUTARE
    @GetMapping("/cauta")
    public List<Persoana> cautaPersoane(@RequestParam String termen) {
        if (termen == null || termen.trim().isEmpty()) {
            return persoanaRepository.findAll();
        }
        return persoanaRepository.cautaDupaInceput(termen);
    }
}