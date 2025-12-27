package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "Adrese")
public class Adresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adresa")
    private Integer idAdresa;

    @Column(name = "strada")
    private String strada;

    @Column(name = "numar")
    private String numar;

    @Column(name = "bloc")
    private String bloc;

    @Column(name = "apartament")
    private Integer apartament;

    @Column(name = "localitate")
    private String localitate;

    @Column(name = "judet_sau_sector")
    private String judetSauSector;

    // --- Getters si Setters ---

    public Integer getIdAdresa() {
        return idAdresa;
    }

    public String getStrada() {
        return strada;
    }

    public String getNumar() {
        return numar;
    }

    public String getBloc() {
        return bloc;
    }

    public Integer getApartament() {
        return apartament;
    }

    public String getLocalitate() {
        return localitate;
    }

    public String getJudetSauSector() {
        return judetSauSector;
    }

    public void setIdAdresa(Integer idAdresa) {
        this.idAdresa = idAdresa;
    }

    public void setStrada(String strada) {
        this.strada = strada;
    }

    public void setNumar(String numar) {
        this.numar = numar;
    }

    public void setBloc(String bloc) {
        this.bloc = bloc;
    }

    public void setApartament(Integer apartament) {
        this.apartament = apartament;
    }

    public void setLocalitate(String localitate) {
        this.localitate = localitate;
    }

    public void setJudetSauSector(String judetSauSector) {
        this.judetSauSector = judetSauSector;
    }
}
