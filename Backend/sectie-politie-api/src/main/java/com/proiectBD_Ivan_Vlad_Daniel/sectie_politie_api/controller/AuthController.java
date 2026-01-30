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

/**
 * Controller for Authentication and Registration (Register = Activating an existing officer account).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
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
            errors.put("nume", "Enter username!");
        }
        if (loginRequest.getParola() == null || loginRequest.getParola().trim().isEmpty()) {
            errors.put("parola", "Enter password!");
        }

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // I included a BACKDOOR ADMIN check for rapid testing during development.
        if ("admin".equals(loginRequest.getNume()) && "admin".equals(loginRequest.getParola())) {
            Politist adminFals = new Politist();
            adminFals.setIdPolitist(-1);
            adminFals.setNume("Developer");
            adminFals.setPrenume("Admin");
            adminFals.setGrad("SuperUser");
            adminFals.setFunctie("Developer");
            return ResponseEntity.ok(adminFals);
        }

        // I search for the user in the database.
        Optional<Politist> politistOpt = politistRepository.findByUsername(loginRequest.getNume());

        if (politistOpt.isPresent()) {
            Politist p = politistOpt.get();
            // I perform strict case-sensitive validation using Java's .equals().
            if (p.getUsername().equals(loginRequest.getNume()) &&
                    p.getPassword().equals(loginRequest.getParola())) {
                return ResponseEntity.ok(p);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("global", "Invalid credentials (case sensitive)!"));
    }

    // === REGISTER (ACCOUNT ACTIVATION) ===
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        Map<String, String> errors = new HashMap<>();
        // Personal data validation
        if (req.getNume() == null || req.getNume().trim().isEmpty()) errors.put("nume", "Name required.");
        if (req.getPrenume() == null || req.getPrenume().trim().isEmpty()) errors.put("prenume", "Surname required.");
        if (req.getTelefon() == null || req.getTelefon().trim().isEmpty()) errors.put("telefon", "Phone required.");

        // New account credential validation
        if (req.getNewUsername() == null || req.getNewUsername().trim().isEmpty()) errors.put("newUsername", "Choose a username.");
        else if (req.getNewUsername().length() < 3) errors.put("newUsername", "Min 3 chars.");

        if (req.getNewPassword() == null || req.getNewPassword().trim().isEmpty()) errors.put("newPassword", "Choose a password.");
        else if (req.getNewPassword().length() < 3) errors.put("newPassword", "Min 3 chars.");

        if (req.getConfirmPassword() == null || req.getConfirmPassword().trim().isEmpty()) errors.put("confirmPassword", "Confirm password.");
        else if (!req.getConfirmPassword().equals(req.getNewPassword())) errors.put("confirmPassword", "Passwords do not match!");

        if (!errors.isEmpty()) return ResponseEntity.badRequest().body(errors);

        // I verify that the officer actually exists in the system before letting them create an account.
        Optional<Politist> target = politistRepository.findForActivation(
                req.getNume(), req.getPrenume(), req.getTelefon()
        );
        if (target.isEmpty()) {
            errors.put("nume", "Check Name.");
            errors.put("prenume", "Check Surname.");
            errors.put("telefon", "Check Phone (Officer not found in system).");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errors);
        }
        Politist p = target.get();

        // I prevent re-registration if the account is already active.
        if (p.getUsername() != null && !p.getUsername().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("global", "Officer already has an active account! Go to Login."));
        }
        // I ensure username uniqueness.
        if (politistRepository.findByUsername(req.getNewUsername()).isPresent()) {
            errors.put("newUsername", "Username already taken.");
            return ResponseEntity.badRequest().body(errors);
        }

        // I save the new credentials to activate the account.
        p.setUsername(req.getNewUsername());
        p.setPassword(req.getNewPassword());
        politistRepository.save(p);

        return ResponseEntity.ok("Account activated successfully!");
    }
}