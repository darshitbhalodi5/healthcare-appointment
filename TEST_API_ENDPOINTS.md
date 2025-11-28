# API Endpoint Testing Guide

This document provides examples and instructions for testing the newly implemented document management endpoints.

## Prerequisites

1. **Server Running**: Make sure the server is running on port 3051
   ```bash
   npm run server
   ```

2. **Authentication**: All endpoints require JWT authentication. You'll need:
   - A valid JWT token (login as patient/doctor/admin)
   - The token should be included in the `Authorization` header as `Bearer {token}`

3. **Test Data**: You'll need:
   - A valid appointment ID (from your database)
   - A patient user ID and doctor user ID
   - Test files: PDF and image files for upload testing

## API Endpoints

### Base URL
```
http://localhost:3051/api/v1/appointment
```

---

## 1. Upload Document

**Endpoint**: `POST /:appointmentId/upload-document`

**Description**: Upload a document (PDF or image) to an appointment

**Headers**:
```
Authorization: Bearer {your_jwt_token}
Content-Type: multipart/form-data
```

**Body** (Form Data):
```
file: <select a file>
```

**cURL Example** (Patient Upload):
```bash
curl -X POST "http://localhost:3051/api/v1/appointment/{appointmentId}/upload-document" \
  -H "Authorization: Bearer {patient_jwt_token}" \
  -F "file=@/path/to/document.pdf"
```

**cURL Example** (Doctor Upload):
```bash
curl -X POST "http://localhost:3051/api/v1/appointment/{appointmentId}/upload-document" \
  -H "Authorization: Bearer {doctor_jwt_token}" \
  -F "file=@/path/to/prescription.pdf"
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "_id": "doc123...",
    "filename": "document.pdf",
    "storedFilename": "uuid-v4.pdf",
    "filepath": "/path/to/file",
    "fileType": "pdf",
    "mimeType": "application/pdf",
    "fileSize": 2048576,
    "uploadedBy": {
      "_id": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "uploaderRole": "patient",
    "category": "pre-appointment",
    "uploadedAt": "2025-11-28T10:00:00Z",
    "comments": []
  }
}
```

**Error Responses**:
- `400`: No file uploaded / Invalid file type / File too large
- `403`: Not authorized (e.g., doctor uploading to pending appointment)
- `404`: Appointment not found
- `413`: File size exceeds 10 MB limit

---

## 2. Get All Documents

**Endpoint**: `GET /:appointmentId/documents`

**Description**: Retrieve all documents for an appointment with metadata

**Headers**:
```
Authorization: Bearer {your_jwt_token}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3051/api/v1/appointment/{appointmentId}/documents" \
  -H "Authorization: Bearer {jwt_token}"
```

**Success Response** (200):
```json
{
  "success": true,
  "appointment": {
    "_id": "appt123",
    "status": "approved",
    "date": "28-11-2025",
    "time": "14:00",
    "generalNotes": "Patient shows improvement",
    "documents": [
      {
        "_id": "doc1",
        "filename": "lab_report.pdf",
        "fileType": "pdf",
        "fileSize": 1024000,
        "uploadedBy": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "uploaderRole": "patient",
        "category": "pre-appointment",
        "uploadedAt": "2025-11-27T10:00:00Z",
        "comments": [
          {
            "_id": "comment1",
            "userId": {
              "firstName": "Dr. Jane",
              "lastName": "Smith"
            },
            "text": "Reviewed - normal range",
            "createdAt": "2025-11-27T12:00:00Z"
          }
        ]
      },
      {
        "_id": "doc2",
        "filename": "prescription.pdf",
        "fileType": "pdf",
        "fileSize": 512000,
        "uploadedBy": {
          "firstName": "Dr. Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        },
        "uploaderRole": "doctor",
        "category": "post-appointment",
        "uploadedAt": "2025-11-28T16:00:00Z",
        "comments": []
      }
    ]
  }
}
```

**Error Responses**:
- `403`: Not authorized to view documents
- `404`: Appointment not found

---

## 3. Download Document

**Endpoint**: `GET /:appointmentId/document/:documentId/download`

**Description**: Download a specific document

**Headers**:
```
Authorization: Bearer {your_jwt_token}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3051/api/v1/appointment/{appointmentId}/document/{documentId}/download" \
  -H "Authorization: Bearer {jwt_token}" \
  -o downloaded_file.pdf
```

**Success Response** (200):
- File stream with appropriate Content-Type and Content-Disposition headers
- Browser will prompt download with original filename

**Error Responses**:
- `403`: Not authorized to download
- `404`: Document not found / File not found on server

