package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

/**
 * Entity class defining the Police Officer which maps to the database table.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Entity
@Table(name = "Politisti")
public class Politist {

    // I defined the primary key and specified that the database handles ID generation.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_politist")
    private Integer idPolitist;

    // I mapped table columns to class fields.
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

    // I added these fields to support the login system.
    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    // --- Access Methods (Getters and Setters) ---
    // I generated these to allow reading and modifying the officer's private data.

    public Integer getIdPolitist() { return idPolitist; }
    public void setIdPolitist(Integer idPolitist) { this.idPolitist = idPolitist; }

    public String getNume() { return nume; }
    public void setNume(String nume) { this.nume = nume; }

    public String getPrenume() { return prenume; }
    public void setPrenume(String prenume) { this.prenume = prenume; }

    public String getGrad() { return grad; }
    public void setGrad(String grad) { this.grad = grad; }

    public String getFunctie() { return functie; }
    public void setFunctie(String functie) { this.functie = functie; }

    public String getTelefon_serviciu() { return telefon_serviciu; }
    public void setTelefon_serviciu(String telefon_serviciu) { this.telefon_serviciu = telefon_serviciu; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}