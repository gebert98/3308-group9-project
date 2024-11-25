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
   'USA',
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
  ('United States'),
  ('Italy'),
  ('Japan'),
  ('Mexico'),
  ('France'),
  ('India'),
  ('Brazil'),
  ('China'),
  ('Spain'),
  ('Thailand');
