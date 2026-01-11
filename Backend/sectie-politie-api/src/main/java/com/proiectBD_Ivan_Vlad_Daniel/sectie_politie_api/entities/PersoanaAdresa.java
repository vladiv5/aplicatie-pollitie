package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

/** Clasa de legatura intre Persoane si Adrese, incluzand tipul adresei (ex: Domiciliu)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Entity
@Table(name = "Persoane_Adrese")
public class PersoanaAdresa {

    // Am folosit cheia compusa definita anterior
    @EmbeddedId
    private PersoanaAdresaId id;

    @ManyToOne
    @MapsId("idPersoana") // Am mapat partea de ID persoana la entitatea Persoana
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    @ManyToOne
    @MapsId("idAdresa") // Am mapat partea de ID adresa la entitatea Adresa
    @JoinColumn(name = "id_adresa")
    private Adresa adresa;

    @Column(name = "tip_adresa")
    private String tipAdresa;

    // --- Getters si Setters ---

    public PersoanaAdresaId getId() { return id; }
    public void setId(PersoanaAdresaId id) { this.id = id; }

    public Persoana getPersoana() { return persoana; }
    public void setPersoana(Persoana persoana) { this.persoana = persoana; }

    public Adresa getAdresa() { return adresa; }
    public void setAdresa(Adresa adresa) { this.adresa = adresa; }

    public String getTipAdresa() { return tipAdresa; }
    public void setTipAdresa(String tipAdresa) { this.tipAdresa = tipAdresa; }
}