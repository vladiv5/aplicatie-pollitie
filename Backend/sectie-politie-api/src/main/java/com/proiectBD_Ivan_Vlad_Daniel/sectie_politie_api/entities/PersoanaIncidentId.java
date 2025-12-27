package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PersoanaIncidentId implements Serializable {
    @Column(name = "id_persoana")
    private Integer idPersoana;

    @Column(name = "id_incident")
    private Integer idIncident;

    // --- Constructor gol (Necesar pentru JPA) ---
    public PersoanaIncidentId() {
    }

    // --- Constructor cu argumente ---
    public PersoanaIncidentId(Integer idPersoana, Integer idIncident) {
        this.idPersoana = idPersoana;
        this.idIncident = idIncident;
    }

    // --- Getters și Setters ---


    public Integer getIdPersoana() {
        return idPersoana;
    }

    public Integer getIdIncident() {
        return idIncident;
    }

    public void setIdPersoana(Integer idPersoana) {
        this.idPersoana = idPersoana;
    }

    public void setIdIncident(Integer idIncident) {
        this.idIncident = idIncident;
    }

    // --- Metodele equals() și hashCode() (Necesar pentru chei compuse) ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PersoanaIncidentId that = (PersoanaIncidentId) o;
        return Objects.equals(idPersoana, that.idPersoana) &&
                Objects.equals(idIncident, that.idIncident);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPersoana, idIncident);
    }
}
