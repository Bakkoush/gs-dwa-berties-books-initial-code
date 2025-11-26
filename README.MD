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