---

## 4. Replace Document

**Endpoint**: `PUT /:appointmentId/document/:documentId/replace`

**Description**: Replace an existing document (patient only, before appointment)

**Headers**:
```
Authorization: Bearer {patient_jwt_token}
Content-Type: multipart/form-data
```

**Body** (Form Data):
```
file: <select new file>
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:3051/api/v1/appointment/{appointmentId}/document/{documentId}/replace" \
  -H "Authorization: Bearer {patient_jwt_token}" \
  -F "file=@/path/to/updated_document.pdf"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Document replaced successfully",
  "document": {
    "_id": "doc123",
    "filename": "updated_document.pdf",
    "storedFilename": "new-uuid-v4.pdf",
    // ... other fields
  }
}
```

**Error Responses**:
- `400`: No file uploaded
- `403`: Not authorized / Cannot replace after appointment / Not original uploader
- `404`: Document not found

---

## 5. Add Document Comment

**Endpoint**: `POST /:appointmentId/document/:documentId/comment`

**Description**: Add a comment to a specific document (doctor only)

**Headers**:
```
Authorization: Bearer {doctor_jwt_token}
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "text": "Lab results reviewed - all values within normal range. Continue current medication."
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:3051/api/v1/appointment/{appointmentId}/document/{documentId}/comment" \
  -H "Authorization: Bearer {doctor_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"text": "Lab results reviewed - all values normal"}'
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "_id": "comment123",
    "userId": {
      "firstName": "Dr. Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "text": "Lab results reviewed - all values normal",
    "createdAt": "2025-11-28T12:00:00Z"
  }
}
```

**Error Responses**:
- `400`: Comment text is required
- `403`: Only doctors can comment / Not assigned doctor
- `404`: Appointment or document not found

---

## 6. Update General Notes

**Endpoint**: `PUT /:appointmentId/notes`

**Description**: Update general appointment notes (doctor only)

**Headers**:
```
Authorization: Bearer {doctor_jwt_token}
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "notes": "Patient shows significant improvement. Blood pressure normalized. Continue current medication for 2 more weeks. Schedule follow-up appointment."
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:3051/api/v1/appointment/{appointmentId}/notes" \
  -H "Authorization: Bearer {doctor_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Patient shows improvement. Continue medication."}'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Notes updated successfully",
  "generalNotes": "Patient shows improvement. Continue medication."
}
```

**Error Responses**:
- `403`: Only doctors can update notes / Not assigned doctor
- `404`: Appointment not found

---

## 7. Delete Document

**Endpoint**: `DELETE /:appointmentId/document/:documentId`

**Description**: Delete a document (admin only)

**Headers**:
```
Authorization: Bearer {admin_jwt_token}
```

**cURL Example**:
```bash
curl -X DELETE "http://localhost:3051/api/v1/appointment/{appointmentId}/document/{documentId}" \
  -H "Authorization: Bearer {admin_jwt_token}"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Error Responses**:
- `403`: Only admins can delete documents
- `404`: Document not found

---

## Testing Workflow

### Scenario 1: Patient Uploads Document During Booking

1. Patient creates an appointment (existing endpoint)
2. Patient uploads document:
   ```bash
   POST /:appointmentId/upload-document
   ```
3. Document is categorized as "pre-appointment"
4. Patient can view documents:
   ```bash
   GET /:appointmentId/documents
   ```

### Scenario 2: Doctor Approves and Adds Prescription

1. Doctor approves appointment (existing endpoint)
2. Appointment status changes to "approved"
3. Doctor uploads prescription:
   ```bash
   POST /:appointmentId/upload-document
   ```
4. Doctor adds general notes:
   ```bash
   PUT /:appointmentId/notes
   ```
5. Patient receives document and can download:
   ```bash
   GET /:appointmentId/document/:documentId/download
   ```

### Scenario 3: Doctor Comments on Patient's Document

1. Patient has uploaded lab report
2. Doctor views all documents:
   ```bash
   GET /:appointmentId/documents
   ```
3. Doctor adds comment to specific document:
   ```bash
   POST /:appointmentId/document/:documentId/comment
   ```
4. Patient can see doctor's comment when viewing documents

### Scenario 4: Patient Replaces Document Before Appointment

1. Patient uploaded wrong document
2. Current time is before appointment time
3. Patient replaces document:
   ```bash
   PUT /:appointmentId/document/:documentId/replace
   ```
4. Old file is deleted, new file is saved
5. Comments on document are preserved

---

## Testing with Postman

### Setup

1. **Create a new Collection**: "Appointment Document Management"

2. **Add Environment Variables**:
   - `base_url`: `http://localhost:3051/api/v1/appointment`
   - `patient_token`: `{your_patient_jwt_token}`
   - `doctor_token`: `{your_doctor_jwt_token}`
   - `admin_token`: `{your_admin_jwt_token}`
   - `appointment_id`: `{test_appointment_id}`
   - `document_id`: `{test_document_id}`

