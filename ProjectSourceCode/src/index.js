// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');

// -------------------------------------  APP CONFIG   ----------------------------------------------

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(bodyParser.json());  // Only one body parser is needed, combine them
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Static files (CSS, JS, images)
app.use(express.static('public'));
// Serve static files from the "src/images" directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images/uploads', express.static(path.join(__dirname, 'public/images/uploads')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    saveUninitialized: true,
    resave: true,
  })
);

// ------------------------------------- HANDLEBARS CONFIGURATION --------------------------------------------

const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------

const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// Function to retry DB connection
const waitForDatabase = async (retries = 3, interval = 3000) => {
  while (retries > 0) {
    try {
      await db.connect();
      console.log('Database connection successful');
      return;
    } catch (error) {
      console.log('Database not ready, retrying...', retries);
      retries--;
      await new Promise(r => setTimeout(r, interval)); // Wait before retry
    }
  }
  console.log('Failed to connect to the database after multiple attempts.');
  process.exit(1); // Exit if DB connection fails after retries
};

waitForDatabase();  // Wait for DB before starting the server

// -------------------------- Multer configuration for user image uploads ------------------------------

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Correct path: Adjust based on your structure
    const uploadsPath = path.join(__dirname, '../public/images/uploads'); 
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});


// Multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and GIF files are allowed.'));
    }
    cb(null, true);
  }
});


// ------------------------------------- ROUTES AND HANDLERS --------------------------------------------

// Render home
app.get('/', (req, res) => {
  res.redirect('/home'); 
});

// Render home
app.get('/home', (req, res) => {
  res.render('pages/home'); 
});

app.get('/countries', (req, res) => {
  fs.readFile('./countries.geojson', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      res.status(500).send('Error reading the file');
      return;
    }
    res.header('Content-Type', 'application/json');
    res.send(data);
  });
});

// Render register page
app.get('/register', (req, res) => {
  res.render('pages/register'); 
});

// Render Login page
app.get('/login', (req, res) => {
  res.render('pages/login',{});
});

// Get add recipe page for clicked on country:
app.get('/add-recipe', (req, res) => {
  const country = req.query.country || ''; // Get country from query, default to empty
  res.render('pages/add_recipe', { country });
});

// Get Recipes For Country
app.get('/recipes/:country', async (req, res) => {
  const { country } = req.params;

  try {
    const recipes = await db.query(
      'SELECT * FROM recipes WHERE LOWER(country) = LOWER($1)',
      [country]
    );

    // Send a 200 response with the page regardless of whether recipes are found
    res.status(200).render('pages/recipes', {
      country,
      recipes: recipes || [] // Default to an empty array if no recipes
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).send('Failed to load recipes');
  }
});


//Currently not using this log in redirect

/*app.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }

  const username = req.session.user.username;
  res.render('pages/home', { username });
}); */

//*****************************************************

// Add recipe to recipe table and other relations
app.post('/add_recipe', upload.single('recipeImage'), async (req, res) => {
  const { name, country, description, prep_time, cook_time, servings, difficulty } = req.body;
  const ingredientNames = req.body.ingredient_name;
  const quantities = req.body.quantity;
  const units = req.body.unit;

  try {
    await db.query('BEGIN');
    console.log(req.file);

    const imagePath = req.file ? `/images/uploads/${req.file.filename}` : '/images/default.png';

    const recipeResult = await db.query(
      `INSERT INTO recipes (name, description, country, prep_time, cook_time, servings, difficulty, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        name,
        description,
        country,
        prep_time,
        cook_time,
        servings,
        difficulty,
        imagePath,
      ]
    );

    const recipeId = recipeResult[0].id;

    if (Array.isArray(ingredientNames) && ingredientNames.length > 0) {
      for (let i = 0; i < ingredientNames.length; i++) {
        const ingredientName = ingredientNames[i]?.trim();
        const quantity = quantities[i] ? parseInt(quantities[i], 10) : null;
        const unit = units[i]?.trim();

        if (!ingredientName || !quantity || !unit) {
          throw new Error(`Invalid ingredient data at index ${i}`);
        }

        const ingredientResult = await db.query(
          `INSERT INTO ingredients (name)
           VALUES ($1)
           ON CONFLICT (name) DO NOTHING
           RETURNING id`,
          [ingredientName]
        );

        const ingredientId = ingredientResult.length > 0
          ? ingredientResult[0].id
          : (await db.query(`SELECT id FROM ingredients WHERE name = $1`, [ingredientName]))[0].id;

        await db.query(
          `INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity, unit)
           VALUES ($1, $2, $3, $4)`,
          [recipeId, ingredientId, quantity, unit]
        );
      }
    }

    await db.query('COMMIT');
    res.redirect('/');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error adding recipe:', error);
    res.status(500).send('Failed to add recipe');
  }
});



/********* Get Recipes For Country *********

I dont think this is nessicary...

*/
/*app.post('/get_recipes', async (req, res) => {
  // Extract country from the request body
  const { country } = req.body;
  
  // If the country is not provided, return a bad request response
  if (!country) {
    return res.status(400).json({ error: "Country is required" });
  }

  try {
    // Query to get all recipes for the specified country
    const result = await db.query(
      'SELECT * FROM recipes WHERE country = $1;',
      [country]
    );

    // If no recipes are found, return an empty array
    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No recipes found for country: ${country}` });
    }

    // Return the recipes found
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "An error occurred while fetching recipes" });
  }
});*/


// For example test *********************************/ 
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
/*************************************************** */


// Register user
app.post('/register', async (req, res) => {
  // Extract username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  // Hash the password using bcrypt library
  const hash = await bcrypt.hash(password, 10);
  
  if (typeof username !== 'string') {
    return res.status(400).send("Invalid Username");
  }
  // Insert username and hashed password into the 'users' table
  try {
      const result = await db.query(
          'INSERT INTO users (username, password) VALUES ($1, $2);',
          [username, hash]
      );
      
      //not sure why we are getting a 200 code and not a 302 code but whatever
      return res.redirect('/login');
  } 
  catch (error) {
    console.error("Error inserting user:", error); // Log the exact error
    return res.status(500).send("Error");
}
});

// User login
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
          return res.status(400).render('pages/login', { message: 'Invalid password' });
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

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Could not log out.");
    }
    res.redirect('/login');
  });
});

// ------------------------------------- START SERVER -----------------------------------------------
const PORT = process.env.PORT || 3000;
module.exports = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});