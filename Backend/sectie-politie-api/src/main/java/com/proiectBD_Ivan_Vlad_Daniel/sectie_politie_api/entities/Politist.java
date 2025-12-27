package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

@Entity // Anunta JPA ca aceasta este o entitate
@Table(name = "Politisti") // Leaga clasa de tabelul Politisti din SQL

public class Politist {
    @Id // Cheia primara
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Anunta JPA ca SQL se ocupa de autoincrementare

    // Leg atributele de coloanele corespunzatoare
    @Column(name = "id_politist")
    private Integer idPolitist;

    @Column(name = "nume")
    private String nume;

    @Column(name = "prenume")
    private String prenume;

    @Column(name = "grad")
    private String grad;

    @Column(name = "functie")
    private String functie;

    @Column(name = "telefon_serviciu")
    private String telefon_serviciu;

    // --- Getters si Setters

    public Integer getIdPolitist() {
        return idPolitist;
    }

    public String getNume() {
        return nume;
    }

    public String getPrenume() {
        return prenume;
    }

    public String getGrad() {
        return grad;
    }

    public String getFunctie() {
        return functie;
    }

    public String getTelefon_serviciu() {
        return telefon_serviciu;
    }

    public void setIdPolitist(Integer idPolitist) {
        this.idPolitist = idPolitist;
    }

    public void setNume(String nume) {
        this.nume = nume;
    }

    public void setPrenume(String prenume) {
        this.prenume = prenume;
    }

    public void setGrad(String grad) {
        this.grad = grad;
    }

    public void setFunctie(String functie) {
        this.functie = functie;
    }

    public void setTelefon_serviciu(String telefon_serviciu) {
        this.telefon_serviciu = telefon_serviciu;
    }
}