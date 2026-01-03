package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
    @NotBlank(message = "Motivul amenzii este obligatoriu!")
    // Acceptam litere, spatii si gol (pt ca golul e prins de NotBlank)
    @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ ]+$", message = "Motivul poate conține doar litere și spații.")
    private String motiv;

    @Column(name = "suma")
    @NotNull(message = "Suma este obligatorie!")
    @Positive(message = "Suma trebuie să fie pozitivă!")
    @Max(value = 3000, message = "Suma maximă este 3000 RON.")
    private BigDecimal suma;

    @Column(name = "stare_plata")
    @NotBlank(message = "Starea plății este obligatorie!")
    private String starePlata;

    @Column(name = "data_emitere")
    @NotNull(message = "Data emiterii este obligatorie!")
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