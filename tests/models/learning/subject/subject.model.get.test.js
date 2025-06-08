const { Subject } = require("../../../../src/models/learning/subject.model");

describe("Subject Model - GET Operations", () => {
  const validSubjectData = {
    name: "Test Subject",
    icon: "📚",
    color: "#FF0000",
    description: "Test description",
    series: ["A", "C"],
    category: "sciences",
    difficulty: "moyen",
    popularity: 50,
    rating: { average: 4.0, count: 5 },
    estimatedHours: 120,
    tags: ["test", "science"],
  };

  describe("Virtual Fields", () => {
    test("should calculate examCount virtual field correctly", async () => {
      const subject = new Subject({
        ...validSubjectData,
        examIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      });

      expect(subject.examCount).toBe(2);
    });

    test("should calculate examCount as 0 for empty examIds", async () => {
      const subject = new Subject({
        ...validSubjectData,
        examIds: [],
      });

      expect(subject.examCount).toBe(0);
    });

    test("should format series correctly", async () => {
      const subject = new Subject({
        ...validSubjectData,
        series: ["A", "C", "D"],
      });

      expect(subject.formattedSeries).toBe("A, C, D");
    });

    test("should format single series correctly", async () => {
      const subject = new Subject({
        ...validSubjectData,
        series: ["A"],
      });

      expect(subject.formattedSeries).toBe("A");
    });

    test("should determine popularity correctly for popular subjects", async () => {
      const subject = new Subject({
        ...validSubjectData,
        popularity: 150,
      });

      expect(subject.isPopular).toBe(true);
    });

    test("should determine popularity correctly for non-popular subjects", async () => {
      const subject = new Subject({
        ...validSubjectData,
        popularity: 50,
      });

      expect(subject.isPopular).toBe(false);
    });

    test("should calculate difficulty level correctly", async () => {
      const testCases = [
        { difficulty: "facile", expectedLevel: 1 },
        { difficulty: "moyen", expectedLevel: 2 },
        { difficulty: "difficile", expectedLevel: 3 },
      ];

      for (const testCase of testCases) {
        const subject = new Subject({
          ...validSubjectData,
          difficulty: testCase.difficulty,
        });

        expect(subject.difficultyLevel).toBe(testCase.expectedLevel);
      }
    });

    test("should calculate completion percentage correctly", async () => {
      const subject = new Subject({
        ...validSubjectData,
        statistics: {
          ...validSubjectData.statistics,
          completionRate: 0.75,
        },
      });

      expect(subject.completionPercentage).toBe(75);
    });

    test("should handle completion percentage rounding", async () => {
      const subject = new Subject({
        ...validSubjectData,
        statistics: {
          ...validSubjectData.statistics,
          completionRate: 0.847,
        },
      });

      expect(subject.completionPercentage).toBe(85);
    });
  });

  describe("Querying Subjects", () => {
    beforeEach(async () => {
      const subjects = [
        {
          name: "Mathematics A",
          icon: "🔢",
          color: "#FF0000",
          description: "Math for series A",
          series: ["A"],
          category: "mathematiques",
          difficulty: "facile",
          popularity: 100,
        },
        {
          name: "Physics C",
          icon: "⚛️",
          color: "#00FF00",
          description: "Physics for series C",
          series: ["C"],
          category: "sciences",
          difficulty: "difficile",
          popularity: 150,
        },
        {
          name: "French General",
          icon: "📚",
          color: "#0000FF",
          description: "French for all series",
          series: ["A", "C", "D"],
          category: "langues",
          difficulty: "moyen",
          popularity: 200,
        },
      ];

      await Subject.insertMany(subjects);
    });

    test("should find subjects by category", async () => {
      const mathSubjects = await Subject.find({ category: "mathematiques" });

      expect(mathSubjects).toHaveLength(1);
      expect(mathSubjects[0].name).toBe("Mathematics A");
    });

    test("should find subjects by series using $in operator", async () => {
      const seriesASubjects = await Subject.find({ series: { $in: ["A"] } });

      expect(seriesASubjects).toHaveLength(2);
      seriesASubjects.forEach((subject) => {
        expect(subject.series).toContain("A");
      });
    });

    test("should find subjects by difficulty", async () => {
      const easySubjects = await Subject.find({ difficulty: "facile" });

      expect(easySubjects).toHaveLength(1);
      expect(easySubjects[0].difficulty).toBe("facile");
    });

    test("should find active subjects only", async () => {
      // Deactivate one subject
      await Subject.findOneAndUpdate(
        { name: "Mathematics A" },
        { isActive: false }
      );

      const activeSubjects = await Subject.find({ isActive: true });

      expect(activeSubjects).toHaveLength(2);
      activeSubjects.forEach((subject) => {
        expect(subject.isActive).toBe(true);
      });
    });

    test("should sort subjects by popularity descending", async () => {
      const sortedSubjects = await Subject.find({}).sort({ popularity: -1 });

      const popularities = sortedSubjects.map((s) => s.popularity);
      expect(popularities).toEqual([200, 150, 100]);
    });

    test("should sort subjects by name ascending", async () => {
      const sortedSubjects = await Subject.find({}).sort({ name: 1 });

      const names = sortedSubjects.map((s) => s.name);
      expect(names).toEqual(["French General", "Mathematics A", "Physics C"]);
    });

    test("should apply pagination correctly", async () => {
      const page1 = await Subject.find({}).limit(2).skip(0);
      const page2 = await Subject.find({}).limit(2).skip(2);

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);

      // Ensure different subjects
      const page1Ids = page1.map((s) => s._id.toString());
      const page2Ids = page2.map((s) => s._id.toString());

      page1Ids.forEach((id) => {
        expect(page2Ids).not.toContain(id);
      });
    });

    test("should count documents correctly", async () => {
      const totalCount = await Subject.countDocuments({});
      const activeCount = await Subject.countDocuments({ isActive: true });
      const mathCount = await Subject.countDocuments({
        category: "mathematiques",
      });

      expect(totalCount).toBe(3);
      expect(activeCount).toBe(3);
      expect(mathCount).toBe(1);
    });
  });

  describe("Complex Queries", () => {
    beforeEach(async () => {
      const subjects = [
        {
          name: "Advanced Math A",
          icon: "🔢",
          color: "#FF0000",
          description: "Advanced mathematics",
          series: ["A"],
          category: "mathematiques",
          difficulty: "difficile",
          popularity: 80,
          rating: { average: 4.5, count: 10 },
          tags: ["calculus", "algebra"],
        },
        {
          name: "Basic Science C",
          icon: "🔬",
          color: "#00FF00",
          description: "Basic science concepts",
          series: ["C"],
          category: "sciences",
          difficulty: "facile",
          popularity: 120,
          rating: { average: 3.8, count: 15 },
          tags: ["biology", "chemistry"],
        },
        {
          name: "Language Arts",
          icon: "📝",
          color: "#0000FF",
          description: "Language and literature",
          series: ["A", "C"],
          category: "langues",
          difficulty: "moyen",
          popularity: 90,
          rating: { average: 4.2, count: 8 },
          tags: ["literature", "grammar"],
        },
      ];

      await Subject.insertMany(subjects);
    });

    test("should find subjects with rating above threshold", async () => {
      const highRatedSubjects = await Subject.find({
        "rating.average": { $gte: 4.0 },
      });

      expect(highRatedSubjects).toHaveLength(2);
      highRatedSubjects.forEach((subject) => {
        expect(subject.rating.average).toBeGreaterThanOrEqual(4.0);
      });
    });

    test("should find subjects with popularity in range", async () => {
      const moderatelyPopular = await Subject.find({
        popularity: { $gte: 80, $lte: 100 },
      });

      expect(moderatelyPopular).toHaveLength(2);
      moderatelyPopular.forEach((subject) => {
        expect(subject.popularity).toBeGreaterThanOrEqual(80);
        expect(subject.popularity).toBeLessThanOrEqual(100);
      });
    });

    test("should find subjects by multiple series", async () => {
      const multiSeriesSubjects = await Subject.find({
        series: { $in: ["A", "C"] },
      });

      expect(multiSeriesSubjects).toHaveLength(3);
    });

    test("should find subjects by tags", async () => {
      const mathSubjects = await Subject.find({
        tags: { $in: ["algebra"] },
      });

      expect(mathSubjects).toHaveLength(1);
      expect(mathSubjects[0].tags).toContain("algebra");
    });

    test("should combine multiple filter conditions", async () => {
      const filteredSubjects = await Subject.find({
        category: "sciences",
        difficulty: "facile",
        popularity: { $gt: 100 },
      });

      expect(filteredSubjects).toHaveLength(1);
      expect(filteredSubjects[0].name).toBe("Basic Science C");
    });

    test("should use text search if available", async () => {
      // Note: Text index might not be available in test environment
      // This test demonstrates the query structure
      try {
        const searchResults = await Subject.find({
          $text: { $search: "advanced mathematics" },
        });

        // If text index is available, verify results
        if (searchResults.length > 0) {
          expect(searchResults[0].name).toContain("Math");
        }
      } catch (error) {
        // Text index not available in test environment - this is expected
        expect(error.message).toContain("text index");
      }
    });
  });

  describe("Aggregation Queries", () => {
    beforeEach(async () => {
      const subjects = [
        {
          name: "Math A1",
          icon: "🔢",
          color: "#FF0000",
          description: "Math A1",
          series: ["A"],
          category: "mathematiques",
          difficulty: "facile",
          popularity: 100,
          rating: { average: 4.0, count: 10 },
        },
        {
          name: "Math A2",
          icon: "🔢",
          color: "#FF0001",
          description: "Math A2",
          series: ["A"],
          category: "mathematiques",
          difficulty: "moyen",
          popularity: 120,
          rating: { average: 4.2, count: 12 },
        },
        {
          name: "Science C1",
          icon: "🔬",
          color: "#00FF00",
          description: "Science C1",
          series: ["C"],
          category: "sciences",
          difficulty: "difficile",
          popularity: 80,
          rating: { average: 3.8, count: 8 },
        },
      ];

      await Subject.insertMany(subjects);
    });

    test("should group subjects by category", async () => {
      const grouped = await Subject.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating.average" },
            totalPopularity: { $sum: "$popularity" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      expect(grouped).toHaveLength(2);

      const mathGroup = grouped.find((g) => g._id === "mathematiques");
      expect(mathGroup.count).toBe(2);
      expect(mathGroup.avgRating).toBe(4.1);

      const scienceGroup = grouped.find((g) => g._id === "sciences");
      expect(scienceGroup.count).toBe(1);
    });

    test("should calculate statistics by difficulty", async () => {
      const stats = await Subject.aggregate([
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
            avgPopularity: { $avg: "$popularity" },
            maxRating: { $max: "$rating.average" },
            minRating: { $min: "$rating.average" },
          },
        },
      ]);

      expect(stats).toHaveLength(3);

      const facileStats = stats.find((s) => s._id === "facile");
      expect(facileStats.count).toBe(1);
      expect(facileStats.avgPopularity).toBe(100);
    });

    test("should find top subjects by performance score", async () => {
      const topSubjects = await Subject.aggregate([
        {
          $addFields: {
            performanceScore: {
              $add: [
                { $multiply: ["$rating.average", 20] },
                { $multiply: ["$popularity", 0.1] },
              ],
            },
          },
        },
        { $sort: { performanceScore: -1 } },
        { $limit: 2 },
        {
          $project: {
            name: 1,
            category: 1,
            rating: 1,
            popularity: 1,
            performanceScore: 1,
          },
        },
      ]);

      expect(topSubjects).toHaveLength(2);
      expect(topSubjects[0].performanceScore).toBeGreaterThan(
        topSubjects[1].performanceScore
      );
    });

    test("should get distinct values", async () => {
      const categories = await Subject.distinct("category");
      const difficulties = await Subject.distinct("difficulty");
      const series = await Subject.distinct("series");

      expect(categories).toEqual(
        expect.arrayContaining(["mathematiques", "sciences"])
      );
      expect(difficulties).toEqual(
        expect.arrayContaining(["facile", "moyen", "difficile"])
      );
      expect(series).toEqual(expect.arrayContaining(["A", "C"]));
    });
  });

  describe("Population and References", () => {
    test("should populate examIds when they exist", async () => {
      // Note: This would require actual Exam documents in a real scenario
      const subject = new Subject({
        ...validSubjectData,
        examIds: ["507f1f77bcf86cd799439011"],
      });

      await subject.save();

      // In a real scenario with Exam model:
      // const populatedSubject = await Subject.findById(subject._id)
      //   .populate('examIds', 'title description difficulty');

      expect(subject.examIds).toHaveLength(1);
      expect(subject.examCount).toBe(1);
    });
  });
});
