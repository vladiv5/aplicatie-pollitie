package com.proiectBD_Ivan_Vlad_Daniel.sectie_politie_api.dto;

/**
 * Helper class to describe an item blocking a delete action (e.g., an unpaid fine).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
public class BlockingItem {
    private String tip; // "Incident" or "Fine"
    private Integer id;
    private String descriere; // e.g., "Theft (Active)" or "Unpaid - 200 RON"

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