# Phase 1: Trust & Cultural Logic

## Context
Parichay users need trust signals to feel secure about potential matches. "Vikas Trust Verified" is a premium trust signal for profiles known to the trust. Additionally, "Gotra" validation provides cultural guidance common in Aggarwal matchmaking.

## Requirements
- [ ] **R1: Backend - Community Verification Flag**
  - Add `isCommunityVerified` (boolean) to `BioData` model.
  - Default value: `false`.
- [ ] **R2: Backend - Admin Toggle Endpoint**
  - New admin endpoint `PUT /api/v1/admin/profiles/{id}/verify-community` to toggle the flag.
  - Requires `ADMIN` role.
- [ ] **R3: Frontend - Verification Badge**
  - Display "Vikas Trust Verified" badge on profile cards and details page.
  - Use a professional, premium aesthetic (e.g., gold/indigo theme).
- [ ] **R4: Frontend - Gotra Validation**
  - When viewing a profile, compare its Gotra with the current user's Gotra.
  - If same, show a prominent warning/guidance about "Sagal rules".

## Tech Considerations
- Backend uses Spring Boot, JPA, Spring Security (JWT).
- Frontend uses Next.js 15, Tailwind v4.
- Gotra list is already available via metadata lookups.

## Acceptence Criteria (UAT)
- [ ] Admin can mark a user as "Community Verified".
- [ ] Verified profiles show a distinct badge in the UI.
- [ ] User sees a warning when viewing a profile with the same Gotra.
