const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const subjectRoutes = require("../../../../src/routes/learning/subject.route");
const { Subject } = require("../../../../src/models/learning/subject.model");

// Mock middleware to avoid authentication issues
jest.mock(
  "../../../../src/middlewares/auth.middleware",
  () => (req, res, next) => {
    req.user = { userId: "test-user-id", role: "student" };
    next();
  }
);

jest.mock(
  "../../../../src/middlewares/role.middleware",
  () => (roles) => (req, res, next) => {
    req.user = { userId: "test-user-id", role: "teacher" };
    next();
  }
);

jest.mock("../../../../src/middlewares/rate.limit.middleware", () => ({
  apiLimiter: (req, res, next) => next(),
}));

// Create test app
const app = express();
app.use(express.json());
app.use("/api/subjects", subjectRoutes);

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
    status: "error",
    code: "Error",
  });
});

describe("Subject Integration Tests - GET Operations", () => {
  const testSubjects = [
    {
      name: "Mathématiques Avancées",
      icon: "🔢",
      color: "#FF0000",
      description: "Mathématiques avancées pour série A",
      series: ["A"],
      category: "mathematiques",
      difficulty: "difficile",
      popularity: 150,
      rating: { average: 4.5, count: 20 },
      estimatedHours: 180,
      tags: ["calcul", "algèbre", "géométrie"],
    },
    {
      name: "Physique Générale",
      icon: "⚛️",
      color: "#00FF00",
      description: "Physique générale pour série C",
      series: ["C"],
      category: "sciences",
      difficulty: "moyen",
      popularity: 120,
      rating: { average: 4.2, count: 15 },
      estimatedHours: 150,
      tags: ["mécanique", "électricité", "optique"],
    },
    {
      name: "Français Littérature",
      icon: "📚",
      color: "#0000FF",
      description: "Littérature française pour toutes séries",
      series: ["A", "C", "D"],
      category: "langues",
      difficulty: "moyen",
      popularity: 200,
      rating: { average: 3.8, count: 25 },
      estimatedHours: 120,
      tags: ["littérature", "grammaire", "expression"],
    },
    {
      name: "Histoire Contemporaine",
      icon: "📜",
      color: "#FFA500",
      description: "Histoire contemporaine pour série A et D",
      series: ["A", "D"],
      category: "sciences-sociales",
      difficulty: "facile",
      popularity: 80,
      rating: { average: 4.0, count: 12 },
      estimatedHours: 100,
      tags: ["histoire", "société", "politique"],
    },
    {
      name: "Biologie Cellulaire",
      icon: "🧬",
      color: "#00FFFF",
      description: "Biologie cellulaire et moléculaire",
      series: ["C", "D"],
      category: "sciences",
      difficulty: "difficile",
      popularity: 90,
      rating: { average: 4.3, count: 18 },
      estimatedHours: 160,
      tags: ["cellule", "adn", "protéines"],
    },
  ];

  beforeEach(async () => {
    await Subject.deleteMany({});
    await Subject.insertMany(testSubjects);
  });

  describe("GET /api/subjects - Basic Functionality", () => {
    test("should return all subjects with default pagination", async () => {
      const response = await request(app).get("/api/subjects").expect(200);

      expect(response.body.message).toBe("Matières récupérées avec succès");
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toEqual({
        current: 1,
        pages: 1,
        total: 5,
        limit: 10,
      });

      // Verify subject structure
      const subject = response.body.data[0];
      expect(subject).toHaveProperty("name");
      expect(subject).toHaveProperty("category");
      expect(subject).toHaveProperty("series");
      expect(subject).toHaveProperty("difficulty");
      expect(subject).toHaveProperty("rating");
      expect(subject).toHaveProperty("popularity");
    });

    test("should apply pagination correctly", async () => {
      const page1Response = await request(app)
        .get("/api/subjects?page=1&limit=2")
        .expect(200);

      expect(page1Response.body.data).toHaveLength(2);
      expect(page1Response.body.pagination).toEqual({
        current: 1,
        pages: 3,
        total: 5,
        limit: 2,
      });

      const page2Response = await request(app)
        .get("/api/subjects?page=2&limit=2")
        .expect(200);

      expect(page2Response.body.data).toHaveLength(2);
      expect(page2Response.body.pagination.current).toBe(2);

      // Ensure different subjects on different pages
      const page1Ids = page1Response.body.data.map((s) => s._id);
      const page2Ids = page2Response.body.data.map((s) => s._id);

      page1Ids.forEach((id) => {
        expect(page2Ids).not.toContain(id);
      });
    });

    test("should handle empty results gracefully", async () => {
      await Subject.deleteMany({});

      const response = await request(app).get("/api/subjects").expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.pagination.pages).toBe(0);
    });
  });

  describe("GET /api/subjects - Filtering", () => {
    test("should filter by category", async () => {
      const response = await request(app)
        .get("/api/subjects?category=mathematiques")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe("mathematiques");
      expect(response.body.data[0].name).toBe("Mathématiques Avancées");
    });

    test("should filter by difficulty", async () => {
      const response = await request(app)
        .get("/api/subjects?difficulty=difficile")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((subject) => {
        expect(subject.difficulty).toBe("difficile");
      });
    });

    test("should filter by multiple criteria", async () => {
      const response = await request(app)
        .get("/api/subjects?category=sciences&difficulty=moyen")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("Physique Générale");
      expect(response.body.data[0].category).toBe("sciences");
      expect(response.body.data[0].difficulty).toBe("moyen");
    });

    test("should return empty results for non-matching filters", async () => {
      const response = await request(app)
        .get("/api/subjects?category=invalid-category")
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe("GET /api/subjects - Sorting", () => {
    test("should sort by name ascending", async () => {
      const response = await request(app)
        .get("/api/subjects?sortBy=name&sortOrder=asc")
        .expect(200);

      const names = response.body.data.map((s) => s.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    test("should sort by popularity descending", async () => {
      const response = await request(app)
        .get("/api/subjects?sortBy=popularity&sortOrder=desc")
        .expect(200);

      const popularities = response.body.data.map((s) => s.popularity);
      expect(popularities).toEqual([200, 150, 120, 90, 80]);
    });

    test("should sort by rating descending", async () => {
      const response = await request(app)
        .get("/api/subjects?sortBy=rating&sortOrder=desc")
        .expect(200);

      const ratings = response.body.data.map((s) => s.rating.average);
      expect(ratings[0]).toBeGreaterThanOrEqual(ratings[1]);
      expect(ratings[1]).toBeGreaterThanOrEqual(ratings[2]);
    });
  });

  describe("GET /api/subjects/series/:series - Series Filtering", () => {
    test("should filter by series A", async () => {
      const response = await request(app)
        .get("/api/subjects/series/A")
        .expect(200);

      expect(response.body.message).toBe(
        "Matières récupérées par série avec succès"
      );
      expect(response.body.data).toHaveLength(2);

      response.body.data.forEach((subject) => {
        expect(subject.series).toContain("A");
      });

      const subjectNames = response.body.data.map((s) => s.name);
      expect(subjectNames).toEqual(
        expect.arrayContaining([
          "Mathématiques Avancées",
          "Français Littérature",
        ])
      );
    });

    test("should filter by series C", async () => {
      const response = await request(app)
        .get("/api/subjects/series/C")
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      response.body.data.forEach((subject) => {
        expect(subject.series).toContain("C");
      });
    });

    test("should handle case-insensitive series filtering", async () => {
      const upperCaseResponse = await request(app)
        .get("/api/subjects/series/A")
        .expect(200);

      const lowerCaseResponse = await request(app)
        .get("/api/subjects/series/a")
        .expect(200);

      expect(upperCaseResponse.body.data).toHaveLength(
        lowerCaseResponse.body.data.length
      );
      expect(upperCaseResponse.body.pagination.total).toBe(
        lowerCaseResponse.body.pagination.total
      );
    });

    test("should combine series filter with other parameters", async () => {
      const response = await request(app)
        .get(
          "/api/subjects/series/C?category=sciences&sortBy=popularity&sortOrder=desc"
        )
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((subject) => {
        expect(subject.series).toContain("C");
        expect(subject.category).toBe("sciences");
      });

      // Check sorting
      const popularities = response.body.data.map((s) => s.popularity);
      expect(popularities[0]).toBeGreaterThanOrEqual(popularities[1]);
    });

    test("should return empty for non-existent series", async () => {
      const response = await request(app)
        .get("/api/subjects/series/Z")
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe("GET /api/subjects/:id - Subject by ID", () => {
    let testSubjectId;

    beforeEach(async () => {
      const subject = await Subject.findOne({ name: "Mathématiques Avancées" });
      testSubjectId = subject._id.toString();
    });

    test("should return subject by valid ID", async () => {
      const response = await request(app)
        .get(`/api/subjects/${testSubjectId}`)
        .expect(200);

      expect(response.body.message).toBe("Matière récupérée avec succès");
      expect(response.body.data.name).toBe("Mathématiques Avancées");
      expect(response.body.data._id).toBe(testSubjectId);
      expect(response.body.data).toHaveProperty("examCount");
      expect(response.body.data).toHaveProperty("formattedSeries");
      expect(response.body.data).toHaveProperty("isPopular");
    });

    test("should increment popularity when viewing subject", async () => {
      const initialSubject = await Subject.findById(testSubjectId);
      const initialPopularity = initialSubject.popularity;

      await request(app).get(`/api/subjects/${testSubjectId}`).expect(200);

      const updatedSubject = await Subject.findById(testSubjectId);
      expect(updatedSubject.popularity).toBe(initialPopularity + 1);
    });

    test("should return 404 for non-existent ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/subjects/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe("Matière non trouvée");
    });

    test("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/subjects/invalid-id")
        .expect(400);

      expect(response.body.message).toBe("ID de matière invalide");
    });
  });

  describe("Complex Integration Scenarios", () => {
    test("should handle concurrent requests correctly", async () => {
      const promises = Array(10)
        .fill()
        .map(() => request(app).get("/api/subjects"));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(5);
        expect(response.body.pagination.total).toBe(5);
      });
    });

    test("should maintain data consistency during concurrent ID requests", async () => {
      const subject = await Subject.findOne({ name: "Mathématiques Avancées" });
      const subjectId = subject._id.toString();
      const initialPopularity = subject.popularity;

      const promises = Array(5)
        .fill()
        .map(() => request(app).get(`/api/subjects/${subjectId}`));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe("Mathématiques Avancées");
      });

      // Check that popularity was incremented correctly
      const finalSubject = await Subject.findById(subjectId);
      expect(finalSubject.popularity).toBe(initialPopularity + 5);
    });

    test("should handle edge case pagination", async () => {
      const response = await request(app)
        .get("/api/subjects?page=999&limit=10")
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.current).toBe(999);
      expect(response.body.pagination.total).toBe(5);
    });

    test("should handle complex filter combinations", async () => {
      const response = await request(app)
        .get(
          "/api/subjects?category=sciences&difficulty=difficile&sortBy=rating&sortOrder=desc&page=1&limit=2"
        )
        .expect(200);

      response.body.data.forEach((subject) => {
        expect(subject.category).toBe("sciences");
        expect(subject.difficulty).toBe("difficile");
      });
    });
  });

  describe("Virtual Fields Integration", () => {
    test("should include virtual fields in response", async () => {
      const response = await request(app).get("/api/subjects").expect(200);

      const subject = response.body.data[0];
      expect(subject).toHaveProperty("examCount");
      expect(subject).toHaveProperty("formattedSeries");
      expect(subject).toHaveProperty("isPopular");
      expect(subject).toHaveProperty("difficultyLevel");
      expect(subject).toHaveProperty("completionPercentage");
    });

    test("should calculate virtual fields correctly", async () => {
      const response = await request(app).get("/api/subjects").expect(200);

      const mathSubject = response.body.data.find(
        (s) => s.name === "Mathématiques Avancées"
      );
      expect(mathSubject.formattedSeries).toBe("A");
      expect(mathSubject.isPopular).toBe(true); // popularity > 100
      expect(mathSubject.difficultyLevel).toBe(3); // difficile = 3
    });
  });
});
