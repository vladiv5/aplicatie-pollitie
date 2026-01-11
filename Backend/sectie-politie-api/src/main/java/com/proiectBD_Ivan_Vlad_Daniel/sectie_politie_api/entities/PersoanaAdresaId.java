package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/** Clasa ajutatoare pentru definirea cheii primare compuse (id_persoana + id_adresa)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Embeddable
public class PersoanaAdresaId implements Serializable {
    private Integer idPersoana;
    private Integer idAdresa;

    // Constructor gol necesar pentru JPA
    public PersoanaAdresaId() {}

    public PersoanaAdresaId(Integer idPersoana, Integer idAdresa) {
        this.idPersoana = idPersoana;
        this.idAdresa = idAdresa;
    }

    // Am implementat equals si hashCode, obligatorii pentru cheile compuse
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PersoanaAdresaId that = (PersoanaAdresaId) o;
        return Objects.equals(idPersoana, that.idPersoana) &&
                Objects.equals(idAdresa, that.idAdresa);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPersoana, idAdresa);
    }

    public Integer getIdPersoana() { return idPersoana; }
    public void setIdPersoana(Integer idPersoana) { this.idPersoana = idPersoana; }

    public Integer getIdAdresa() { return idAdresa; }
    public void setIdAdresa(Integer idAdresa) { this.idAdresa = idAdresa; }
}