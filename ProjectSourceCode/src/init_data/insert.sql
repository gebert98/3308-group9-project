-- Insert sample ingredients
INSERT INTO ingredients (name) VALUES
  ('Tomato'),
  ('Lettuce'),
  ('Chicken'),
  ('Cheese');

-- Insert sample recipes
INSERT INTO recipes (name, description, country, prep_time, cook_time, servings, difficulty) VALUES
  ('Chicken Caesar Salad', 
   'A classic Caesar salad with grilled chicken, lettuce, and Caesar dressing.',
   'United States of America',
   15, -- prep_time in minutes
   10, -- cook_time in minutes
   2,  -- servings
   'moderate'),
  ('Vegan Lettuce Wraps', 
   'Vegan lettuce wraps filled with fresh vegetables and a savory sauce.',
   'Thailand',
   10, -- prep_time
   0,  -- cook_time
   4,  -- servings
   'easy');

-- Link recipes to ingredients
INSERT INTO recipes_ingredients (quantity, unit, recipe_id, ingredient_id) VALUES
  -- Chicken Caesar Salad
  (1, 'piece', 
   (SELECT id FROM recipes WHERE name = 'Chicken Caesar Salad'), 
   (SELECT id FROM ingredients WHERE name = 'Chicken')),
  (2, 'leaves', 
   (SELECT id FROM recipes WHERE name = 'Chicken Caesar Salad'), 
   (SELECT id FROM ingredients WHERE name = 'Lettuce')),
  (1, 'slice', 
   (SELECT id FROM recipes WHERE name = 'Chicken Caesar Salad'), 
   (SELECT id FROM ingredients WHERE name = 'Cheese')),

  -- Vegan Lettuce Wraps
  (2, 'leaves', 
   (SELECT id FROM recipes WHERE name = 'Vegan Lettuce Wraps'), 
   (SELECT id FROM ingredients WHERE name = 'Lettuce')),
  (1, 'cup', 
   (SELECT id FROM recipes WHERE name = 'Vegan Lettuce Wraps'), 
   (SELECT id FROM ingredients WHERE name = 'Tomato'));

-- Insert sample countries
INSERT INTO countries (name) VALUES
  ('Italy'),
  ('Japan'),
  ('Mexico'),
  ('France'),
  ('India'),
  ('Brazil'),
  ('China'),
  ('Spain'),
  ('Thailand');

INSERT INTO countries (name) 
VALUES ('United States')
ON CONFLICT (name) DO NOTHING;

-- Insert recipe
INSERT INTO recipes (name, image_url, description, instructions, country, prep_time, cook_time)
VALUES (
    'Pozole', 
    '/images/uploads/pozole.png', 
    'A traditional Mexican soup, pozole is usually enjoyed around the holidays, but it makes a comforting, slightly spicy, slightly smoky dish throughout the year, topped with diced avocado and a dollop of sour cream.',
    'In a Dutch oven, saute chiles in 1 tablespoon oil over medium heat until heated through, 1-2 minutes, pressing with a spatula (do not brown). Using a slotted spoon, transfer chiles to a bowl; add the boiling water. Soak until softened, about 20 minutes. Remove stems and seeds, reserving water. In the Dutch oven, brown pork in remaining 1 tablespoon oil in batches, sauteing onion and garlic with the last batch of pork. Return all pork to pan and add broth. Bring to a boil. Reduce heat; cover and simmer until meat is tender, about 30 minutes. Transfer chiles and soaking liquid to a blender; cover and process until smooth. Strain through a fine strainer, reserving pulp and discarding skins. Add pulp to pork mixture. Stir in hominy, oregano and salt. Cover and simmer for 20 minutes. Serve with optional toppings as desired.',
    'Mexico', 
    15, 
    65
)
RETURNING id;

-- Ingredients for Pozole
INSERT INTO ingredients (name) VALUES ('dried guajillo or pasilla chiles') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('dried ancho chiles') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('canola oil') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('boneless pork cubed') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('chopped onion') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('garlic cloves minced') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('chicken broth') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('hominy') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('dried Mexican oregano') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('salt') ON CONFLICT (name) DO NOTHING;

