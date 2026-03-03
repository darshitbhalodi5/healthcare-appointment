# SMS & OTP Compliance Note (India) for Health1

Last updated: March 3, 2026  
Scope: SMS/OTP login and notification flows for the doctor appointment platform (single-doctor, multi-location).

This is an implementation-oriented compliance note, not legal advice.

## 1. Regulatory Snapshot (India)

### 1.1 TRAI TCCCPR / DLT (telecom messaging compliance)
- All bulk/business SMS senders must comply with TCCCPR, 2018.
- For sending business SMS, Principal Entity (PE) must complete:
  - PE registration
  - Header registration
  - Content template registration
  - Pass PE ID + Header + Content Template ID in message submission
  - Consent template and consent capture where applicable
- Service and promotional traffic are treated differently. Template/category mismatch can block SMS.

What this means for our app:
- OTP and appointment/report notifications should go through approved DLT templates.
- We cannot push production SMS until DLT onboarding and template approvals are complete.

### 1.2 DPDP Act, 2023 + DPDP Rules, 2025 (data privacy)
- DPDP Act is in force in phases.
- DPDP Rules, 2025 were notified on November 13, 2025 with phased commencement:
  - Effective November 13, 2025: Rules 1, 2, 17 to 21
  - Effective November 13, 2026: Rule 4
  - Effective May 13, 2027: Rules 3, 5 to 16, 22, 23

What this means as of March 3, 2026:
- Full operational privacy obligations are still phasing in, but implementation should already follow notice, consent, minimization, retention, and breach-response standards to avoid rework.

### 1.3 CERT-In Directions (cyber incident response)
- Report specified cyber incidents to CERT-In within 6 hours of noticing.
- Maintain ICT logs securely for a rolling 180 days within Indian jurisdiction.
- Keep designated Point of Contact details updated for CERT-In coordination.

What this means for SMS/OTP:
- OTP abuse, account takeover patterns, and data leaks should feed your incident handling process.
- SMS/OTP audit logs must be preserved in secure, queryable form.

## 2. Message Classification for This Product

Use classification carefully; wrong classification is a common delivery failure reason.

- `Service-Implicit` (typical for this app):
  - Login/verification OTP triggered by user action
  - Appointment confirmation/reminders
  - Registration, report ready, prescription upload/download alerts
- `Promotional`:
  - Health camp marketing, offers, cross-sell campaigns
  - Requires stricter consent and preference scrubbing
- `Transactional`:
  - In operator guidance, this is primarily banking OTP/transaction context
  - Do not assume general app login OTP is transactional

Practical rule:
- Keep authentication and care-delivery messages on service templates.
- Keep marketing strictly separated and consented.

## 3. Documents Required for DLT + SMS Provider Onboarding

Prepare these once and keep a signed digital folder:

### 3.1 Core entity/KYC docs
- Business PAN
- GST/TAN or equivalent business proof
- Address proof
- Authorized signatory identity proof
- Authorized signatory mobile/email
- Letter of Authorization (LoA) on letterhead (if someone registers on behalf of owner)

### 3.2 Entity profile docs (commonly requested)
- Certificate of Incorporation / registration proof (if company/LLP)
- MOA/ownership proof where needed
- Line of business details (must align with message purpose)

### 3.3 DLT artifacts (post approval)
- Principal Entity ID
- Approved Header(s)
- Approved Content Template IDs
- Consent Template IDs (when required)
- Telemarketer linkage approval (if using provider/aggregator route)

### 3.4 App policy and compliance docs (internal + public)
- Privacy Policy
- Terms of Service
- SMS/OTP consent and communication notice text
- Data retention and deletion policy
- Incident response SOP (including CERT-In escalation path)
- Vendor agreement/DPA with SMS provider

## 4. Non-Negotiable OTP Implementation Controls

### 4.1 OTP security controls
- OTP expiry: 3 to 5 minutes
- One-time use only (invalidate immediately after success)
- Max attempts per OTP: 3 to 5
- Rate limit by phone, IP, and device fingerprint
- Cooldown window after repeated failures
- Store OTP hashed (never plaintext)

### 4.2 Content controls
- Do not include diagnosis, reports, or clinical details in SMS body
- Keep OTP SMS minimal: app name, OTP, validity, do-not-share warning
- Keep template variables exactly as approved on DLT (text mismatch can fail delivery)

### 4.3 Abuse and fraud controls
- Block disposable/abusive number patterns where feasible
- Alert on unusual OTP request spikes
- Maintain deny-list and velocity-based controls
- Log provider error codes for forensic review

### 4.4 Delivery and fallback
- Implement delivery status tracking (submitted/sent/delivered/failed)
- Add retry policy with capped attempts
- Keep fallback channel for failed OTP (email OTP as backup, or voice/WhatsApp where allowed)

## 5. Legal/Operational Notices to Show in Product

Recommended notice near phone-based login:
- "By continuing, you consent to receive OTP and service-related SMS for authentication and appointment updates."

Recommended footer in OTP SMS:
- "Do not share this OTP with anyone."

Recommended privacy notice points:
- Why phone number is collected
- What messages will be sent
- Retention duration
- How user can request data deletion

## 6. Go-Live Checklist (SMS/OTP)

- PE registration approved
- Header approved
- OTP template approved
- Appointment/service templates approved
- Provider mapped with PE ID/header/template IDs
- Production credentials tested on live routes
- Rate limiting and lockout enabled
- OTP hashing and expiry validated
- Delivery status webhook/logging enabled
- Consent and privacy notice visible in app
- Incident response and CERT-In contact process documented

## 7. Current Project Gap (important)

Current codebase OTP is email-based. SMS OTP path is not yet integrated end-to-end.  
Before launch with phone OTP, complete:
- DLT onboarding
- SMS provider API integration
- Template ID mapping in backend
- End-to-end testing with real Indian numbers

## 8. Reference Links (primary)

- TRAI Advice to Senders (DLT obligations): https://www.trai.gov.in/advice-to-senders
- TRAI TCCCPR page: https://www.trai.gov.in/tcccpr
- DPDP Act, 2023 text (Gazette copy): https://www.trai.gov.in/sites/default/files/2024-09/DPDT_11082024.pdf
- DPDP Rules, 2025 Gazette notification (G.S.R. 846(E), Nov 13, 2025): https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
- CERT-In Directions (April 28, 2022): https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf
- Airtel DLT FAQ (operator process and document examples): https://dltconnect.airtel.in/faq/

