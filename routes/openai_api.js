import { Router } from "express";
import {
  generateRecipeSubstitution,
  generateRecipeImage,
} from "../controllers/openaiController.js";

const router = Router();

router.post("/substitute", generateRecipeSubstitution);
router.post("/recipe-image", generateRecipeImage);

export default router;
