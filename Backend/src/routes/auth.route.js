import { Router } from "express";
import { login, register, getMe } from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validation/auth.validation.js";

const router = Router();

router.post("/register", register);
router.post("/login", validate(loginSchema), login);
router.get("/me", getMe);

export default router;
