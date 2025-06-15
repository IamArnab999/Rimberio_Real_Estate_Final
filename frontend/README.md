# 🏘️ Real Estate Website

A full-stack Real Estate Web Application built to simplify property discovery, management, and communication between clients, agents, and administrators.

Deployed on **Azure** (link coming soon!)

## 🌐 Overview

This project is a modern real estate platform that allows users to browse property listings, communicate with agents, and manage transactions. It features:

- A responsive, interactive frontend built with React.
- A Node.js/Express backend with RESTful APIs.
- MySQL for persistent storage.
- Firebase for authentication and analytics.
- Real-time chat and secure payments support.

## 🛠️ Technologies Used

### Frontend

- **React**
- **Vite**
- **Tailwind CSS**
- **Material Tailwind**
- **React Router**
- **React Toastify**

### Backend

- **Node.js**
- **Express.js**
- **RESTful APIs**

### Database

- **MySQL** (modular models & controllers)

### Additional Tools

- **Firebase Auth** – Authentication & route protection
- **Firebase Analytics** – Usage tracking
- **Nodemailer** – Email service integration
- **Custom Chat Server** – Real-time messaging (Node.js + Gemini API)
- **Cron Jobs** – For newsletter scheduling
- **Payment Service** – Integrated for secure transactions

## ⚙️ How the Website Works

- 🔍 Users can search and filter property listings with image galleries and details.
- 🔐 Authenticated users can:
  - Add properties to wishlists
  - Submit reviews
  - Book site visits
- 💬 Real-time chat with agents or support.
- 📬 Newsletters and notifications powered by backend cron jobs.
- 💳 Secure payment integration for services.
- 🛠️ Admin Panel features include:
  - Analytics dashboard
  - Full CRUD on users, properties, reviews, payments
  - Support ticket system
  - Calendar and revenue tracking
  - Role-based access control

## 🧑‍💼 Admin Features

- 📊 Dashboard with analytics and metrics
- 🏡 Manage properties, users, reviews, payments
- 🧾 View chat and support logs
- 📅 Calendar view with new leads & revenue tracking
- 🔐 Role management for admins/owners

## 📁 Project Structure

├── frontend/ # React app (pages, components, styles)
├── backend/ # Express server (routes, controllers, models, services)
├── sql/ # SQL scripts for DB setup
└── public/assets/ # Static assets like images

## 🚀 How to Run Locally

1. **Clone the repository:**

   git clone https://github.com/your-username/real-estate-website.git

2. **Install dependencies:**

   cd frontend
   npm install
   cd backend
   npm install

3. **Setup the database:**

   Create a MySQL database.
   Run SQL scripts in /backend/sql/ to initialize schema and seed data.

4. **Environment Variables:**

   Create .env files in both frontend/ and backend/
   Add API keys, DB credentials, Firebase config, etc.

5. **Run the backend:**

   cd backend
   npm run server

6. **Run the frontend:**

   cd frontend
   npm run dev

7. **Access the app:**

   - Open your browser and go to:  
     [http://localhost:5173](http://localhost:5173)

   - Alternatively, if you're using **Dev Tunnels in Visual Studio Code**, follow these steps to expose your local server publicly:

     **🔧 Setting up Dev Tunnels (VS Code):**
     1. Make sure you're signed into GitHub or Microsoft in VS Code.

     2. Open the **Command Palette** (`Ctrl+Shift+P`) and search for:
        Dev Tunnels: Create Tunnel

     3. Choose:
        - **Port:** `5173`
        - **Protocol:** `http`
        - **Tunnel Access:** Set to `Public` (if you want anyone with the link to access)

     4. You’ll get a **public URL** (e.g., `https://yourname.dev.tunnels.ai`).

     5. Share this URL to let others preview the site **without deploying**.

   > 🔁 Dev Tunnels can be used both for frontend (`5173`) and backend (`5000` or other), just repeat the steps with the relevant ports.

## 💬 Support

**Need help?**  
For issues or queries, feel free to:

- **Raise an issue** in the repository
- **Contact the development team** directly

## 📦 Deployment

**Hosting Platform:** Microsoft Azure  
The project will be deployed soon.  
🔗 **Live Link:** _Coming Soon_

## 📄 License

**License:** MIT  
This project is licensed under the [MIT License](LICENSE).

## 🙌 Acknowledgements

**Special Thanks** to the creators and maintainers of:

- React
- Node.js
- Tailwind CSS
- Firebase
- And every open-source tool used in this project

This project wouldn’t be possible without your excellent documentation and community support.
