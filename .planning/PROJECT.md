# Project Parichay - Phase 2 Enhancements

Parichay is a matrimonial platform for the Aggarwal community. This phase focuses on building trust signals, professional data sharing, revenue generation, and privacy controls.

## Goals

1. **Trust-Based Verification**: Introduce a premium "Community Verified" badge for profiles vetted by the Vikas Trust.
2. **Professional Sharing**: Enable users to download profile data as a branded PDF "Bio-Data".
3. **Revenue Generation**: Create an Aggarwal Business Directory for local vendors to advertise to engaged users.
4. **Privacy First**: Implement granular photo privacy controls with a request-access flow.
5. **Cultural Logic**: Automate Gotra validation to provide cultural guidance.
6. **Social Proof & Events**: Showcase success stories and integrate digital profiles with physical events via QR codes.

## Requirements

### Validated
- ✓ JWT Authentication (User/Admin roles)
- ✓ Profile/Bio-Data Management
- ✓ Search and Filtering
- ✓ Razorpay Integration (Membership payments)
- ✓ Basic Admin Dashboard

### Active
- [ ] **A. Vikas Trust Verified Badge**
  - Implement `communityVerified` flag in `BioData`.
  - Admin endpoint to toggle verification status.
  - Premium-styled badge in frontend profile cards and details.
- [ ] **B. PDF Bio-Data Generator**
  - Backend service to generate PDF from Bio-Data using a library (e.g., OpenPDF).
  - Branded template with Vikas Trust logo.
  - "Download Bio-Data" button in User Dashboard.
- [ ] **C. Aggarwal Business Directory**
  - New module for Business Listings (Caterers, Jewelers, etc.).
  - Banner ad system to display ads in the "Shortlist" stage.
- [ ] **D. Photo Request System**
  - Option for users to blur/hide photos.
  - "Request Access" flow for other users to see blurred photos.
  - Admin/User notifications for requests.
- [ ] **E. Gotra Validation Logic**
  - Real-time warning if a user views a profile with the same Gotra.
  - Guidance on "Sagal rules" in the UI.
- [ ] **F. Social Proof & Events**
  - "Success Stories" section for testimonials.
  - QR Code generator for attendee profiles at physical "Parichay Sammelan" events.

## Tech Stack
- Frontend: Next.js 15, React 19, Tailwind CSS v4.
- Backend: Spring Boot 4.0.1, Java 17, PostgreSQL, JPA.
- New Libraries Needed: 
  - Backend: `com.github.librepdf:openpdf` (PDF generation).
  - Backend: `com.google.zxing:core` (QR code generation).

## Out of Scope
- Full-scale CRM for businesses (only basic directory and ads for now).
- Video calling or real-time chat (planned for Phase 3).
