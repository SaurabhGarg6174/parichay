# Parichay - Modern Matrimonial Platform

Parichay is a feature-rich, full-stack matrimonial platform designed to provide a secure, seamless, and personalized experience for individuals seeking life partners. The platform combines a robust Spring Boot backend with a high-performance, responsive Next.js frontend, featuring enterprise-grade security and modern UI/UX.

---

## 🌟 Key Features

### 👤 User Capabilities
- **Secure Authentication**: JWT-based login and registration system with multi-tier role support.
- **Comprehensive Bio-Data**: Detailed profile management including personal, family, education, and professional information, with Gotra tracking for community-specific matchmaking guidance (same-Gotra warnings).
- **Smart Matchmaking**: Browse and filter profiles (name, gotra, gender, age range, education, city, manglik status) to find compatible matches.
- **Trust Verification Badges**: Two-tier trust signal — general admin verification plus a premium **Vikas Trust "Community Verified"** badge.
- **Photo Privacy Controls**: Hide your photo from public view and approve/reject "request access" asks from other members.
- **Branded PDF Bio-Data**: Download a print-ready, Vikas Trust–branded PDF of your bio-data to share.
- **QR Profile Sharing**: Generate a scannable QR code linking to your profile, for use at in-person matchmaking events.
- **Aggarwal Business Directory**: Browse a curated directory of community vendors (caterers, jewelers, tent houses, etc.).
- **Success Stories**: Read stories of past matches made through the platform.
- **Integrated Payments**: Secure financial transactions using **Razorpay Integration** for premium membership activation.
- **Profile Customization**: Upload and manage profile pictures with automated server-side storage.
- **Responsive Dashboard**: Personalized, role-aware navigation and a view of matches, payment status, and profile completion.

### 🛠️ Administrative Control
- **User Management**: Comprehensive oversight of all registered users (Activate/Deactivate/Delete).
- **Profile Moderation**: Review, approve/reject, and verify user bio-data before making it public.
- **Trust Badge Management**: Toggle both general verification and Vikas Trust community verification per profile.
- **Business Directory Management**: Add and manage vendor listings shown as banner ads to engaged users.
- **Dynamic Action System**: Metadata-driven dashboard actions (per module and status) to streamline admin workflows without frontend redeploys.
- **Configurable Lookups**: Admin-managed reference data (Gotra, Education, Occupation, Marital Status, etc.) that drives dropdowns across the app.
- **Real-time Statistics**: High-level dashboard showing total profiles, verification status, and membership tiers.

---

## 🛠️ Technology Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 4.0.1
- **Language**: Java 17
- **Security**: Spring Security + JWT (Json Web Token)
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: 
  - **PostgreSQL** (Production-ready)
  - **H2** (In-memory for rapid development)
- **Key Libraries**: Lombok, Jackson (JSON handling), Validation API
- **Payment Gateway**: Razorpay Java SDK
- **PDF Generation**: OpenPDF (branded Bio-Data export)
- **QR Codes**: ZXing (profile sharing)

### Frontend (Next.js)
- **Framework**: Next.js 15+ (App Router), React 19
- **Styling**: Tailwind CSS v4 (Standard-compliant, high-performance)
- **Theme Support**: `next-themes` (Dark/Light/System)
- **Icons**: Lucide React
- **Client**: Axios for API communication

---

## 📂 Project Structure

```text
parichay/
├── backend/                   # Spring Boot Enterprise Application
│   ├── src/main/java/         # Java Source Code (com.aggarjan.patrika.parichay)
│   │   ├── core/              # Security config, JWT, global exception handling, response envelopes
│   │   └── modules/           # Feature-based modular architecture
│   │       ├── admin/         # Admin aggregation controller (profiles, users, stats)
│   │       ├── auth/          # Authentication, registration & user management
│   │       ├── profile/       # Bio-data, search/masking, PDF export, QR codes, photo requests
│   │       ├── payment/       # Razorpay integration & membership activation
│   │       ├── directory/     # Aggarwal Business Directory & banner ads
│   │       ├── menu/          # Role-aware navigation menu
│   │       ├── metadata/      # Admin-configurable lookups & row-action metadata
│   │       └── file/          # File upload handling
│   ├── src/main/resources/    # Configuration files (application.properties, seeds)
│   └── pom.xml                # Maven configuration
├── frontend/                  # Next.js 15 Client-side Application
│   ├── src/app/               # App Router pages and layouts
│   ├── src/components/        # Reusable UI components
│   └── package.json           # NPM dependencies and scripts
└── Parichay_Local_API.postman_collection.json # API documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **JDK**: Version 17 or higher
- **Node.js**: Version 20+ (recommended)
- **Build Tool**: Maven 3.x
- **Database**: PostgreSQL (required by default; an H2 in-memory fallback is available but commented out in config — see below)

### 1. Backend Setup
1. **Clone & Navigate**:
   ```bash
   cd backend
   ```
2. **Database Config**: `src/main/resources/application.properties` points at PostgreSQL by default. Update the credentials for your local setup, or create the `parichay_db` database first:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/parichay_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```
   To run against H2 instead for quick local testing, comment out the PostgreSQL block and uncomment the H2 block already present in the same file.
3. **Razorpay Setup**: Provide your Razorpay API keys in the same file.
   ```properties
   razorpay.key.id=your_id
   razorpay.key.secret=your_secret
   ```
4. **Run Application**:
   ```bash
   mvn spring-boot:run
   ```
   The API starts on `http://localhost:8081` (see `server.port` in `application.properties`).

### 2. Frontend Setup
1. **Navigate**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Config**: Create a `.env.local` if needed (defaults are usually pre-configured in `src` for dev).
4. **Run Dev Server**:
   ```bash
   npm run dev
   ```
5. **Access Site**: Visit `http://localhost:3000`.

---

## 📑 API Documentation
A complete Postman collection is included in the root directory: `Parichay_Local_API.postman_collection.json`. Import this into Postman to start testing the backend endpoints.

## 📄 License
This project is proprietary and confidential.

---
Built with ❤️ by the Parichay Development Team.

