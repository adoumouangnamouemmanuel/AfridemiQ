#!/bin/bash
# create-geography-quizzes.sh

admin_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODU2OWM2Mzc0MzYxMmJjOGExMWRmOWYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTA1NTQ0NTEsImV4cCI6MTc1MDU1ODA1MX0.VJqGHCaXV4FLSX1S0jiOPFjTBpHbh4P8v1XWp6MUKJI" 


echo "Creating 3 Geography Physical Geography of Africa quizzes..."

for i in {1..3}; do
  echo "Creating Geography quiz $i..."
  curl -X POST http://localhost:3000/api/v1/quizzes \
    -H "Content-Type: application/json; charset=utf-8" \
    -H "Authorization: Bearer $admin_token" \
    -d @geo-quiz-$i.json
  echo ""
done

echo "All Geography quizzes created successfully!"