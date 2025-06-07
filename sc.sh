#!/bin/bash

  curl -X PATCH http://localhost:3000/api/users/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQzNmY5MDJjM2E2NDYzMzgyOWQxNjgiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc0OTI1Mzg2MywiZXhwIjoxNzQ5MjU3NDYzfQ.FZzVSgDjMMv0hvEihFDSr0s79MfF_G-MljPJUdewHF4" \
  -d '{
    "preferences": {
      "darkMode": true,
      "fontSize": "large",
      "preferredContentFormat": "video",
      "enableHints": false,
      "autoPlayAudio": true,
      "showStepSolutions": false,
      "leaderboardVisibility": true,
      "allowFriendRequests": false,
      "multilingualSupport": ["fr", "en"]
    }
  }'