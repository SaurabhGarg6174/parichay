# Parichay

Parichay is a full-stack matrimonial platform for the Aggarwal community. The codebase combines a modular Spring Boot backend with a Next.js dashboard frontend and supports user registration, JWT login, bio-data submission, profile review, paid activation, match discovery, business-directory ads, PDF bio-data export, photo-access requests, QR-code sharing, and admin management screens.

This README reflects the current repository state rather than only the planned feature set.

## Current Stack

### Backend

- Java 17 target, tested locally with Java 22
- Spring Boot 4.0.1
- Spring Web, Spring Security, Spring Data JPA, Validation, and Actuator
- PostgreSQL configured by default
- H2 is present as an optional in-memory fallback, but the H2 configuration is commented out in the main properties file
- JWT support with io.jsonwebtoken:jjwt
- Razorpay Java SDK for payments
- OpenPDF for PDF generation
- ZXing for QR code generation
- Lombok

### Frontend

- Next.js 16.1.6 with the App Router
- React 19.2.3
- TypeScript
- Tailwind CSS v4
- Axios
- Lucide React icons
- next-themes

## Key Features

### User Capabilities

- Secure authentication with JWT-based login and registration, including role-aware access.
- Comprehensive bio-data management with personal, family, education, and professional information, plus Gotra tracking for community-specific matching guidance.
- Smart matchmaking through profile search and filtering by name, Gotra, gender, age range, education, city, and manglik status.
- Trust verification badges for both general admin verification and a premium Vikas Trust community badge.
- Photo privacy controls that let users hide photos and approve or reject access requests.
- Branded PDF bio-data export for sharing.
- QR profile sharing for in-person matchmaking events.
- A curated Aggarwal business directory for vendors such as caterers, jewelers, and tent houses.
- Success stories that highlight prior matches made through the platform.
- Integrated payments through Razorpay for premium activation.
- Profile picture upload and server-side storage.
- A responsive dashboard tailored to the authenticated role.

### Administrative Control

- User management for activating, deactivating, and deleting accounts.
- Profile moderation for reviewing, approving, rejecting, and verifying bio-data before public release.
- Trust badge management for both verification tiers.
- Business-directory management for vendor listings and banner ads.
- Metadata-driven dashboard actions that can be changed without a frontend redeploy.
- Admin-managed lookup values for Gotra, education, occupation, marital status, and other dropdown data.
- Real-time statistics for profiles, verification state, and membership tiers.

## Project Structure

```text
parichay/
├── backend/                                   # Spring Boot application
│   ├── src/main/java/com/aggarjan/patrika/parichay/
│   │   ├── core/                              # Security, JWT, global exception handling, response envelopes
│   │   └── modules/                           # Feature-based modules
│   │       ├── admin/                         # Admin aggregation and dashboard APIs
│   │       ├── auth/                          # Authentication, registration, and user management
│   │       ├── profile/                       # Bio-data, search, masking, PDF export, QR codes, photo requests, stories
│   │       ├── payment/                       # Razorpay integration and membership activation
│   │       ├── directory/                     # Business directory and ads
│   │       ├── menu/                          # Role-aware navigation menus
│   │       ├── metadata/                      # Lookup and action metadata
│   │       └── file/                          # File upload handling
│   ├── src/main/resources/                    # Config and seed files
│   └── pom.xml                                # Maven configuration
├── frontend/                                  # Next.js client app
│   ├── src/app/                               # App Router pages and layouts
│   ├── src/components/                        # Reusable UI components
│   ├── src/context/                          # Auth and toast contexts
│   └── src/lib/api.ts                        # Axios API client
├── Parichay_Local_API.postman_collection.json # API collection for local testing
└── obsidian_vault/                            # Local documentation notes
```

## Implemented Backend Features

### Authentication and Users

- User registration with email, name, and password.
- Login with JWT issuance.
- Current-user endpoint at GET /api/v1/auth/me.
- Password management endpoints for CHANGE, FORGOT, and RESET actions.
- Password hashing with BCrypt.
- Role seeding for USER and ADMIN.
- Admin user management for listing users, creating users, updating details and roles, activating or deactivating users, and deleting users.

### Profile and Bio-Data

- Authenticated users can submit exactly one bio-data profile.
- Users can fetch and update their own profile.
- Admins can list profiles by membership status and search text.
- Admins can update profile status.
- Admins can toggle normal verification and community verification.
- Public profile listing and search return only ACTIVE profiles.
- Non-active or anonymous viewers receive masked sensitive fields such as contact number, address, father name, and mother name.
- Search supports name, Gotra, gender, age range, education, city, and manglik status.
- Same-Gotra detection is implemented as a transient response flag for logged-in viewers.
- Height parsing accepts cm and simple ft/in formats.

### Membership and Payments

- Razorpay order creation through POST /api/v1/payments/initiate.
- Razorpay signature verification through POST /api/v1/payments/verify.
- Successful verification stores payment status and activates the user profile.
- Payment ownership is checked before activation.

### Metadata, Menus, and Actions

