package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.entities;

import jakarta.persistence.*;

/** Clasa care defineste structura unei adrese fizice din baza de date * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
@Entity
@Table(name = "Adrese")
public class Adresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adresa")
    private Integer idAdresa;

    @Column(name = "strada")
    private String strada;

    @Column(name = "numar")
    private String numar;

    // Blocul si apartamentul pot fi null in baza de date
    @Column(name = "bloc")
    private String bloc;

    @Column(name = "apartament")
    private Integer apartament;

    @Column(name = "localitate")
    private String localitate;

    @Column(name = "judet_sau_sector")
    private String judetSauSector;

    // --- Metode de acces ---

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