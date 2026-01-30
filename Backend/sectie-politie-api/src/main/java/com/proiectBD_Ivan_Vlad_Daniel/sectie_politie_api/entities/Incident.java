package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity class for Incident, linking officers to locations and descriptions.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
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

    // I use LocalDateTime to store the precise timestamp of the incident.
    @Column(name = "data_emitere")
    private LocalDateTime dataEmitere;

    @Column(name = "descriere_locatie")
    private String descriereLocatie;

    @Column(name = "descriere_incident")
    private String descriereIncident;

    // I map these columns as foreign keys ID references for quick access.
    @Column(name = "id_politist_responsabil")
    private Integer idPolitist;

    @Column(name = "id_adresa_incident")
    private Integer idAdresa;

    @Column(name = "status")
    private String status;

    // --- JPA Relationships (Read-Only) ---
    // I set insertable=false and updatable=false to avoid conflicts with the simple ID columns above.
    // These objects help me automatically fetch related Officer and Address details when loading an incident.

    @ManyToOne
    @JoinColumn(name = "id_politist_responsabil", insertable = false, updatable = false)
    private Politist politistResponsabil;

    @ManyToOne
    @JoinColumn(name = "id_adresa_incident", insertable = false, updatable = false)
    private Adresa adresaIncident;

    // --- Getters and Setters ---

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