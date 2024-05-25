
## Installation
1. Clone this repository to your local machine: run "git clone https://github.com/thomasHogno/FlyDreamAir.git"
2. Navigate to the project directory.
    cd /backend

## Install dependencies using npm: run "npm install"
    express, express-session, body-parser, dotenv, ejs, express-session, mongodb, mongoose, nodemon, bcrypt, passport, passport-local, express-flash

## Configuration
    Create a .env file in the root directory of the project.
    Add the following environment variables to the .env file:
    SESSION_SECRET: Secret key for session management. you can use : f0d2c3464c7ae236b011a276op156f0c
    PORT: Port number for the server to listen on. Default is 5000.

## Usage
    Start the server: node app.js
    or for development with nodemon:    nodemon app.js
    Open your web browser and navigate to http://localhost:5000 (or your specified port) to access the application.
    Our dataset are currently developed, it will only include one-way and round trip from Sydney to Melbourne, Brisbane, Singapore, Honululu, Ho Chi Minh City and Los Angeles.
