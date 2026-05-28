export const applyMoodTheme = (moods = [], genres = []) => {
  const root = document.documentElement;

  // Revert all classes
  root.classList.remove("mood-thrill", "mood-nature", "mood-dreamy", "mood-mystery", "mood-calm");

  const allTags = [
    ...(Array.isArray(moods) ? moods : []),
    ...(Array.isArray(genres) ? genres : [])
  ].map((t) => t.trim().toLowerCase());

  if (allTags.some((t) => ["thrill", "thriller", "adventure", "action", "suspense", "danger", "journey"].includes(t))) {
    root.classList.add("mood-thrill");
  } else if (allTags.some((t) => ["calm", "nature", "healing", "green", "peace", "design", "technology", "productivity"].includes(t))) {
    root.classList.add("mood-nature");
  } else if (allTags.some((t) => ["dreamy", "poetry", "romance", "prose", "love", "cozy", "soft", "self help"].includes(t))) {
    root.classList.add("mood-dreamy");
  } else if (allTags.some((t) => ["mystery", "gothic", "horror", "dark", "crime", "detective", "drama", "literary fiction"].includes(t))) {
    root.classList.add("mood-mystery");
  } else {
    // Default fallback
    root.classList.add("mood-calm");
  }
};
