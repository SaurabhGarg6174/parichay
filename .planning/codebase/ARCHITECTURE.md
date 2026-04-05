# Architecture

The project follows a modular monolithic architecture with a decoupled frontend and backend.

## Backend (Spring Boot)
- **Base Package**: `com.aggarjan.patrika.parichay`
- **Core Package**: Contains global configuration, security, and utility classes.
- **Modules Package**: Contains feature-specific logic, further divided into:
  - `admin`: Administrative dashboard and user management.
  - `auth`: User authentication and registration.
  - `profile`: Bio-data management and search.
  - `payment`: Razorpay integration for premium memberships.

## Frontend (Next.js)
- **App Router**: Uses Next.js 15 App Router for routing and page structure.
- **Components**: Reusable UI components in `src/components`.
- **Styling**: Tailwind CSS v4 for modern responsive design.

## Data Flow
- Frontend communicates with Backend via REST APIs using Axios.
- JWT is used for secure communication between frontend and backend.
- PostgreSQL stores persistent data, with H2 available for local development.
