package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto;

import java.util.List;

/** Obiect complex trimis catre frontend pentru a decide culoarea si mesajul modalului de stergere
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
public class DeleteConfirmation {
    private boolean permisiuneStergere;
    // Severitatea determina culoarea modalului: SAFE (Verde), WARNING (Portocaliu), BLOCKED (Rosu)
    private String severitate;
    private String titlu;
    private String mesaj;
    // Lista detaliata cu motivele pentru care stergerea este periculoasa sau blocata
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