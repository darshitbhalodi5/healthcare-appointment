# Appointment Document Management System
## Complete Requirements & Implementation Guide

---

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Document Upload Workflow](#document-upload-workflow)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Permissions Matrix](#permissions-matrix)
7. [File Management](#file-management)
8. [Security Considerations](#security-considerations)
9. [Implementation Plan](#implementation-plan)

---

## Overview

### Purpose
Add comprehensive document management to the health appointment system, allowing patients and doctors to upload, view, and manage medical documents (prescriptions, reports, lab results, etc.) throughout the appointment lifecycle.

### Key Features
- ✅ Patient document upload (before & after appointments)
- ✅ Doctor prescription & opinion upload
- ✅ Timeline-based organization (Pre/Post appointment)
- ✅ Document comments by doctors
- ✅ General appointment notes
- ✅ Role-based access control
- ✅ File validation (type, size)
- ✅ Local storage with secure file handling

---

## System Architecture

### Tech Stack Updates

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING STACK                                │
├──────────────────────────────────────────────────────────────────┤
│ Frontend: React 18.2 + Redux Toolkit + Ant Design               │
│ Backend:  Express.js 4.18 + Node.js                             │
│ Database: MongoDB (Mongoose 8.1.1)                               │
│ Auth:     JWT + bcryptjs                                         │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    NEW ADDITIONS                                 │
├──────────────────────────────────────────────────────────────────┤
│ File Upload:  multer (^1.4.5)                                   │
│ File System:  fs-extra (^11.2.0)                                │
│ Unique IDs:   uuid (^9.0.1)                                     │
│ File Validation: file-type (^18.7.0)                            │
└──────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
health1/
├── uploads/                          # NEW - File storage
│   └── appointments/
│       ├── {appointmentId}/
│       │   ├── pre/                  # Pre-appointment docs
│       │   └── post/                 # Post-appointment docs
│
├── middlewares/
│   ├── authMiddleware.js             # Existing
│   └── uploadMiddleware.js           # NEW - Multer config
│
├── controllers/
│   ├── userCtrl.js                   # Existing
│   ├── doctorCtrl.js                 # Existing
│   └── documentCtrl.js               # NEW - Document operations
│
├── models/
│   ├── appointmentModel.js           # UPDATE - Add documents field
│   ├── userModels.js                 # Existing
│   └── doctorModel.js                # Existing
│
├── routes/
│   ├── userRoutes.js                 # Existing
│   ├── doctorRoutes.js               # Existing
│   └── documentRoutes.js             # NEW - Document endpoints
│
└── DOCUMENT_MANAGEMENT_REQUIREMENTS.md  # This file
```

---

## Document Upload Workflow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT LIFECYCLE FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

PATIENT BOOKS APPOINTMENT
    │
    ├──> [OPTIONAL] Upload Documents
    │         │
    │         └──> Medical History, Lab Reports, Previous Prescriptions
    │
    ▼
APPOINTMENT STATUS: "pending"
    │
    ├──> Patient can: Upload/Replace documents
    ├──> Doctor can:  View appointment (no upload yet)
    │
    ▼
DOCTOR APPROVES APPOINTMENT
    │
    ▼
APPOINTMENT STATUS: "approved"
    │
    ├──> Patient can: Upload/Replace documents (before appointment time)
    ├──> Doctor can:  Upload documents, Add notes, Comment on docs
    │
    ▼
APPOINTMENT TIME OCCURS
    │
    ├──> Auto-categorization triggered
    │    ├──> Docs uploaded before time → "pre-appointment"
    │    └──> Docs uploaded after time  → "post-appointment"
    │
    ▼
AFTER APPOINTMENT (No status change needed)
    │
    ├──> Patient can: Upload follow-up docs, View all docs
    ├──> Doctor can:  Upload prescriptions, Add opinions, Comment
    │
    ▼
DOCUMENTS PRESERVED (Even if appointment rejected)
```

### Upload Timeline Matrix

| Stage | Patient Upload | Doctor Upload | Document Category |
|-------|---------------|---------------|-------------------|
| **During Booking** | ✅ Yes | ❌ No | Pre-appointment |
| **Pending (before appointment time)** | ✅ Yes | ❌ No | Pre-appointment |
| **Approved (before appointment time)** | ✅ Yes | ✅ Yes | Pre-appointment |
| **After appointment time** | ✅ Yes | ✅ Yes | Post-appointment |

---

## Database Schema

### Updated Appointment Model

```javascript
// models/appointmentModel.js

{
  // ============ EXISTING FIELDS ============
  userId: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  doctorInfo: {
    type: String,
    required: true
  },
  userInfo: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "pending"
    // Values: "pending", "approved", "reject"
  },

  // ============ NEW FIELDS ============

  documents: [{
    // File Information
    filename: {
      type: String,
      required: true          // Original filename (e.g., "lab_report.pdf")
    },
    storedFilename: {
      type: String,
      required: true          // UUID-based filename (e.g., "uuid-v4.pdf")
    },
    filepath: {
      type: String,
      required: true          // Full server path
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'image']  // Document type category
    },
    mimeType: {
      type: String,
      required: true          // 'application/pdf', 'image/jpeg', etc.
    },
    fileSize: {
      type: Number,
      required: true          // Size in bytes
    },

    // Upload Metadata
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true          // User who uploaded (patient or doctor)
    },
    uploaderRole: {
      type: String,
      required: true,
      enum: ['patient', 'doctor']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },

    // Categorization
    category: {
      type: String,
      required: true,
      enum: ['pre-appointment', 'post-appointment']
    },

    // Doctor Comments on This Document
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],

  // General Doctor Notes (not tied to specific document)
  generalNotes: {
    type: String,
    default: ''
  },

  // Track actual appointment completion time
  appointmentDateTime: {
    type: Date                // Computed from date + time strings
  }
},
{
  timestamps: true            // Existing: createdAt, updatedAt
}
```

### Schema Relationships

```
┌─────────────────┐
│   Appointment   │
├─────────────────┤
│ _id             │
│ userId      ────┼───────> User (Patient)
│ doctorId    ────┼───────> User (Doctor)
│ documents[]     │
│ generalNotes    │
│ status          │
└─────────────────┘
        │
        │ documents array
        ▼
┌──────────────────────────┐
│      Document Object     │
├──────────────────────────┤
│ filename                 │
│ storedFilename           │
│ filepath                 │
│ uploadedBy ──────────────┼────> User (Patient/Doctor)
│ uploaderRole             │
│ category                 │
│ comments[]               │
└──────────────────────────┘
        │
        │ comments array
        ▼
┌──────────────────────┐
│   Comment Object     │
├──────────────────────┤
│ userId ──────────────┼────> User (Doctor)
│ text                 │
│ createdAt            │
└──────────────────────┘
```

---

## API Endpoints

### Endpoint Overview

```
BASE URL: /api/v1/appointment

┌────────────────────────────────────────────────────────────────┐
│                    DOCUMENT ENDPOINTS                          │
└────────────────────────────────────────────────────────────────┘

1. POST   /:appointmentId/upload-document
   → Upload a new document (patient or doctor)

2. GET    /:appointmentId/documents
   → Get all documents for an appointment

3. PUT    /:appointmentId/document/:documentId/replace
   → Replace/update a document (patient before appointment only)

4. POST   /:appointmentId/document/:documentId/comment
   → Add doctor comment to specific document

5. PUT    /:appointmentId/notes
   → Update general appointment notes (doctor only)

6. GET    /:appointmentId/document/:documentId/download
   → Download a specific document

7. DELETE /:appointmentId/document/:documentId
   → Delete a document (admin only - optional)
```

### Detailed Endpoint Specifications

#### 1. Upload Document

```
POST /api/v1/appointment/:appointmentId/upload-document

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: multipart/form-data

Body (FormData):
  file: <File>                    # Required
  category: "pre" | "post"        # Optional, auto-determined if not provided

Authentication: Required (Patient or Doctor)

Validation:
  ✓ User must be patient of appointment OR assigned doctor
  ✓ If patient: appointment must not be rejected
  ✓ If doctor: appointment must be approved
  ✓ File type: PDF, JPG, JPEG, PNG only
  ✓ File size: Max 10 MB
  ✓ Valid MIME type verification

Response Success (201):
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "_id": "doc123",
    "filename": "lab_report.pdf",
    "fileType": "pdf",
    "fileSize": 2048576,
    "uploadedBy": "user123",
    "uploaderRole": "patient",
    "category": "pre-appointment",
    "uploadedAt": "2025-11-28T10:00:00Z"
  }
}

Response Error (400/403/413):
{
  "success": false,
  "message": "Error message here"
}
```

#### 2. Get All Documents

```
GET /api/v1/appointment/:appointmentId/documents

Headers:
  Authorization: Bearer {jwt_token}

Authentication: Required (Patient, Doctor, or Admin)

Authorization:
  - Patient: Can only access their own appointments
  - Doctor: Can only access their assigned appointments
  - Admin: Can access all appointments

Response Success (200):
{
  "success": true,
  "appointment": {
    "_id": "appt123",
    "status": "approved",
    "generalNotes": "Patient shows improvement",
    "documents": [
      {
        "_id": "doc123",
        "filename": "lab_report.pdf",
        "fileType": "pdf",
        "fileSize": 2048576,
        "uploadedBy": {
          "_id": "user123",
          "firstName": "John",
          "lastName": "Doe"
        },
        "uploaderRole": "patient",
        "category": "pre-appointment",
        "uploadedAt": "2025-11-28T10:00:00Z",
        "comments": [
          {
            "_id": "comment1",
            "userId": {
              "firstName": "Dr. Jane",
              "lastName": "Smith"
            },
            "text": "Lab results reviewed - normal range",
            "createdAt": "2025-11-28T11:00:00Z"
          }
        ]
      }
    ]
  }
}
```

#### 3. Replace Document

```
PUT /api/v1/appointment/:appointmentId/document/:documentId/replace

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: multipart/form-data

Body (FormData):
  file: <File>

Authentication: Required (Patient only)

Validation:
  ✓ User must be the patient of the appointment
  ✓ User must be the original uploader of the document
  ✓ Current time must be BEFORE appointment time
  ✓ File type and size validation (same as upload)

Response Success (200):
{
  "success": true,
  "message": "Document replaced successfully",
  "document": { /* updated document object */ }
}
```

#### 4. Add Document Comment

```
POST /api/v1/appointment/:appointmentId/document/:documentId/comment

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "text": "Comment text here"
}

Authentication: Required (Doctor only)

Validation:
  ✓ User must be a doctor (isDoctor: true)
  ✓ User must be the assigned doctor for this appointment
  ✓ Comment text must be non-empty

Response Success (201):
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "_id": "comment123",
    "userId": "doctor123",
    "text": "Comment text",
    "createdAt": "2025-11-28T12:00:00Z"
  }
}
```

#### 5. Update General Notes

```
PUT /api/v1/appointment/:appointmentId/notes

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "notes": "General appointment notes here"
}

Authentication: Required (Doctor only)

Validation:
  ✓ User must be a doctor
  ✓ User must be assigned doctor for appointment

Response Success (200):
{
  "success": true,
  "message": "Notes updated successfully",
  "generalNotes": "General appointment notes here"
}
```

#### 6. Download Document

```
GET /api/v1/appointment/:appointmentId/document/:documentId/download

Headers:
  Authorization: Bearer {jwt_token}

Authentication: Required (Patient, Doctor, or Admin)

Authorization: Same as "Get All Documents"

Response Success (200):
  Headers:
    Content-Type: application/pdf | image/jpeg | image/png
    Content-Disposition: attachment; filename="original_filename.pdf"

  Body: File stream

Response Error (404):
{
  "success": false,
  "message": "Document not found or file missing"
}
```

---

## Permissions Matrix

### Access Control Table

| Action | Patient (Own Appt) | Doctor (Assigned) | Doctor (Other) | Admin | Notes |
|--------|-------------------|-------------------|----------------|-------|-------|
| **View documents** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | Full access to own/assigned appointments |
| **Upload document** | ✅ Yes* | ✅ Yes** | ❌ No | ❌ No | *If not rejected, **If approved |
| **Replace document (before appt)** | ✅ Yes*** | ❌ No | ❌ No | ❌ No | ***Only their own uploads, before appt time |
| **Delete document** | ❌ No | ❌ No | ❌ No | ⚠️ Optional | Consider admin-only delete for moderation |
| **Download document** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | Same as view permissions |
| **Add document comment** | ❌ No | ✅ Yes | ❌ No | ❌ No | Doctors only, on assigned appointments |
| **Update general notes** | ❌ No | ✅ Yes | ❌ No | ❌ No | Doctors only |
| **View general notes** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | All authorized users can read |

### Permission Check Flow

```
┌─────────────────────────────────────────────────────────────┐
│              PERMISSION VALIDATION FLOW                     │
└─────────────────────────────────────────────────────────────┘

Request to Access Appointment Documents
    │
    ├──> Check: Is user authenticated?
    │         ├──> NO  → Return 401 Unauthorized
    │         └──> YES → Continue
    │
    ├──> Check: What is user's role?
    │         │
    │         ├──> ADMIN
    │         │      └──> ALLOW (access all appointments)
    │         │
    │         ├──> PATIENT
    │         │      ├──> Is user the patient of this appointment?
    │         │      │     ├──> YES → ALLOW
    │         │      │     └──> NO  → Return 403 Forbidden
    │         │
    │         └──> DOCTOR
    │                ├──> Is user the assigned doctor?
    │                │     ├──> YES → ALLOW
    │                │     └──> NO  → Return 403 Forbidden
    │
    └──> Additional checks for specific actions:
          │
          ├──> UPLOAD (Patient)
          │      └──> Is appointment status "reject"?
          │            ├──> YES → Return 403 "Cannot upload to rejected appointment"
          │            └──> NO  → ALLOW
          │
          ├──> UPLOAD (Doctor)
          │      └──> Is appointment status "approved"?
          │            ├──> YES → ALLOW
          │            └──> NO  → Return 403 "Can only upload after approval"
          │
          └──> REPLACE (Patient)
                 ├──> Is user the original uploader?
                 │     └──> NO → Return 403 "Can only replace own documents"
                 │
                 └──> Is current time before appointment time?
                       ├──> YES → ALLOW
                       └──> NO  → Return 403 "Cannot replace after appointment"
```

---

## File Management

### Storage Structure

```
uploads/
└── appointments/
    ├── {appointmentId_1}/
    │   ├── pre/
    │   │   ├── uuid-1234-abcd.pdf
    │   │   ├── uuid-5678-efgh.jpg
    │   │   └── uuid-9012-ijkl.png
    │   │
    │   └── post/
    │       ├── uuid-3456-mnop.pdf
    │       └── uuid-7890-qrst.pdf
    │
    ├── {appointmentId_2}/
    │   ├── pre/
    │   └── post/
    │
    └── .gitkeep
```

### File Naming Convention

```javascript
Original filename: "Lab Report - Nov 2025.pdf"
                           ↓
            Remove special characters
                           ↓
Sanitized: "Lab_Report_Nov_2025.pdf"
                           ↓
            Generate UUID v4
                           ↓
Stored as: "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p.pdf"
                           ↓
Full path: "uploads/appointments/{appointmentId}/pre/a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p.pdf"
```

### File Type Validation

```javascript
Allowed Extensions: .pdf, .jpg, .jpeg, .png
Allowed MIME Types:
  - application/pdf
  - image/jpeg
  - image/jpg
  - image/png

Validation Steps:
1. Check file extension (case-insensitive)
2. Verify MIME type from Content-Type header
3. Read file magic numbers (first few bytes) to confirm actual type
4. Ensure file size <= 10 MB (10,485,760 bytes)
```

### Category Determination

```javascript
function determineCategory(appointmentDateTime, uploadTime) {
  if (!appointmentDateTime) {
    // If appointment time not set, default to pre-appointment
    return 'pre-appointment';
  }

  if (uploadTime < appointmentDateTime) {
    return 'pre-appointment';
  } else {
    return 'post-appointment';
  }
}

// appointmentDateTime computed from appointment.date + appointment.time
// Example: date="2025-11-28", time="14:30" → appointmentDateTime = 2025-11-28T14:30:00Z
```

---

## Security Considerations

### File Upload Security

```
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY CHECKLIST                         │
└─────────────────────────────────────────────────────────────┘

✅ File Size Limit
   - Max 10 MB per file
   - Configured in multer middleware
   - Prevents DoS attacks via large files

✅ File Type Validation
   - Whitelist approach (only PDF, JPG, PNG)
   - Check extension AND MIME type
   - Verify magic numbers (file signature)
   - Prevents malicious executable uploads

✅ Filename Sanitization
   - Remove special characters
   - Use UUID for storage (prevents path traversal)
   - Preserve original filename in database only

✅ Path Traversal Prevention
   - Never use user-provided filenames for storage
   - Validate appointmentId is valid MongoDB ObjectId
   - Sanitize all path components

✅ Authentication & Authorization
   - All endpoints require JWT authentication
   - Role-based access control
   - Verify appointment ownership

✅ Rate Limiting (Recommended)
   - Limit upload requests per user per hour
   - Example: 20 uploads per hour per user
   - Prevents abuse

✅ Storage Location
   - Files stored outside web root
   - Served through authenticated endpoint only
   - No direct URL access to files

⚠️ Optional Advanced Security
   - Virus scanning (ClamAV integration)
   - File content sanitization (PDF scrubbing)
   - Encryption at rest
   - Audit logging for file access
```

### Example Security Vulnerabilities Prevented

| Attack Vector | Prevention Method |
|---------------|------------------|
| **Path Traversal** (`../../etc/passwd`) | UUID-based filenames, no user input in paths |
| **Malicious File Upload** (`.exe`, `.sh`) | File type whitelist, MIME validation, magic number check |
| **DoS via Large Files** | 10 MB size limit enforced at multer level |
| **Unauthorized Access** | JWT auth + ownership verification on all endpoints |
| **File Overwrites** | UUID ensures unique filenames, no collisions |
| **XSS via Filenames** | Sanitize filenames, store original separately |
| **SQL/NoSQL Injection** | Mongoose parameterized queries, ObjectId validation |

---

## Implementation Plan

### Phase 1: Backend Foundation (Priority: HIGH)

**Estimated Time: 2-3 hours**

```
Tasks:
├── 1.1 Install Dependencies
│   ├── npm install multer uuid
│   └── Verify installations
│
├── 1.2 Update Appointment Model
│   ├── Add documents array field
│   ├── Add generalNotes field
│   ├── Add appointmentDateTime field
│   └── Test model save/retrieve
│
├── 1.3 Create Upload Middleware
│   ├── Create uploadMiddleware.js
│   ├── Configure multer (storage, limits, filter)
│   ├── Add file validation function
│   └── Export middleware
│
├── 1.4 Create uploads Directory
│   ├── mkdir -p uploads/appointments
│   ├── Add .gitkeep
│   └── Update .gitignore
│
└── 1.5 Create Document Controller
    ├── Create documentCtrl.js
    ├── Implement uploadDocumentController
    ├── Implement getDocumentsController
    ├── Implement downloadDocumentController
    └── Add error handling
```

**Files to Create/Modify:**
- ✏️ `models/appointmentModel.js` (UPDATE)
- ✏️ `package.json` (UPDATE - add dependencies)
- ➕ `middlewares/uploadMiddleware.js` (NEW)
- ➕ `controllers/documentCtrl.js` (NEW)
- ➕ `routes/documentRoutes.js` (NEW)
- ➕ `uploads/appointments/.gitkeep` (NEW)
- ✏️ `.gitignore` (UPDATE - add /uploads/)

---

### Phase 2: Core Document Operations (Priority: HIGH)

**Estimated Time: 3-4 hours**

```
Tasks:
├── 2.1 Implement Upload Endpoint
│   ├── POST /:appointmentId/upload-document
│   ├── Validate user permissions
│   ├── Determine document category
│   ├── Save file to disk
│   ├── Update appointment document array
│   └── Return response
│
├── 2.2 Implement Get Documents Endpoint
│   ├── GET /:appointmentId/documents
│   ├── Check user authorization
│   ├── Populate uploadedBy references
│   ├── Return documents with metadata
│   └── Handle empty results
│
├── 2.3 Implement Download Endpoint
│   ├── GET /:appointmentId/document/:documentId/download
│   ├── Verify file exists on disk
│   ├── Set correct Content-Type header
│   ├── Stream file to response
│   └── Handle file not found errors
│
└── 2.4 Create Routes
    ├── Define all document routes
    ├── Apply authMiddleware
    ├── Apply uploadMiddleware where needed
    └── Mount routes in server.js
```

**Testing Checklist:**
- [ ] Patient can upload during booking
- [ ] Doctor cannot upload to pending appointment
- [ ] Doctor can upload after approval
- [ ] Files saved to correct directory (pre/post)
- [ ] Original filename preserved in DB
- [ ] File download works correctly
- [ ] Unauthorized users get 403 error

---

### Phase 3: Advanced Features (Priority: MEDIUM)

**Estimated Time: 2-3 hours**

```
Tasks:
├── 3.1 Implement Replace Document
│   ├── PUT /:appointmentId/document/:documentId/replace
│   ├── Verify user is original uploader
│   ├── Check current time < appointment time
│   ├── Delete old file from disk
│   ├── Save new file
│   ├── Update document in array
│   └── Preserve comments on document
│
├── 3.2 Implement Document Comments
│   ├── POST /:appointmentId/document/:documentId/comment
│   ├── Verify user is doctor
│   ├── Add comment to document.comments array
│   ├── Populate user info in response
│   └── Send notification to patient (optional)
│
├── 3.3 Implement General Notes
│   ├── PUT /:appointmentId/notes
│   ├── Verify user is assigned doctor
│   ├── Update generalNotes field
│   └── Return updated appointment
│
└── 3.4 Implement Delete Document (Admin)
    ├── DELETE /:appointmentId/document/:documentId
    ├── Verify user is admin
    ├── Remove file from disk
    ├── Remove from document array
    └── Log deletion for audit
```

---

### Phase 4: Frontend Integration (Priority: MEDIUM)

**Estimated Time: 4-5 hours**

```
Tasks:
├── 4.1 Create Document Upload Component
│   ├── FileUpload.jsx
│   ├── Drag & drop area
│   ├── File type/size validation
│   ├── Upload progress indicator
│   ├── Preview thumbnails
│   └── Error handling UI
│
├── 4.2 Create Document List Component
│   ├── DocumentList.jsx
│   ├── Tabs: Pre-Appointment / Post-Appointment
│   ├── Document cards with metadata
│   ├── Download button
│   ├── Replace button (for patients, before appt)
│   └── Comment section (for doctors)
│
├── 4.3 Integrate with BookingPage
│   ├── Add upload section to booking form
│   ├── Allow multiple file selection
│   ├── Show uploaded files before submit
│   └── Submit files with appointment
│
├── 4.4 Integrate with Appointments Page (Patient)
│   ├── Show document list in appointment details
│   ├── Add upload button
│   ├── Enable replace before appointment
│   └── View-only mode after appointment
│
└── 4.5 Integrate with DoctorAppointments
    ├── View patient documents
    ├── Upload prescription/opinion
    ├── Add comments to documents
    ├── Update general notes textarea
    └── Download documents
```

**UI Components:**
```
BookingPage.js
└── <FileUpload onUpload={handleUpload} />

Appointments.js
└── <AppointmentDetails>
    └── <DocumentList
          documents={appointment.documents}
          canUpload={true}
          canReplace={beforeAppointment}
        />

DoctorAppointments.js
└── <AppointmentDetails>
    ├── <DocumentList
    │     documents={appointment.documents}
    │     canComment={true}
    │   />
    ├── <FileUpload
    │     label="Upload Prescription"
    │     onUpload={handlePrescriptionUpload}
    │   />
    └── <GeneralNotes
          notes={appointment.generalNotes}
          onSave={handleNotesSave}
        />
```

---

### Phase 5: Polish & Testing (Priority: LOW)

**Estimated Time: 2-3 hours**

```
Tasks:
├── 5.1 Add Notifications
│   ├── Notify patient when doctor uploads prescription
│   ├── Notify doctor when patient uploads new document
│   └── Use existing notification system
│
├── 5.2 Improve UI/UX
│   ├── Add file preview for images
│   ├── PDF thumbnail generation (optional)
│   ├── Sorting/filtering documents
│   ├── Search within documents
│   └── Responsive design for mobile
│
├── 5.3 Error Handling & Validation
│   ├── Graceful error messages
│   ├── Client-side file validation
│   ├── Retry failed uploads
│   └── Handle network errors
│
├── 5.4 Testing
│   ├── Unit tests for controllers
│   ├── Integration tests for API endpoints
│   ├── Manual testing all user flows
│   └── Security testing (auth bypass attempts)
│
└── 5.5 Documentation
    ├── API documentation (Postman collection)
    ├── User guide for patients
    ├── User guide for doctors
    └── Admin documentation
```

---

## Testing Scenarios

### Manual Test Cases

```
TEST SUITE 1: Patient Upload Flow
─────────────────────────────────
1. ✓ Patient uploads document while booking appointment
   - Expected: Document saved to pre-appointment folder

2. ✓ Patient uploads document after booking, before appointment time
   - Expected: Document saved to pre-appointment folder

3. ✓ Patient uploads document after appointment time
   - Expected: Document saved to post-appointment folder

4. ✓ Patient tries to upload 15 MB file
   - Expected: Error "File too large"

5. ✓ Patient tries to upload .exe file
   - Expected: Error "Invalid file type"

6. ✓ Patient replaces document before appointment
   - Expected: Old file deleted, new file saved

7. ✓ Patient tries to replace document after appointment
   - Expected: Error "Cannot replace after appointment"

TEST SUITE 2: Doctor Upload Flow
─────────────────────────────────
1. ✓ Doctor tries to upload to pending appointment
   - Expected: Error "Appointment not approved"

2. ✓ Doctor uploads prescription after approving appointment
   - Expected: Document saved successfully

3. ✓ Doctor uploads prescription after appointment time
   - Expected: Document saved to post-appointment folder

4. ✓ Doctor adds comment to patient's document
   - Expected: Comment saved and visible

5. ✓ Doctor updates general notes
   - Expected: Notes saved and visible to patient

TEST SUITE 3: Authorization
────────────────────────────
1. ✓ Patient A tries to view Patient B's appointment documents
   - Expected: Error 403 Forbidden

2. ✓ Doctor A tries to view Doctor B's appointment documents
   - Expected: Error 403 Forbidden

3. ✓ Admin views any appointment documents
   - Expected: Success

4. ✓ Unauthenticated user tries to download document
   - Expected: Error 401 Unauthorized

TEST SUITE 4: Edge Cases
────────────────────────
1. ✓ Upload to rejected appointment (patient)
   - Expected: Error "Cannot upload to rejected appointment"

2. ✓ View documents when appointment has no documents
   - Expected: Empty array returned

3. ✓ Download non-existent document
   - Expected: Error 404 Not Found

4. ✓ File deleted from disk but reference exists in DB
   - Expected: Error "File not found" with graceful handling

5. ✓ Concurrent uploads by patient and doctor
   - Expected: Both saved correctly, no race condition
```

---

## API Request Examples (Postman/cURL)

### Upload Document

```bash
# Patient uploads document
curl -X POST http://localhost:3051/api/v1/appointment/673a1b2c3d4e5f6g7h8i9j0k/upload-document \
  -H "Authorization: Bearer {patient_jwt_token}" \
  -F "file=@/path/to/lab_report.pdf"

# Doctor uploads prescription
curl -X POST http://localhost:3051/api/v1/appointment/673a1b2c3d4e5f6g7h8i9j0k/upload-document \
  -H "Authorization: Bearer {doctor_jwt_token}" \
  -F "file=@/path/to/prescription.pdf"
```

### Get Documents

```bash
curl -X GET http://localhost:3051/api/v1/appointment/673a1b2c3d4e5f6g7h8i9j0k/documents \
  -H "Authorization: Bearer {jwt_token}"
```

### Download Document

```bash
curl -X GET http://localhost:3051/api/v1/appointment/673a1b2c3d4e5f6g7h8i9j0k/document/doc123/download \
  -H "Authorization: Bearer {jwt_token}" \
  -o downloaded_file.pdf
```

### Add Comment

```bash
curl -X POST http://localhost:3051/api/v1/appointment/673a1b2c3d4e5f6g7h8i9j0k/document/doc123/comment \
  -H "Authorization: Bearer {doctor_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"text": "Lab results reviewed - all normal"}'
```

### Update General Notes

```bash
curl -X PUT http://localhost:3051/api/v1/appointment/673a1b2c3d4e5f6g7h8i9j0k/notes \
  -H "Authorization: Bearer {doctor_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Patient shows significant improvement. Continue current medication."}'
```

---

## Future Enhancements (Out of Scope for v1)

```
┌─────────────────────────────────────────────────────────────┐
│                  POTENTIAL FUTURE FEATURES                  │
└─────────────────────────────────────────────────────────────┘

🔮 Version History
   - Keep previous versions when document is replaced
   - Allow viewing/restoring old versions

🔮 Document Templates
   - Pre-defined prescription templates for doctors
   - Lab report templates

🔮 E-Signatures
   - Digital signature for prescriptions
   - Patient consent signatures

🔮 OCR Integration
   - Extract text from scanned documents
   - Searchable content within PDFs/images

🔮 Cloud Storage Migration
   - Move from local storage to AWS S3/Google Cloud
   - CDN for faster downloads

🔮 Advanced Security
   - Virus scanning (ClamAV)
   - Encryption at rest
   - Document expiration/auto-delete

🔮 Analytics
   - Track document views
   - Download history
   - Most common document types

🔮 Bulk Operations
   - Upload multiple files at once
   - Bulk download as ZIP
   - Batch delete (admin)

🔮 Document Sharing
   - Share documents with other doctors (referrals)
   - Generate shareable links with expiration

🔮 Mobile App Support
   - Camera integration for document scanning
   - Mobile-optimized file picker
```

---

## Appendix

### Glossary

- **Pre-Appointment Document**: File uploaded before the scheduled appointment time
- **Post-Appointment Document**: File uploaded after the scheduled appointment time
- **General Notes**: Doctor's overall notes for the appointment (not tied to specific document)
- **Document Comment**: Doctor's remark on a specific uploaded document
- **Uploader Role**: Whether the document was uploaded by patient or doctor
- **Category**: Classification as pre-appointment or post-appointment
- **MIME Type**: Standard identifier for file types (e.g., `application/pdf`)
- **UUID**: Universally Unique Identifier used for secure file naming

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | File too large | File exceeds 10 MB limit |
| 400 | Invalid file type | File is not PDF/JPG/PNG |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Document not found | Document ID doesn't exist |
| 404 | File not found | File missing from disk |
| 413 | Payload too large | Request body exceeds limit |
| 500 | Internal server error | Server-side error occurred |

### Environment Variables

```bash
# Add to .env file

# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/healthcare

# JWT Secret
JWT_SECRET=your_secret_key_here

# Server Port
PORT=3051

# Upload Settings
MAX_FILE_SIZE=10485760          # 10 MB in bytes
UPLOAD_DIR=uploads/appointments

# File Type Settings
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
```

---

## Contact & Support

For questions or issues during implementation:
- Review this document first
- Check the API endpoint specifications
- Refer to the flow diagrams
- Test with the provided cURL examples

---

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Author**: Claude Code
**Project**: Health Appointment System - Document Management Module