-- Link ingredients to Pozole (example with the recipe_id from the first insert)
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES 
    (3, (SELECT id FROM ingredients WHERE name = 'dried guajillo or pasilla chiles'), 4, NULL),
    (3, (SELECT id FROM ingredients WHERE name = 'dried ancho chiles'), 4, NULL),
    (3, (SELECT id FROM ingredients WHERE name = 'canola oil'), 2, 'tablespoons'),
    (3, (SELECT id FROM ingredients WHERE name = 'boneless pork cubed'), 2, 'pounds'),
    (3, (SELECT id FROM ingredients WHERE name = 'chopped onion'), 1, 'cup'),
    (3, (SELECT id FROM ingredients WHERE name = 'garlic cloves minced'), 4, 'cloves'),
    (3, (SELECT id FROM ingredients WHERE name = 'chicken broth'), 3, 'cups'),
    (3, (SELECT id FROM ingredients WHERE name = 'hominy'), 2, 'cans'),
    (3, (SELECT id FROM ingredients WHERE name = 'dried Mexican oregano'), 1.5, 'teaspoons'),
    (3, (SELECT id FROM ingredients WHERE name = 'salt'), 1, 'teaspoon');

-- Insert recipe
INSERT INTO recipes (name, image_url, description, instructions, country, prep_time, cook_time)
VALUES (
    'Kizaka', 
    '/images/uploads/kizaka.png', 
    'Kizaka is a healthy, and authentic plant-based dish that is also wildly popular in Angola. I found cassava leaves at a local African grocer, but chopped spinach would also make a good substitute.',
    'Cook the greens in boiling water till soft. In frying pan, sauté the onions until clear, add garlic and ginger until soft and aromatic. Add tomatoes and cook until tender Add peanut powder/butter and continue cooking for 5 minutes. Combine with the greens (or stir in the chopped spinach and broth) and mix with salt, pepper, and red pepper flakes. Serve with rice!',
    'Angola', 
    20, 
    15
)
RETURNING id;

-- Ingredients for Kizaka
INSERT INTO ingredients (name) VALUES ('Vegetable oil') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Onion') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Cassava leaves') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Peanut powder') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Garlic') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Ginger') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Vegetable broth') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Tomatoes') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Salt') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Pepper') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Red pepper flakes') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Rice') ON CONFLICT (name) DO NOTHING;

-- Link ingredients to Kizaka
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES 
    (4, (SELECT id FROM ingredients WHERE name = 'Vegetable oil'), 1, 'teaspoon'),
    (4, (SELECT id FROM ingredients WHERE name = 'Onion'), 1, NULL),
    (4, (SELECT id FROM ingredients WHERE name = 'Cassava leaves'), 1, 'pound'),
    (4, (SELECT id FROM ingredients WHERE name = 'Peanut powder'), 1, 'cup'),
    (4, (SELECT id FROM ingredients WHERE name = 'Garlic'), 3, 'cloves'),
    (4, (SELECT id FROM ingredients WHERE name = 'Ginger'), 1, 'cube inch'),
    (4, (SELECT id FROM ingredients WHERE name = 'Vegetable broth'), 1, 'cup'),
    (4, (SELECT id FROM ingredients WHERE name = 'Tomatoes'), 3, NULL),
    (4, (SELECT id FROM ingredients WHERE name = 'Salt'), 1, 'teaspoon'),
    (4, (SELECT id FROM ingredients WHERE name = 'Pepper'), 1, 'teaspoon'),
    (4, (SELECT id FROM ingredients WHERE name = 'Red pepper flakes'), 1, 'teaspoon'),
    (4, (SELECT id FROM ingredients WHERE name = 'Rice'), 2, 'cups');
-- Insert recipe
INSERT INTO recipes (name, image_url, description, instructions, country, prep_time, cook_time)
VALUES (
    'Onigiri', 
    '/images/uploads/Onigiri.png', 
    'Onigiri is basically a rice ball wrapped in black seaweed. It is one of the most popular snacks, sold at every supermarket and every konbini! The most famous traditional Japanese dishes are relatively easy to make and usually contain some salt and ingredients or filings in the rice balls, such as grilled salmon, pickled plum, or spicy cod roe.', 
    'Cook the rice. Prepare filling. Shape the rice around the filling and wrap with the nori.',
    'Japan', 
    5, 
    15
)
RETURNING id;

-- Ingredients for Onigiri
INSERT INTO ingredients (name) VALUES ('Rice') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Nori') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name) VALUES ('Fillings') ON CONFLICT (name) DO NOTHING;

-- Link ingredients to Onigiri
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES 
    (5, (SELECT id FROM ingredients WHERE name = 'Rice'), 1, 'cup'),
    (5, (SELECT id FROM ingredients WHERE name = 'Nori'), 5, 'pieces'),
    (5, (SELECT id FROM ingredients WHERE name = 'Fillings'), 2, 'cups');
