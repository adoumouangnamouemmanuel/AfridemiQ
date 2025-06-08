#!/bin/bash

# Test rating a subject with various ratings
echo "=== Testing Subject Rating Functionality ==="

SUBJECT_ID="6842e5c790fdcf8871bde677"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQzNmY3NTJjM2E2NDYzMzgyOWQxNjUiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc0OTM5Mjc1NCwiZXhwIjoxNzQ5Mzk2MzU0fQ.hEydwYEmg_-2jm6UkGig2MKsHdE-8Cs3UdRE1puB424"

echo "1. Adding rating of 5..."
curl -X POST "http://localhost:3000/api/subjects/$SUBJECT_ID/rate" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"rating": 5}' | jq '.data.rating'

echo -e "\n2. Adding rating of 3..."
curl -X POST "http://localhost:3000/api/subjects/$SUBJECT_ID/rate" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"rating": 3}' | jq '.data.rating'

echo -e "\n3. Adding rating of 1..."
curl -X POST "http://localhost:3000/api/subjects/$SUBJECT_ID/rate" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"rating": 1}' | jq '.data.rating'

echo -e "\n4. Final subject data with updated rating:"
curl -X GET "http://localhost:3000/api/subjects/$SUBJECT_ID" \
  -H "Accept: application/json" | jq '.data | {name, rating, popularity}'

echo -e "\n=== Rating tests completed! ==="