# Parichay - Matrimonial Platform

Parichay is a modern matrimonial platform designed to facilitate secure and personalized match-finding. It features a robust Spring Boot backend and a sleek, responsive Next.js frontend with full dark mode support.

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration.
- **Dynamic Bio-Data**: Comprehensive profile creation including personal, family, and professional details.
- **Image Management**: Support for profile picture uploads with local/server storage options.
- **Match Discovery**: Browse and view detailed profiles of potential matches.
- **Admin Panel**: Role-based access for administrators to review, approve, or reject user profiles.
- **Modern UI**: Built with Tailwind CSS v4, featuring a fully responsive layout and seamless Dark Mode transitions.
- **Quick Navigation**: Sidebar-driven dashboard for easy access to profile and match settings.

## 🛠️ Tech Stack

### Backend
- **Core**: Java 21, Spring Boot 4.x
- **Security**: Spring Security, JWT (Json Web Token)
- **Data**: Spring Data JPA, Hibernate
- **Database**: PostgreSQL (Production), H2 (Development/Testing)
- **Utilities**: Lombok, Validation API, Jackson

### Frontend
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4
- **Theming**: next-themes (Light/Dark/System)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📦 Project Structure

```text
parichay/
├── backend/          # Spring Boot Application
│   ├── src/
│   ├── pom.xml       # Maven Dependencies
│   └── ...
├── frontend/         # Next.js Application
│   ├── src/
│   ├── package.json  # NPM Dependencies
│   └── ...
└── README.md
```

## ⚙️ Getting Started

### Prerequisites
- JDK 21
- Node.js 18+
- Maven 3.x
- PostgreSQL (optional, can use H2)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure `src/main/resources/application.properties` (Database and JWT settings).
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by Parichay Team.
