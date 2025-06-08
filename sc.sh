#!/bin/bash
TEACHER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZTk4ZjE1NTg5Y2Y0OWNjZGY5MTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk0MDUwNTYsImV4cCI6MTc0OTQwODY1Nn0.qS2AvGw61_mgOHvj8bmEIwHdB56l_YLX-7CtLdRHtxg

echo -e "\n71. Testing search with French special characters (CORRECTED)..."
curl -X GET "http://localhost:3000/api/subjects/search?query=fran%C3%A7ais" \
  -H "Accept: application/json"

echo -e "\n\n72. Testing search with Unicode escapes..."
curl -X GET "http://localhost:3000/api/subjects/search?query=Fran\u00e7ais" \
  -H "Accept: application/json"

echo -e "\n\n73. Testing search for Unicode subjects we created..."
curl -X GET "http://localhost:3000/api/subjects/search?query=Unicode" \
  -H "Accept: application/json"

echo -e "\n\n74. Testing search suggestions with French..."
curl -X GET "http://localhost:3000/api/subjects/search/suggestions?q=fran" \
  -H "Accept: application/json"

echo -e "\n\n75. Testing search for math subjects..."
curl -X GET "http://localhost:3000/api/subjects/search?query=math%C3%A9matiques" \
  -H "Accept: application/json"

echo -e "\n\n76. Testing category search with accents..."
curl -X GET "http://localhost:3000/api/subjects/search?category=langues&query=fran%C3%A7ais" \
  -H "Accept: application/json"

echo -e "\n\n=== French Character Search Tests Complete ==="