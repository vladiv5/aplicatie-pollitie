# Police Station Management System

## Description

This project is a full-stack application designed to simulate the digital management of a police station. It is the most complex project in my portfolio, combining a Java Spring Boot backend, a React frontend, and a relational SQL Server database.

The main objective was to go beyond basic CRUD functionality and implement real-world business logic and constraints, such as enforcing fiscal rules, maintaining referential integrity across complex relationships, and generating analytical insights from operational data.

---

## Technology Stack

### Backend
- Java 17 with Spring Boot 3 for building a RESTful API
- Spring Data JPA and Hibernate for ORM mapping
- Native SQL queries for complex reports and performance-critical operations
- Maven for dependency management

### Frontend
- React with functional components and Hooks (`useState`, `useEffect`, `useCallback`, `useContext`)
- Axios for HTTP communication and request interception
- Recharts for statistical data visualization
- Custom CSS Modules without external UI frameworks

### Database
- Microsoft SQL Server
- Relational schema with complex joins, subqueries, and aggregation logic
- SQL scripts for schema creation and data population

---

## Core Features

### Referential Integrity and Smart Deletion Logic
Instead of relying solely on database cascade deletion, I implemented application-level validation logic for safe data removal.
- Before deleting an entity (e.g. a police officer), the system checks for blocking dependencies such as active incidents or unpaid fines.
- If deletion is blocked, the user is redirected to the exact record causing the issue, where it can be resolved before automatically returning to the original operation.

### Incident and Fine Management
- Incident tracking with detailed metadata (type, location, description).
- Many-to-many relationships between citizens and incidents, with role differentiation (witness, suspect, victim).
- Fine management with strict validation rules (value constraints, allowed increments).
- Unpaid fines cannot be deleted, enforcing fiscal consistency.

### Human Resources and Citizen Registry
- Officer profiles including rank, role, and a complete digital activity history.
- Citizen registry with CNP validation logic, address history management (domicile vs. residence), and criminal record tracking.

### Analytical and Statistics Module
A dedicated backend statistics layer generates aggregated data for decision support:
- Identification of days with crime rates above the daily average.
- Detection of recidivist citizens based on fine frequency compared to population averages.
- Ranking of streets with the highest incident concentration.
- Data is visualized in the frontend using interactive charts.

### Live Search and Autocomplete
To improve performance and usability, I implemented a live search mechanism with debounced API calls, allowing dynamic lookup of officers, citizens, and addresses without loading large datasets into memory.

---

## Project Structure

Police-Station-App/
│
├── backend/sectie-politie-api/
│   ├── src/main/java/.../controller   # REST endpoints and validation logic
│   ├── src/main/java/.../entities     # JPA entities
│   ├── src/main/java/.../repository   # JPA and native SQL queries
│   └── src/main/resources             # Application configuration
│
├── frontend/
│   ├── src/components/                # Reusable UI components
│   ├── src/pages/                     # Main application views
│   └── src/context/                   # Global state and authentication context
│
├── database/
│   ├── DB_INIT_SCRIPT.sql             # Database initialization script
│   └── PoliceDB_Backup.bak            # Database backup
│
└── docs/
    └── Screenshots and documentation

---

## Setup and Run

### Prerequisites
- Java JDK 17 or higher
- Node.js and npm
- Microsoft SQL Server (Local or Express)

### Database Setup
1. Open SQL Server Management Studio.
2. Run `DB_INIT_SCRIPT.sql   ` to create the schema.


### Backend
1. Navigate to the `backend` directory.
2. Update SQL Server credentials in `src/main/resources/application.properties`.
3. Run the application: ./mvnw spring-boot:run


### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: npm install
3. Start the development server: npm start

The application will be available at `http://localhost:3000`.

---

## Authentication

The system uses a custom authentication mechanism.
- Default admin account: `admin / admin` (testing purposes only).
- User registration is restricted to officers already present in the database, linking login accounts to employee records.

---

## Additional Notes

- Printable officer and citizen dossiers are generated using custom CSS print media queries.
- Business rules are enforced primarily at the application level to keep database logic transparent and maintainable.
- The project was designed with modularity and extensibility in mind, allowing future integration of role-based access control or audit logging.



