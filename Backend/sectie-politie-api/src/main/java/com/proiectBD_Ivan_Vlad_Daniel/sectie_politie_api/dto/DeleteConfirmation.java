package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto;

import java.util.List;

public class DeleteConfirmation {
    private boolean permisiuneStergere;
    private String severitate; // "SAFE" (Verde), "WARNING" (Portocaliu), "BLOCKED" (Rosu)
    private String titlu;
    private String mesaj;
    private List<BlockingItem> elementeBlocante; // Lista pentru tabelul din modal

    public DeleteConfirmation(boolean permisiuneStergere, String severitate, String titlu, String mesaj, List<BlockingItem> elementeBlocante) {
        this.permisiuneStergere = permisiuneStergere;
        this.severitate = severitate;
        this.titlu = titlu;
        this.mesaj = mesaj;
        this.elementeBlocante = elementeBlocante;
    }

    // Getters...
    public boolean isPermisiuneStergere() { return permisiuneStergere; }
    public String getSeveritate() { return severitate; }
    public String getTitlu() { return titlu; }
    public String getMesaj() { return mesaj; }
    public List<BlockingItem> getElementeBlocante() { return elementeBlocante; }
}