CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password CHAR(60) NOT NULL,
  email VARCHAR(50) UNIQUE
);

CREATE TABLE IF NOT EXISTS recipes ( -- didn't add location bc format is still unsure
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(4000),
  instructions TEXT, -- idk if I should use text here. seem to remember we weren't supposed to ?
  country VARCHAR(100),
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
  vegan BOOLEAN NOT NULL DEFAULT FALSE
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

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Adding foreign keys, this should make sure that they are deleted from connected tables too
ALTER TABLE favorites ADD FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
ALTER TABLE favorites ADD FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE;

ALTER TABLE recipes_ingredients ADD FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE;
ALTER TABLE recipes_ingredients ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE;

