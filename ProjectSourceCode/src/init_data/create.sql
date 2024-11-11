CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password CHAR(60) NOT NULL,
  email VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes ( -- didn't add location bc format is still unsure
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(4000),
  instructions TEXT -- idk if I should use text here. seem to remember we weren't supposed to ? 
);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
  vegan BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS recipes_to_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    quantity DECIMAL(5, 2),
    unit VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER,
  recipe_id INTEGER
);

CREATE TABLE IF NOT EXISTS recipes_ingredients (
  quantity INTEGER,
  unit varchar(50),
  recipe_id INTEGER,
  ingredient_id INTEGER
);

-- Adding foreign keys, this should make sure that they are deleted from connected tables too
ALTER TABLE favorites ADD FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
ALTER TABLE favorites ADD FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE;

ALTER TABLE recipes_ingredients ADD FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE;
ALTER TABLE recipes_ingredients ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE;

