package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "Amenzi")
public class Amenda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_amenda")
    private Integer idAmenda;

    @Column(name = "motiv")
    // FARA ADNOTARI - VALIDAM IN CONTROLLER
    private String motiv;

    @Column(name = "suma")
    // FARA ADNOTARI - VALIDAM IN CONTROLLER
    private BigDecimal suma;

    @Column(name = "stare_plata")
    private String starePlata;

    @Column(name = "data_emitere")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime dataEmitere;

    @ManyToOne
    @JoinColumn(name = "id_politist")
    private Politist politist;

    @ManyToOne
    @JoinColumn(name = "id_persoana")
    private Persoana persoana;

    // Getters/Setters...
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