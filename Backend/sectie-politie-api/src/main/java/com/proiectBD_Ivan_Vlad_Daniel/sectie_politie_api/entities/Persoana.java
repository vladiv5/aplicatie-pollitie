package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;

@Entity
@Table(name = "Persoane")
public class Persoana {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persoana")
    private Integer idPersoana;

    @Column(name = "nume")
    @NotBlank(message = "Numele este obligatoriu")
    @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ -]+$", message = "Numele poate conține doar litere, spații sau cratime")
    private String nume;

    @Column(name = "prenume")
    @NotBlank(message = "Prenumele este obligatoriu")
    @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ -]+$", message = "Prenumele poate conține doar litere, spații sau cratime")
    private String prenume;

    @Column(name = "cnp")
    @NotBlank(message = "CNP-ul este obligatoriu")
    // Verific doar formatul, matematic pt validare in controller!
    @Pattern(regexp = "^$|^\\d{13}$", message = "CNP-ul trebuie să aibă exact 13 cifre")
    private String cnp;

    @Column(name = "data_nasterii")
    private LocalDate dataNasterii;

    @Column(name = "telefon")
    @Pattern(regexp = "^$|^07\\d{8}$", message = "Telefonul trebuie să înceapă cu '07' și să aibă 10 cifre")
    private String telefon;

    // --- Getteri si Setteri

    public Integer getIdPersoana() {
        return idPersoana;
    }

    public String getNume() {
        return nume;
    }

    public String getPrenume() {
        return prenume;
    }

    public String getCnp() {
        return cnp;
    }

    public LocalDate getDataNasterii() {
        return dataNasterii;
    }

    public String getTelefon() {
        return telefon;
    }

    public void setIdPersoana(Integer idPersoana) {
        this.idPersoana = idPersoana;
    }

    public void setNume(String nume) {
        this.nume = nume;
    }

    public void setPrenume(String prenume) {
        this.prenume = prenume;
    }

    public void setCnp(String cnp) {
        this.cnp = cnp;
    }

    public void setDataNasterii(LocalDate dataNasterii) {
        this.dataNasterii = dataNasterii;
    }

    public void setTelefon(String telefon) {
        this.telefon = telefon;
    }
}
