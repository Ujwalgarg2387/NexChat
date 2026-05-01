package com.nexchat.service;

import com.nexchat.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    private static final long MAX_DOC_SIZE = 20 * 1024 * 1024;   // 20MB

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/ogg", "video/quicktime");
    private static final Set<String> ALLOWED_DOC_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain");

    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        validateFile(file, contentType);

        String subDir = getSubDir(contentType);
        Path dirPath = Paths.get(uploadDir, subDir);
        Files.createDirectories(dirPath);

        String ext = getExtension(Objects.requireNonNull(file.getOriginalFilename()));
        String fileName = UUID.randomUUID().toString() + ext;
        Path targetPath = dirPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/api/files/view/" + subDir + "/" + fileName;

        Map<String, String> result = new HashMap<>();
        result.put("fileUrl", fileUrl);
        result.put("fileName", file.getOriginalFilename());
        result.put("fileSize", formatFileSize(file.getSize()));
        result.put("fileMimeType", contentType);
        result.put("messageType", subDir.toUpperCase());
        return result;
    }

    public Path getFilePath(String subDir, String fileName) {
        return Paths.get(uploadDir, subDir, fileName);
    }

    private void validateFile(MultipartFile file, String contentType) {
        if (file.isEmpty()) throw new BadRequestException("File is empty");

        if (ALLOWED_IMAGE_TYPES.contains(contentType)) {
            if (file.getSize() > MAX_IMAGE_SIZE)
                throw new BadRequestException("Image size exceeds 10MB limit");
        } else if (ALLOWED_VIDEO_TYPES.contains(contentType)) {
            if (file.getSize() > MAX_VIDEO_SIZE)
                throw new BadRequestException("Video size exceeds 50MB limit");
        } else if (ALLOWED_DOC_TYPES.contains(contentType)) {
            if (file.getSize() > MAX_DOC_SIZE)
                throw new BadRequestException("Document size exceeds 20MB limit");
        } else {
            throw new BadRequestException("File type not allowed: " + contentType);
        }
    }

    private String getSubDir(String contentType) {
        if (ALLOWED_IMAGE_TYPES.contains(contentType)) return "images";
        if (ALLOWED_VIDEO_TYPES.contains(contentType)) return "videos";
        return "documents";
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : "";
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }
}
