Sanitisation

I applied sanitisation using the express-sanitizer middleware, which was added globally in index.js using:

app.use(expressSanitizer());


Sanitisation was then applied specifically to all user-submitted input fields in the registration and login routes inside users.js, such as:

username

first

last

email

password

Example:

const username = req.sanitize(req.body.username);


Sanitisation was applied because these fields are stored in the database and may later be rendered back to the browser, which could lead to stored XSS attacks if malicious HTML or JavaScript is submitted. Sanitising them prevents scripts or harmful markup from being executed.

I did not apply sanitisation to internal application values, session variables, or data coming from trusted sources (e.g., database-generated content) because they do not originate from the user and therefore do not pose an XSS risk. Sanitisation is only needed on user input, not system-generated values.


Validation

Validation was added using express-validator to ensure only correctly formatted and expected data is processed.

I applied validation to:

Registration route (POST /users/registered):

email – must be a valid email format

username – must be 5–20 characters

password – must be at least 8 characters

These rules ensure the data meets minimum security and usability requirements and avoids invalid or malformed accounts.

Login route (POST /users/login):

username – required

password – required

Validation was applied here because the login form must contain both fields, and missing values would otherwise cause unnecessary database lookups or misleading error messages.

I did not apply validation on internal routes such as /listusers or /audit because these do not accept user-submitted input and therefore do not require validation. Validation is only necessary on routes that handle external input from the user.

I created an API in api.js to allow external applications to retrieve book data in JSON format. The API was registered in index.js using:

app.use('/api', apiRoutes);

/api/books

This route returns all books from the database in JSON form using:

res.json(result);


I added optional query parameters to make the API more useful:

search – filters books by keyword (e.g., /api/books?search=world)

minprice / maxprice – filters books by price range (e.g., /api/books?minprice=5&maxprice=10)

sort – sorts results by name or price (e.g., /api/books?sort=price)

These features were added to improve flexibility for developers who may want to integrate book data into their own applications.

/api/friendsbooks

I also added a route that calls a friend’s API and returns their book list in JSON format. This demonstrates how external APIs can be consumed inside our application.

The API returns machine-readable data and does not render templates because it is intended for programmatic access rather than for human viewing.
