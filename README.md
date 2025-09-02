# Klinika – Digital Clinic System

A fullstack **clinic management system** built as part of my bachelor’s thesis at KEA.  
The platform supports different user roles (admin, doctor, secretary, patient) and combines **administrative workflows** with an **AI assistant** for patient preparation.

👉 **Live demo (Frontend)**: https://clinic-ai-app.vercel.app/
ℹ️ Use one of the [demo accounts](#4-demo-accounts) to log in.

---

## Why Klinika?

The project explores how **AI can supplement, not replace, human interaction** in a healthcare setting.  
Patients are supported with an AI chatbot that helps them describe their symptoms in a structured way. Doctors then use these AI-generated notes as a supplement during the consultation — improving efficiency without losing the human touch.

---

## Features

- **AI integration**:
  - Patients can chat with an AI assistant before an appointment to describe symptoms.
  - AI-generated notes are saved in the patient’s record and visible to the doctor.
  - Doctors can add their own notes alongside AI suggestions, ensuring human oversight.
- **Role-based access control (RBAC)** with JWT authentication
- **Admin**: manage clinic, doctors, secretaries, and patients
- **Secretary**: handle bookings, availability, and patient messaging
- **Doctor**: see today’s appointments, view patient history, add notes, prescriptions & test results
- **Patient**: book appointments, chat with AI assistant, view profile & prescriptions
- **Messaging system** (secretary/admin ↔ patients)
- **Calendar system** with availability slots, booking flow, and appointment confirmation/cancellation
- **Security measures**:
  - Input validation (manual + backend)
  - JWT with jti to prevent replay attacks
  - Password hashing (bcrypt pre-save middleware)
  - Helmet, CORS, HTTPS
  - Rate limiting
  - Dependabot for dependency security

---

## Tech Stack

**Frontend**

- React (TypeScript)
- Chakra UI
- React Query (TanStack)
- React Router

**Backend**

- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- JWT + bcrypt

**AI Integration**

- OpenAI API for chatbot & note generation
- Integration designed to support — not replace — the doctor–patient relationship

**DevOps & Security**

- Helmet, CORS, HTTPS
- Jest + Supertest (integration tests)
- Dependabot

**Deployment**

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## How to Run Locally

### 1. Clone repo

git clone https://github.com/kanb1/klinika.git
cd klinika

### 2. Setup Backend

cd backend
npm install
npm run dev

Runs on http://localhost:5000

### 3. Setup Frontend

cd frontend
npm install
npm run dev

Runs on http://localhost:5173

### 4. Demo Accounts

Seeded users for quick testing:

Admin: admin@test.dk
/ Strong@123!

Doctor: doc@test.dk
/ Strong@123!

Secretary: sek@test.dk
/ Strong@123!

Patient: kanza@test.dk
/ Strong@123!

### What I Learned:

- Designing and implementing a **role-based system** (RBAC) with multiple user types
- Integrating **AI (OpenAI API)** to support patient–doctor workflows
- Building a **secure fullstack app** with JWT, hashing, Helmet, CORS, rate limiting
- Writing **integration tests** with Jest & Supertest
- Creating a responsive UI with Chakra UI and reusable components
- Structuring backend with controllers, middleware, and clean route organization
- Deploying a fullstack app (Vercel + Render + MongoDB Atlas)