- Startup seed data creates roles, membership statuses, and lookup values for Gotra, gender, education, occupation, manglik status, and marital status.
- Admin profile actions and admin user actions are seeded at startup.
- Lookup APIs support grouped and category-specific data.
- Menu APIs return menus based on the authenticated user.

### File Uploads

- Authenticated file upload endpoint at POST /api/v1/files/upload.
- Files are stored under the configured local uploads directory.
- Uploaded files are served from /uploads/**.
- 10 MB multipart limits are configured.

### PDF, QR, Photo Privacy, and Stories

- Bio-data PDF generation using OpenPDF.
- QR-code generation for profile sharing.
- Privacy controls for photo visibility and access requests.
- Success stories surfaced to users.

## Getting Started

### Prerequisites

- JDK 17 or higher
- Node.js 20+ (recommended)
- Maven 3.x
- PostgreSQL (required by default; the H2 fallback is available but commented out in the backend configuration)

### Backend Setup

1. Clone the repository and navigate to the backend directory.
2. Create or update the local database configuration in backend/src/main/resources/application.properties.
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/parichay_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```
3. Optionally provide Razorpay credentials in the same file.
   ```properties
   razorpay.key.id=your_id
   razorpay.key.secret=your_secret
   ```
4. Run the application.
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   The API runs on http://localhost:8081.

### Frontend Setup

1. Install dependencies.
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server.
   ```bash
   npm run dev
   ```
   The app is available at http://localhost:3000.

- Profile QR code generation using ZXing.
- Hidden-photo flag on bio-data.
- Photo access request creation.
- Incoming photo request listing for profile owners.
- Photo request response endpoint.
- Success stories model and public listing endpoint.

### Business Directory

- Active business listings API.
- Random business ad API used by the frontend shortlist modal.
- Business listing creation endpoint under `/api/v1/business-directory/admin/add`.

## Implemented Frontend Features

- Login and registration pages.
- JWT-based auth context using `localStorage`.
- Dashboard layout with dynamic menu loading.
- Role-aware dashboard landing screen.
- Member profile submission and edit page.
- Match discovery page with filters, pagination, profile cards, masked-field display, gotra warning data, community verification badge, and photo blur behavior.
- Match detail page.
- Profile PDF download and QR code usage from backend endpoints.
- Payment activation and membership pages.
- Admin profile review dashboard with status tabs, stats, approve/reject/activate actions, and verification toggling.
- Admin user management page.
- Business directory page.
- Success stories component.
- Dark/light theme support.
- Toast and modal components.

## API Surface

Major backend routes currently include:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/password`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/profiles`
- `GET /api/v1/profiles`
- `GET /api/v1/profiles/search`
- `GET /api/v1/profiles/me`
- `PUT /api/v1/profiles/me`
- `GET /api/v1/profiles/{id}`
- `GET /api/v1/profiles/{id}/download-pdf`
- `GET /api/v1/profiles/{id}/qr-code`
- `POST /api/v1/profiles/{id}/request-photo`
- `GET /api/v1/profiles/photo-requests`
- `PUT /api/v1/profiles/photo-requests/{requestId}/respond/{status}`
- `GET /api/v1/profiles/success-stories`
- `GET /api/v1/admin/profiles`
- `GET /api/v1/admin/profiles/{profileId}`
- `PUT /api/v1/admin/profiles/{profileId}/status/{statusId}`
- `PUT /api/v1/admin/profiles/{profileId}/verify/{verified}`
- `PUT /api/v1/admin/profiles/{profileId}/verify-community/{verified}`
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PUT /api/v1/admin/users/{userId}`
- `PUT /api/v1/admin/users/{userId}/status/{active}`
- `DELETE /api/v1/admin/users/{userId}`
- `POST /api/v1/payments/initiate`
- `POST /api/v1/payments/verify`
- `POST /api/v1/files/upload`
- `GET /api/v1/metadata/lookups`
- `GET /api/v1/metadata/lookups/{category}`
- `GET /api/v1/metadata/statuses`
- `GET /api/v1/menus`
- `GET /api/v1/business-directory`
- `GET /api/v1/business-directory/random-ad`
- `POST /api/v1/business-directory/admin/add`

The root Postman collection `Parichay_Local_API.postman_collection.json` can be imported for manual API testing.

## Local Setup

### Backend

1. Create a PostgreSQL database named `parichay_db`.
2. Update `backend/src/main/resources/application.properties` with local credentials.
3. Start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend runs on `http://localhost:8081`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

The frontend currently hardcodes the backend URL in `frontend/src/lib/api.ts`:

```ts
export const API_BASE_URL = 'http://localhost:8081/api/v1';
export const IMAGE_BASE_URL = 'http://localhost:8081';
```

## Verification Performed

On 2026-06-28:

- `backend\mvnw.cmd test` passed.
- Backend test coverage is currently only a Spring context smoke test.
- The backend test used the configured local PostgreSQL database, not an isolated test database.
- `npm run lint` did not run because `eslint` was not available in `frontend/node_modules`. Run `npm install` first.

## Vulnerabilities and Risks

### Critical

- `application.properties` contains hardcoded local database credentials, a hardcoded JWT secret, and default Spring Security admin credentials. These must be moved to environment variables or a secret manager before deployment.
- JWTs are stored in browser `localStorage`, which makes token theft easier if any XSS issue is introduced. Prefer secure, HttpOnly, SameSite cookies or a hardened token strategy.
- `POST /api/v1/business-directory/admin/add` is not under `/api/v1/admin/**`; it is only protected by generic authentication, so any logged-in user may be able to add business listings.
- Photo request response does not verify that the responder owns the target profile. A logged-in user could respond to another user's photo request if they know the request ID.
- File upload accepts arbitrary extensions and content types, then serves uploads publicly. This creates malware, stored content, and content-type confusion risks.

### High

- `@CrossOrigin(origins = "*")` appears on several controllers while global security CORS is more restrictive. This should be consolidated and locked to approved origins.
- Public profile and search endpoints expose active profiles to anonymous users. Some fields are masked, but this is still intentional public exposure of personal profile data and should be reviewed against privacy requirements.
- Password reset is incomplete: reset tokens are generated and stored, but no email delivery is implemented.
- Token refresh is not a real refresh-token flow. It accepts the existing bearer token and issues another JWT if that token is still valid.
- Logout is client-side only; there is no server-side token revocation or blacklist.
- `spring.jpa.hibernate.ddl-auto=update` is unsafe for production schema management. Use migrations such as Flyway or Liquibase.
- Payment activation trusts successful Razorpay signature verification but does not reconcile order amount/currency against an internal membership plan catalog.

### Medium

- No rate limiting exists for login, registration, password reset, profile search, or file upload.
- Validation is uneven. Some DTO fields are validated, but profile, business listing, and admin update flows need stricter server-side constraints.
- Admin update endpoints accept IDs/statuses directly without richer business rules or audit logs.
- Generated PDFs may include sensitive fields depending on caller access. The controller fetches a masked or unmasked profile based on service logic, but authorization rules should be explicitly tested.
- Uploaded files are stored on local disk. There is no cleanup, antivirus scanning, image resizing, object storage, or CDN strategy.
- Success stories are listed without filtering by `isActive`.
- Duplicate `org.json.JSONObject` classes appear on the backend test classpath, which can cause unpredictable runtime behavior.
- Frontend admin protection is mostly client-side routing. Backend role checks protect `/api/v1/admin/**`, but non-admin frontend pages should still assume backend authorization is authoritative.

### Low

- Several frontend pages use hardcoded `localhost` URLs instead of shared environment configuration.
- Some UI text and generated PDF strings show encoding artifacts for rupee symbol/bullets in existing files.
- Dashboard system status is static UI text, not live health data.
- Existing logs and target build artifacts are present in the repository tree.

## Incomplete or Shallow Features

- Real email service for password reset.
- Refresh-token storage, rotation, expiry, and revocation.
- Server-side logout/token invalidation.
- Production-grade file upload validation and storage.
- Business directory admin authorization and admin UI for full listing management.
- Shortlist persistence. The frontend shows a shortlist modal, but there is no backend shortlist model/API.
- Notifications. Current dashboard notifications are static.
- Membership plan catalog, pricing rules, and payment history UI.
- Full audit trail for admin actions.
- Better privacy rules for profile visibility, photo access, PDF export, and QR code access.
- Owner authorization check for photo request responses.
- Success story admin CRUD and active filtering.
- Gotra validation is currently a warning flag only; there is no formal rule engine or configurable cultural guidance.
- Deployment configuration, production environment profiles, Docker files, and CI/CD are not implemented.
- Automated frontend tests are absent.
- Backend tests are minimal and do not cover auth, payments, profile masking, uploads, admin permissions, or photo request authorization.

## Recommended Next Implementation Plan

1. Move secrets and environment-specific values out of `application.properties`.
2. Fix authorization gaps:
   - protect business listing creation with admin role
   - enforce photo request ownership on response
   - add tests for admin-only and owner-only flows
3. Replace localStorage JWT handling or add strong XSS defenses and a proper refresh-token design.
4. Harden uploads:
   - allowlist image MIME types and extensions
   - inspect file content
   - normalize output filenames
   - store outside the app process or in object storage
   - serve with safe content headers
5. Add Flyway or Liquibase migrations and disable `ddl-auto=update` outside local development.
6. Finish password reset email delivery and token lifecycle cleanup.
7. Add rate limiting for auth, reset, search, and uploads.
8. Add backend integration tests for the high-risk flows.
9. Move frontend API URLs to `.env.local` / deployment environment variables.
10. Implement persistent shortlist, notifications, payment history, and business listing admin management.

## Production Readiness

This project is not production-ready yet. The core product flows are present, but secret management, access control gaps, upload hardening, token lifecycle, database migrations, payment reconciliation, privacy rules, and automated tests must be addressed before handling real user data.
