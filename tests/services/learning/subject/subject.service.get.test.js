const subjectService = require("../../../../src/services/learning/subject/subject.service");
const { Subject } = require("../../../../src/models/learning/subject.model");

describe("Subject Service - GET Operations", () => {
  // Test data setup
  const createTestSubjects = async () => {
    const subjects = [
      {
        name: "Mathématiques A",
        icon: "🔢",
        color: "#FF0000",
        description: "Mathématiques pour série A",
        series: ["A"],
        category: "mathematiques",
        difficulty: "facile",
        popularity: 100,
        rating: { average: 4.5, count: 10 },
        estimatedHours: 120,
        tags: ["algèbre", "géométrie"],
      },
      {
        name: "Physique C",
        icon: "⚛️",
        color: "#00FF00",
        description: "Physique pour série C",
        series: ["C"],
        category: "sciences",
        difficulty: "difficile",
        popularity: 150,
        rating: { average: 4.2, count: 8 },
        estimatedHours: 140,
        tags: ["mécanique", "électricité"],
      },
      {
        name: "Français",
        icon: "📚",
        color: "#0000FF",
        description: "Langue française",
        series: ["A", "C", "D"],
        category: "langues",
        difficulty: "moyen",
        popularity: 200,
        rating: { average: 3.8, count: 15 },
        estimatedHours: 100,
        tags: ["grammaire", "littérature"],
      },
      {
        name: "Histoire",
        icon: "📜",
        color: "#FFA500",
        description: "Histoire générale",
        series: ["A", "D"],
        category: "sciences-sociales",
        difficulty: "moyen",
        popularity: 80,
        rating: { average: 4.0, count: 12 },
        estimatedHours: 110,
        tags: ["chronologie", "civilisation"],
      },
      {
        name: "Biologie",
        icon: "🧬",
        color: "#00FFFF",
        description: "Sciences biologiques",
        series: ["C", "D"],
        category: "sciences",
        difficulty: "moyen",
        popularity: 120,
        rating: { average: 4.3, count: 9 },
        estimatedHours: 130,
        tags: ["cellule", "écosystème"],
      },
    ];

    return await Subject.insertMany(subjects);
  };

  describe("getSubjects - Basic Functionality", () => {
    beforeEach(async () => {
      await createTestSubjects();
    });

    test("should return all subjects with default pagination", async () => {
      const result = await subjectService.getSubjects({});

      expect(result).toHaveProperty("subjects");
      expect(result).toHaveProperty("pagination");
      expect(result.subjects).toHaveLength(5);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.current).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.pages).toBe(1);
    });

    test("should apply pagination correctly", async () => {
      const result = await subjectService.getSubjects({ page: 1, limit: 2 });

      expect(result.subjects).toHaveLength(2);
      expect(result.pagination.current).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.pages).toBe(3);
    });

    test("should return second page correctly", async () => {
      const page1 = await subjectService.getSubjects({ page: 1, limit: 2 });
      const page2 = await subjectService.getSubjects({ page: 2, limit: 2 });

      expect(page2.subjects).toHaveLength(2);
      expect(page2.pagination.current).toBe(2);

      // Ensure different subjects on different pages
      const page1Ids = page1.subjects.map((s) => s._id.toString());
      const page2Ids = page2.subjects.map((s) => s._id.toString());
      expect(page1Ids).not.toEqual(page2Ids);
    });

    test("should handle empty results gracefully", async () => {
      // Clear all subjects
      await Subject.deleteMany({});

      const result = await subjectService.getSubjects({});

      expect(result.subjects).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.pages).toBe(0);
    });
  });

  describe("getSubjects - Series Filtering", () => {
    beforeEach(async () => {
      await createTestSubjects();
    });

    test("should filter by series (case-sensitive)", async () => {
      const result = await subjectService.getSubjects({ series: "A" });

      expect(result.subjects).toHaveLength(2);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });

    test("should filter by series (case-insensitive)", async () => {
      const result = await subjectService.getSubjects({ series: "a" });

      expect(result.subjects).toHaveLength(2);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });

    test("should filter by series C", async () => {
      const result = await subjectService.getSubjects({ series: "C" });

      expect(result.subjects).toHaveLength(3);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("C");
      });
    });

    test("should return empty array for non-existent series", async () => {
      const result = await subjectService.getSubjects({ series: "Z" });

      expect(result.subjects).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    test("should handle series as array (first element)", async () => {
      const result = await subjectService.getSubjects({ series: ["A", "B"] });

      // Should use first element 'A'
      expect(result.subjects).toHaveLength(2);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });
  });

  describe("getSubjects - Category Filtering", () => {
    beforeEach(async () => {
      await createTestSubjects();
    });

    test("should filter by category mathematiques", async () => {
      const result = await subjectService.getSubjects({
        category: "mathematiques",
      });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].category).toBe("mathematiques");
      expect(result.subjects[0].name).toBe("Mathématiques A");
    });

    test("should filter by category sciences", async () => {
      const result = await subjectService.getSubjects({ category: "sciences" });

      expect(result.subjects).toHaveLength(2);
      result.subjects.forEach((subject) => {
        expect(subject.category).toBe("sciences");
      });
    });

    test("should filter by category langues", async () => {
      const result = await subjectService.getSubjects({ category: "langues" });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe("Français");
    });

    test("should return empty array for non-existent category", async () => {
      const result = await subjectService.getSubjects({
        category: "invalid-category",
      });

      expect(result.subjects).toHaveLength(0);
    });
  });

  describe("getSubjects - Difficulty Filtering", () => {
    beforeEach(async () => {
      await createTestSubjects();
    });

    test("should filter by difficulty facile", async () => {
      const result = await subjectService.getSubjects({ difficulty: "facile" });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].difficulty).toBe("facile");
      expect(result.subjects[0].name).toBe("Mathématiques A");
    });

    test("should filter by difficulty moyen", async () => {
      const result = await subjectService.getSubjects({ difficulty: "moyen" });

      expect(result.subjects).toHaveLength(3);
      result.subjects.forEach((subject) => {
        expect(subject.difficulty).toBe("moyen");
      });
    });

    test("should filter by difficulty difficile", async () => {
      const result = await subjectService.getSubjects({
        difficulty: "difficile",
      });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].difficulty).toBe("difficile");
      expect(result.subjects[0].name).toBe("Physique C");
    });
  });

  describe("getSubjects - Combined Filtering", () => {
    beforeEach(async () => {
      await createTestSubjects();
    });

    test("should filter by series and category", async () => {
      const result = await subjectService.getSubjects({
        series: "C",
        category: "sciences",
      });

      expect(result.subjects).toHaveLength(2);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("C");
        expect(subject.category).toBe("sciences");
      });
    });

    test("should filter by series, category and difficulty", async () => {
      const result = await subjectService.getSubjects({
        series: "C",
        category: "sciences",
        difficulty: "moyen",
      });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe("Biologie");
    });

    test("should return empty when no subjects match all criteria", async () => {
      const result = await subjectService.getSubjects({
        series: "A",
        category: "sciences",
        difficulty: "difficile",
      });

      expect(result.subjects).toHaveLength(0);
    });
  });

  describe("getSubjects - Sorting", () => {
    beforeEach(async () => {
      await createTestSubjects();
    });

    test("should sort by name ascending (default)", async () => {
      const result = await subjectService.getSubjects({
        sortBy: "name",
        sortOrder: "asc",
      });

      const names = result.subjects.map((s) => s.name);
      expect(names).toEqual([
        "Biologie",
        "Français",
        "Histoire",
        "Mathématiques A",
        "Physique C",
      ]);
    });

    test("should sort by name descending", async () => {
      const result = await subjectService.getSubjects({
        sortBy: "name",
        sortOrder: "desc",
      });

      const names = result.subjects.map((s) => s.name);
      expect(names).toEqual([
        "Physique C",
        "Mathématiques A",
        "Histoire",
        "Français",
        "Biologie",
      ]);
    });

    test("should sort by popularity descending", async () => {
      const result = await subjectService.getSubjects({
        sortBy: "popularity",
        sortOrder: "desc",
      });

      const popularities = result.subjects.map((s) => s.popularity);
      expect(popularities).toEqual([200, 150, 120, 100, 80]);
    });

    test("should sort by rating descending", async () => {
      const result = await subjectService.getSubjects({
        sortBy: "rating",
        sortOrder: "desc",
      });

      const ratings = result.subjects.map((s) => s.rating.average);
      expect(ratings).toEqual([4.5, 4.3, 4.2, 4.0, 3.8]);
    });

    test("should sort by difficulty ascending", async () => {
      const result = await subjectService.getSubjects({
        sortBy: "difficulty",
        sortOrder: "asc",
      });

      const difficulties = result.subjects.map((s) => s.difficulty);
      // 'difficile' < 'facile' < 'moyen' alphabetically
      expect(difficulties[0]).toBe("difficile");
      expect(difficulties[1]).toBe("facile");
    });
  });

  describe("getSubjects - Active Status Filtering", () => {
    beforeEach(async () => {
      const subjects = await createTestSubjects();
      // Deactivate one subject
      await Subject.findByIdAndUpdate(subjects[0]._id, { isActive: false });
    });

    test("should return only active subjects by default", async () => {
      const result = await subjectService.getSubjects({});

      expect(result.subjects).toHaveLength(4);
      result.subjects.forEach((subject) => {
        expect(subject.isActive).toBe(true);
      });
    });

    test("should return only active subjects when explicitly set", async () => {
      const result = await subjectService.getSubjects({ isActive: true });

      expect(result.subjects).toHaveLength(4);
      result.subjects.forEach((subject) => {
        expect(subject.isActive).toBe(true);
      });
    });

    test("should return inactive subjects when requested", async () => {
      const result = await subjectService.getSubjects({ isActive: false });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].isActive).toBe(false);
    });

    test("should handle isActive as string", async () => {
      const result = await subjectService.getSubjects({ isActive: "true" });

      expect(result.subjects).toHaveLength(4);
      result.subjects.forEach((subject) => {
        expect(subject.isActive).toBe(true);
      });
    });
  });

  describe("getSubjects - Edge Cases", () => {
    test("should handle invalid page numbers gracefully", async () => {
      await createTestSubjects();

      const result = await subjectService.getSubjects({ page: 0, limit: 2 });

      // Should default to page 1
      expect(result.pagination.current).toBe(1);
      expect(result.subjects).toHaveLength(2);
    });

    test("should handle very large page numbers", async () => {
      await createTestSubjects();

      const result = await subjectService.getSubjects({ page: 1000, limit: 2 });

      expect(result.subjects).toHaveLength(0);
      expect(result.pagination.current).toBe(1000);
      expect(result.pagination.total).toBe(5);
    });

    test("should handle invalid sort fields", async () => {
      await createTestSubjects();

      const result = await subjectService.getSubjects({
        sortBy: "invalidField",
      });

      // Should still return results (MongoDB handles unknown fields)
      expect(result.subjects).toHaveLength(5);
    });

    test("should handle whitespace in series parameter", async () => {
      await createTestSubjects();

      const result = await subjectService.getSubjects({ series: "  A  " });

      expect(result.subjects).toHaveLength(2);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });
  });
});
