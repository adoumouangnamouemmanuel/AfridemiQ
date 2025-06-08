const subjectService = require("../../../../src/services/learning/subject/subject.service");
const { Subject } = require("../../../../src/models/learning/subject.model");

describe("Subject Service - GET By Series Operations", () => {
  const createTestSubjectsForSeries = async () => {
    const subjects = [
      {
        name: "Mathématiques A",
        icon: "🔢",
        color: "#FF0000",
        description: "Mathématiques pour série A uniquement",
        series: ["A"],
        category: "mathematiques",
        difficulty: "facile",
      },
      {
        name: "Sciences A-C",
        icon: "🔬",
        color: "#00FF00",
        description: "Sciences pour séries A et C",
        series: ["A", "C"],
        category: "sciences",
        difficulty: "moyen",
      },
      {
        name: "Français Général",
        icon: "📚",
        color: "#0000FF",
        description: "Français pour toutes séries",
        series: ["A", "C", "D", "E"],
        category: "langues",
        difficulty: "moyen",
      },
      {
        name: "Sciences C",
        icon: "⚛️",
        color: "#FF00FF",
        description: "Sciences pour série C uniquement",
        series: ["C"],
        category: "sciences",
        difficulty: "difficile",
      },
      {
        name: "Arts D",
        icon: "🎨",
        color: "#FFA500",
        description: "Arts pour série D",
        series: ["D"],
        category: "arts",
        difficulty: "facile",
      },
      {
        name: "Technical E",
        icon: "⚙️",
        color: "#808080",
        description: "Matières techniques série E",
        series: ["E"],
        category: "technologie",
        difficulty: "difficile",
      },
    ];

    return await Subject.insertMany(subjects);
  };

  describe("getBySeries - Single Series Filtering", () => {
    beforeEach(async () => {
      await createTestSubjectsForSeries();
    });

    test("should get subjects for series A (case-sensitive)", async () => {
      const result = await subjectService.getSubjects({ series: "A" });

      expect(result.subjects).toHaveLength(3);
      const subjectNames = result.subjects.map((s) => s.name).sort();
      expect(subjectNames).toEqual([
        "Français Général",
        "Mathématiques A",
        "Sciences A-C",
      ]);

      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });

    test("should get subjects for series A (case-insensitive)", async () => {
      const result = await subjectService.getSubjects({ series: "a" });

      expect(result.subjects).toHaveLength(3);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });

    test("should get subjects for series C", async () => {
      const result = await subjectService.getSubjects({ series: "C" });

      expect(result.subjects).toHaveLength(3);
      const subjectNames = result.subjects.map((s) => s.name).sort();
      expect(subjectNames).toEqual([
        "Français Général",
        "Sciences A-C",
        "Sciences C",
      ]);
    });

    test("should get subjects for series D", async () => {
      const result = await subjectService.getSubjects({ series: "D" });

      expect(result.subjects).toHaveLength(2);
      const subjectNames = result.subjects.map((s) => s.name).sort();
      expect(subjectNames).toEqual(["Arts D", "Français Général"]);
    });

    test("should get subjects for series E", async () => {
      const result = await subjectService.getSubjects({ series: "E" });

      expect(result.subjects).toHaveLength(2);
      const subjectNames = result.subjects.map((s) => s.name).sort();
      expect(subjectNames).toEqual(["Français Général", "Technical E"]);
    });

    test("should return empty for non-existent series", async () => {
      const result = await subjectService.getSubjects({ series: "Z" });

      expect(result.subjects).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getBySeries - Case Insensitivity", () => {
    beforeEach(async () => {
      await createTestSubjectsForSeries();
    });

    test("should handle lowercase series names", async () => {
      const lowercase = await subjectService.getSubjects({ series: "c" });
      const uppercase = await subjectService.getSubjects({ series: "C" });

      expect(lowercase.subjects).toHaveLength(uppercase.subjects.length);
      expect(lowercase.pagination.total).toBe(uppercase.pagination.total);

      const lowercaseNames = lowercase.subjects.map((s) => s.name).sort();
      const uppercaseNames = uppercase.subjects.map((s) => s.name).sort();
      expect(lowercaseNames).toEqual(uppercaseNames);
    });

    test("should handle mixed case series names", async () => {
      const mixedCase = await subjectService.getSubjects({ series: "aA" });
      // This should not match anything as no series named 'aA' exists
      expect(mixedCase.subjects).toHaveLength(0);
    });

    test("should trim whitespace from series parameter", async () => {
      const withSpaces = await subjectService.getSubjects({ series: "  A  " });
      const withoutSpaces = await subjectService.getSubjects({ series: "A" });

      expect(withSpaces.subjects).toHaveLength(withoutSpaces.subjects.length);
      expect(withSpaces.pagination.total).toBe(withoutSpaces.pagination.total);
    });
  });

  describe("getBySeries - Combined with Other Filters", () => {
    beforeEach(async () => {
      await createTestSubjectsForSeries();
    });

    test("should filter by series A and category sciences", async () => {
      const result = await subjectService.getSubjects({
        series: "A",
        category: "sciences",
      });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe("Sciences A-C");
      expect(result.subjects[0].series).toContain("A");
      expect(result.subjects[0].category).toBe("sciences");
    });

    test("should filter by series C and difficulty difficile", async () => {
      const result = await subjectService.getSubjects({
        series: "C",
        difficulty: "difficile",
      });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe("Sciences C");
      expect(result.subjects[0].series).toContain("C");
      expect(result.subjects[0].difficulty).toBe("difficile");
    });

    test("should filter by series D and category arts", async () => {
      const result = await subjectService.getSubjects({
        series: "D",
        category: "arts",
      });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe("Arts D");
    });

    test("should return empty when combining filters with no matches", async () => {
      const result = await subjectService.getSubjects({
        series: "A",
        category: "arts",
      });

      expect(result.subjects).toHaveLength(0);
    });

    test("should filter by series A, category sciences and difficulty moyen", async () => {
      const result = await subjectService.getSubjects({
        series: "A",
        category: "sciences",
        difficulty: "moyen",
      });

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe("Sciences A-C");
    });
  });

  describe("getBySeries - Pagination with Series", () => {
    beforeEach(async () => {
      await createTestSubjectsForSeries();
    });

    test("should paginate series A results", async () => {
      const page1 = await subjectService.getSubjects({
        series: "A",
        page: 1,
        limit: 2,
      });

      expect(page1.subjects).toHaveLength(2);
      expect(page1.pagination.current).toBe(1);
      expect(page1.pagination.total).toBe(3);
      expect(page1.pagination.pages).toBe(2);

      const page2 = await subjectService.getSubjects({
        series: "A",
        page: 2,
        limit: 2,
      });

      expect(page2.subjects).toHaveLength(1);
      expect(page2.pagination.current).toBe(2);
    });

    test("should handle pagination when no results for series", async () => {
      const result = await subjectService.getSubjects({
        series: "Z",
        page: 1,
        limit: 5,
      });

      expect(result.subjects).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.pages).toBe(0);
    });
  });

  describe("getBySeries - Sorting with Series", () => {
    beforeEach(async () => {
      await createTestSubjectsForSeries();
    });

    test("should sort series A subjects by name ascending", async () => {
      const result = await subjectService.getSubjects({
        series: "A",
        sortBy: "name",
        sortOrder: "asc",
      });

      const names = result.subjects.map((s) => s.name);
      expect(names).toEqual([
        "Français Général",
        "Mathématiques A",
        "Sciences A-C",
      ]);
    });

    test("should sort series C subjects by difficulty", async () => {
      const result = await subjectService.getSubjects({
        series: "C",
        sortBy: "difficulty",
        sortOrder: "asc",
      });

      // Alphabetical order: difficile < moyen
      const difficulties = result.subjects.map((s) => s.difficulty);
      expect(difficulties[0]).toBe("difficile");
    });

    test("should sort series subjects by category", async () => {
      const result = await subjectService.getSubjects({
        series: "A",
        sortBy: "category",
        sortOrder: "asc",
      });

      const categories = result.subjects.map((s) => s.category);
      // Alphabetical: langues < mathematiques < sciences
      expect(categories).toEqual(["langues", "mathematiques", "sciences"]);
    });
  });

  describe("getBySeries - Array Handling", () => {
    beforeEach(async () => {
      await createTestSubjectsForSeries();
    });

    test("should handle series as array and use first element", async () => {
      const result = await subjectService.getSubjects({
        series: ["A", "C", "D"],
      });

      // Should filter by 'A' (first element)
      expect(result.subjects).toHaveLength(3);
      result.subjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });

    test("should handle empty array", async () => {
      const result = await subjectService.getSubjects({
        series: [],
      });

      // Should return all subjects (no series filter applied)
      expect(result.subjects).toHaveLength(6);
    });

    test("should handle array with empty string", async () => {
      const result = await subjectService.getSubjects({
        series: [""],
      });

      // Should return no results (empty string doesn't match any series)
      expect(result.subjects).toHaveLength(0);
    });
  });
});
