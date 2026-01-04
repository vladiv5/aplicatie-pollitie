package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Persoane")
public class Persoana {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persoana")
    private Integer idPersoana;

    @Column(name = "nume")
    private String nume;

    @Column(name = "prenume")
    private String prenume;

    @Column(name = "cnp")
    private String cnp;

    @Column(name = "data_nasterii")
    private LocalDate dataNasterii;

    @Column(name = "telefon")
    private String telefon;

    // --- Getteri si Setteri ---

    public Integer getIdPersoana() { return idPersoana; }
    public void setIdPersoana(Integer idPersoana) { this.idPersoana = idPersoana; }

    public String getNume() { return nume; }
    public void setNume(String nume) { this.nume = nume; }

    public String getPrenume() { return prenume; }
    public void setPrenume(String prenume) { this.prenume = prenume; }

    public String getCnp() { return cnp; }
    public void setCnp(String cnp) { this.cnp = cnp; }

    public LocalDate getDataNasterii() { return dataNasterii; }
    public void setDataNasterii(LocalDate dataNasterii) { this.dataNasterii = dataNasterii; }

    public String getTelefon() { return telefon; }
    public void setTelefon(String telefon) { this.telefon = telefon; }
}