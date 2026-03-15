# 📄 Previous Year Question Papers Platform

A web platform designed to **upload, search, filter, and download previous year question papers** for Midterm and Final exams.  
The system allows students and professors to manage and access exam papers easily in one place.

---

## 📌 Description

This platform is built specifically for sharing **previous year question papers**.  
Users can search and filter papers by different categories and download them easily.

The system has **two main roles: Student and Professor**.

- **Public Users** can search, filter, and download available question papers.
- **Students** have a profile where they can view uploaded papers.
- **Professors** also have a dashboard to manage papers and approve student accounts.

A **student can only log in after a professor approves their registration**, ensuring that the platform is used by verified students only.

---

## 🚀 Key Features

### 📚 Paper Upload & Download
- Upload previous year question papers.
- Download exam papers easily.
- Supports structured information like subject, year, and exam type.

### 🔎 Search & Filter System
- Search papers by keyword.
- Filter by:
  - Subject
  - Year
  - Semester
  - Exam Type (Midterm 1, Midterm 2, Final)
  - Branch/Department

### 👥 User Roles
The platform supports **two main user roles**:

#### 🎓 Student
- View student profile.
- Access and download uploaded papers.
- Browse available exam papers.

#### 👨‍🏫 Professor
- Upload and manage question papers.
- View uploaded papers.
- **Approve student registrations** before they can log in.

### ✅ Professor Approval System
- Students must register on the platform.
- A professor must approve the student account.
- Only approved students can log in and access the system.

### 📄 Organized Paper Repository
- All papers are stored in a structured format.
- Easy browsing of previous year exam papers.

---

## 🎯 Purpose of the Project

The goal of this platform is to provide students with a **centralized place to access previous year question papers**, helping them prepare better for exams while allowing professors to manage and verify student access.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT / Role-Based Access Control

---

## 📷 Platform Capabilities

✔ Upload Previous Year Question Papers  
✔ Download Exam Papers  
✔ Search & Filter Papers  
✔ Student and Professor Dashboards  
✔ Professor Approval for Student Login  

---

## ⚙ Installation

Follow these steps to run the project locally on your system.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Tech-Lksh/Paper-Project.git

```

### 2️⃣ Install Dependencies

Install dependencies for both **backend** and **frontend**.

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file inside the **backend** folder and add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4️⃣ Run the Backend Server

```bash
cd server
npm start
```

The backend server will start on:

```
http://localhost:5000
```

### 5️⃣ Run the Frontend

Open another terminal and run:

```bash
cd client
npm run dev
```

The frontend will run on:

```
http://localhost:5173
```

### ✅ Project is Ready

Now open your browser and visit:

```
http://localhost:5173
```

You can now **upload, search, filter, and download previous year question papers** from the platform.


## 📁 Folder Structure

```
project-root
│
├── client
│   │
│   ├── public
│   │
│   ├── src
│   │   │
│   │   ├── api
│   │   │   └── axios.js
│   │   │
│   │   ├── assets
│   │   │   └── react.svg
│   │   │
│   │   ├── components
│   │   │   ├── GetPapers.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── pages
│   │   │
│   │   │   ├── ProfessorDashboard
│   │   │   │   ├── ProfessorApproveStudents.jsx
│   │   │   │   ├── ProfessorDashboard.jsx
│   │   │   │   ├── ProfessorGetPapers.jsx
│   │   │   │   ├── ProfessorProfile.jsx
│   │   │   │   └── ProfessorUploadPapers.jsx
│   │   │   │
│   │   │   ├── StudentDashboard
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── StudentGetPapers.jsx
│   │   │   │   ├── StudentProfile.jsx
│   │   │   │   └── StudentUploadPapers.jsx
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│
├── server
│   │
│   ├── config
│   │   └── db.js
│   │
│   ├── controller
│   │   ├── paperController.js
│   │   └── userController.js
│   │
│   ├── middleware
│   │   └── authMiddleware.js
│   │
│   ├── models
│   │   ├── PaperSchema.js
│   │   └── UserSchema.js
│   │
│   ├── routes
│   │   ├── paperRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── uploads
│   │   ├── papers
│   │   └── profile
│   │
│   ├── node_modules
│   ├── .env
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   └── README.md
│
├── .env
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 📌 Folder Description

### Frontend (client)
- **client/** → React frontend application  
- **src/api/** → Axios API configuration  
- **src/components/** → Reusable UI components  
- **src/pages/** → Student and Professor dashboard pages  
- **assets/** → Static images and icons  

### Backend (server)
- **config/** → Database configuration  
- **controller/** → Business logic for users and papers  
- **middleware/** → Authentication and security middleware  
- **models/** → MongoDB schemas (User, Papers)  
- **routes/** → API route definitions  
- **uploads/** → Stored uploaded files (papers, profile images)  
- **server.js** → Main backend server entry point  

---


ScreenShots

Home

