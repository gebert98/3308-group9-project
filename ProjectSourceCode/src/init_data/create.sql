-- Drop tables if they exist
DROP TABLE IF EXISTS recipes_ingredients CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password CHAR(60) NOT NULL,
  email VARCHAR(50) UNIQUE
);

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  image_url TEXT DEFAULT '/images/default.png',
  description TEXT,
  instructions TEXT,
  country VARCHAR(100),
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER,
  recipe_id INTEGER,
  UNIQUE(user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS recipes_ingredients (
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity INTEGER,
  unit VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Adding foreign keys, this should make sure that they are deleted from connected tables too
ALTER TABLE favorites ADD FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
ALTER TABLE favorites ADD FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE;

ALTER TABLE recipes_ingredients ADD FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE;
ALTER TABLE recipes_ingredients ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE;
