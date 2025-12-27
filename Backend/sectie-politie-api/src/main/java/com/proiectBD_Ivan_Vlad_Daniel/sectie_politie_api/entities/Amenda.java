package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Amenzi")
public class Amenda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_amenda")
    private Integer idAmenda;

    @Column(name = "data_emitere")
    private LocalDateTime dataEmitere;

    @Column(name = "motiv")
    private String motiv;

    @Column(name = "suma")
    private BigDecimal suma;

    @Column(name = "stare_plata")
    private String starePlata;

    // Relatie N:1
    // O amenda ii este acordata unei persoane
    // O persoana poate avea N amenzi
    @ManyToOne
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    // Relatie N:1
    // O amenda este data de un politist
    // Un politist poate da N amenzi
    @ManyToOne
    @JoinColumn(name = "id_politist")
    private Politist politist;

    // --- Getters și Setters ---


    public Integer getIdAmenda() {
        return idAmenda;
    }

    public LocalDateTime getDataEmitere() {
        return dataEmitere;
    }

    public String getMotiv() {
        return motiv;
    }

    public BigDecimal getSuma() {
        return suma;
    }

    public String getStarePlata() {
        return starePlata;
    }

    public Persoana getPersoana() {
        return persoana;
    }

    public Politist getPolitist() {
        return politist;
    }

    public void setIdAmenda(Integer idAmenda) {
        this.idAmenda = idAmenda;
    }

    public void setDataEmitere(LocalDateTime dataEmitere) {
        this.dataEmitere = dataEmitere;
    }

    public void setMotiv(String motiv) {
        this.motiv = motiv;
    }

    public void setSuma(BigDecimal suma) {
        this.suma = suma;
    }

    public void setStarePlata(String starePlata) {
        this.starePlata = starePlata;
    }

    public void setPersoana(Persoana persoana) {
        this.persoana = persoana;
    }

    public void setPolitist(Politist politist) {
        this.politist = politist;
    }
}
