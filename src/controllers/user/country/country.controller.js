const { StatusCodes } = require("http-status-codes");
const countryService = require("../../services/user/country/country.service");

// Create a new country
const createCountry = async (req, res) => {
  try {
    const country = await countryService.createCountry(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Pays créé avec succès",
      data: country,
    });
  } catch (error) {
    console.error("Error in createCountry controller", error);
    throw error;
  }
};

// Get all countries
const getCountries = async (req, res) => {
  try {
    const result = await countryService.getCountries(req.query);
    res.status(StatusCodes.OK).json({
      message: "Pays récupérés avec succès",
      data: result.countries,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getCountries controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Get country by ID
const getCountryById = async (req, res) => {
  try {
    const country = await countryService.getCountryById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Pays récupéré avec succès",
      data: country,
    });
  } catch (error) {
    console.error("Error in getCountryById controller", error, {
      countryId: req.params.id,
    });
    throw error;
  }
};

// Get country by code
const getCountryByCode = async (req, res) => {
  try {
    const country = await countryService.getCountryByCode(req.params.code);
    res.status(StatusCodes.OK).json({
      message: "Pays récupéré avec succès",
      data: country,
    });
  } catch (error) {
    console.error("Error in getCountryByCode controller", error, {
      countryCode: req.params.code,
    });
    throw error;
  }
};

// Update country
const updateCountry = async (req, res) => {
  try {
    const country = await countryService.updateCountry(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Pays mis à jour avec succès",
      data: country,
    });
  } catch (error) {
    console.error("Error in updateCountry controller", error, {
      countryId: req.params.id,
    });
    throw error;
  }
};

// Delete country
const deleteCountry = async (req, res) => {
  try {
    const result = await countryService.deleteCountry(req.params.id);
    res.status(StatusCodes.OK).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteCountry controller", error, {
      countryId: req.params.id,
    });
    throw error;
  }
};

// Add exam to country
const addExamToCountry = async (req, res) => {
  try {
    const country = await countryService.addExamToCountry(
      req.params.id,
      req.body.examId
    );
    res.status(StatusCodes.OK).json({
      message: "Examen ajouté au pays avec succès",
      data: country,
    });
  } catch (error) {
    console.error("Error in addExamToCountry controller", error, {
      countryId: req.params.id,
      examId: req.body.examId,
    });
    throw error;
  }
};

// Remove exam from country
const removeExamFromCountry = async (req, res) => {
  try {
    const country = await countryService.removeExamFromCountry(
      req.params.id,
      req.params.examId
    );
    res.status(StatusCodes.OK).json({
      message: "Examen retiré du pays avec succès",
      data: country,
    });
  } catch (error) {
    console.error("Error in removeExamFromCountry controller", error, {
      countryId: req.params.id,
      examId: req.params.examId,
    });
    throw error;
  }
};

// Get countries by region
const getCountriesByRegion = async (req, res) => {
  try {
    const countries = await countryService.getCountriesByRegion(
      req.params.region
    );
    res.status(StatusCodes.OK).json({
      message: "Pays récupérés par région avec succès",
      data: countries,
    });
  } catch (error) {
    console.error("Error in getCountriesByRegion controller", error, {
      region: req.params.region,
    });
    throw error;
  }
};

// Get countries by education system
const getCountriesByEducationSystem = async (req, res) => {
  try {
    const countries = await countryService.getCountriesByEducationSystem(
      req.params.educationSystem
    );
    res.status(StatusCodes.OK).json({
      message: "Pays récupérés par système éducatif avec succès",
      data: countries,
    });
  } catch (error) {
    console.error("Error in getCountriesByEducationSystem controller", error, {
      educationSystem: req.params.educationSystem,
    });
    throw error;
  }
};

// Get countries by language
const getCountriesByLanguage = async (req, res) => {
  try {
    const countries = await countryService.getCountriesByLanguage(
      req.params.language
    );
    res.status(StatusCodes.OK).json({
      message: "Pays récupérés par langue avec succès",
      data: countries,
    });
  } catch (error) {
    console.error("Error in getCountriesByLanguage controller", error, {
      language: req.params.language,
    });
    throw error;
  }
};

// Get country statistics
const getCountryStats = async (req, res) => {
  try {
    const stats = await countryService.getCountryStats();
    res.status(StatusCodes.OK).json({
      message: "Statistiques des pays récupérées avec succès",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getCountryStats controller", error);
    throw error;
  }
};

// Search countries
const searchCountries = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const countries = await countryService.searchCountries(
      q,
      Number.parseInt(limit)
    );
    res.status(StatusCodes.OK).json({
      message: "Recherche de pays effectuée avec succès",
      data: countries,
    });
  } catch (error) {
    console.error("Error in searchCountries controller", error, {
      query: req.query,
    });
    throw error;
  }
};

module.exports = {
  createCountry,
  getCountries,
  getCountryById,
  getCountryByCode,
  updateCountry,
  deleteCountry,
  addExamToCountry,
  removeExamFromCountry,
  getCountriesByRegion,
  getCountriesByEducationSystem,
  getCountriesByLanguage,
  getCountryStats,
  searchCountries,
};