import express from "express";
import {
  handleSearch,
  handleAutocomplete,
  handleFilterOptions,
} from "../controller/search.controller.js";

const router = express.Router();

router.get("/", handleSearch);
router.get("/autocomplete", handleAutocomplete);
router.get("/filters", handleFilterOptions);

export default router;
