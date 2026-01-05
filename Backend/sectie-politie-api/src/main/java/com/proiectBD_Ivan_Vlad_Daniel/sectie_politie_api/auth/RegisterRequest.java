package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.auth;

public class RegisterRequest {
    // Date de identificare a politistului existent
    private String nume;
    private String prenume;
    private String telefon;

    // Datele contului pe care vrea sa il creeze
    private String newUsername;
    private String newPassword;

    // --- CAMP NOU ---
    private String confirmPassword;

    // Getters si Setters
    public String getNume() { return nume; }
    public void setNume(String nume) { this.nume = nume; }

    public String getPrenume() { return prenume; }
    public void setPrenume(String prenume) { this.prenume = prenume; }

    public String getTelefon() { return telefon; }
    public void setTelefon(String telefon) { this.telefon = telefon; }

    public String getNewUsername() { return newUsername; }
    public void setNewUsername(String newUsername) { this.newUsername = newUsername; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}