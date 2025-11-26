// Create a new router
const express = require("express");
const router = express.Router();

// 🔹 Middleware: Require Login Before Accessing Some Pages
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');  // send them to login page
    }
    next();
};

// -------------------------------
// PUBLIC PAGES
// -------------------------------

// Home page
router.get('/', (req, res) => {
    res.render('index.ejs', { session: req.session });
});

// About page
router.get('/about', (req, res) => {
    res.render('about.ejs', { session: req.session });
});

// -------------------------------
// USERS PAGES
// -------------------------------

// Login page (public)
router.get('/users/login', (req, res) => {
    res.render('login.ejs', { message: null, session: req.session });
});

// List all users (PROTECTED)
router.get('/users/listusers', redirectLogin, (req, res, next) => {
    const sqlquery = "SELECT username, firstName, lastName, email FROM users";

    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render('listusers.ejs', { users: result, session: req.session });
        }
    });
});

// -------------------------------
// LOGOUT ROUTE (Task 4)
// -------------------------------
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.send(`You are now logged out. <a href="/">Home</a>`);
    });
});

// -------------------------------
// BOOK ROUTES
// -------------------------------

// Show all books (PROTECTED)
router.get('/books/list', redirectLogin, (req, res, next) => {
    const sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render('list.ejs', { books: result, session: req.session });
        }
    });
});

// Add book form (PROTECTED)
router.get('/books/addbook', redirectLogin, (req, res) => {
    res.render('addbook.ejs', { message: null, session: req.session });
});

// Handle add book submission (PROTECTED)
router.post('/books/bookadded', redirectLogin, (req, res, next) => {
    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    const name = req.body.bookname;
    const price = req.body.price;

    db.query(sqlquery, [name, price], (err, result) => {
        if (err) {
            next(err);
        } else {
            const message = `This book is added to database, name: ${name} price ${price}`;
            res.render('addbook.ejs', { message, session: req.session });
        }
    });
});

module.exports = router;
