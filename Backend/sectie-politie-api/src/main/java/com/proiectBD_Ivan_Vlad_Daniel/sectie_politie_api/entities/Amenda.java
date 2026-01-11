package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

/** Clasa pentru entitatea Amenda care inregistreaza sanctiunile
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Entity
@Table(name = "Amenzi")
public class Amenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_amenda")
    private Integer idAmenda;

    // Validarile pentru motiv si suma le-am implementat direct in Controller, nu aici
    @Column(name = "motiv")
    private String motiv;

    @Column(name = "suma")
    private BigDecimal suma;

    @Column(name = "stare_plata")
    private String starePlata;

    // Am specificat formatul JSON pentru a fi usor de citit in frontend
    @Column(name = "data_emitere")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime dataEmitere;

    // Aici am definit relatiile cu Politistul si Persoana amendata
    @ManyToOne
    @JoinColumn(name = "id_politist")
    private Politist politist;

    @ManyToOne
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    // --- Metode de acces ---

    public Integer getIdAmenda() { return idAmenda; }
    public void setIdAmenda(Integer idAmenda) { this.idAmenda = idAmenda; }

    public String getMotiv() { return motiv; }
    public void setMotiv(String motiv) { this.motiv = motiv; }

    public BigDecimal getSuma() { return suma; }
    public void setSuma(BigDecimal suma) { this.suma = suma; }

    public String getStarePlata() { return starePlata; }
    public void setStarePlata(String starePlata) { this.starePlata = starePlata; }

    public LocalDateTime getDataEmitere() { return dataEmitere; }
    public void setDataEmitere(LocalDateTime dataEmitere) { this.dataEmitere = dataEmitere; }

    public Politist getPolitist() { return politist; }
    public void setPolitist(Politist politist) { this.politist = politist; }

    public Persoana getPersoana() { return persoana; }
    public void setPersoana(Persoana persoana) { this.persoana = persoana; }
}