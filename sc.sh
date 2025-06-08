#!/bin/bash

echo -e "\n=== USER PROFILE TESTS ==="

echo -e "\n1. Creating a test user for profile tests..."
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/users/register" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "name": "Profile Test User",
    "email": "profile.test@example.com",
    "password": "password123",
    "phoneNumber": "+33123456789",
    "country": "France",
    "role": "student"
  }')

echo "$REGISTER_RESPONSE"

echo -e "\n\n2. Logging in to get token..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/users/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "email": "profile.test@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE"

# Extract token from login response
USER_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo -e "\nExtracted Token: $USER_TOKEN"

echo -e "\n\n3. Getting user profile..."
if [ ! -z "$USER_TOKEN" ]; then
  curl -X GET "http://localhost:3000/api/users/profile" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $USER_TOKEN"
else
  echo "No token available for profile test"
fi

echo -e "\n\n4. Updating user profile..."
if [ ! -z "$USER_TOKEN" ]; then
  curl -X PUT "http://localhost:3000/api/users/profile" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json; charset=utf-8" \
    -H "Authorization: Bearer $USER_TOKEN" \
    --data-raw '{
      "name": "Updated Profile User",
      "timeZone": "Europe/Paris",
      "preferredLanguage": "fr",
      "gradeLevel": "Terminale S",
      "schoolName": "Lycée Test"
    }'
fi

echo -e "\n\n5. Getting updated profile to verify changes..."
if [ ! -z "$USER_TOKEN" ]; then
  curl -X GET "http://localhost:3000/api/users/profile" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $USER_TOKEN"
fi

echo -e "\n\n6. Testing profile access without token (should fail)..."
curl -X GET "http://localhost:3000/api/users/profile" \
  -H "Accept: application/json"

echo -e "\n\n7. Testing profile access with invalid token (should fail)..."
curl -X GET "http://localhost:3000/api/users/profile" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer invalid.token.here"

echo -e "\n\n=== USER PROFILE TESTS COMPLETE ==="