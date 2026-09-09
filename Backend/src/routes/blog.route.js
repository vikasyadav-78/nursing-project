import { Router } from "express";
import {
  addBlog,
  getAllBlogs,
  getBlogById,
  removeBlog,
  updateBlog,
  updateBlogStatus,
} from "../controller/blog.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { createBlogSchema } from "../validation/blog.validation.js";

const router = Router();

router.post(
  "/",
  upload("blogs").single("image"),
  addBlog
);

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.delete("/:id", removeBlog);

router.put(
  "/:id",
  verifyToken,
  upload("blogs").single("image"),
  updateBlog
);

router.put("/:id/status", verifyToken, updateBlogStatus);

export default router;
