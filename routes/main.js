// Create a new router
const express = require("express");
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('index.ejs');
});

// About page
router.get('/about', (req, res) => {
    res.render('about.ejs');
});

// -------------------------------
// USERS PAGES ADDED BELOW
// -------------------------------

// ✅ Login page
router.get('/users/login', (req, res) => {
    res.render('login.ejs', { message: null });
});

// ✅ List all users (no passwords)
router.get('/users/listusers', (req, res, next) => {
    const sqlquery = "SELECT username, firstName, lastName, email FROM users";

    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render('listusers.ejs', { users: result });
        }
    });
});

// -------------------------------
// BOOK ROUTES
// -------------------------------

// Show all books
router.get('/books/list', (req, res, next) => {
    const sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render('list.ejs', { books: result });
        }
    });
});

// Show add book form
router.get('/books/addbook', (req, res) => {
    res.render('addbook.ejs', { message: null });
});

// Handle form submission (add book)
router.post('/books/bookadded', (req, res, next) => {
    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    const name = req.body.bookname;
    const price = req.body.price;

    db.query(sqlquery, [name, price], (err, result) => {
        if (err) {
            next(err);
        } else {
            const message = `This book is added to database, name: ${name} price ${price}`;
            res.render('addbook.ejs', { message });
        }
    });
});

// Export the router object
module.exports = router;