package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

/** Clasa pentru definirea entitatii Politist care mapeaza tabelul din baza de date
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Entity
@Table(name = "Politisti")
public class Politist {

    // Am definit cheia primara si am specificat ca baza de date se ocupa de generarea ID-ului
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_politist")
    private Integer idPolitist;

    // Am mapat coloanele tabelului la campurile clasei
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

    // Aici am adaugat campurile necesare pentru sistemul de login
    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    // --- Metode de acces (Getters si Setters) ---
    // Le-am generat pentru a putea citi si modifica datele private ale politistului

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