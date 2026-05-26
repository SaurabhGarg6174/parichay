# Parichay - Modern Matrimonial Platform

Parichay is a feature-rich, full-stack matrimonial platform designed to provide a secure, seamless, and personalized experience for individuals seeking life partners. The platform combines a robust Spring Boot backend with a high-performance, responsive Next.js frontend, featuring enterprise-grade security and modern UI/UX.

---

## 🌟 Key Features

### 👤 User Capabilities
- **Secure Authentication**: JWT-based login and registration system with multi-tier role support.
- **Comprehensive Bio-Data**: Detailed profile management including personal, family, education, and professional information.
- **Smart Matchmaking**: Browse and filter profiles to find compatible matches.
- **Integrated Payments**: Secure financial transactions using **Razorpay Integration** for premium memberships.
- **Profile Customization**: Upload and manage profile pictures with automated server-side storage.
- **Responsive Dashboard**: Personalized view of matches, payment status, and profile completion.

### 🛠️ Administrative Control
- **User Management**: Comprehensive oversight of all registered users (Activate/Deactivate/Delete).
- **Profile Moderation**: Review and verify user bio-data before making it public.
- **Dynamic Action System**: Metadata-driven dashboard actions to streamline admin workflows.
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
│   │   ├── core/              # Core utilities, payload definitions, security config
│   │   └── modules/           # Feature-based modular architecture
│   │       ├── admin/         # Administrative logic and controllers
│   │       ├── auth/          # Authentication & User management
│   │       ├── profile/       # Bio-data and profile logic
│   │       └── payment/       # Razorpay integration
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
- **Database**: PostgreSQL (optional, defaults to H2 if configured)

### 1. Backend Setup
1. **Clone & Navigate**:
   ```bash
   cd backend
   ```
2. **Database Config**: Edit `src/main/resources/application.properties` to set your PostgreSQL credentials.
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/parichay_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```
3. **Razorpay Setup**: Provide your Razorpay API keys in the same file.
   ```properties
   razorpay.key.id=your_id
   razorpay.key.secret=your_secret
   ```
4. **Run Application**:
   ```bash
   mvn spring-boot:run
   ```

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

