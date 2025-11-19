// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// --- REGISTRATION PAGE ---
router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

// --- HANDLE REGISTRATION ---
router.post('/registered', function (req, res, next) {

    const username = req.body.username;
    const first = req.body.first;
    const last = req.body.last;
    const email = req.body.email;
    const plainPassword = req.body.password;

    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {

        if (err) {
            return res.send("Error hashing password.");
        }

        // Save user in database
        let sqlquery = `
            INSERT INTO users (username, firstName, lastName, email, hashedPassword)
            VALUES (?, ?, ?, ?, ?)
        `;
        let values = [username, first, last, email, hashedPassword];

        db.query(sqlquery, values, (err, result) => {

            if (err) {
                return next(err);
            }

            let output = `Hello ${first} ${last}, you are now registered! 
                          We will send an email to you at ${email}.<br><br>`;
            output += `Your password is: ${plainPassword}<br>`;
            output += `Your hashed password is: ${hashedPassword}`;

            res.send(output);
        });

    });
});


// --- LIST USERS (NO PASSWORDS SHOWN) ---
router.get('/listusers', function (req, res, next) {

    const sqlquery = "SELECT username, firstName, lastName, email FROM users";

    db.query(sqlquery, (err, result) => {
        if (err) return next(err);

        res.render("listusers.ejs", { users: result });
    });
});


// --- LOGIN PAGE ---
router.get('/login', function (req, res, next) {
    res.render('login.ejs', { message: null });
});


// --- HANDLE LOGIN ---
router.post('/loggedin', function (req, res, next) {

    const username = req.body.username;
    const password = req.body.password;

    let sqlquery = "SELECT * FROM users WHERE username = ?";

    db.query(sqlquery, [username], (err, result) => {
        if (err) return next(err);

        // Username not found
        if (result.length === 0) {
            return res.render("login.ejs", { message: "Login failed: Username not found." });
        }

        const hashedPassword = result[0].hashedPassword;

        bcrypt.compare(password, hashedPassword, function (err, match) {

            if (err) return next(err);

            if (match === true) {
                res.send(`
                    <h1>Login Successful</h1>
                    <p>Welcome back, ${result[0].firstName}!</p>
                `);
            } else {
                res.render("login.ejs", { message: "Login failed: Incorrect password." });
            }
        });
    });
});


// Export the router object so index.js can access it
module.exports = router;
