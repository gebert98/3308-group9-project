// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
app.get('/add-recipe', (req, res) => {
  const countries = [{ id: 1, name: 'Test Country' }]; // Hardcoded country
  res.render('pages/add_recipe', { countries });
});

app.post('/add_recipe', async (req, res) => {
  const client = await db.connect(); // Assuming db.connect() returns a client object
  try {
    console.log("Received form data:", req.body);

    const {
      title,
      description,
      prep_time,
      cook_time,
      servings,
      difficulty,
      ingredients
    } = req.body;

    // Check if all required fields are present
    if (!title || !description || !prep_time || !cook_time || !servings || !difficulty) {
      throw new Error("Missing required fields");
    }

    const country = "Test Country"; // Hardcoded country name

    // Step 1: Start a transaction
    await client.query('BEGIN');

    // Step 2: Insert the recipe into the `recipes` table
    const recipeResult = await client.query(
      `INSERT INTO recipes (name, country, description, prep_time, cook_time, servings, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [title, country, description, prep_time, cook_time, servings, difficulty]
    );

    console.log("Recipe query result:", recipeResult); // Debug log for query result

    // Check if the recipe insertion returned a valid ID
    if (!recipeResult || !recipeResult.rows || recipeResult.rows.length === 0) {
      throw new Error("Recipe insertion failed");
    }

    const recipeId = recipeResult.rows[0].id;
    console.log("Recipe inserted with ID:", recipeId);

    // Step 3: Insert ingredients into the `recipes_ingredients` table if present
    if (ingredients) {
      const ingredientsArray = ingredients.split(',').map(ingredient => ingredient.trim());

      // Handle each ingredient
      for (let ingredient of ingredientsArray) {
        const [quantity, unit, ...nameParts] = ingredient.split(' ');
        const name = nameParts.join(' ');

        console.log("Processing ingredient:", name); // Debug log for each ingredient

        // Insert ingredient into `ingredients` table if it doesn't exist
        let ingredientResult = await client.query(`SELECT id FROM ingredients WHERE name = $1`, [name]);

        let ingredientId;
        if (ingredientResult.rows.length > 0) {
          ingredientId = ingredientResult.rows[0].id;
        } else {
          const newIngredientResult = await client.query(
            `INSERT INTO ingredients (name) VALUES ($1) RETURNING id`,
            [name]
          );

          if (!newIngredientResult || newIngredientResult.rows.length === 0) {
            throw new Error("Ingredient insertion failed");
          }

          ingredientId = newIngredientResult.rows[0].id;
        }

        // Insert into `recipes_ingredients` table
        await client.query(
          `INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity, unit)
           VALUES ($1, $2, $3, $4)`,
          [recipeId, ingredientId, quantity || null, unit || null]
        );

        console.log(`Inserted ingredient: ${name} with quantity: ${quantity}`);
      }
    }

    // Step 4: Commit the transaction
    await client.query('COMMIT');

    res.status(201).send("Recipe added successfully");
  } catch (error) {
    console.error("Error adding recipe:", error);

    // Rollback in case of error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error("Error during rollback:", rollbackError);
    }

    res.status(500).send("Error adding recipe");
  } finally {
    // Check if client.release() is a valid method for your db client
    if (client.release) {
      client.release();
    } else {
      console.log("client.release() is not a function, skipping release.");
    }
  }
});




// For example test *********************************/ 
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
/*************************************************** */

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
