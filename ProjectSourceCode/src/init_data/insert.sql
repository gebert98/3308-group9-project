
-- THE FOLLOWING IS AI GENERATED FILLER FOR TESTING PURPOSES!

-- Insert sample ingredients
INSERT INTO ingredients (name, vegetarian, vegan) VALUES
  ('Tomato', TRUE, TRUE),
  ('Lettuce', TRUE, TRUE),
  ('Chicken', FALSE, FALSE),
  ('Cheese', TRUE, FALSE);

-- Insert sample recipes
INSERT INTO recipes (name, description, instructions) VALUES
  ('Chicken Caesar Salad', 
   'A classic Caesar salad with grilled chicken, lettuce, and Caesar dressing.',
   '1. Grill the chicken. 2. Toss lettuce with Caesar dressing. 3. Add grilled chicken and cheese.'),
  ('Vegan Lettuce Wraps', 
   'Vegan lettuce wraps filled with fresh vegetables and a savory sauce.',
   '1. Prepare the vegetables. 2. Toss with soy sauce and sesame oil. 3. Wrap in lettuce leaves.');

-- Link recipes to ingredients
INSERT INTO recipes_ingredients (quantity, unit, recipe_id, ingredient_id) VALUES
  (1, 'piece', 1, (SELECT id FROM ingredients WHERE name = 'Chicken')), -- Chicken Caesar Salad
  (2, 'leaves', 1, (SELECT id FROM ingredients WHERE name = 'Lettuce')), 
  (1, 'slice', 1, (SELECT id FROM ingredients WHERE name = 'Cheese')), 
  (2, 'leaves', 2, (SELECT id FROM ingredients WHERE name = 'Lettuce')), -- Vegan Lettuce Wraps
  (1, 'cup', 2, (SELECT id FROM ingredients WHERE name = 'Tomato')), 
  (1, 'tbsp', 2, (SELECT id FROM ingredients WHERE name = 'Lettuce')); 


