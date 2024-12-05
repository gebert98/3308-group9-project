# Global Recipe Map  

## Overview  
**Global Recipe Map** is an interactive web application that allows users to explore and experience culinary delights from around the world. By clicking on an interactive globe, users can discover diverse recipes, traditional dishes, and street foods specific to each geographic location. The platform fosters a deeper understanding of global cuisines and brings international flavors to home kitchens.  

## Contributors  
This project was developed by:  
- **Gaeryth Elbert**  
- **Maxwell Rodgers**  
- **Randy Eldredge**  
- **Tyler Min**  
- **Veranika Kamenka**  

## Technology Stack  
The application leverages the following technologies:  
- **Frontend:**  
  - HTML  
  - CSS  
  - JavaScript  
  - [Three.js](https://threejs.org/) for globe visualization  
    - `"three": "https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.module.js"`  
    - `"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/jsm/"`  
- **Backend:**  
  - Node.js  
  - Express.js  
- **Database:**  
  - PostgreSQL  
- **APIs:**  
  - Integration with third-party APIs for recipes and cultural insights  

## Prerequisites  
To run the application locally, ensure you have the following installed:  
- **Node.js** (version 16.x or higher)  
- **npm** or **yarn** package manager  
- **PostgreSQL**  

## Environment Variables  
Create a `.env` file in the root directory and add the following credentials:  

##env: 

POSTGRES_USER="postgres" 
POSTGRES_PASSWORD="pwd"  
POSTGRES_DB="users_db"  

SESSION_SECRET="YbyWeG5iNJZ9kW4l"  


##Instructions to Run Locally
To set up and run the application locally:

Clone the Repository

git clone <repository-url>  
Navigate to the Project Directory

cd 3308-group9-project

Install Dependencies:
npm install

Set Up the Database:

Start PostgreSQL and create a database with the name specified in the .env file (users_db).
Ensure the POSTGRES_USER and POSTGRES_PASSWORD match your PostgreSQL configuration.

##Start the Application

Build and Start the Docker Containers
Use Docker Compose to set up the application and database:

docker-compose up -d
Access the Application
Open your browser and navigate to:
http://localhost:3000

Stop the Application

When done, stop the containers with:
docker-compose down

##Running Tests
Follow these steps to run the test suite:



View Results
Test results will be displayed in the terminal. Verify functionality and address any issues reported.

#Deployed Application
Access the live version of the application here:
https://three308-group9-project.onrender.com 

#Explore global cuisines and expand your culinary horizons with Global Recipe Map! 🌍🍴


