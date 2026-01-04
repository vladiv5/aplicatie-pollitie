package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "Politisti")
public class Politist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    // --- GETTERS & SETTERS STANDARD ---

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
}