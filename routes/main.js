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

// ✅ Show all books
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

// ✅ Show add book form
router.get('/books/addbook', (req, res) => {
    // Always provide a default message (so EJS doesn't throw an error)
    res.render('addbook.ejs', { message: null });
});

// ✅ Handle form submission (add book)
router.post('/books/bookadded', (req, res, next) => {
    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    const name = req.body.bookname;
    const price = req.body.price;

    db.query(sqlquery, [name, price], (err, result) => {
        if (err) {
            next(err);
        } else {
            const message = `This book is added to database, name: ${name} price ${price}`;
            // Stay on the addbook page, show confirmation
            res.render('addbook.ejs', { message });
        }
    });
});


// Export the router object
module.exports = router;
