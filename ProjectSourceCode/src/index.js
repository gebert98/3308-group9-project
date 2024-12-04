// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const fs = require('fs');

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
      console.log('Database not ready, retrying...', error, retries);
      retries--;
      await new Promise(r => setTimeout(r, interval)); // Wait before retry
    }
  }
  console.log('Failed to connect to the database after multiple attempts.');
  process.exit(1); // Exit if DB connection fails after retries
};

waitForDatabase();  // Wait for DB before starting the server


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

// Add recipe to recipe table and other relations:
app.post('/add_recipe', async (req, res) => {
  const { name, country, description, prep_time, cook_time, servings, difficulty } = req.body;
  const ingredientNames = req.body.ingredient_name;
  const quantities = req.body.quantity;
  const units = req.body.unit;

  try {
    // Start a transaction
    await db.query('BEGIN');

    // Insert recipe into `recipes` table
    const recipeResult = await db.query(
      `INSERT INTO recipes (name, description, country, prep_time, cook_time, servings, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [name, description, country, prep_time, cook_time, servings, difficulty]
    );

    const recipeId = recipeResult[0].id;
    const numIngredients = ingredientNames.length;

    // Loop through ingredients
    for (let i = 0; i < numIngredients; i++) {
      const ingredientName = ingredientNames[i]?.trim();
      const quantity = quantities[i] ? parseInt(quantities[i], 10) : null;
      const unit = units[i]?.trim();

      if (!ingredientName || !quantity || !unit) {
        throw new Error(`Invalid data at index ${i}: ingredientName: ${ingredientName}, quantity: ${quantity}, unit: ${unit}`);
      }


      // Insert or find ingredient in `ingredients` table
      const ingredientResult = await db.query(
        `INSERT INTO ingredients (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING
         RETURNING id`,
        [ingredientName]
      );

      let ingredientId;

      if (ingredientResult.length > 0) {
        ingredientId = ingredientResult[0].id;
      } else {
        // If no ID is returned, query for the ingredient ID
        const existingIngredient = await db.query(
          `SELECT id FROM ingredients WHERE name = $1`,
          [ingredientName]
        );

        if (existingIngredient.length === 0) {
          throw new Error(`Failed to retrieve ingredient ID for ${ingredientName}`);
        }

        ingredientId = existingIngredient[0].id;
      }

      // Insert into `recipes_ingredients` table
      await db.query(
        `INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity, unit)
         VALUES ($1, $2, $3, $4)`,
        [recipeId, ingredientId, quantity, unit]
      );
    }

    // Commit transaction
    await db.query('COMMIT');
    res.redirect('/');
  } catch (error) {
    // Rollback transaction on error
    
    await db.query('ROLLBACK');
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

        /*req.session.save(() => { //Duplicate why?

            res.redirect('/home');
        });*/

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send('Error during login');
    }
});

app.get('/home', (req, res) => { //TODO does this work?
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not logged in
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


// *********************************************************
// display recipe based on id

async function recipePage(id, req) {
  const query1 = 'SELECT * FROM recipes WHERE id = $1';
  const query2 = `
    SELECT
      i.name AS name,
      ri.quantity,
      ri.unit
    FROM recipes r
    JOIN recipes_ingredients ri ON r.id = ri.recipe_id
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE r.id = $1`;
  const query3 = "SELECT 1 FROM favorites WHERE user_id = $1 AND recipe_id = $2;";
  const results = await db.any (query1, [id]);
  const ingredients = await db.any(query2, [id]);

  const favorite = await db.any(query3, [req.session.user?req.session.user.id:-1, id]); // terrible way to do this but it works
  const favorited = (favorite.length > 0) ?true:false;

  //console.log(results + "\n" + ingredients);
  if(results.length == 0){
    return 404;
  }

  const logged = req.session.user ? true : false;

  const recipe = {

    id: results[0].id,
    name: results[0].name,
    description: results[0].description,
    instructions: results[0].instructions,
    ingredients: ingredients,
  }  
  return [recipe, logged, favorited];
}

app.get('/recipe/:id', async (req, res) => {

  try{
    const result = await recipePage(req.params.id,req);
    if(result == 404){
      return res.status(404).send('Error: No such recipe');
    }
    const recipe  = result[0];
    const logged = result[1];
    const favorited = result[2];
    console.log(result);
    res.render('pages/display_recipe', {recipe, logged, favorited});
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Database Error');
  }
});

//***************************************************
// toggle if a recipe is favorited or not

app.post('/favorite/:recipeId', async (req, res) => {
  //console.log("/favorite route");
  const recipe_id = req.params.recipeId;
  try {
    // This very long query just adds to favorite if it isn't already and removes from favorite if it is
    const query = `
      WITH upsert AS (
        INSERT INTO favorites (user_id, recipe_id)
        SELECT $1, $2
        WHERE NOT EXISTS (
          SELECT 1 FROM favorites WHERE user_id = $1 AND recipe_id = $2
        )
        RETURNING *
      )
      DELETE FROM favorites
      WHERE user_id = $1 AND recipe_id = $2 AND NOT EXISTS (SELECT 1 FROM upsert);
    `;
    //console.log("query starting");
    await db.query(query, [req.session.user.id, recipe_id]);
    //console.log("query completed");
    //await axios.get('http://localhost:3000/recipe/'+recipe_id);  
    //const result = await recipePage(recipe_id, req);

    res.redirect(`/recipe/${recipe_id}`);

    //if(result == 404){
      //return res.status(404).send('Error: No such recipe');
    //}
    //const recipe  = result[0];
    //const logged = result[1];
    //const favorited = result[2];
    //console.log(result);
    //res.render('pages/display_recipe', {recipe, logged, favorited});
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// For example test *********************************/ 
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
/*************************************************** */

// ------------------------------------- START SERVER -----------------------------------------------
const PORT = process.env.PORT || 3000;
module.exports = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
