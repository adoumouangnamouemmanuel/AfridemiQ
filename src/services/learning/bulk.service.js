const { Subject } = require("../../models/subject.model");
const createLogger = require("../logging.service");

const logger = createLogger("BulkService");

/**
 * Bulk create subjects
 */
const bulkCreateSubjects = async (subjectsData) => {
  try {
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: subjectsData.length,
        created: 0,
        failed: 0,
      },
    };

    for (let i = 0; i < subjectsData.length; i++) {
      try {
        const subjectData = subjectsData[i];

        // Check for duplicates
        const existing = await Subject.findOne({
          name: subjectData.name,
          series: { $in: subjectData.series },
          isActive: true,
        });

        if (existing) {
          results.failed.push({
            index: i,
            data: subjectData,
            error: "Subject with this name already exists for this series",
          });
          continue;
        }

        const subject = new Subject(subjectData);
        await subject.save();

        results.successful.push({
          index: i,
          subject: subject.toJSON(),
        });
        results.summary.created++;
      } catch (error) {
        results.failed.push({
          index: i,
          data: subjectsData[i],
          error: error.message,
        });
      }
    }

    results.summary.failed = results.failed.length;

    logger.info(
      `Bulk create completed: ${results.summary.created} created, ${results.summary.failed} failed`,
      {
        total: results.summary.total,
      }
    );

    return results;
  } catch (error) {
    logger.error("Error in bulk create subjects", error);
    throw error;
  }
};

/**
 * Bulk update subjects
 */
const bulkUpdateSubjects = async (updates) => {
  try {
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: updates.length,
        updated: 0,
        failed: 0,
      },
    };

    for (let i = 0; i < updates.length; i++) {
      try {
        const { id, data } = updates[i];

        const subject = await Subject.findById(id);
        if (!subject) {
          results.failed.push({
            index: i,
            id,
            error: "Subject not found",
          });
          continue;
        }

        // Update fields
        Object.keys(data).forEach((key) => {
          if (key !== "_id") {
            subject[key] = data[key];
          }
        });

        await subject.save();

        results.successful.push({
          index: i,
          subject: subject.toJSON(),
        });
        results.summary.updated++;
      } catch (error) {
        results.failed.push({
          index: i,
          id: updates[i].id,
          error: error.message,
        });
      }
    }

    results.summary.failed = results.failed.length;

    logger.info(
      `Bulk update completed: ${results.summary.updated} updated, ${results.summary.failed} failed`,
      {
        total: results.summary.total,
      }
    );

    return results;
  } catch (error) {
    logger.error("Error in bulk update subjects", error);
    throw error;
  }
};

/**
 * Bulk delete subjects (soft delete)
 */
const bulkDeleteSubjects = async (subjectIds) => {
  try {
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: subjectIds.length,
        deleted: 0,
        failed: 0,
      },
    };

    for (let i = 0; i < subjectIds.length; i++) {
      try {
        const subjectId = subjectIds[i];

        const subject = await Subject.findById(subjectId);
        if (!subject) {
          results.failed.push({
            index: i,
            id: subjectId,
            error: "Subject not found",
          });
          continue;
        }

        subject.isActive = false;
        await subject.save();

        results.successful.push({
          index: i,
          id: subjectId,
          name: subject.name,
        });
        results.summary.deleted++;
      } catch (error) {
        results.failed.push({
          index: i,
          id: subjectIds[i],
          error: error.message,
        });
      }
    }

    results.summary.failed = results.failed.length;

    logger.info(
      `Bulk delete completed: ${results.summary.deleted} deleted, ${results.summary.failed} failed`,
      {
        total: results.summary.total,
      }
    );

    return results;
  } catch (error) {
    logger.error("Error in bulk delete subjects", error);
    throw error;
  }
};

/**
 * Bulk export subjects
 */
const bulkExportSubjects = async (filters = {}, format = "json") => {
  try {
    const matchConditions = { isActive: true };

    if (filters.category) matchConditions.category = filters.category;
    if (filters.series) matchConditions.series = { $in: [filters.series] };
    if (filters.difficulty) matchConditions.difficulty = filters.difficulty;

    const subjects = await Subject.find(matchConditions).sort({ name: 1 });

    if (format === "csv") {
      // Convert to CSV format
      const csvHeaders = [
        "ID",
        "Name",
        "Category",
        "Series",
        "Difficulty",
        "Description",
        "Rating",
        "Popularity",
        "Estimated Hours",
        "Tags",
        "Created At",
      ];

      const csvRows = subjects.map((subject) => [
        subject._id,
        subject.name,
        subject.category,
        subject.series.join(";"),
        subject.difficulty,
        subject.description,
        subject.rating.average,
        subject.popularity,
        subject.estimatedHours || "",
        subject.tags.join(";"),
        subject.createdAt.toISOString(),
      ]);

      return {
        format: "csv",
        headers: csvHeaders,
        data: csvRows,
        count: subjects.length,
      };
    }

    // Default JSON format
    return {
      format: "json",
      data: subjects,
      count: subjects.length,
    };
  } catch (error) {
    logger.error("Error in bulk export subjects", error, { filters, format });
    throw error;
  }
};

/**
 * Bulk import subjects from CSV/JSON
 */
const bulkImportSubjects = async (data, format = "json") => {
  try {
    let subjectsData = [];

    if (format === "csv") {
      // Parse CSV data
      const [headers, ...rows] = data;
      subjectsData = rows.map((row) => {
        const subject = {};
        headers.forEach((header, index) => {
          const value = row[index];
          switch (header.toLowerCase()) {
            case "name":
              subject.name = value;
              break;
            case "category":
              subject.category = value;
              break;
            case "series":
              subject.series = value ? value.split(";") : [];
              break;
            case "difficulty":
              subject.difficulty = value;
              break;
            case "description":
              subject.description = value;
              break;
            case "icon":
              subject.icon = value;
              break;
            case "color":
              subject.color = value;
              break;
            case "tags":
              subject.tags = value ? value.split(";") : [];
              break;
            case "estimatedhours":
              subject.estimatedHours = value
                ? Number.parseInt(value)
                : undefined;
              break;
          }
        });
        return subject;
      });
    } else {
      subjectsData = data;
    }

    // Validate required fields
    const validSubjects = subjectsData.filter((subject) => {
      return (
        subject.name &&
        subject.category &&
        subject.description &&
        subject.series &&
        subject.series.length > 0
      );
    });

    if (validSubjects.length === 0) {
      throw new Error("No valid subjects found in import data");
    }

    // Use bulk create
    const result = await bulkCreateSubjects(validSubjects);

    logger.info(
      `Bulk import completed: ${result.summary.created} imported, ${result.summary.failed} failed`,
      {
        format,
        totalProvided: subjectsData.length,
        validSubjects: validSubjects.length,
      }
    );

    return {
      ...result,
      importStats: {
        totalProvided: subjectsData.length,
        validSubjects: validSubjects.length,
        invalidSubjects: subjectsData.length - validSubjects.length,
      },
    };
  } catch (error) {
    logger.error("Error in bulk import subjects", error, { format });
    throw error;
  }
};

module.exports = {
  bulkCreateSubjects,
  bulkUpdateSubjects,
  bulkDeleteSubjects,
  bulkExportSubjects,
  bulkImportSubjects,
};