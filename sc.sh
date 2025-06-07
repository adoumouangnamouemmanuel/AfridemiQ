curl -X POST "http://localhost:3000/api/exercises" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZTk4ZjE1NTg5Y2Y0OWNjZGY5MTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDkzMjg3MDYsImV4cCI6MTc0OTMzMjMwNn0.0MhD-28AJOUmakoBleP0xt_-tihPZJ1JhaJ-UsppEYU" \
-H "Content-Type: application/json" \
-d '{
  "body": {
    "type": "practice",
    "subjectId": "YOUR_SUBJECT_ID",
    "series": ["D"],
    "topicId": "YOUR_TOPIC_ID",
    "title": "Basic Mechanics Problems",
    "description": "Practice problems on basic mechanics concepts",
    "difficulty": "beginner",
    "timeLimit": 15,
    "points": 10,
    "instructions": "Solve the following problems showing all your work",
    "subjectType": "physics",
    "topic": "mechanics",
    "content": {
      "problems": [
        {
          "statement": "A car accelerates from rest to 60 km/h in 10 seconds. What is its acceleration?",
          "questionType": "calculation",
          "variables": [
            {
              "name": "initial_velocity",
              "value": "0",
              "unit": "km/h"
            },
            {
              "name": "final_velocity",
              "value": "60",
              "unit": "km/h"
            },
            {
              "name": "time",
              "value": "10",
              "unit": "s"
            }
          ],
          "difficulty": "beginner",
          "points": 5
        }
      ],
      "formulas": ["a = (v_f - v_i)/t"],
      "diagrams": [
        {
          "url": "https://example.com/acceleration-diagram.png",
          "altText": "Diagram showing car acceleration",
          "caption": "Car acceleration diagram"
        }
      ]
    },
    "solution": {
      "answers": [
        {
          "answer": "1.67",
          "problemIndex": 0,
          "unit": "m/s²",
          "explanation": "Convert velocities to m/s, then use a = (v_f - v_i)/t"
        }
      ],
      "explanation": "To solve this problem, we first convert the velocities from km/h to m/s, then use the acceleration formula.",
      "calculations": [
        "60 km/h = 16.67 m/s",
        "a = (16.67 - 0)/10 = 1.67 m/s²"
      ]
    },
    "metadata": {
      "tags": ["mechanics", "acceleration", "kinematics"],
      "status": "draft"
    },
    "settings": {
      "allowHints": true,
      "showSolution": true,
      "randomizeQuestions": false,
      "allowRetake": true,
      "maxAttempts": 3
    }
  }
}'