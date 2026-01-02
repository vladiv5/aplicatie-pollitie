package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto;

public class BlockingItem {
    private String tip; // "Incident" sau "Amenda"
    private Integer id;
    private String descriere; // Ex: "Furt (Activ)" sau "Neplatita - 200 RON"

    public BlockingItem(String tip, Integer id, String descriere) {
        this.tip = tip;
        this.id = id;
        this.descriere = descriere;
    }

    // Getters
    public String getTip() { return tip; }
    public Integer getId() { return id; }
    public String getDescriere() { return descriere; }
}