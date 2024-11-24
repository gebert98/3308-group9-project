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

app.use(express.static('public'));

const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
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

app.get('/home', (req, res) => {
  res.render('pages/home'); // This is correct based on your structure.
});

app.get('/', (req, res) => {
  res.redirect('/home'); 
});
app.get('/register', (req, res) => {
  res.render('pages/register'); // This is correct based on your structure.
});
app.get('/login', (req, res) => {
  res.render('pages/login',{});
});


// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());


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
  host: process.env.POSTGRES_HOST,
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
app.get('/add-recipe',(req, res) => {
  res.render('pages/add_recipe'); // This is correct based on your structure.
});

app.post('/add_recipe', async (req, res) => {
  try {
      const {
          title,
          country_id,
          description,
          prep_time,
          cook_time,
          servings,
          difficulty,
          ingredients
      } = req.body;

      // Step 1: Insert the recipe into the `recipes` table
      const recipeResult = await pool.query(
          `INSERT INTO recipes (name, country_id, description, prep_time, cook_time, servings, difficulty)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [title, country_id, description, prep_time, cook_time, servings, difficulty]
      );
      const recipeId = recipeResult.rows[0].id;

      // Step 2: Insert ingredients into the `recipes_ingredients` table
      if (ingredients) {
          const ingredientsArray = ingredients.split(',').map(ingredient => ingredient.trim());
          
          for (let ingredient of ingredientsArray) {
              // Assuming ingredient has a format like "1 cup flour"
              const [quantity, unit, ...nameParts] = ingredient.split(' ');
              const name = nameParts.join(' ');

              // Check if the ingredient already exists in the `ingredients` table
              let ingredientResult = await pool.query(
                  `SELECT id FROM ingredients WHERE name = $1`,
                  [name]
              );

              let ingredientId;
              if (ingredientResult.rows.length > 0) {
                  ingredientId = ingredientResult.rows[0].id;
              } else {
                  // If not found, insert the new ingredient
                  const newIngredientResult = await pool.query(
                      `INSERT INTO ingredients (name) VALUES ($1) RETURNING id`,
                      [name]
                  );
                  ingredientId = newIngredientResult.rows[0].id;
              }

              // Insert into the `recipes_ingredients` table
              await pool.query(
                  `INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity, unit)
                  VALUES ($1, $2, $3, $4)`,
                  [recipeId, ingredientId, quantity || null, unit || null]
              );
          }
      }

      // Redirect or send a success response
      res.redirect('/recipes');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error adding recipe');
  }
});


// Get Recipes For Country
app.get('/recipes/:country', async (req, res) => {
  const countryName = req.params.country;
  
  try {
    // Fetch recipes for the country
    const result = await db.query('SELECT * FROM recipes WHERE country = $1', [countryName]);
    
    if (result.rows.length > 0) {
      // Render the page with the recipe data
      res.render('recipes_list', { country: countryName, recipes: result.rows });
    } else {
      res.status(404).send('No recipes found for this country');
    }
  } catch (error) {
    console.error('Error fetching recipes for page:', error);
    res.status(500).send('Error fetching recipes');
  }
});

// For example test *********************************/ 
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
/*************************************************** */

module.exports = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
