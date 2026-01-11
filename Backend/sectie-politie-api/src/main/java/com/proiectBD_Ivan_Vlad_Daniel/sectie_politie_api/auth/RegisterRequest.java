package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.auth;

/** Clasa DTO pentru procesul de activare a contului (Register)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
public class RegisterRequest {
    // Folosesc aceste campuri pentru a identifica politistul in baza de date
    private String nume;
    private String prenume;
    private String telefon;

    // Acestea sunt noile credentiale pe care utilizatorul vrea sa le seteze
    private String newUsername;
    private String newPassword;

    // Camp suplimentar pentru validarea parolei (sa nu o scrie gresit)
    private String confirmPassword;

    // --- Getters si Setters ---

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