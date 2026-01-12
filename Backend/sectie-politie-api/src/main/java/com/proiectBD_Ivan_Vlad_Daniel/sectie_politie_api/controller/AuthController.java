package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.controller;

import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.auth.LoginRequest;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.auth.RegisterRequest;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities.Politist;
import com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.repository.PolitistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/** Controller pentru Autentificare si Inregistrare (Register = Activare cont existent)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private PolitistRepository politistRepository;

    // === LOGIN (Case Sensitive) ===
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Map<String, String> errors = new HashMap<>();

        if (loginRequest.getNume() == null || loginRequest.getNume().trim().isEmpty()) {
            errors.put("nume", "Introduceți numele de utilizator!");
        }
        if (loginRequest.getParola() == null || loginRequest.getParola().trim().isEmpty()) {
            errors.put("parola", "Introduceți parola!");
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // Verificare BACKDOOR ADMIN pentru testare rapida
        if ("admin".equals(loginRequest.getNume()) && "admin".equals(loginRequest.getParola())) {
            Politist adminFals = new Politist();
            adminFals.setIdPolitist(-1);
            adminFals.setNume("Developer");
            adminFals.setPrenume("Admin");
            adminFals.setGrad("SuperUser");
            adminFals.setFunctie("Developer");
            return ResponseEntity.ok(adminFals);
        }

        // Caut user in baza de date
        Optional<Politist> politistOpt = politistRepository.findByUsername(loginRequest.getNume());

        if (politistOpt.isPresent()) {
            Politist p = politistOpt.get();
            // Verificare stricta Java pentru litere mari/mici
            if (p.getUsername().equals(loginRequest.getNume()) &&
                    p.getPassword().equals(loginRequest.getParola())) {
                return ResponseEntity.ok(p);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("global", "Date incorecte (atenție la majuscule)!"));
    }

    // === REGISTER (ACTIVARE CONT) ===
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        Map<String, String> errors = new HashMap<>();
        // Validari campuri personale
        if (req.getNume() == null || req.getNume().trim().isEmpty()) errors.put("nume", "Numele este obligatoriu.");
        if (req.getPrenume() == null || req.getPrenume().trim().isEmpty()) errors.put("prenume", "Prenumele este obligatoriu.");
        if (req.getTelefon() == null || req.getTelefon().trim().isEmpty()) errors.put("telefon", "Telefonul este obligatoriu.");
        // Validari cont nou
        if (req.getNewUsername() == null || req.getNewUsername().trim().isEmpty()) errors.put("newUsername", "Alegeți un nume de utilizator.");
        else if (req.getNewUsername().length() < 3) errors.put("newUsername", "Minim 3 caractere.");
        if (req.getNewPassword() == null || req.getNewPassword().trim().isEmpty()) errors.put("newPassword", "Alegeți o parolă.");
        else if (req.getNewPassword().length() < 3) errors.put("newPassword", "Minim 3 caractere.");
        if (req.getConfirmPassword() == null || req.getConfirmPassword().trim().isEmpty()) errors.put("confirmPassword", "Confirmați parola.");
        else if (!req.getConfirmPassword().equals(req.getNewPassword())) errors.put("confirmPassword", "Parolele nu coincid!");
        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // Caut politistul in baza de date dupa datele personale
        Optional<Politist> target = politistRepository.findForActivation(
                req.getNume(), req.getPrenume(), req.getTelefon()
        );
        if (target.isEmpty()) {
            errors.put("nume", "Verifică numele.");
            errors.put("prenume", "Verifică prenumele.");
            errors.put("telefon", "Verifică telefonul (nu există în sistem).");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errors);
        }
        Politist p = target.get();
        // Verific daca are deja cont
        if (p.getUsername() != null && !p.getUsername().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("global", "Acest polițist are deja un cont activ! Mergi la Autentificare."));
        }
        // Verific unicitate username
        if (politistRepository.findByUsername(req.getNewUsername()).isPresent()) {
            errors.put("newUsername", "Acest username este deja folosit.");
            return ResponseEntity.badRequest().body(errors);
        }
        // Salvez noile date de autentificare
        p.setUsername(req.getNewUsername());
        p.setPassword(req.getNewPassword());
        politistRepository.save(p);

        return ResponseEntity.ok("Cont activat cu succes!");
    }
}