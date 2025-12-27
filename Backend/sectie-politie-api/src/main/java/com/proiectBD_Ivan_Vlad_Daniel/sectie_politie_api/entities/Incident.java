package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Incidente")
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_incident")
    private Integer idIncident;

    @Column(name = "tip_incident")
    private String tipIncident;

    @Column(name = "data_emitere")
    private LocalDateTime dataEmitere;

    @Column(name = "descriere_locatie")
    private String descriereLocatie;

    @Column(name = "descriere_incident")
    private String descriereIncident;

    // Relatie N:1
    // Un incident este gestionat de un politist
    // Un politist poate gestiona mai multe incidente
    @ManyToOne
    @JoinColumn(name = "id_politist_responsabil")
    private Politist politistResponsabil;

    // Relatie N:1
    // Un incident are o adresa
    // O adresa poate fi inclusa in mai multe incidente
    @ManyToOne
    @JoinColumn(name = "id_adresa_incident")
    private Adresa adresaIncident;

    // --- Getters si Setters ---


    public Integer getIdIncident() {
        return idIncident;
    }

    public String getTipIncident() {
        return tipIncident;
    }

    public LocalDateTime getDataEmitere() {
        return dataEmitere;
    }

    public String getDescriereLocatie() {
        return descriereLocatie;
    }

    public String getDescriereIncident() {
        return descriereIncident;
    }

    public Politist getPolitistResponsabil() {
        return politistResponsabil;
    }

    public Adresa getAdresaIncident() {
        return adresaIncident;
    }

    public void setIdIncident(Integer idIncident) {
        this.idIncident = idIncident;
    }

    public void setTipIncident(String tipIncident) {
        this.tipIncident = tipIncident;
    }

    public void setDataEmitere(LocalDateTime dataEmitere) {
        this.dataEmitere = dataEmitere;
    }

    public void setDescriereLocatie(String descriereLocatie) {
        this.descriereLocatie = descriereLocatie;
    }

    public void setDescriereIncident(String descriereIncident) {
        this.descriereIncident = descriereIncident;
    }

    public void setPolitistResponsabil(Politist politistResponsabil) {
        this.politistResponsabil = politistResponsabil;
    }

    public void setAdresaIncident(Adresa adresaIncident) {
        this.adresaIncident = adresaIncident;
    }
}
