package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "Persoane_Incidente")
public class PersoanaIncident {
    @EmbeddedId
    private PersoanaIncidentId id;

    @ManyToOne
    @MapsId("idPersoana") // Mapează "idPersoana" din cheia compusă
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    @ManyToOne
    @MapsId("idIncident") // Mapează "idIncident" din cheia compusă
    @JoinColumn(name = "id_incident")
    private Incident incident;

    @Column(name = "calitate")
    private String calitate;

    // --- Getters și Setters ---

    public PersoanaIncidentId getId() {
        return id;
    }

    public Persoana getPersoana() {
        return persoana;
    }

    public Incident getIncident() {
        return incident;
    }

    public String getCalitate() {
        return calitate;
    }

    public void setId(PersoanaIncidentId id) {
        this.id = id;
    }

    public void setPersoana(Persoana persoana) {
        this.persoana = persoana;
    }

    public void setIncident(Incident incident) {
        this.incident = incident;
    }

    public void setCalitate(String calitate) {
        this.calitate = calitate;
    }
}
