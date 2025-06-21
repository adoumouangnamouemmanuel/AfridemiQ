admin_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODU2OWM2Mzc0MzYxMmJjOGExMWRmOWYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTA1MzMzNTcsImV4cCI6MTc1MDUzNjk1N30.w28pgzw2R1bgpOQAxWX7Qwb9L6l5RVG955gn5_9Gl0U"
math="6856e110aff9659b6e3ec887"

# Create UTF-8 encoded file and reference it
curl -X POST http://localhost:3000/api/v1/topics \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Bearer $admin_token" \
  -d @topic-french.json