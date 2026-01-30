package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

/**
 * Join entity linking Persons and Addresses, including the type of address (e.g., Domicile).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
@Entity
@Table(name = "Persoane_Adrese")
public class PersoanaAdresa {

    // I used the composite key defined previously.
    @EmbeddedId
    private PersoanaAdresaId id;

    @ManyToOne
    @MapsId("idPersoana") // I mapped the Person ID part to the Person entity.
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    @ManyToOne
    @MapsId("idAdresa") // I mapped the Address ID part to the Address entity.
    @JoinColumn(name = "id_adresa")
    private Adresa adresa;

    @Column(name = "tip_adresa")
    private String tipAdresa;

    // --- Getters and Setters ---

    public PersoanaAdresaId getId() { return id; }
    public void setId(PersoanaAdresaId id) { this.id = id; }

    public Persoana getPersoana() { return persoana; }
    public void setPersoana(Persoana persoana) { this.persoana = persoana; }

    public Adresa getAdresa() { return adresa; }
    public void setAdresa(Adresa adresa) { this.adresa = adresa; }

    public String getTipAdresa() { return tipAdresa; }
    public void setTipAdresa(String tipAdresa) { this.tipAdresa = tipAdresa; }
}