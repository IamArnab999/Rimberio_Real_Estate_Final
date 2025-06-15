import React from "react";

const iconClass =
  "inline-block align-middle mr-2 text-blue-500 text-2xl md:text-3xl";

const Documentation = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <h1 className="text-4xl font-bold mb-8 text-blue-800 text-center flex items-center justify-center gap-3">
      <span role="img" aria-label="docs" className="text-4xl md:text-5xl">
        📄
      </span>
      Project Documentation
    </h1>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700 flex items-center">
        <span className={iconClass} role="img" aria-label="overview">
          🌐
        </span>
        Overview
      </h2>
      <p className="text-gray-700 mb-2">
        This Real Estate Website is a full-stack web application for property
        discovery, management, and communication between clients, agents, and
        administrators. It features a modern React frontend, a Node.js/Express
        backend, MySQL database, and Firebase for authentication and analytics.
      </p>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700 flex items-center">
        <span className={iconClass} role="img" aria-label="tech">
          🛠️
        </span>
        Technologies Used
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-1">
        <li>
          <b>Frontend:</b> React, Vite, Tailwind CSS, Material Tailwind, React
          Router, Toastify
        </li>
        <li>
          <b>Backend:</b> Node.js, Express.js, RESTful APIs
        </li>
        <li>
          <b>Database:</b> MySQL (with models and controllers for all major
          entities)
        </li>
        <li>
          <b>Authentication:</b> Firebase Auth (with middleware for protected
          routes)
        </li>
        <li>
          <b>Analytics:</b> Firebase Analytics
        </li>
        <li>
          <b>Real-time Chat:</b> Custom chat server (Node.js, Gemini API)
        </li>
        <li>
          <b>Email:</b> Nodemailer, custom email service
        </li>
        <li>
          <b>Payments:</b> Integrated payment controller and service
        </li>
        <li>
          <b>Other:</b> Cron jobs for newsletters, RESTful API structure,
          modular codebase
        </li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700 flex items-center">
        <span className={iconClass} role="img" aria-label="how">
          ⚙️
        </span>
        How the Website Works
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>
          Users can browse, search, and filter property listings with images and
          details.
        </li>
        <li>
          Authentication is required for actions like wishlist, reviews, and
          booking visits.
        </li>
        <li>
          Real-time chat is available for users to communicate with agents or
          support.
        </li>
        <li>
          Newsletter signup and notifications are managed via backend and cron
          jobs.
        </li>
        <li>
          Payment integration allows users to make secure transactions for
          services.
        </li>
        <li>
          Admin panel provides analytics, property/client management, chat
          history, calendar, and revenue tracking.
        </li>
        <li>
          Admins can view and manage all users, properties, reviews, payments,
          and support tickets.
        </li>
        <li>
          Role-based access ensures only authorized users can access admin
          features.
        </li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700 flex items-center">
        <span className={iconClass} role="img" aria-label="admin">
          🧑‍💼
        </span>
        Admin Features
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Dashboard with analytics and key metrics</li>
        <li>
          Manage properties, clients, reviews, payments, and notifications
        </li>
        <li>View chat history and support tickets</li>
        <li>Access to calendar, new leads, sales count, and total revenue</li>
        <li>Role management for admin/owner privileges</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700 flex items-center">
        <span className={iconClass} role="img" aria-label="structure">
          📁
        </span>
        Project Structure
      </h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>
          <b>frontend/</b> - React app (pages, components, utils, styles)
        </li>
        <li>
          <b>backend/</b> - Express server (routes, controllers, models,
          services, config)
        </li>
        <li>
          <b>sql/</b> - SQL scripts for database setup
        </li>
        <li>
          <b>public/assets/</b> - Images and static assets
        </li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700 flex items-center">
        <span className={iconClass} role="img" aria-label="run">
          🚀
        </span>
        How to Run Locally
      </h2>
      <ol className="list-decimal pl-6 text-gray-700 space-y-1">
        <li>
          Clone the repository and install dependencies in both frontend and
          backend folders.
        </li>
        <li>
          Set up your MySQL database using the scripts in{" "}
          <code>backend/sql/</code>.
        </li>
        <li>
          Configure environment variables for backend and frontend (API keys, DB
          credentials, etc.).
        </li>
        <li>
          Run the backend server: <code>npm start</code> in{" "}
          <code>backend/</code>.
        </li>
        <li>
          Run the frontend: <code>npm run dev</code> in <code>frontend/</code>.
        </li>
        <li>
          Access the app at <code>http://localhost:5173</code> (or as
          configured).
        </li>
      </ol>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700 flex items-center">
        <span className={iconClass} role="img" aria-label="support">
          💬
        </span>
        Support
      </h2>
      <p className="text-gray-700">
        For questions or issues, contact the development team or open an issue
        in the repository.
      </p>
    </section>
  </div>
);

export default Documentation;
