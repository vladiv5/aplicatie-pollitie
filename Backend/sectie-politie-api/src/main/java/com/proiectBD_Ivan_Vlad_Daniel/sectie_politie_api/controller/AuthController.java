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

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private PolitistRepository politistRepository;

    // === LOGIN ===
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Eu colectez erorile aici
        Map<String, String> errors = new HashMap<>();

        if (loginRequest.getNume() == null || loginRequest.getNume().trim().isEmpty()) {
            errors.put("nume", "Introduceți numele de utilizator!");
        }
        if (loginRequest.getParola() == null || loginRequest.getParola().trim().isEmpty()) {
            errors.put("parola", "Introduceți parola!");
        }

        // Dacă am găsit câmpuri goale, le trimit înapoi imediat
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // BACKDOOR ADMIN
        if ("admin".equals(loginRequest.getNume()) && "admin".equals(loginRequest.getParola())) {
            Politist adminFals = new Politist();
            adminFals.setIdPolitist(-1);
            adminFals.setNume("Developer");
            adminFals.setPrenume("Admin");
            adminFals.setGrad("SuperUser");
            adminFals.setFunctie("Developer");
            return ResponseEntity.ok(adminFals);
        }

        // Verific în baza de date
        Optional<Politist> politistOpt = politistRepository.findByUsernameAndPassword(
                loginRequest.getNume(),
                loginRequest.getParola()
        );

        if (politistOpt.isPresent()) {
            return ResponseEntity.ok(politistOpt.get());
        } else {
            // Dacă nu găsesc userul, trimit o eroare generală sau pe ambele câmpuri
            // Eu prefer să pun eroarea pe câmpul de parolă sau global
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("global", "Date de autentificare incorecte!"));
        }
    }

    // === REGISTER (ACTIVARE) ===
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // Aici am modificat strategia: verific TOATE câmpurile și adun TOATE erorile
        Map<String, String> errors = new HashMap<>();

        // 1. Validări Câmpuri Personale
        if (req.getNume() == null || req.getNume().trim().isEmpty()) {
            errors.put("nume", "Numele este obligatoriu.");
        }
        if (req.getPrenume() == null || req.getPrenume().trim().isEmpty()) {
            errors.put("prenume", "Prenumele este obligatoriu.");
        }
        if (req.getTelefon() == null || req.getTelefon().trim().isEmpty()) {
            errors.put("telefon", "Telefonul este obligatoriu.");
        }

        // 2. Validări Cont Nou
        if (req.getNewUsername() == null || req.getNewUsername().trim().isEmpty()) {
            errors.put("newUsername", "Alegeți un nume de utilizator.");
        } else if (req.getNewUsername().length() < 3) {
            errors.put("newUsername", "Minim 3 caractere.");
        }

        if (req.getNewPassword() == null || req.getNewPassword().trim().isEmpty()) {
            errors.put("newPassword", "Alegeți o parolă.");
        } else if (req.getNewPassword().length() < 3) {
            errors.put("newPassword", "Minim 3 caractere.");
        }

        // 3. Confirmare Parolă
        if (req.getConfirmPassword() == null || req.getConfirmPassword().trim().isEmpty()) {
            errors.put("confirmPassword", "Confirmați parola.");
        } else if (!req.getConfirmPassword().equals(req.getNewPassword())) {
            errors.put("confirmPassword", "Parolele nu coincid!");
        }

        // Dacă am găsit erori de validare, mă opresc AICI și le trimit pe toate
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // --- DE AICI ÎNCOLO VERIFIC LOGICA DE BUSINESS (Database) ---

        // 4. Caut polițistul
        Optional<Politist> target = politistRepository.findForActivation(
                req.getNume(), req.getPrenume(), req.getTelefon()
        );

        if (target.isEmpty()) {
            // Dacă nu îl găsesc, pun eroare pe câmpurile de identificare ca să știe unde a greșit
            errors.put("nume", "Verifică numele.");
            errors.put("prenume", "Verifică prenumele.");
            errors.put("telefon", "Verifică telefonul (nu există în sistem).");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errors);
        }

        Politist p = target.get();

        // 5. Verific dacă are deja cont
        if (p.getUsername() != null && !p.getUsername().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("global", "Acest polițist are deja un cont activ! Mergi la Autentificare."));
        }

        // 6. Verific unicitate username
        if (politistRepository.findByUsername(req.getNewUsername()).isPresent()) {
            errors.put("newUsername", "Acest username este deja folosit.");
            return ResponseEntity.badRequest().body(errors);
        }

        // 7. Salvez
        p.setUsername(req.getNewUsername());
        p.setPassword(req.getNewPassword());
        politistRepository.save(p);

        return ResponseEntity.ok("Cont activat cu succes!");
    }
}