#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://db_admin:2Q5uHfBNegpfN89zS80vVn3P6bLDBKGd@dpg-csvmift6l47c73dolq1g-a.oregon-postgres.render.com/recipes_db_st5o"

# Execute each .sql file in the directory
for file in init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done