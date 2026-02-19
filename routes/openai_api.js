import { Router } from "express";
import { generateRecipeSubstitution } from "../controllers/openaiController.js";

const router = Router();

router.post("/substitute", generateRecipeSubstitution);

export default router;
