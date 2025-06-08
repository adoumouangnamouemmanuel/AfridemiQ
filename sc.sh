#!/bin/bash
TEACHER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZTk4ZjE1NTg5Y2Y0OWNjZGY5MTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk0MDE0MjUsImV4cCI6MTc0OTQwNTAyNX0.pW2mAAuUV0M8DE1vGMg84Nv_UXw0dTBBS913xs_uKAc



echo -e "\n57. Testing bulk create (fixed route)..."
curl -X POST "http://localhost:3000/api/subjects/bulk" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "subjects": [
      {
        "name": "Test Bulk Subject 1",
        "icon": "📚",
        "color": "#FF0000",
        "description": "First bulk test subject",
        "series": ["A"],
        "category": "sciences"
      },
      {
        "name": "Test Bulk Subject 2", 
        "icon": "📝",
        "color": "#00FF00",
        "description": "Second bulk test subject",
        "series": ["C"],
        "category": "mathematiques"
      }
    ]
  }'

# echo -e "\n58. Testing export (fixed route)..."
# curl -X GET "http://localhost:3000/api/subjects/export?format=json&category=mathematiques" \
#   -H "Accept: application/json" \
#   -H "Authorization: Bearer $TEACHER_TOKEN"

# echo -e "\n=== Advanced Search Tests ==="

# echo -e "\n59. Testing basic text search..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=mathematiques" \
#   -H "Accept: application/json"

# echo -e "\n60. Testing multi-criteria search..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=algebre&category=mathematiques&difficulty=moyen&series=C&minRating=3" \
#   -H "Accept: application/json"

# echo -e "\n61. Testing search with tags filter..."
# curl -X GET "http://localhost:3000/api/subjects/search?tags=physique,quantique&category=sciences" \
#   -H "Accept: application/json"

# echo -e "\n62. Testing search with popularity filter..."
# curl -X GET "http://localhost:3000/api/subjects/search?isPopular=false&sortBy=popularity&sortOrder=desc" \
#   -H "Accept: application/json"

# echo -e "\n63. Testing search with estimated hours range..."
# curl -X GET "http://localhost:3000/api/subjects/search?minEstimatedHours=100&maxEstimatedHours=200&sortBy=estimatedHours" \
#   -H "Accept: application/json"

# echo -e "\n64. Testing search with multiple series..."
# curl -X GET "http://localhost:3000/api/subjects/search?series=C,D&category=sciences&sortBy=name" \
#   -H "Accept: application/json"

# echo -e "\n65. Testing search with multiple difficulties..."
# curl -X GET "http://localhost:3000/api/subjects/search?difficulty=moyen,difficile&sortBy=difficulty" \
#   -H "Accept: application/json"

# echo -e "\n66. Testing search with has exams filter..."
# curl -X GET "http://localhost:3000/api/subjects/search?hasExams=false&sortBy=examCount" \
#   -H "Accept: application/json"

# echo -e "\n67. Testing search with relevance sorting..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=chimie&sortBy=relevance&sortOrder=desc" \
#   -H "Accept: application/json"

# echo -e "\n68. Testing search with pagination..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=math&page=1&limit=3" \
#   -H "Accept: application/json"

# echo -e "\n69. Testing search by subcategory..."
# curl -X GET "http://localhost:3000/api/subjects/search?subcategory=physique&category=sciences" \
#   -H "Accept: application/json"

# echo -e "\n70. Testing comprehensive search with all filters..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=science&category=sciences&subcategory=biologie&series=C&difficulty=moyen&tags=cellules&minRating=2&minEstimatedHours=50&maxEstimatedHours=300&hasExams=false&isPopular=false&page=1&limit=5&sortBy=rating&sortOrder=desc" \
#   -H "Accept: application/json"

# echo -e "\n71. Testing empty search (should return all active subjects)..."
# curl -X GET "http://localhost:3000/api/subjects/search" \
#   -H "Accept: application/json"

# echo -e "\n72. Testing search with special characters..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=français%20littérature" \
#   -H "Accept: application/json"

# echo -e "\n=== Additional Search Verification ==="

# echo -e "\n73. Testing search without query (should return all mathematiques subjects)..."
# curl -X GET "http://localhost:3000/api/subjects/search?category=mathematiques" \
#   -H "Accept: application/json"

# echo -e "\n74. Testing search with exact subject name..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=Mathématiques" \
#   -H "Accept: application/json"

# echo -e "\n75. Testing search with partial name..."
# curl -X GET "http://localhost:3000/api/subjects/search?query=Algèbre" \
#   -H "Accept: application/json"

# echo -e "\n76. Testing category-only search for sciences..."
# curl -X GET "http://localhost:3000/api/subjects/search?category=sciences" \
#   -H "Accept: application/json"

# echo -e "\n77. Testing search with series filter..."
# curl -X GET "http://localhost:3000/api/subjects/search?series=C" \
#   -H "Accept: application/json"

# echo -e "\n78. Testing no filters (should return all active subjects)..."
# curl -X GET "http://localhost:3000/api/subjects/search" \
#   -H "Accept: application/json"

# echo -e "\n=== Search Verification Complete! ==="

# echo -e "\n=== All Advanced Features Testing Complete! ==="