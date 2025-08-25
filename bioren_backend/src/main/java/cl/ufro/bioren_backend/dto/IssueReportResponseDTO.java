package cl.ufro.bioren_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class IssueReportResponseDTO {
    private Long id;
    private EquipmentDTO equipment;
    private String reportedBy;
    private LocalDateTime dateTime;
    private String description;
    private String severity;
    private List<AttachmentDTO> attachments;
    private String status;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public EquipmentDTO getEquipment() { return equipment; }
    public void setEquipment(EquipmentDTO equipment) { this.equipment = equipment; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public List<AttachmentDTO> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDTO> attachments) { this.attachments = attachments; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static class EquipmentDTO {
        private Long id;
        private String name;
        private String brand;
        private String model;
        // Getters y setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getBrand() { return brand; }
        public void setBrand(String brand) { this.brand = brand; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
    }

    public static class AttachmentDTO {
        private String name;
        private String url;
        // Getters y setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}
