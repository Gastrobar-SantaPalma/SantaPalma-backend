import { Router } from "express";
import { getPeopleWithStories, getThemesSummary, getStories } from "./stories.controller.js";

const router = Router();

router.get("/people", getPeopleWithStories);
router.get("/themes", getThemesSummary);
router.get("/", getStories);

export default router;