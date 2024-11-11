<<<<<<< Updated upstream
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(50) PRIMARY KEY,
  password CHAR(60) NOT NULL  
);
=======
CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "username" varchar(50),
  "hashed_password" char(60) NOT NULL,
  "email" varchar(50),
  "created_at" timestamp
);

CREATE TABLE "recipes" (
  "id" integer PRIMARY KEY,
  "name" varchar(100),
  "description" varchar(4000),
  "instructions" varchar(MAX)
);

CREATE TABLE "ingredients" (
  "id" integer PRIMARY KEY,
  "name" varchar(100),
  "vegetarian" bool,
  "vegan" bool
);

CREATE TABLE "favorites" (
  "user_id" integer,
  "recipe_id" integer
);

CREATE TABLE "recipes_ingredients" (
  "recipe_id" integer,
  "ingredient_id" integer
);

ALTER TABLE "favorites" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "favorites" ADD FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id");

ALTER TABLE "recipes_ingredients" ADD FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id");

ALTER TABLE "recipes_ingredients" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id");
>>>>>>> Stashed changes
