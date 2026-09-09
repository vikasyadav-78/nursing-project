import {
  searchEntitiesService,
  autocompleteSearchService,
  getSupportedFilterOptionsService,
} from "../services/search.service.js";

/**
 * GET /api/search
 * Unified Search Endpoint with Filters, Ranking, and Pagination
 */
export const handleSearch = async (req, res) => {
  try {
    const data = await searchEntitiesService(req.query);
    res.json({
      success: true,
      message: "Search query processed successfully",
      data,
    });
  } catch (error) {
    console.error("SEARCH CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute search query",
      error: error.message,
    });
  }
};

/**
 * GET /api/search/autocomplete
 * Fast suggestions dropdown for search input bar
 */
export const handleAutocomplete = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const suggestions = await autocompleteSearchService(q, limit);
    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("AUTOCOMPLETE CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch autocomplete suggestions",
      error: error.message,
    });
  }
};

/**
 * GET /api/search/filters
 * Dynamic Supported Filter options metadata for sidebar
 */
export const handleFilterOptions = async (req, res) => {
  try {
    const filters = await getSupportedFilterOptionsService();
    res.json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error("FILTER OPTIONS CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch supported filter options",
      error: error.message,
    });
  }
};
