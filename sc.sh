#!/bin/bash

echo "=== EXAM PREP API TESTING ==="
echo ""

# Set base URL
BASE_URL="http://localhost:3000/api"

echo "2. Logging in Admin User..."
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@examprep.com",
    "password": "AdminPass123!"
  }')

echo "Login Response: $LOGIN_RESPONSE"
echo ""

# Extract JWT token from login response
JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    echo "Failed to get JWT token. Using fallback token..."
    JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ2YTM0ZTg5ODA5MzlmNzM3OWU2Y2UiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk0NTk3OTAsImV4cCI6MTc0OTQ2MzM5MH0.qrU52nlzFKTuJtRwRZplWKf0Nmf5gO6wK07Fzrlv2LQ"
    USER_ID="6846a34e8980939f7379e6ce"
fi

echo "JWT Token extracted: ${JWT_TOKEN:0:50}..."
echo "User ID: $USER_ID"
echo ""

echo "3. Creating Curriculum 1 - Cameroon Primary..."
CURRICULUM1_RESPONSE=$(curl -s -X POST ${BASE_URL}/curricula \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "country": "Cameroun",
    "educationLevel": "primaire",
    "series": ["CP", "CE1", "CE2", "CM1", "CM2"],
    "subjects": [],
    "academicYear": {
      "startDate": "2024-09-01T00:00:00.000Z",
      "endDate": "2025-06-30T23:59:59.999Z",
      "terms": [
        {
          "term": 1,
          "startDate": "2024-09-01T00:00:00.000Z",
          "endDate": "2024-12-20T23:59:59.999Z",
          "holidays": [
            {
              "name": "Vacances de Noël",
              "startDate": "2024-12-21T00:00:00.000Z",
              "endDate": "2025-01-05T23:59:59.999Z"
            }
          ]
        },
        {
          "term": 2,
          "startDate": "2025-01-06T00:00:00.000Z",
          "endDate": "2025-03-25T23:59:59.999Z",
          "holidays": [
            {
              "name": "Vacances de Pâques",
              "startDate": "2025-03-26T00:00:00.000Z",
              "endDate": "2025-04-10T23:59:59.999Z"
            }
          ]
        },
        {
          "term": 3,
          "startDate": "2025-04-11T00:00:00.000Z",
          "endDate": "2025-06-30T23:59:59.999Z",
          "holidays": []
        }
      ]
    }
  }')

echo "Curriculum 1 Response: $CURRICULUM1_RESPONSE"
echo ""

echo "4. Creating Curriculum 2 - France Secondary..."
CURRICULUM2_RESPONSE=$(curl -s -X POST ${BASE_URL}/curricula \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "country": "France",
    "educationLevel": "secondaire",
    "series": ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"],
    "subjects": [],
    "academicYear": {
      "startDate": "2024-09-02T00:00:00.000Z",
      "endDate": "2025-07-08T23:59:59.999Z",
      "terms": [
        {
          "term": 1,
          "startDate": "2024-09-02T00:00:00.000Z",
          "endDate": "2024-12-20T23:59:59.999Z",
          "holidays": [
            {
              "name": "Vacances de Noël",
              "startDate": "2024-12-21T00:00:00.000Z",
              "endDate": "2025-01-06T23:59:59.999Z"
            }
          ]
        },
        {
          "term": 2,
          "startDate": "2025-01-07T00:00:00.000Z",
          "endDate": "2025-04-25T23:59:59.999Z",
          "holidays": [
            {
              "name": "Vacances de Printemps",
              "startDate": "2025-04-26T00:00:00.000Z",
              "endDate": "2025-05-12T23:59:59.999Z"
            }
          ]
        },
        {
          "term": 3,
          "startDate": "2025-05-13T00:00:00.000Z",
          "endDate": "2025-07-08T23:59:59.999Z",
          "holidays": []
        }
      ]
    }
  }')

echo "Curriculum 2 Response: $CURRICULUM2_RESPONSE"
echo ""

echo "5. Creating Curriculum 3 - Senegal Higher Education..."
CURRICULUM3_RESPONSE=$(curl -s -X POST ${BASE_URL}/curricula \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "country": "Sénégal",
    "educationLevel": "superieur",
    "series": ["L1", "L2", "L3", "M1", "M2"],
    "subjects": [],
    "academicYear": {
      "startDate": "2024-10-01T00:00:00.000Z",
      "endDate": "2025-07-31T23:59:59.999Z",
      "terms": [
        {
          "term": 1,
          "startDate": "2024-10-01T00:00:00.000Z",
          "endDate": "2025-01-31T23:59:59.999Z",
          "holidays": [
            {
              "name": "Vacances de fin d année",
              "startDate": "2024-12-24T00:00:00.000Z",
              "endDate": "2025-01-02T23:59:59.999Z"
            }
          ]
        },
        {
          "term": 2,
          "startDate": "2025-02-01T00:00:00.000Z",
          "endDate": "2025-07-31T23:59:59.999Z",
          "holidays": [
            {
              "name": "Vacances de Korité",
              "startDate": "2025-04-10T00:00:00.000Z",
              "endDate": "2025-04-12T23:59:59.999Z"
            }
          ]
        }
      ]
    }
  }')

echo "Curriculum 3 Response: $CURRICULUM3_RESPONSE"
echo ""

echo "6. Testing Curriculum Endpoints..."
echo ""

echo "6.1 Get all curricula..."
curl -s -X GET "${BASE_URL}/curricula?page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/curricula?page=1&limit=10" -H "Authorization: Bearer $JWT_TOKEN"
echo ""

echo "6.2 Get curricula by country Cameroun..."
curl -s -X GET "${BASE_URL}/curricula/country/Cameroun" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/curricula/country/Cameroun" -H "Authorization: Bearer $JWT_TOKEN"
echo ""

echo "6.3 Get curriculum statistics..."
curl -s -X GET "${BASE_URL}/curricula/stats" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/curricula/stats" -H "Authorization: Bearer $JWT_TOKEN"
echo ""

echo "=== TESTING COMPLETED ==="