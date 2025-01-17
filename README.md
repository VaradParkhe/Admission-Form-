# Overview
This is a full-stack web application that demonstrates CRUD (Create, Read, Update, Delete) operations on a MySQL database. The frontend is built using React for dynamic and interactive user interfaces, while the backend is implemented with Node.js and Express.js for API services. The database layer uses MySQL for data persistence.

Features
Frontend:

Responsive design using React.
Interactive components for smooth user experience.
Integrated API calls using Axios or Fetch API for seamless communication with the backend.
Backend:

RESTful API principles followed for consistent and scalable design.
Built with Node.js and Express.js for fast and efficient server-side operations.
Error handling and validation for robust functionality.
Database:

MySQL used for structured data storage.
Schema designed to optimize queries and maintain data integrity.
Technologies Used
Frontend: React
Backend: Node.js, Express.js
Database: MySQL
Tools: Postman (for API testing), Visual Studio Code

Requirements
Frontend:
Node.js 16.x or higher
npm or Yarn for dependency management
Backend:
Node.js 16.x or higher
MySQL 8.0 or higher
Development Tools:
Visual Studio Code / WebStorm / any preferred IDE
Setup Instructions
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/your-username/your-repo-name.git  
cd your-repo-name  
2. Install Dependencies
Frontend:

bash
Copy
Edit
cd frontend  
npm install  
Backend:

bash
Copy
Edit
cd backend  
npm install  
3. Configure the Database
Create a MySQL database:

sql
Copy
Edit
CREATE DATABASE your_database_name;  
Update the database configuration file (e.g., .env or config.js) with your MySQL credentials:

makefile
Copy
Edit
DB_HOST=localhost  
DB_USER=root  
DB_PASSWORD=your_password  
DB_NAME=your_database_name  
4. Run the Application
Backend:

bash
Copy
Edit
cd backend  
node server.js  
Frontend:

bash
Copy
Edit
cd frontend  
npm start  
The application will run on http://localhost:3000 (frontend) and http://localhost:5000 (backend).

API Endpoints
Category CRUD Operations
GET All Categories:
GET /api/categories

Create a New Category:
POST /api/categories

json
Copy
Edit
{  
  "categoryName": "Utilities"  
}  
GET Category by ID:
GET /api/categories/{id}

Update Category by ID:
PUT /api/categories/{id}

json
Copy
Edit
{  
  "categoryName": "Most Sold"  
}  
Delete Category by ID:
DELETE /api/categories/{id}

Testing Instructions
Use Postman or REST client to test the API endpoints.
Ensure the MySQL database is running before starting the backend server.
Use sample payloads as provided in the API documentation.
Notes
Ensure proper IDs are used for GET, PUT, and DELETE operations.
Application supports pagination for listing categories or products (?page={number}).
Author
Varad Parkhe
Email: varadparkhe@gmail.com
GitHub:VaradParkhe
LinkedIn:Varad Parkhe
