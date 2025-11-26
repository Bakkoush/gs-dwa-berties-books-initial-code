// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { check, validationResult } = require('express-validator');

// 🔹 Session redirect middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login');
    } else {
        next();
    }
};

// --- REGISTRATION PAGE ---
router.get('/register', function (req, res, next) {
    res.render('register.ejs', { errors: [] });
});

// --- HANDLE REGISTRATION ---
router.post('/registered',
    [
        check('email')
            .isEmail().withMessage('Please enter a valid email'),

        check('username')
            .isLength({ min: 4, max: 20 })
            .withMessage('Username must be between 5 and 20 characters'),

        check('password')
            .isLength({ min: 5 })
            .withMessage('Password must be at least 8 characters long')
    ],
    function (req, res, next) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('register.ejs', {
                errors: errors.array()
            });
        }

        // 🔹 Sanitize user inputs
        const username = req.sanitize(req.body.username);
        const first = req.sanitize(req.body.first);
        const last = req.sanitize(req.body.last);
        const email = req.sanitize(req.body.email);
        const plainPassword = req.sanitize(req.body.password);

        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {

            if (err) {
                return res.send("Error hashing password.");
            }

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

// --- LIST USERS (PROTECTED) ---
router.get('/listusers', redirectLogin, function (req, res, next) {

    const sqlquery = "SELECT username, firstName, lastName, email FROM users";

    db.query(sqlquery, (err, result) => {
        if (err) return next(err);

        res.render("listusers.ejs", { users: result });
    });
});

// --- LOGIN PAGE ---
router.get('/login', function (req, res, next) {
    res.render('login.ejs', { message: null, errors: [] });
});

// --- HANDLE LOGIN ---
router.post('/login',
    [
        check('username')
            .notEmpty().withMessage('Username is required'),

        check('password')
            .notEmpty().withMessage('Password is required')
    ],
    function (req, res, next) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('login.ejs', {
                message: null,
                errors: errors.array()
            });
        }

        // 🔹 Sanitize login inputs
        const username = req.sanitize(req.body.username);
        const password = req.sanitize(req.body.password);

        let sqlquery = "SELECT * FROM users WHERE username = ?";

        db.query(sqlquery, [username], (err, result) => {
            if (err) return next(err);

            if (result.length === 0) {

                db.query("INSERT INTO audit_log (username, status) VALUES (?, 'FAIL')", [username]);

                return res.render("login.ejs", { 
                    message: "Login failed: Username not found.",
                    errors: [] 
                });
            }

            const hashedPassword = result[0].hashedPassword;

            bcrypt.compare(password, hashedPassword, function (err, match) {

                if (err) return next(err);

                if (match === true) {

                    db.query("INSERT INTO audit_log (username, status) VALUES (?, 'SUCCESS')", [username]);

                    // 🔹 SAVE SESSION
                    req.session.userId = username;

                    // 🔹 RENDER LOGGED-IN PAGE WITH USERNAME
                    return res.render("loggedin.ejs", {
                        username: username
                    });

                } else {

                    db.query("INSERT INTO audit_log (username, status) VALUES (?, 'FAIL')", [username]);

                    return res.render("login.ejs", { 
                        message: "Login failed: Incorrect password.",
                        errors: [] 
                    });
                }
            });
        });
});

// --- AUDIT LOG PAGE (PROTECTED) ---
router.get('/audit', redirectLogin, function (req, res, next) {

    const sqlquery = "SELECT * FROM audit_log ORDER BY timestamp DESC";

    db.query(sqlquery, (err, result) => {
        if (err) return next(err);

        res.render("audit.ejs", { logs: result });
    });
});

module.exports = router;
