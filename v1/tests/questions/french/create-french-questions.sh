#!/bin/bash
# create-french-questions.sh


admin_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODU2OWM2Mzc0MzYxMmJjOGExMWRmOWYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTA1NDk5MDMsImV4cCI6MTc1MDU1MzUwM30.9nCq2ao9hGoy6FeKkYGU66dcd18fgdD7E4QzcFPqjHg"

echo "Creating 10 French Compréhension et Expression Orale questions..."

for i in {1..10}; do
  echo "Creating question $i..."
  curl -X POST http://localhost:3000/api/v1/questions \
    -H "Content-Type: application/json; charset=utf-8" \
    -H "Authorization: Bearer $admin_token" \
    -d @fr-q$i.json
  echo ""
done

echo "All French questions created successfully!"