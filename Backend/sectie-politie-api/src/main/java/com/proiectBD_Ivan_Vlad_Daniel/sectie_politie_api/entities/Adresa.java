package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "Adrese")
public class Adresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adresa")
    private Integer idAdresa;

    @Column(name = "strada")
    @NotBlank(message = "Strada este obligatorie!")
    // Regex: Gol SAU Litere/Spatii. Daca e gol, NotBlank il prinde. Daca e gresit, Pattern il prinde.
    @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ ]+$", message = "Strada poate conține doar litere și spații.")
    private String strada;

    @Column(name = "numar")
    @NotBlank(message = "Numărul este obligatoriu!")
    @Pattern(regexp = "^$|^[a-zA-Z0-9]+$", message = "Numărul poate conține doar litere și cifre (fără spații).")
    private String numar;

    @Column(name = "bloc")
    // Blocul e optional, acceptam orice format sau punem unul lejer
    private String bloc;

    @Column(name = "apartament")
    @Min(value = 0, message = "Apartamentul trebuie să fie un număr pozitiv.")
    private Integer apartament;

    @Column(name = "localitate")
    @NotBlank(message = "Localitatea este obligatorie!")
    @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ -]+$", message = "Localitatea poate conține doar litere, spații sau cratimă.")
    private String localitate;

    @Column(name = "judet_sau_sector")
    @NotBlank(message = "Județul/Sectorul este obligatoriu!")
    @Pattern(regexp = "^$|^[a-zA-ZăâîșțĂÂÎȘȚ0-9 ]+$", message = "Câmpul poate conține doar litere, cifre și spații.")
    private String judetSauSector;

    // --- Getters si Setters ---
    public Integer getIdAdresa() { return idAdresa; }
    public void setIdAdresa(Integer idAdresa) { this.idAdresa = idAdresa; }
    public String getStrada() { return strada; }
    public void setStrada(String strada) { this.strada = strada; }
    public String getNumar() { return numar; }
    public void setNumar(String numar) { this.numar = numar; }
    public String getBloc() { return bloc; }
    public void setBloc(String bloc) { this.bloc = bloc; }
    public Integer getApartament() { return apartament; }
    public void setApartament(Integer apartament) { this.apartament = apartament; }
    public String getLocalitate() { return localitate; }
    public void setLocalitate(String localitate) { this.localitate = localitate; }
    public String getJudetSauSector() { return judetSauSector; }
    public void setJudetSauSector(String judetSauSector) { this.judetSauSector = judetSauSector; }
}