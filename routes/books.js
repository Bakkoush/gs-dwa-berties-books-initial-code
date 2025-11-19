// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt");

// ------------------------------
// BOOK ROUTES
// ------------------------------

router.get('/search', function(req, res, next){
    res.render("search.ejs");
});

router.get('/search-result', function (req, res, next) {
    res.send("You searched for: " + req.query.keyword);
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) next(err);
        res.render("list.ejs", { availableBooks: result });
    });
});

// Add book form
router.get('/addbook', function(req, res, next) {
    res.render('addbook', { message: null });
});

// Handle adding book
router.post('/bookadded', (req, res, next) => {
    const name = req.body.bookname;
    const price = req.body.price;

    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    db.query(sqlquery, [name, price], (err, result) => {
        if (err) next(err);
        else {
            const message = `This book is added to database, name: ${name} price ${price}`;
            res.render('addbook', { message });
        }
    });
});

// Search exact match
router.get('/search_result', function (req, res, next) {
    const keyword = req.query.search_text;

    if (!keyword) {
        return res.render("search_result.ejs", { searchTerm: "", results: [] });
    }

    const sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    const searchValue = "%" + keyword + "%";

    db.query(sqlquery, [searchValue], (err, result) => {
        if (err) next(err);
        else {
            res.render("search_result.ejs", {
                searchTerm: keyword,
                results: result
            });
        }
    });
});


// ------------------------------
// USER ROUTES (added as requested)
// ------------------------------

// Login page
router.get('/users/login', (req, res) => {
    res.render('login.ejs', { message: null });
});

// List all users (no passwords)
router.get('/users/listusers', (req, res, next) => {
    const sqlquery = "SELECT username, firstName, lastName, email FROM users";

    db.query(sqlquery, (err, result) => {
        if (err) next(err);
        else res.render('listusers.ejs', { users: result });
    });
});

// Export router
module.exports = router;
