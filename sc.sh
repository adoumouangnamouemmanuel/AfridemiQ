#!/bin/bash
TEACHER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZTk4ZjE1NTg5Y2Y0OWNjZGY5MTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk0MDE0MjUsImV4cCI6MTc0OTQwNTAyNX0.pW2mAAuUV0M8DE1vGMg84Nv_UXw0dTBBS913xs_uKAc

echo -e "\n=== PUT/UPDATE tests completed! ==="

echo -e "\n=== Testing DELETE Operations ==="

echo -e "\n31. Testing soft delete of a subject..."
curl -X DELETE "http://localhost:3000/api/subjects/6845be1c87d397f288291a12" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

echo -e "\n32. Verifying subject is soft deleted (should not appear in active list)..."
curl -X GET "http://localhost:3000/api/subjects?category=sciences" \
  -H "Accept: application/json"

echo -e "\n33. Getting deleted subject by ID (should still work but show isActive: false)..."
curl -X GET "http://localhost:3000/api/subjects/6845be1c87d397f288291a12" \
  -H "Accept: application/json"

echo -e "\n34. Testing delete with non-existent ID..."
curl -X DELETE "http://localhost:3000/api/subjects/507f1f77bcf86cd799439999" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

echo -e "\n35. Testing delete without authentication..."
curl -X DELETE "http://localhost:3000/api/subjects/6845bdc687d397f288291a08" \
  -H "Accept: application/json"

echo -e "\n36. Testing delete with invalid ID format..."
curl -X DELETE "http://localhost:3000/api/subjects/invalid-id" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

echo -e "\n=== Testing Advanced Search and Analytics ==="

echo -e "\n37. Testing advanced search with multiple filters..."
curl -X GET "http://localhost:3000/api/subjects/search?query=mathematiques&category=mathematiques&difficulty=moyen&minRating=3" \
  -H "Accept: application/json"

echo -e "\n38. Testing search suggestions..."
curl -X GET "http://localhost:3000/api/subjects/search/suggestions?q=math" \
  -H "Accept: application/json"

echo -e "\n39. Testing trending subjects..."
curl -X GET "http://localhost:3000/api/subjects/trending?period=week&limit=5" \
  -H "Accept: application/json"

echo -e "\n40. Testing subject analytics..."
curl -X GET "http://localhost:3000/api/subjects/analytics" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

echo -e "\n41. Testing subject comparison..."
curl -X POST "http://localhost:3000/api/subjects/compare" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "ids": ["6845bdc687d397f288291a05", "6845bdc687d397f288291a08"]
  }'

echo -e "\n=== Testing Exam Management ==="

echo -e "\n42. Testing add exam to subject (will fail since exam doesn'\''t exist)..."
curl -X POST "http://localhost:3000/api/subjects/6845bdc687d397f288291a05/exams" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "examId": "507f1f77bcf86cd799439011"
  }'

echo -e "\n43. Testing remove exam from subject..."
curl -X DELETE "http://localhost:3000/api/subjects/6845bdc687d397f288291a05/exams/507f1f77bcf86cd799439011" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

echo -e "\n=== Testing Bulk Operations ==="

echo -e "\n44. Testing bulk create subjects..."
curl -X POST "http://localhost:3000/api/subjects/bulk" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "subjects": [
      {
        "name": "Informatique Avancee",
        "icon": "💻",
        "color": "#2196F3",
        "description": "Cours d'\''informatique avancee",
        "series": ["C", "E"],
        "category": "technologie",
        "difficulty": "difficile",
        "estimatedHours": 180,
        "tags": ["informatique", "programmation", "algorithmes"]
      },
      {
        "name": "Arts Visuels",
        "icon": "🎭",
        "color": "#E91E63",
        "description": "Cours d'\''arts visuels et design",
        "series": ["L", "Arts"],
        "category": "arts",
        "difficulty": "moyen",
        "estimatedHours": 140,
        "tags": ["arts", "design", "creativite"]
      }
    ]
  }'

echo -e "\n45. Testing bulk update subjects..."
curl -X PUT "http://localhost:3000/api/subjects/bulk" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "updates": [
      {
        "id": "6845bdc687d397f288291a05",
        "data": {
          "tags": ["algebre", "mathematiques", "equations", "matrices", "bulk-updated"]
        }
      },
      {
        "id": "6845bdc687d397f288291a08",
        "data": {
          "description": "Physique quantique mise a jour en bulk"
        }
      }
    ]
  }'

echo -e "\n46. Testing subject export..."
curl -X GET "http://localhost:3000/api/subjects/export?format=json&category=mathematiques" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

echo -e "\n=== Testing Edge Cases and Performance ==="

echo -e "\n47. Testing pagination with large page number..."
curl -X GET "http://localhost:3000/api/subjects?page=999&limit=5" \
  -H "Accept: application/json"

echo -e "\n48. Testing search with special characters..."
curl -X GET "http://localhost:3000/api/subjects?search=mathématiques%20algèbre" \
  -H "Accept: application/json"

echo -e "\n49. Testing subjects with sorting by multiple criteria..."
curl -X GET "http://localhost:3000/api/subjects?sortBy=popularity&sortOrder=desc&limit=3" \
  -H "Accept: application/json"

echo -e "\n50. Testing subject stats and performance..."
curl -X GET "http://localhost:3000/api/subjects/6845bdc687d397f288291a05/performance" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

echo -e "\n=== Final verification - Get all subjects summary ==="
curl -X GET "http://localhost:3000/api/subjects?limit=5&sortBy=updatedAt&sortOrder=desc" \
  -H "Accept: application/json"

echo -e "\n=== COMPREHENSIVE SUBJECT API TESTING COMPLETED! ==="
echo -e "Summary of tests performed:"
echo -e "✅ POST (Create) - Basic, validation, authentication"
echo -e "✅ GET (Read) - All subjects, by ID, by series, filtering, pagination"
echo -e "✅ PUT (Update) - Partial updates, validation, authentication"
echo -e "✅ DELETE (Soft Delete) - Subject deactivation"
echo -e "✅ Rating System - Add ratings, validation, average calculation"
echo -e "✅ Advanced Search - Multi-criteria search, suggestions"
echo -e "✅ Analytics - Performance metrics, trending subjects"
echo -e "✅ Bulk Operations - Create, update, export multiple subjects"
echo -e "✅ Edge Cases - Invalid inputs, authentication, large datasets"
echo -e "✅ Exam Management - Add/remove exams (basic structure)"