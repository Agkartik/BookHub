import api from "./api";

export const getBooks = async (params = {}) => {
  const { data } = await api.get("/books", { params });
  return data;
};

export const getBook = async (id) => {
  const { data } = await api.get(`/books/${id}`);
  return data;
};

export const getMyBooks = async () => {
  const { data } = await api.get("/books/mine");
  return data;
};

export const uploadBook = async (formData) => {
  const { data } = await api.post("/books", formData);
  return data;
};

export const toggleLike = async (id) => {
  const { data } = await api.put(`/users/like/${id}`);
  return data;
};

export const getFavorites = async () => {
  const { data } = await api.get("/users/liked-books");
  return data;
};

export const addReview = async (bookId, review) => {
  const { data } = await api.post(`/reviews/${bookId}`, review);
  return data;
};

export const updateReview = async (reviewId, review) => {
  const { data } = await api.put(`/reviews/${reviewId}`, review);
  return data;
};

export const getReviews = async (bookId) => {
  const { data } = await api.get(`/reviews/${bookId}`);
  return data;
};

export const getReviewComments = async (reviewId) => {
  const { data } = await api.get(`/reviews/${reviewId}/comments`);
  return data;
};

export const addReviewComment = async (reviewId, payload) => {
  const { data } = await api.post(`/reviews/${reviewId}/comments`, payload);
  return data;
};

export const saveProgress = async (bookId, payload) => {
  const { data } = await api.put(`/progress/${bookId}`, payload);
  return data;
};

export const getMyProgress = async () => {
  const { data } = await api.get("/progress");
  return data;
};

export const getRecommendations = async () => {
  const { data } = await api.get("/recommendations");
  return data;
};

export const getMoodRecommendations = async (mood) => {
  const { data } = await api.get("/recommendations/mood", { params: { mood } });
  return data;
};

export const getWriterDashboard = async () => {
  const { data } = await api.get("/dashboard/writer");
  return data;
};

export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const getAdminOverview = async () => {
  const { data } = await api.get("/admin/overview");
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const deleteAdminUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const getAdminBooks = async () => {
  const { data } = await api.get("/admin/books");
  return data;
};

export const updateAdminBook = async (id, payload) => {
  const { data } = await api.put(`/admin/books/${id}`, payload);
  return data;
};

export const deleteAdminBook = async (id) => {
  const { data } = await api.delete(`/admin/books/${id}`);
  return data;
};

export const createReport = async (payload) => {
  const { data } = await api.post("/moderation/report", payload);
  return data;
};

export const getAdminReports = async () => {
  const { data } = await api.get("/moderation/admin/reports");
  return data;
};

export const resolveAdminReport = async (id, payload = {}) => {
  const { data } = await api.put(`/moderation/admin/reports/${id}/resolve`, payload);
  return data;
};

export const getCart = async () => {
  const { data } = await api.get("/users/cart");
  return data;
};

export const addToCart = async (bookId, quantity = 1) => {
  const { data } = await api.post("/users/cart", { bookId, quantity });
  return data;
};

export const updateCartItem = async (itemId, quantity) => {
  const { data } = await api.put(`/users/cart/${itemId}`, { quantity });
  return data;
};

export const removeCartItem = async (itemId) => {
  const { data } = await api.delete(`/users/cart/${itemId}`);
  return data;
};

export const getHighlights = async (bookId, params = {}) => {
  const { data } = await api.get(`/highlights/${bookId}`, { params });
  return data;
};

export const createHighlight = async (bookId, highlight) => {
  const { data } = await api.post(`/highlights/${bookId}`, highlight);
  return data;
};

export const updateHighlight = async (id, highlight) => {
  const { data } = await api.put(`/highlights/${id}`, highlight);
  return data;
};

export const deleteHighlight = async (id) => {
  const { data } = await api.delete(`/highlights/${id}`);
  return data;
};

export const chatWithBook = async (bookId, payload) => {
  const { data } = await api.post(`/chat/${bookId}`, payload);
  return data;
};

export const sendReadingHeartbeat = async () => {
  const { data } = await api.post("/users/heartbeat");
  return data;
};

export const updateReadingGoal = async (goal) => {
  const { data } = await api.put("/users/reading-goal", { goal });
  return data;
};

export const getMusic = async (params = {}) => {
  const { data } = await api.get("/music", { params });
  return data;
};

export const getMyUploadedMusic = async () => {
  const { data } = await api.get("/music/my-uploads");
  return data;
};

export const uploadMusic = async (formData) => {
  const { data } = await api.post("/music", formData);
  return data;
};

export const deleteMusic = async (id) => {
  const { data } = await api.delete(`/music/${id}`);
  return data;
};
