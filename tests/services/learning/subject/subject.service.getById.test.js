const subjectService = require("../../../../src/services/learning/subject/subject.service");
const { Subject } = require("../../../../src/models/learning/subject.model");
const NotFoundError = require("../../../../src/errors/notFoundError");
const BadRequestError = require("../../../../src/errors/badRequestError");

describe("Subject Service - GET By ID Operations", () => {
  let testSubject;

  const validSubjectData = {
    name: "Test Subject",
    icon: "📚",
    color: "#FF0000",
    description: "Test description for subject",
    series: ["A", "C"],
    category: "sciences",
    difficulty: "moyen",
    popularity: 50,
    rating: { average: 4.0, count: 5 },
    estimatedHours: 120,
    tags: ["test", "science"],
    examIds: [],
  };

  beforeEach(async () => {
    testSubject = await Subject.create(validSubjectData);
  });

  describe("getSubjectById - Success Cases", () => {
    test("should return subject by valid ID", async () => {
      const result = await subjectService.getSubjectById(testSubject._id);

      expect(result).toHaveProperty("subject");
      expect(result.subject).toBeDefined();
      expect(result.subject._id.toString()).toBe(testSubject._id.toString());
      expect(result.subject.name).toBe(validSubjectData.name);
      expect(result.subject.description).toBe(validSubjectData.description);
      expect(result.subject.series).toEqual(validSubjectData.series);
      expect(result.subject.category).toBe(validSubjectData.category);
    });

    test("should increment popularity when subject is fetched", async () => {
      const initialPopularity = testSubject.popularity;

      await subjectService.getSubjectById(testSubject._id);

      const updatedSubject = await Subject.findById(testSubject._id);
      expect(updatedSubject.popularity).toBe(initialPopularity + 1);
    });

    test("should increment popularity multiple times", async () => {
      const initialPopularity = testSubject.popularity;

      await subjectService.getSubjectById(testSubject._id);
      await subjectService.getSubjectById(testSubject._id);
      await subjectService.getSubjectById(testSubject._id);

      const updatedSubject = await Subject.findById(testSubject._id);
      expect(updatedSubject.popularity).toBe(initialPopularity + 3);
    });

    test("should return subject with all virtual fields", async () => {
      const result = await subjectService.getSubjectById(testSubject._id);

      expect(result.subject.examCount).toBeDefined();
      expect(result.subject.formattedSeries).toBeDefined();
      expect(result.subject.isPopular).toBeDefined();
      expect(result.subject.difficultyLevel).toBeDefined();
      expect(result.subject.completionPercentage).toBeDefined();
    });

    test("should return subject with correct virtual field values", async () => {
      const result = await subjectService.getSubjectById(testSubject._id);

      expect(result.subject.examCount).toBe(0); // No exams added
      expect(result.subject.formattedSeries).toBe("A, C");
      expect(result.subject.isPopular).toBe(false); // popularity < 100
      expect(result.subject.difficultyLevel).toBe(2); // 'moyen' = 2
      expect(result.subject.completionPercentage).toBe(0);
    });
  });

  describe("getSubjectById - Error Cases", () => {
    test("should throw NotFoundError for non-existent ID", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      await expect(
        subjectService.getSubjectById(nonExistentId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        subjectService.getSubjectById(nonExistentId)
      ).rejects.toThrow("Matière non trouvée");
    });

    test("should throw BadRequestError for invalid ID format", async () => {
      const invalidId = "invalid-id-format";

      await expect(subjectService.getSubjectById(invalidId)).rejects.toThrow(
        BadRequestError
      );

      await expect(subjectService.getSubjectById(invalidId)).rejects.toThrow(
        "ID de matière invalide"
      );
    });

    test("should throw BadRequestError for empty ID", async () => {
      await expect(subjectService.getSubjectById("")).rejects.toThrow(
        BadRequestError
      );
    });

    test("should throw BadRequestError for null ID", async () => {
      await expect(subjectService.getSubjectById(null)).rejects.toThrow(
        BadRequestError
      );
    });

    test("should throw BadRequestError for undefined ID", async () => {
      await expect(subjectService.getSubjectById(undefined)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("getSubjectById - Different Subject Types", () => {
    test("should handle subject with no examIds", async () => {
      const subjectWithoutExams = await Subject.create({
        ...validSubjectData,
        name: "Subject Without Exams",
        examIds: [],
      });

      const result = await subjectService.getSubjectById(
        subjectWithoutExams._id
      );

      expect(result.subject.examIds).toEqual([]);
      expect(result.subject.examCount).toBe(0);
    });

    test("should handle subject with high popularity", async () => {
      const popularSubject = await Subject.create({
        ...validSubjectData,
        name: "Popular Subject",
        popularity: 500,
      });

      const result = await subjectService.getSubjectById(popularSubject._id);

      expect(result.subject.popularity).toBe(501); // 500 + 1 increment
      expect(result.subject.isPopular).toBe(true);
    });

    test("should handle subject with zero rating", async () => {
      const unratedSubject = await Subject.create({
        ...validSubjectData,
        name: "Unrated Subject",
        rating: { average: 0, count: 0 },
      });

      const result = await subjectService.getSubjectById(unratedSubject._id);

      expect(result.subject.rating.average).toBe(0);
      expect(result.subject.rating.count).toBe(0);
    });

    test("should handle subject with different difficulties", async () => {
      const difficulties = ["facile", "moyen", "difficile"];

      for (const difficulty of difficulties) {
        const subject = await Subject.create({
          ...validSubjectData,
          name: `Subject ${difficulty}`,
          difficulty: difficulty,
        });

        const result = await subjectService.getSubjectById(subject._id);

        expect(result.subject.difficulty).toBe(difficulty);

        const expectedLevel =
          difficulty === "facile" ? 1 : difficulty === "moyen" ? 2 : 3;
        expect(result.subject.difficultyLevel).toBe(expectedLevel);
      }
    });
  });

  describe("getSubjectById - Performance and Concurrency", () => {
    test("should handle concurrent requests correctly", async () => {
      const initialPopularity = testSubject.popularity;

      // Make 5 concurrent requests
      const promises = Array(5)
        .fill()
        .map(() => subjectService.getSubjectById(testSubject._id));

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.subject._id.toString()).toBe(testSubject._id.toString());
      });

      // Popularity should be incremented 5 times
      const finalSubject = await Subject.findById(testSubject._id);
      expect(finalSubject.popularity).toBe(initialPopularity + 5);
    });

    test("should maintain data consistency during concurrent access", async () => {
      const promises = Array(10)
        .fill()
        .map(async (_, index) => {
          const result = await subjectService.getSubjectById(testSubject._id);
          return {
            index,
            name: result.subject.name,
            id: result.subject._id.toString(),
          };
        });

      const results = await Promise.all(promises);

      // All results should have the same subject data
      results.forEach((result) => {
        expect(result.name).toBe(validSubjectData.name);
        expect(result.id).toBe(testSubject._id.toString());
      });
    });
  });

  describe("getSubjectById - Inactive Subjects", () => {
    test("should return inactive subject by ID", async () => {
      // Deactivate the subject
      testSubject.isActive = false;
      await testSubject.save();

      const result = await subjectService.getSubjectById(testSubject._id);

      expect(result.subject).toBeDefined();
      expect(result.subject.isActive).toBe(false);
      expect(result.subject._id.toString()).toBe(testSubject._id.toString());
    });

    test("should still increment popularity for inactive subjects", async () => {
      testSubject.isActive = false;
      const initialPopularity = testSubject.popularity;
      await testSubject.save();

      await subjectService.getSubjectById(testSubject._id);

      const updatedSubject = await Subject.findById(testSubject._id);
      expect(updatedSubject.popularity).toBe(initialPopularity + 1);
    });
  });
});
