#!/bin/bash
TEACHER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZTk4ZjE1NTg5Y2Y0OWNjZGY5MTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk0MDUwNTYsImV4cCI6MTc0OTQwODY1Nn0.qS2AvGw61_mgOHvj8bmEIwHdB56l_YLX-7CtLdRHtxg


echo -e "\n\n68. Testing with UTF-8 middleware (simple characters first)..."
curl -X POST "http://localhost:3000/api/subjects" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  --data-raw '{
    "name": "Francais Simple",
    "icon": "📚",
    "color": "#FF5722",
    "description": "Cours de francais sans accents pour test",
    "series": ["6eme"],
    "category": "langues",
    "tags": ["francais", "grammaire", "litterature"]
  }'

echo -e "\n\n69. Alternative approach - try with JSON escape sequences..."
curl -X POST "http://localhost:3000/api/subjects" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  --data-raw '{
    "name": "Fran\u00e7ais Unicode",
    "icon": "📚", 
    "color": "#FF5722",
    "description": "Cours de fran\u00e7ais avec unicode: \u00e9 \u00e8 \u00e0 \u00e7",
    "series": ["6\u00e8me"],
    "category": "langues",
    "tags": ["fran\u00e7ais", "grammaire", "litt\u00e9rature"]
  }'

echo -e "\n\n70. Testing search and list to verify encoding..."
curl -X GET "http://localhost:3000/api/subjects?category=langues&limit=3" \
  -H "Accept: application/json"
