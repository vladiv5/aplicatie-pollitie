package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

/** Clasa de legatura intre Persoane si Incidente (ex: Martor, Suspect, Victima)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Entity
@Table(name = "Persoane_Incidente")
public class PersoanaIncident {

    @EmbeddedId
    private PersoanaIncidentId id;

    @ManyToOne
    @MapsId("idPersoana")
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    @ManyToOne
    @MapsId("idIncident")
    @JoinColumn(name = "id_incident")
    private Incident incident;

    // Calitatea persoanei in incident (ex: Martor)
    @Column(name = "calitate")
    private String calitate;

    // --- Getters si Setters ---

    public PersoanaIncidentId getId() { return id; }
    public void setId(PersoanaIncidentId id) { this.id = id; }

    public Persoana getPersoana() { return persoana; }
    public void setPersoana(Persoana persoana) { this.persoana = persoana; }

    public Incident getIncident() { return incident; }
    public void setIncident(Incident incident) { this.incident = incident; }

    public String getCalitate() { return calitate; }
    public void setCalitate(String calitate) { this.calitate = calitate; }
}