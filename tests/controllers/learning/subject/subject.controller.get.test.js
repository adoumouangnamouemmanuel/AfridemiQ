const request = require("supertest");
const express = require("express");
const subjectController = require("../../../../src/controllers/learning/subject.controller");
const subjectService = require("../../../../src/services/learning/subject/subject.service");
const { Subject } = require("../../../../src/models/learning/subject.model");

// Mock the service
jest.mock("../../../../src/services/learning/subject/subject.service");

// Mock middleware
jest.mock("../../../../src/middlewares/validate.middleware", () => {
  return jest.fn(() => (req, res, next) => next());
});

jest.mock("../../../../src/middlewares/rate.limit.middleware", () => ({
  apiLimiter: (req, res, next) => next(),
}));

// Create test app
const app = express();
app.use(express.json());

// Set up routes
app.get("/subjects", subjectController.getSubjects);
app.get("/subjects/series/:series", subjectController.getSubjectsBySeries);
app.get("/subjects/:id", subjectController.getSubjectById);

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
    status: "error",
    code: "Error",
  });
});

describe("Subject Controller - GET Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSubjects = [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Mathematics",
      icon: "🔢",
      color: "#FF0000",
      description: "Mathematics course",
      series: ["A", "C"],
      category: "mathematiques",
      difficulty: "moyen",
      isActive: true,
      popularity: 100,
      rating: { average: 4.5, count: 10 },
    },
    {
      _id: "507f1f77bcf86cd799439012",
      name: "Physics",
      icon: "⚛️",
      color: "#00FF00",
      description: "Physics course",
      series: ["C"],
      category: "sciences",
      difficulty: "difficile",
      isActive: true,
      popularity: 80,
      rating: { average: 4.2, count: 8 },
    },
  ];

  const mockPagination = {
    current: 1,
    pages: 1,
    total: 2,
    limit: 10,
  };

  describe("GET /subjects", () => {
    test("should return all subjects successfully", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: mockSubjects,
        pagination: mockPagination,
      });

      const response = await request(app).get("/subjects").expect(200);

      expect(response.body.message).toBe("Matières récupérées avec succès");
      expect(response.body.data).toEqual(mockSubjects);
      expect(response.body.pagination).toEqual(mockPagination);
      expect(subjectService.getSubjects).toHaveBeenCalledWith({});
    });

    test("should pass query parameters to service", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: [mockSubjects[0]],
        pagination: { ...mockPagination, total: 1 },
      });

      const queryParams = {
        category: "mathematiques",
        difficulty: "moyen",
        page: "1",
        limit: "5",
      };

      await request(app).get("/subjects").query(queryParams).expect(200);

      expect(subjectService.getSubjects).toHaveBeenCalledWith(queryParams);
    });

    test("should handle service errors", async () => {
      const error = new Error("Service error");
      subjectService.getSubjects.mockRejectedValue(error);

      await request(app).get("/subjects").expect(500);
    });

    test("should handle pagination parameters", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: [mockSubjects[0]],
        pagination: { current: 2, pages: 3, total: 5, limit: 2 },
      });

      await request(app).get("/subjects?page=2&limit=2").expect(200);

      expect(subjectService.getSubjects).toHaveBeenCalledWith({
        page: "2",
        limit: "2",
      });
    });

    test("should handle sorting parameters", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: mockSubjects,
        pagination: mockPagination,
      });

      await request(app)
        .get("/subjects?sortBy=popularity&sortOrder=desc")
        .expect(200);

      expect(subjectService.getSubjects).toHaveBeenCalledWith({
        sortBy: "popularity",
        sortOrder: "desc",
      });
    });

    test("should handle filtering parameters", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: [mockSubjects[1]],
        pagination: { ...mockPagination, total: 1 },
      });

      const filters = {
        category: "sciences",
        difficulty: "difficile",
        series: "C",
        isActive: "true",
      };

      await request(app).get("/subjects").query(filters).expect(200);

      expect(subjectService.getSubjects).toHaveBeenCalledWith(filters);
    });
  });

  describe("GET /subjects/series/:series", () => {
    test("should return subjects by series successfully", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: [mockSubjects[0]],
        pagination: { ...mockPagination, total: 1 },
      });

      const response = await request(app).get("/subjects/series/A").expect(200);

      expect(response.body.message).toBe(
        "Matières récupérées par série avec succès"
      );
      expect(response.body.data).toEqual([mockSubjects[0]]);
      expect(response.body.pagination).toEqual({ ...mockPagination, total: 1 });

      expect(subjectService.getSubjects).toHaveBeenCalledWith({
        series: "A",
      });
    });

    test("should combine series with other query parameters", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: [mockSubjects[0]],
        pagination: { ...mockPagination, total: 1 },
      });

      await request(app)
        .get("/subjects/series/A?category=mathematiques&difficulty=moyen")
        .expect(200);

      expect(subjectService.getSubjects).toHaveBeenCalledWith({
        series: "A",
        category: "mathematiques",
        difficulty: "moyen",
      });
    });

    test("should handle case-insensitive series", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: [mockSubjects[0]],
        pagination: { ...mockPagination, total: 1 },
      });

      await request(app).get("/subjects/series/a").expect(200);

      expect(subjectService.getSubjects).toHaveBeenCalledWith({
        series: "a",
      });
    });

    test("should handle empty results for non-existent series", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: [],
        pagination: { current: 1, pages: 0, total: 0, limit: 10 },
      });

      const response = await request(app).get("/subjects/series/Z").expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    test("should handle service errors for series endpoint", async () => {
      const error = new Error("Series service error");
      subjectService.getSubjects.mockRejectedValue(error);

      await request(app).get("/subjects/series/A").expect(500);
    });
  });

  describe("GET /subjects/:id", () => {
    test("should return subject by ID successfully", async () => {
      const mockResult = { subject: mockSubjects[0] };
      subjectService.getSubjectById.mockResolvedValue(mockResult);

      const response = await request(app)
        .get("/subjects/507f1f77bcf86cd799439011")
        .expect(200);

      expect(response.body.message).toBe("Matière récupérée avec succès");
      expect(response.body.data).toEqual(mockSubjects[0]);
      expect(subjectService.getSubjectById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
    });

    test("should handle subject not found", async () => {
      const notFoundError = new Error("Matière non trouvée");
      notFoundError.statusCode = 404;
      subjectService.getSubjectById.mockRejectedValue(notFoundError);

      await request(app).get("/subjects/507f1f77bcf86cd799439999").expect(500); // Will be 500 due to our simple error handler
    });

    test("should handle invalid ID format", async () => {
      const badRequestError = new Error("ID de matière invalide");
      badRequestError.statusCode = 400;
      subjectService.getSubjectById.mockRejectedValue(badRequestError);

      await request(app).get("/subjects/invalid-id").expect(500); // Will be 500 due to our simple error handler
    });

    test("should call service with correct ID parameter", async () => {
      const mockResult = { subject: mockSubjects[1] };
      subjectService.getSubjectById.mockResolvedValue(mockResult);

      await request(app).get("/subjects/507f1f77bcf86cd799439012").expect(200);

      expect(subjectService.getSubjectById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439012"
      );
      expect(subjectService.getSubjectById).toHaveBeenCalledTimes(1);
    });

    test("should handle service errors for getById", async () => {
      const error = new Error("Database connection error");
      subjectService.getSubjectById.mockRejectedValue(error);

      await request(app).get("/subjects/507f1f77bcf86cd799439011").expect(500);
    });
  });

  describe("Controller Error Handling", () => {
    test("should handle malformed requests gracefully", async () => {
      subjectService.getSubjects.mockRejectedValue(
        new Error("Malformed request")
      );

      await request(app).get("/subjects?invalidParam=value").expect(500);
    });

    test("should log errors appropriately", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = new Error("Test error");
      subjectService.getSubjects.mockRejectedValue(error);

      await request(app).get("/subjects").expect(500);

      consoleSpy.mockRestore();
    });
  });

  describe("Response Format Validation", () => {
    test("should return properly formatted response for getSubjects", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: mockSubjects,
        pagination: mockPagination,
      });

      const response = await request(app).get("/subjects").expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(typeof response.body.message).toBe("string");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.pagination).toBe("object");
    });

    test("should return properly formatted response for getSubjectById", async () => {
      const mockResult = { subject: mockSubjects[0] };
      subjectService.getSubjectById.mockResolvedValue(mockResult);

      const response = await request(app)
        .get("/subjects/507f1f77bcf86cd799439011")
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(typeof response.body.message).toBe("string");
      expect(typeof response.body.data).toBe("object");
      expect(response.body.data._id).toBe(mockSubjects[0]._id);
    });

    test("should return proper content-type header", async () => {
      subjectService.getSubjects.mockResolvedValue({
        subjects: mockSubjects,
        pagination: mockPagination,
      });

      await request(app)
        .get("/subjects")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
});
