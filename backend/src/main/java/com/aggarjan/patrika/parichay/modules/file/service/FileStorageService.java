package com.aggarjan.patrika.parichay.modules.file.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Persists an uploaded file under a randomized name and returns its public URL path.
     */
    String store(MultipartFile file);
}
