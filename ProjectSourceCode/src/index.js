// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// -------------------------------------  APP CONFIG   ----------------------------------------------

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});


app.get('/home', (req, res) => {
  res.render('pages/home'); // This is correct based on your structure.
});

app.get('/', (req, res) => {
  res.redirect('/home'); 
});
app.get('/register', (req, res) => {
  res.render('pages/register'); // This is correct based on your structure.
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
// set Session
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// function to retry db connection because somtimes it takes too long
// (only needed for when the db and node are starting at the same time)
const waitForDatabase = async (retries = 3, interval = 3000) => {
  while (retries > 0) {
    try {
      // try connecting to db
      await db.connect();
      console.log('Database connection successful');
      return; // it worked so return
    } catch (error) {
      console.log('Database not ready, retrying...', retries);
      retries--;
      await new Promise(r => setTimeout(r, interval)); // wait for `interval` ms before retryin
    }
  }
  console.log('Failed to connect to the database after multiple attempts.');
  process.exit(1); // exit if the db dosn't start
};


// db test
waitForDatabase();


  // <!-- Login, Logout, Register Routes:


app.post('/register', async (req, res) => {
  // Extract username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  // Hash the password using bcrypt library
  const hash = await bcrypt.hash(password, 10);

  // Insert username and hashed password into the 'users' table
  try {
      const result = await db.query(
          'INSERT INTO users (username, password) VALUES ($1, $2);',
          [username, hash]
      );
      
      res.redirect('/login');
  } 
  catch (error) {
    console.error("Error inserting user:", error); // Log the exact error
    res.status(500).send("Error");
}
});


app.get('/login', (req, res) => {
  res.render('pages/login',{});
  });

  app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1;',
            [username]
        );

        if (result.length === 0) {
            console.log('User not found');
            return res.redirect('/register'); // Redirect to registration if user not found
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log('Invalid password');
            return res.status(400).render('login', { message: 'Invalid password' });
        }

        req.session.user = user;

        req.session.save(() => {

            res.redirect('/home');
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send('Error during login');
    }
});

app.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }

  const username = req.session.user.username;
  res.render('pages/home', { username });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Could not log out.");
    }
    res.redirect('/login');
  });
});
//*****************************************************
