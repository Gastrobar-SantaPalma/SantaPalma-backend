import storiesService from "./stories.service.js";

export async function getPeopleWithStories(req, res) {
  try {
    const venue_id = Number(req.query.venue_id);
    if (!venue_id) return res.status(400).json({ error: "venue_id es requerido" });

    const result = await storiesService.getPeopleWithStories({ venue_id });
    return res.json(result);
  } catch (error) {
    console.error("Error getPeopleWithStories:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getThemesSummary(req, res) {
  try {
    const venue_id = Number(req.query.venue_id);
    if (!venue_id) return res.status(400).json({ error: "venue_id es requerido" });

    const result = await storiesService.getThemesSummary({ venue_id });
    return res.json(result);
  } catch (error) {
    console.error("Error getThemesSummary:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getStories(req, res) {
  try {
    const venue_id = Number(req.query.venue_id);
    const user_id = Number(req.query.user_id);

    if (!venue_id) return res.status(400).json({ error: "venue_id es requerido" });
    if (!user_id) return res.status(400).json({ error: "user_id es requerido" });

    const result = await storiesService.getStoriesByUser({ venue_id, user_id });
    return res.json(result);
  } catch (error) {
    console.error("Error getStories:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}