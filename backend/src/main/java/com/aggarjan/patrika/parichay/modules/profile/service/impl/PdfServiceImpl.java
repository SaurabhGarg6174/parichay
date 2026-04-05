package com.aggarjan.patrika.parichay.modules.profile.service.impl;

import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.service.PdfService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.stream.Stream;

@Service
@Slf4j
public class PdfServiceImpl implements PdfService {

    @Override
    public ByteArrayInputStream generateBioDataPdf(BioData bioData) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font Styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD, java.awt.Color.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Font.BOLD, java.awt.Color.WHITE);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, java.awt.Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, java.awt.Color.BLACK);

            // Title
            Paragraph title = new Paragraph("VIKAS TRUST", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Parichay - Professional Bio-Data", FontFactory.getFont(FontFactory.HELVETICA, 12, Font.NORMAL, java.awt.Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Personal Information Section
            addSectionHeader(document, "PERSONAL INFORMATION", headerFont);
            PdfPTable personalTable = createTable(2);
            addRows(personalTable, normalFont, "Full Name", bioData.getFullName(), "Gender", bioData.getGender());
            addRows(personalTable, normalFont, "Date of Birth", bioData.getDob() != null ? bioData.getDob().toString() : "", "Birth Time", bioData.getBirthTime());
            addRows(personalTable, normalFont, "Birth Place", bioData.getBirthPlace(), "Marital Status", bioData.getMaritalStatus());
            addRows(personalTable, normalFont, "Height", bioData.getHeight(), "Weight", bioData.getWeight());
            addRows(personalTable, normalFont, "Complexion", bioData.getComplexion(), "Gotra", bioData.getGotra());
            addRows(personalTable, normalFont, "Manglik Status", bioData.getIsManglik(), "Spectacles", bioData.getWearsSpectacles() != null && bioData.getWearsSpectacles() ? "Yes" : "No");
            document.add(personalTable);

            // Educational & Professional Section
            addSectionHeader(document, "EDUCATION & PROFESSION", headerFont);
            PdfPTable profTable = createTable(2);
            addRows(profTable, normalFont, "Education", bioData.getEducation(), "Occupation", bioData.getOccupation());
            addRows(profTable, normalFont, "Monthly Income", bioData.getMonthlyIncome() != null ? "₹" + bioData.getMonthlyIncome() : "Not specified", "", "");
            document.add(profTable);

            // Family Details Section
            addSectionHeader(document, "FAMILY DETAILS", headerFont);
            PdfPTable familyTable = createTable(2);
            addRows(familyTable, normalFont, "Father's Name", bioData.getFatherName(), "Father's Occ.", bioData.getFatherOccupation());
            addRows(familyTable, normalFont, "Mother's Name", bioData.getMotherName(), "Mother's Occ.", bioData.getMotherOccupation());
            addRows(familyTable, normalFont, "Brothers", bioData.getBrothersMarried() + " (M) / " + bioData.getBrothersUnmarried() + " (U)", "Sisters", bioData.getSistersMarried() + " (M) / " + bioData.getSistersUnmarried() + " (U)");
            document.add(familyTable);

            // Contact & Address Section
            addSectionHeader(document, "CONTACT DETAILS", headerFont);
            PdfPTable contactTable = createTable(1);
            addRows(contactTable, normalFont, "Address", bioData.getFamilyAddress() + ", " + bioData.getFamilyCity() + ", " + bioData.getFamilyState() + ", " + bioData.getFamilyCountry());
            addRows(contactTable, normalFont, "Contact Number", bioData.getContactNumber());
            document.add(contactTable);

            // Verified Badge (if applicable)
            if (bioData.isCommunityVerified()) {
                Paragraph verifiedText = new Paragraph("Verified by Vikas Trust Community", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, java.awt.Color.ORANGE));
                verifiedText.setAlignment(Element.ALIGN_RIGHT);
                verifiedText.setSpacingBefore(30);
                document.add(verifiedText);
            }

            document.close();
        } catch (DocumentException e) {
            log.error("PDF Document Exception: {}", e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addSectionHeader(Document document, String headerTitle, Font font) throws DocumentException {
        PdfPTable header = new PdfPTable(1);
        header.setWidthPercentage(100);
        header.setSpacingBefore(15);
        header.setSpacingAfter(5);

        PdfPCell cell = new PdfPCell(new Phrase(headerTitle, font));
        cell.setBackgroundColor(java.awt.Color.GRAY);
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setBorder(Rectangle.NO_BORDER);
        header.addCell(cell);
        document.add(header);
    }

    private PdfPTable createTable(int columns) {
        PdfPTable table = new PdfPTable(columns);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5);
        return table;
    }

    private void addRows(PdfPTable table, Font font, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "-", font));
            cell.setPadding(5);
            cell.setBorder(Rectangle.NO_BORDER);
            table.addCell(cell);
        }
    }
}
