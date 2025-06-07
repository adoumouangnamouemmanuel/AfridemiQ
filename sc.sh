#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api/exams"
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZTk4ZjE1NTg5Y2Y0OWNjZGY5MTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDkyNTcyNDYsImV4cCI6MTc0OTI2MDg0Nn0.0j_E9dqQlt2m-_cr2eUI41eVYYzgBgcRNjVUqMOO-1s"  # Replace with your admin JWT token

# Create exam payload
curl -X POST "${API_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d "{
    \"name\": \"Baccalaureat\",
    \"description\": \"Examen national de fin d'etudes secondaires\",
    \"icon\": \"graduation-cap\",
    \"color\": \"#1E88E5\",
    \"examType\": \"certification\",
    \"difficulty\": \"moyen\",
    \"country\": \"France\",
    \"levels\": [\"Terminale\"],
    \"curriculumId\": \"684397535b0d7c35e0ccf2fb\",
    \"examFormat\": \"papier\",
    \"primaryLanguage\": \"francais\",
    \"importantDates\": [
      {
        \"type\": \"inscription\",
        \"date\": \"2024-09-01\",
        \"description\": \"Date limite d'inscription\"
      },
      {
        \"type\": \"examen\",
        \"date\": \"2024-06-15\",
        \"description\": \"Date de l'examen\"
      }
    ],
    \"registrationRequirements\": {
      \"minimumAge\": 17,
      \"requiredDocuments\": [
        \"Carte d'identite\",
        \"Certificat de scolarite\"
      ],
      \"fees\": {
        \"amount\": 50,
        \"currency\": \"EUR\"
      }
    },
    \"series\": [
      {
        \"id\": \"serie-s\",
        \"name\": \"Serie S\",
        \"description\": \"Serie scientifique\",
        \"coefficient\": 1,
        \"duration\": 180,
        \"totalMarks\": 100,
        \"passingMarks\": 50,
        \"subjects\": []
      }
    ]
  }"