#!/bin/bash

  curl -X PUT "http://localhost:3000/api/users/subscription" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQzNmY5MDJjM2E2NDYzMzgyOWQxNjgiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc0OTI1Mzg2MywiZXhwIjoxNzQ5MjU3NDYzfQ.FZzVSgDjMMv0hvEihFDSr0s79MfF_G-MljPJUdewHF4" \
  -d '{
    "type": "premium",
    "startDate": "2024-03-20",
    "expiresAt": "2024-04-20",
    "features": ["unlimited_access", "priority_support"]
  }'