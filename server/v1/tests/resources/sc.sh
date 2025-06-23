admin_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODU2OWM2Mzc0MzYxMmJjOGExMWRmOWYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTA1MzcwNzUsImV4cCI6MTc1MDU0MDY3NX0.w8Djwqj98u5CabBR5XOv9mxESJsd5Kahsr2xveULIHE"
math="6856e110aff9659b6e3ec887"

# Create UTF-8 encoded file and reference it
curl -X POST http://localhost:3000/api/v1/resources \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Bearer $admin_token" \
  -d @math-cheatsheet-resource.json