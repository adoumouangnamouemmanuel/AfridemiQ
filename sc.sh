#!/bin/bash

echo -e "\n=== USER REGISTRATION & LOGIN TESTS ==="

echo -e "\n1. Testing basic student registration..."
STUDENT_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/users/register" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "name": "Alice Dubois",
    "email": "alice.dubois@example.com",
    "password": "password123",
    "phoneNumber": "+33654321987",
    "country": "France",
    "role": "student"
  }')

echo "$STUDENT_RESPONSE"

echo -e "\n\n2. Testing teacher registration with additional fields..."
TEACHER_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/users/register" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "name": "Pierre Martin",
    "email": "pierre.martin@lycee.fr", 
    "password": "professor123",
    "phoneNumber": "+33123456789",
    "country": "France",
    "role": "teacher",
    "schoolName": "Lycée Voltaire",
    "gradeLevel": "Seconde"
  }')

echo "$TEACHER_RESPONSE"

echo -e "\n\n3. Testing student login..."
STUDENT_LOGIN=$(curl -s -X POST "http://localhost:3000/api/users/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "email": "alice.dubois@example.com",
    "password": "password123"
  }')

echo "$STUDENT_LOGIN"

echo -e "\n\n4. Testing teacher login..."
TEACHER_LOGIN=$(curl -s -X POST "http://localhost:3000/api/users/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "email": "pierre.martin@lycee.fr",
    "password": "professor123"
  }')

echo "$TEACHER_LOGIN"

echo -e "\n\n5. Testing duplicate email registration (should fail)..."
curl -X POST "http://localhost:3000/api/users/register" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "name": "Another User",
    "email": "alice.dubois@example.com",
    "password": "different123",
    "country": "Belgium"
  }'

echo -e "\n\n6. Testing invalid credentials login (should fail)..."
curl -X POST "http://localhost:3000/api/users/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "email": "alice.dubois@example.com",
    "password": "wrongpassword"
  }'

echo -e "\n\n7. Testing invalid email format (should fail)..."
curl -X POST "http://localhost:3000/api/users/register" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "name": "Invalid User",
    "email": "not-an-email",
    "password": "password123",
    "country": "France"
  }'

echo -e "\n\n8. Testing missing required fields (should fail)..."
curl -X POST "http://localhost:3000/api/users/register" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw '{
    "name": "Incomplete User",
    "email": "incomplete@example.com"
  }'

echo -e "\n\n=== REGISTRATION & LOGIN TESTS COMPLETE ==="