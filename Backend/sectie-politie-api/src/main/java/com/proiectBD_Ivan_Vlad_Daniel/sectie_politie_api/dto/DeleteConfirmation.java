package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto;

import java.util.List;

/**
 * Complex object sent to frontend to determine the color and message of the Delete Modal.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
public class DeleteConfirmation {
    private boolean permisiuneStergere;
    // Severity determines modal color: SAFE (Green), WARNING (Orange), BLOCKED (Red)
    private String severitate;
    private String titlu;
    private String mesaj;
    // Detailed list of reasons why deletion is risky or blocked
    private List<BlockingItem> elementeBlocante;

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