# SpendWise – Personal Finance Tracker

![Node](https://img.shields.io/badge/node.js-18+-green)
![React](https://img.shields.io/badge/react-19-blue)
![MongoDB](https://img.shields.io/badge/mongodb-database-green)
![License](https://img.shields.io/badge/license-MIT-blue)

SpendWise is a full-stack personal finance tracking application built with **Node.js, Express, MongoDB, and React**.  

The application allows users to manage financial accounts, track income and expenses, transfer funds between accounts, and analyze spending patterns through interactive reports and charts.

---

# Features

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Protected routes in the frontend

### Accounts
- Create, edit, and delete financial accounts
- Multiple account types:
  - debit
  - credit
  - savings
  - investment
- Currency support per account
- Automatic balance calculations

### Transactions
- Record **income and expense transactions**
- Transfer money between accounts
- Transaction categories
- Transaction history
- Edit and delete transactions

### Dashboard
- Current balances across accounts
- Total income
- Total expenses
- Recent transactions overview

### Reports & Analytics
- Expenses by category (pie chart)
- Monthly expense trends (line chart)
- Income vs expenses comparison (bar chart)
- Filters by:
  - date range
  - account

### Developer Tools
- RESTful API
- Input validation with Zod
- Database seed script for demo data
- Secure API middleware

---

# Architecture

```mermaid
flowchart LR

User[User Browser]
Frontend[React Frontend<br>Vite + React Router]
API[Node.js API<br>Express]
DB[(MongoDB)]
Auth[JWT Authentication]

User --> Frontend
Frontend -->|HTTP / Axios| API
API --> Auth
API --> DB
DB --> API
API --> Frontend
Frontend --> User

```

# Tech Stack

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- Zod validation
- bcrypt password hashing

### Frontend
- React
- Vite
- React Router
- Axios
- Recharts (for reports and charts)

### Other Tools
- ESLint
- Prettier
- dotenv
- Postman (API testing)

# Project Structure

spend-wise-finance-tracker-2
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── middleware
│   │   ├── validators
│   │   ├── constants
│   │   ├── config
│   │   └── scripts
│   │       └── seed.js
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── api
│   │   └── styles
│   └── package.json