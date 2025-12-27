package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "Persoane_Adrese")
public class PersoanaAdresa {
    @EmbeddedId
    private PersoanaAdresaId id;

    @ManyToOne
    @MapsId("idPersoana") // 2. Mapează "idPersoana" din cheia compusă la această relație
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    @ManyToOne
    @MapsId("idAdresa") // 3. Mapează "idAdresa" din cheia compusă la această relație
    @JoinColumn(name = "id_adresa")
    private Adresa adresa;

    @Column(name = "tip_adresa") // 4. Acesta este câmpul extra din tabela de legătură
    private String tipAdresa;

    // --- Getters și Setters ---


    public PersoanaAdresaId getId() {
        return id;
    }

    public Persoana getPersoana() {
        return persoana;
    }

    public Adresa getAdresa() {
        return adresa;
    }

    public String getTipAdresa() {
        return tipAdresa;
    }

    public void setId(PersoanaAdresaId id) {
        this.id = id;
    }

    public void setPersoana(Persoana persoana) {
        this.persoana = persoana;
    }

    public void setAdresa(Adresa adresa) {
        this.adresa = adresa;
    }

    public void setTipAdresa(String tipAdresa) {
        this.tipAdresa = tipAdresa;
    }
}