3. **Create Requests** for each endpoint using the examples above

### Sample Test Cases

#### Test 1: Upload Valid PDF
- Method: POST
- URL: `{{base_url}}/{{appointment_id}}/upload-document`
- Headers: `Authorization: Bearer {{patient_token}}`
- Body: Form-data with PDF file
- Expected: 201 Created

#### Test 2: Upload Oversized File
- Same as Test 1 but with 15 MB file
- Expected: 413 Payload Too Large

#### Test 3: Upload Invalid File Type
- Same as Test 1 but with .exe file
- Expected: 400 Bad Request

#### Test 4: Doctor Upload to Pending Appointment
- Method: POST
- URL: `{{base_url}}/{{pending_appointment_id}}/upload-document`
- Headers: `Authorization: Bearer {{doctor_token}}`
- Expected: 403 Forbidden

#### Test 5: Get Documents
- Method: GET
- URL: `{{base_url}}/{{appointment_id}}/documents`
- Headers: `Authorization: Bearer {{patient_token}}`
- Expected: 200 OK with documents array

---

## Common Errors and Solutions

### Error: "No file uploaded"
**Cause**: File field not included in form-data
**Solution**: Ensure you're sending form-data with field name "file"

### Error: "Appointment not found"
**Cause**: Invalid appointment ID
**Solution**: Use a valid MongoDB ObjectId from your database

### Error: "You are not authorized"
**Cause**: User doesn't have permission for this appointment
**Solution**: Ensure the user is either the patient, assigned doctor, or admin

### Error: "Doctor can only upload after approval"
**Cause**: Trying to upload to pending appointment
**Solution**: Approve the appointment first, then upload

### Error: "Cannot replace after appointment"
**Cause**: Trying to replace document after appointment time
**Solution**: This is expected behavior - patients can't replace after appointment

### Error: "File too large"
**Cause**: File exceeds 10 MB limit
**Solution**: Compress the file or use a smaller file

### Error: "Invalid file type"
**Cause**: File is not PDF, JPG, JPEG, or PNG
**Solution**: Convert file to allowed format

---

## Manual Testing Checklist

### Basic Upload/Download
- [ ] Patient uploads PDF during booking
- [ ] Patient uploads JPG image
- [ ] Patient uploads PNG image
- [ ] Doctor uploads prescription after approval
- [ ] Download document as patient
- [ ] Download document as doctor
- [ ] Download document as admin

### Permission Testing
- [ ] Patient cannot upload to rejected appointment
- [ ] Doctor cannot upload to pending appointment
- [ ] Patient A cannot view Patient B's documents
- [ ] Doctor A cannot view Doctor B's appointment documents
- [ ] Admin can view all documents

### File Validation
- [ ] Upload 10 MB file (should succeed)
- [ ] Upload 11 MB file (should fail)
- [ ] Upload .exe file (should fail)
- [ ] Upload .docx file (should fail)
- [ ] Upload file with special characters in name

### Replace Functionality
- [ ] Patient replaces own document before appointment
- [ ] Patient cannot replace after appointment time
- [ ] Patient cannot replace doctor's document
- [ ] Doctor cannot replace documents

### Comment Functionality
- [ ] Doctor adds comment to patient document
- [ ] Doctor adds comment to own document
- [ ] Patient cannot add comments
- [ ] Admin cannot add comments

### General Notes
- [ ] Doctor updates general notes
- [ ] Patient can view general notes (read-only)
- [ ] Non-assigned doctor cannot update notes

### Category Testing
- [ ] Upload before appointment time → pre-appointment
- [ ] Upload after appointment time → post-appointment
- [ ] Verify files saved in correct folders

---

## Database Verification

After testing, verify in MongoDB:

```javascript
// Find appointment and check documents
db.appointments.findOne({_id: ObjectId("your_appointment_id")})

// Should see:
// - documents array with uploaded files
// - generalNotes field with doctor notes
// - appointmentDateTime computed field
// - comments array within documents
```

---

## Next Steps

After backend testing is complete:
1. Test all endpoints with Postman or cURL
2. Verify files are saved correctly in uploads/appointments/
3. Check file permissions and security
4. Proceed to frontend integration (Phase 4)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-28
