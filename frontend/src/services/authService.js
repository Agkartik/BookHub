import api from "./api";

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  return data;
};

export const register = async (name, email, password, role = "user") => {
  const { data } = await api.post("/auth/register", { name, email, password, role });
  return data;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await api.post("/auth/verify-otp", { email, otp });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  return data;
};

export const resendOtp = async (email) => {
  const { data } = await api.post("/auth/resend-otp", { email });
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getMe = async () => {
  const { data } = await api.get("/users/me");
  const existing = getCurrentUser() || {};
  const merged = { ...existing, ...data };
  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
};

export const updateMe = async (payload) => {
  const { data } = await api.put("/users/me", payload);
  const existing = getCurrentUser() || {};
  const merged = { ...existing, ...data };
  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
};

export const verifyEmail = async (token) => {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
};

export const getUserSettings = async () => {
  const { data } = await api.get("/users/settings");
  return data;
};

export const updateUserSettings = async (payload) => {
  const { data } = await api.put("/users/settings", payload);
  return data;
};

export const uploadProfilePic = async (formData) => {
  const { data } = await api.post("/users/me/profile-pic", formData);
  const existing = getCurrentUser() || {};
  const merged = { ...existing, profilePicture: data.profilePicture };
  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
};

export const deleteProfilePic = async () => {
  const { data } = await api.delete("/users/me/profile-pic");
  const existing = getCurrentUser() || {};
  const merged = { ...existing, profilePicture: "" };
  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
};
