// server.js - Node.js server for GreenLeaf Organics signup and login

// Import necessary modules
const express = require('express');        // Express.js for server functionality
const bodyParser = require('body-parser'); // Body-parser to handle request bodies
const fs = require('fs');                 // File system module to work with files

const app = express();                    // Create an Express application
const port = 3000;                        // Define the port the server will listen on (you can change this)
const usersFilePath = 'users.json';       // Path to the JSON file to store user data

// Middleware to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// -------------------- Signup Endpoint --------------------
app.post('/signup', (req, res) => {
    // 1. Extract email and password from the request body
    const { email, password } = req.body;

    // 2. Basic input validation (you can add more robust validation)
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // 3. Create a new user object with email, password, and timestamp
    const newUser = {
        email: email,
        password: password, // IMPORTANT: In a real application, HASH the password before storing!
        timestamp: new Date().toISOString()
    };

    // 4. Read existing users from users.json file (if it exists)
    let users = [];
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(usersData);
    } catch (error) {
        // If file doesn't exist or JSON is invalid, start with an empty array
        console.log('users.json not found or invalid, starting with empty users.');
    }

    // 5. Check if user with this email already exists (optional, but good practice)
    const userExists = users.some(user => user.email === email);
    if (userExists) {
        return res.status(409).send('Email already registered. Please use a different email or login.');
    }

    // 6. Add the new user to the users array
    users.push(newUser);

    // 7. Write the updated users array back to users.json file
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.error('Error writing to users.json:', err);
            return res.status(500).send('Signup failed: Could not save user data.');
        }
        console.log(`User ${email} signed up successfully.`);
        res.send('Signup successful!'); // Send success response to the client
    });
});

// -------------------- Login Endpoint --------------------
app.post('/login', (req, res) => {
    // 1. Extract email and password from the request body
    const { email, password } = req.body;

    // 2. Basic input validation
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // 3. Read users from users.json file
    let users = [];
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(usersData);
    } catch (error) {
        // If file doesn't exist or JSON is invalid, no users are registered yet
        return res.status(401).send('Login failed: Invalid credentials.'); // Or send a different message if you prefer
    }

    // 4. Find user by email and check password (VERY BASIC SECURITY - IMPROVE THIS!)
    const user = users.find(user => user.email === email && user.password === password); // In real app, compare HASHED passwords!

    if (user) {
        console.log(`User ${email} logged in successfully.`);
        res.send('Login successful!'); // Send success response
    } else {
        console.log(`Login failed for email ${email}.`);
        res.status(401).send('Login failed: Invalid credentials.'); // Send error response
    }
});

// -------------------- Start the server --------------------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// -------------------- IMPORTANT SECURITY NOTE --------------------
// **SECURITY WARNING:**
//  - This code stores passwords in plain text in the users.json file.
//  - **DO NOT USE THIS IN A PRODUCTION APPLICATION.**
//  - For a real application, you MUST:
//    1. HASH passwords securely (e.g., using bcrypt, Argon2) before storing them.
//    2. Use a proper database to store user credentials instead of a JSON file.
//  - This example is for basic demonstration and learning purposes only.
