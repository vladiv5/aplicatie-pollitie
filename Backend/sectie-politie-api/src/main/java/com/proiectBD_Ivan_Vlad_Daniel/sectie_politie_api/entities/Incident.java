package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Clasa pentru entitatea Incident care leaga politistii de locatii si descrieri
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Entity
@Table(name = "Incidente")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_incident")
    private Integer idIncident;

    @Column(name = "tip_incident")
    private String tipIncident;

    // Am folosit LocalDateTime pentru a retine si ora exacta a incidentului
    @Column(name = "data_emitere")
    private LocalDateTime dataEmitere;

    @Column(name = "descriere_locatie")
    private String descriereLocatie;

    @Column(name = "descriere_incident")
    private String descriereIncident;

    // Aceste campuri sunt cheile externe catre Politist si Adresa (stocate ca ID-uri)
    @Column(name = "id_politist_responsabil")
    private Integer idPolitist;

    @Column(name = "id_adresa_incident")
    private Integer idAdresa;

    @Column(name = "status")
    private String status;

    // --- Relatii JPA (Doar pentru citire) ---
    // Am setat insertable=false si updatable=false pentru a nu crea conflicte cu coloanele de ID simple de mai sus
    // Aceste obiecte ma ajuta sa aduc automat datele despre politist si adresa cand incarc incidentul

    @ManyToOne
    @JoinColumn(name = "id_politist_responsabil", insertable = false, updatable = false)
    private Politist politistResponsabil;

    @ManyToOne
    @JoinColumn(name = "id_adresa_incident", insertable = false, updatable = false)
    private Adresa adresaIncident;

    // --- Getters si Setters ---

    public Integer getIdIncident() { return idIncident; }
    public void setIdIncident(Integer idIncident) { this.idIncident = idIncident; }

    public String getTipIncident() { return tipIncident; }
    public void setTipIncident(String tipIncident) { this.tipIncident = tipIncident; }

    public LocalDateTime getDataEmitere() { return dataEmitere; }
    public void setDataEmitere(LocalDateTime dataEmitere) { this.dataEmitere = dataEmitere; }

    public String getDescriereLocatie() { return descriereLocatie; }
    public void setDescriereLocatie(String descriereLocatie) { this.descriereLocatie = descriereLocatie; }

    public String getDescriereIncident() { return descriereIncident; }
    public void setDescriereIncident(String descriereIncident) { this.descriereIncident = descriereIncident; }

    public Integer getIdPolitist() { return idPolitist; }
    public void setIdPolitist(Integer idPolitist) { this.idPolitist = idPolitist; }

    public Integer getIdAdresa() { return idAdresa; }
    public void setIdAdresa(Integer idAdresa) { this.idAdresa = idAdresa; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Politist getPolitistResponsabil() { return politistResponsabil; }
    public void setPolitistResponsabil(Politist politistResponsabil) { this.politistResponsabil = politistResponsabil; }

    public Adresa getAdresaIncident() { return adresaIncident; }
    public void setAdresaIncident(Adresa adresaIncident) { this.adresaIncident = adresaIncident; }
}