package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable // 1. Spune JPA că aceasta clasa este embeddable (poate fi parte dintr-o alta entitate)
public class PersoanaAdresaId implements Serializable {
    @Column(name = "id_persoana")
    private Integer idPersoana;

    @Column(name = "id_adresa")
    private Integer idAdresa;

    // --- Constructor gol (Necesar pentru JPA) ---
    public PersoanaAdresaId() {
    }

    // --- Constructor cu argumente ---
    public PersoanaAdresaId(Integer idPersoana, Integer idAdresa) {
        this.idPersoana = idPersoana;
        this.idAdresa = idAdresa;
    }

    public Integer getIdPersoana() {
        return idPersoana;
    }

    public Integer getIdAdresa() {
        return idAdresa;
    }

    public void setIdPersoana(Integer idPersoana) {
        this.idPersoana = idPersoana;
    }

    public void setIdAdresa(Integer idAdresa) {
        this.idAdresa = idAdresa;
    }

    // --- Metodele equals() și hashCode() (Necesar pentru chei compuse) ---
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
}

