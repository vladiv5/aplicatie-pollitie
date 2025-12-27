package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto;

import java.time.LocalDateTime;

public class IncidentDTO {
    private Integer idIncident;
    private String tipIncident;
    private LocalDateTime dataEmitere;
    private String descriereLocatie;
    private String descriereIncident;
    private String numePolitist; // Aici vom pune Nume + Prenume
    private String adresaCompleta; // Aici vom pune Adresa formatată

    // Constructor gol
    public IncidentDTO() {}

    // Constructor cu toate campurile
    public IncidentDTO(Integer idIncident, String tipIncident, LocalDateTime dataEmitere,
                       String descriereLocatie, String descriereIncident,
                       String numePolitist, String adresaCompleta) {
        this.idIncident = idIncident;
        this.tipIncident = tipIncident;
        this.dataEmitere = dataEmitere;
        this.descriereLocatie = descriereLocatie;
        this.descriereIncident = descriereIncident;
        this.numePolitist = numePolitist;
        this.adresaCompleta = adresaCompleta;
    }

    // Getters si Setters
    public Integer getIdIncident() { return idIncident; }
    public void setIdIncident(Integer idIncident) { this.idIncident = idIncident; }

    public String getTipIncident() { return tipIncident; }
    public void setTipIncident(String tipIncident) { this.tipIncident = tipIncident; }

    public LocalDateTime getDataEmitere() { return dataEmitere; }
    public void setDataEmitere(LocalDateTime dataEmitere) { this.dataEmitere = dataEmitere; }

    public String getDescriereLocatie() { return descriereLocatie; }
    public void setDescriereLocatie(String descriereLocatie) { this.descriereLocatie = descriereLocatie; }

    public String getDescriereIncident() { return descriereIncident; }
    public void setDescriereIncident(String descriereIncident) { this.descriereIncident = descriereIncident; }

    public String getNumePolitist() { return numePolitist; }
    public void setNumePolitist(String numePolitist) { this.numePolitist = numePolitist; }

    public String getAdresaCompleta() { return adresaCompleta; }
    public void setAdresaCompleta(String adresaCompleta) { this.adresaCompleta = adresaCompleta; }
}