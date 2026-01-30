package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Helper class for the composite primary key (person_id + incident_id).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Embeddable
public class PersoanaIncidentId implements Serializable {
    private Integer idPersoana;
    private Integer idIncident;

    public PersoanaIncidentId() {}

    public PersoanaIncidentId(Integer idPersoana, Integer idIncident) {
        this.idPersoana = idPersoana;
        this.idIncident = idIncident;
    }

    public Integer getIdPersoana() { return idPersoana; }
    public void setIdPersoana(Integer idPersoana) { this.idPersoana = idPersoana; }

    public Integer getIdIncident() { return idIncident; }
    public void setIdIncident(Integer idIncident) { this.idIncident = idIncident; }

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