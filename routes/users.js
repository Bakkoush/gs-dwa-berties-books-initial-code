// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
    res.render('login.ejs', { message: null });
});

// --- HANDLE LOGIN ---
router.post('/loggedin', function (req, res, next) {

    const username = req.body.username;
    const password = req.body.password;

    let sqlquery = "SELECT * FROM users WHERE username = ?";

    db.query(sqlquery, [username], (err, result) => {
        if (err) return next(err);

        if (result.length === 0) {

            db.query("INSERT INTO audit_log (username, status) VALUES (?, 'FAIL')", [username]);

            return res.render("login.ejs", { message: "Login failed: Username not found." });
        }

        const hashedPassword = result[0].hashedPassword;

        bcrypt.compare(password, hashedPassword, function (err, match) {

            if (err) return next(err);

            if (match === true) {

                db.query("INSERT INTO audit_log (username, status) VALUES (?, 'SUCCESS')", [username]);

                // 🔹 SAVE SESSION HERE
                req.session.userId = username;

                res.redirect('/users/listusers');

            } else {

                db.query("INSERT INTO audit_log (username, status) VALUES (?, 'FAIL')", [username]);

                res.render("login.ejs", { message: "Login failed: Incorrect password." });
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
