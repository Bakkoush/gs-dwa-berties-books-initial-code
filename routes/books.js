// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search-result', function (req, res, next) {
    //searching in the database
    res.send("You searched for: " + req.query.keyword)
});

    router.get('/list', function(req, res, next) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            res.render("list.ejs", {availableBooks:result})
         });
    });

    // addbooks route
router.get('/addbook', function(req, res, next) {
    res.render('addbook', { message: null }); // render with a default value
});


// POST route for adding a book
router.post('/bookadded', (req, res, next) => {
    const name = req.body.bookname;
    const price = req.body.price;

    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    db.query(sqlquery, [name, price], (err, result) => {
        if (err) {
            next(err);
        } else {
            const message = `This book is added to database, name: ${name} price ${price}`;
            // Re-render the addbook page with a success message
            res.render('addbook', { message });
        }
    });
});


    // search_result route
router.get('/search_result', function (req, res, next) {
    const keyword = req.query.search_text; // matches the form input name

    if (!keyword) {
        return res.render("search_result.ejs", { searchTerm: "", results: [] });
    }

    const sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    const searchValue = "%" + keyword + "%";

    db.query(sqlquery, [searchValue], (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("search_result.ejs", {
                searchTerm: keyword,
                results: result
            });
        }
    });
});


// Export the router object so index.js can access it
module.exports = router
