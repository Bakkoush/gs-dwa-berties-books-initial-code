// Create a new router
const express = require("express");
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('index.ejs', { session: req.session });
});

// About page
router.get('/about', (req, res) => {
    res.render('about.ejs', { session: req.session });
});


module.exports = router;
