package com.scts.service;

import com.scts.dto.BulkImportResultDTO;
import com.scts.entity.Role;
import com.scts.entity.User;
import com.scts.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FacultyImportService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public FacultyImportService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public BulkImportResultDTO importFaculty(MultipartFile file) {
        List<Map<String, String>> rows = parseFileToRows(file);

        int importedCount = 0;
        int updatedCount = 0;
        int totalProcessedCount = 0;
        List<String> warnings = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            int rowNum = i + 2; // Row 1 is header

            String rawRegNo = getFieldValue(row, "faculty reg number", "faculty_reg_number", "reg_no", "registration number", "reg number", "code", "faculty code", "faculty_code", "reg no");
            String rawName = getFieldValue(row, "name", "full name", "full_name", "faculty name", "faculty_name");
            String rawEmail = getFieldValue(row, "mail id", "mail_id", "email", "email address", "email_address", "mail");
            String rawDept = getFieldValue(row, "department", "dept", "branch");

            if (rawEmail == null || rawEmail.trim().isEmpty()) {
                warnings.add("Row " + rowNum + ": Missing mail id/email address. Skipped.");
                continue;
            }

            totalProcessedCount++;

            String email = rawEmail.trim().toLowerCase();
            String name = rawName != null && !rawName.trim().isEmpty() ? rawName.trim() : extractNameFromEmail(email);
            String regNo = rawRegNo != null && !rawRegNo.trim().isEmpty() ? rawRegNo.trim().toUpperCase() : ("FAC" + System.currentTimeMillis() % 100000);
            String dept = rawDept != null && !rawDept.trim().isEmpty() ? rawDept.trim() : "General";

            // Find or create User
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("password123"));
                user.setRole(Role.ROLE_COMMUNITY_COORDINATOR); // Promote/assign to faculty coordinator role
                user.setStatus("ACTIVE");
                user.setFacultyRegNumber(regNo);
                user.setName(name);
                user.setDepartment(dept);
                user.setCreatedAt(LocalDateTime.now());
                userRepository.save(user);
                importedCount++;
            } else {
                // If user exists, promote to faculty role and update details
                user.setRole(Role.ROLE_COMMUNITY_COORDINATOR);
                user.setFacultyRegNumber(regNo);
                user.setName(name);
                user.setDepartment(dept);
                userRepository.save(user);
                updatedCount++;
            }
        }

        BulkImportResultDTO result = new BulkImportResultDTO();
        result.setSuccess(true);
        result.setMessage("Processed " + totalProcessedCount + " faculty records. Successfully registered/promoted: " + importedCount + ", Updated: " + updatedCount + ".");
        result.setImportedCount(importedCount);
        result.setAlreadyMemberCount(updatedCount);
        result.setTotalProcessedCount(totalProcessedCount);
        result.setWarnings(warnings);
        return result;
    }

    private String getFieldValue(Map<String, String> row, String... keys) {
        for (String key : keys) {
            String val = row.get(key.toLowerCase().trim());
            if (val != null && !val.trim().isEmpty()) {
                return val.trim();
            }
        }
        return "";
    }

    private String extractNameFromEmail(String email) {
        if (email.contains("@")) {
            String rawUsername = email.split("@")[0];
            String[] parts = rawUsername.split("\\.");
            StringBuilder sb = new StringBuilder();
            for (String part : parts) {
                if (!part.isEmpty()) {
                    sb.append(Character.toUpperCase(part.charAt(0)))
                      .append(part.substring(1))
                      .append(" ");
                }
            }
            return sb.toString().trim();
        }
        return email;
    }

    private List<Map<String, String>> parseFileToRows(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName != null && (fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))) {
            return parseExcelFile(file);
        } else {
            return parseCsvFile(file);
        }
    }

    private List<Map<String, String>> parseExcelFile(MultipartFile file) {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return rows;

            int maxCols = headerRow.getLastCellNum();
            String[] headers = new String[maxCols];
            for (int c = 0; c < maxCols; c++) {
                Cell cell = headerRow.getCell(c);
                headers[c] = (cell != null) ? cell.toString().toLowerCase().trim() : "";
            }

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Map<String, String> rowMap = new HashMap<>();
                boolean hasValue = false;
                for (int c = 0; c < maxCols; c++) {
                    Cell cell = row.getCell(c);
                    String val = (cell != null) ? getCellValueAsString(cell) : "";
                    if (!val.trim().isEmpty()) hasValue = true;
                    rowMap.put(headers[c], val);
                }
                if (hasValue) {
                    rows.add(rowMap);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error parsing Excel spreadsheet: " + e.getMessage(), e);
        }
        return rows;
    }

    private List<Map<String, String>> parseCsvFile(MultipartFile file) {
        List<Map<String, String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) return rows;

            String[] headers = parseCsvLine(headerLine);
            for (int i = 0; i < headers.length; i++) {
                headers[i] = headers[i].toLowerCase().trim().replace("\"", "");
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = parseCsvLine(line);
                Map<String, String> rowMap = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    String val = (i < values.length) ? values[i].trim().replace("\"", "") : "";
                    rowMap.put(headers[i], val);
                }
                rows.add(rowMap);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error parsing CSV file: " + e.getMessage(), e);
        }
        return rows;
    }

    private String[] parseCsvLine(String line) {
        return line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                // Handle whole numbers vs decimals cleanly
                double val = cell.getNumericCellValue();
                if (val == (long) val) {
                    return String.format("%d", (long) val);
                }
                return String.valueOf(val);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
}
