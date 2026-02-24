import supabase from "../../config/supabaseClient.js";

class StoriesService {
  async getPeopleWithStories({ venue_id }) {
    const now = new Date().toISOString();

    // 1) trae historias activas del venue
    const { data: stories, error } = await supabase
      .from("stories")
      .select("id, user_id, created_at")
      .eq("venue_id", venue_id)
      .gt("expires_at", now)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Agrupar por user_id (conteo + latestAt)
    const map = new Map();
    for (const s of stories || []) {
      if (!map.has(s.user_id)) {
        map.set(s.user_id, { user_id: s.user_id, storyCount: 1, latestAt: s.created_at });
      } else {
        const cur = map.get(s.user_id);
        cur.storyCount += 1;
      }
    }

    const userIds = [...map.keys()];
    if (!userIds.length) return [];

    // 2) trae nombres (y foto_url si luego existe)
    const { data: users, error: usersError } = await supabase
      .from("usuarios")
      .select("id_usuario, nombre")
      .in("id_usuario", userIds);

    if (usersError) throw new Error(usersError.message);

    const usersById = new Map((users || []).map(u => [u.id_usuario, u]));

    return userIds.map(userId => ({
      user_id: userId,
      nombre: usersById.get(userId)?.nombre ?? null,
      foto: null,
      hasStory: true,
      storyCount: map.get(userId)?.storyCount ?? 0,
      latestAt: map.get(userId)?.latestAt ?? null
    }));
  }

  async getThemesSummary({ venue_id }) {
    const now = new Date().toISOString();

    const { data: stories, error } = await supabase
      .from("stories")
      .select("venue_category, user_id")
      .eq("venue_id", venue_id)
      .gt("expires_at", now);

    if (error) throw new Error(error.message);

    const summary = new Map(); // category -> {activeUsers:Set, activeStories:number}
    for (const s of stories || []) {
      const key = s.venue_category;
      if (!summary.has(key)) summary.set(key, { activeUsers: new Set(), activeStories: 0 });
      const item = summary.get(key);
      item.activeStories += 1;
      item.activeUsers.add(s.user_id);
    }

    const labelMap = {
      bares: "Bares",
      discotecas: "Discotecas",
      restaurantes: "Restaurantes",
      coworkings: "Coworkings"
    };

    return [...summary.entries()].map(([key, v]) => ({
      key,
      label: labelMap[key] ?? key,
      activeUsers: v.activeUsers.size,
      activeStories: v.activeStories
    }));
  }

  async getStoriesByUser({ venue_id, user_id }) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("stories")
      .select("id, user_id, venue_id, venue_category, media_url, created_at, expires_at")
      .eq("venue_id", venue_id)
      .eq("user_id", user_id)
      .gt("expires_at", now)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export default new StoriesService();