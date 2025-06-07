const express = require("express");
const router = express.Router();
const countryController = require("../../controllers/user/country.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createCountrySchema,
  updateCountrySchema,
  getCountriesSchema,
  addExamToCountrySchema,
} = require("../../schemas/user/country.schema");
const Joi = require("joi");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes - ORDER MATTERS! More specific routes must come before generic ones
router.get("/search", countryController.searchCountries);
router.get("/stats", countryController.getCountryStats);
router.get("/region/:region", countryController.getCountriesByRegion);
router.get(
  "/education-system/:educationSystem",
  countryController.getCountriesByEducationSystem
);
router.get(
  "/language/:language",
  validateMiddleware(Joi.object({
    language: Joi.string().required().trim().min(2).max(50)
  })),
  countryController.getCountriesByLanguage
);
router.get("/code/:code", countryController.getCountryByCode);
router.get(
  "/",
  validateMiddleware(getCountriesSchema),
  countryController.getCountries
);
router.get("/:id", countryController.getCountryById);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin routes only
router.post(
  "/",
  roleMiddleware(["admin"]),
  validateMiddleware(createCountrySchema),
  countryController.createCountry
);

router.put(
  "/:id",
  roleMiddleware(["admin"]),
  validateMiddleware(updateCountrySchema),
  countryController.updateCountry
);

router.delete(
  "/:id",
  roleMiddleware(["admin"]),
  countryController.deleteCountry
);

router.post(
  "/:id/exams",
  roleMiddleware(["admin"]),
  validateMiddleware(addExamToCountrySchema),
  countryController.addExamToCountry
);

router.delete(
  "/:id/exams/:examId",
  roleMiddleware(["admin"]),
  countryController.removeExamFromCountry
);

module.exports = router;