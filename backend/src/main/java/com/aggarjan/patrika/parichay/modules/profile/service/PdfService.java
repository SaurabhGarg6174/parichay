package com.aggarjan.patrika.parichay.modules.profile.service;

import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import java.io.ByteArrayInputStream;

public interface PdfService {
    ByteArrayInputStream generateBioDataPdf(BioData bioData);
}
