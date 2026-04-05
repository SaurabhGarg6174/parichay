package com.aggarjan.patrika.parichay.modules.profile.service;

import java.io.IOException;

public interface QrCodeService {
    byte[] generateQrCode(String text, int width, int height) throws IOException;
}
