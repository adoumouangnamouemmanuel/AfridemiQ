YOUR_ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODU2OWM2Mzc0MzYxMmJjOGExMWRmOWYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTA1MjM0NjQsImV4cCI6MTc1MDUyNzA2NH0.C8EgmPAeloGkcKB-JZ6DHgp-jBvlDFYWIhEamdrVuDo"

curl -X DELETE http://localhost:3000/api/v1/subjects/6856e19caff9659b6e3ec890 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $YOUR_ADMIN_TOKEN" \