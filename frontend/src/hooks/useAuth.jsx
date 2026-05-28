import { createContext, useContext, useEffect, useState } from "react";
import {
  login,
  register,
  verifyOtp,
  resendOtp,
  logout,
  getCurrentUser,
  getMe,
  updateMe,
  uploadProfilePic,
  deleteProfilePic,
} from "../services/authService";
import { addToCart, getCart, getFavorites, removeCartItem, toggleLike, updateCartItem } from "../services/bookService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user on refresh
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const [likedBooks, setLikedBooks] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setLikedBooks([]);
      setCartItems([]);
      return;
    }
    getFavorites().then(setLikedBooks).catch(() => setLikedBooks([]));
    getCart().then(setCartItems).catch(() => setCartItems([]));
  }, [user]);

  const loginUser = async (email, password) => {
    const data = await login(email, password);
    setUser(data);
    return data;
  };

  const registerUser = async (name, email, password, role = "user") => {
    const data = await register(name, email, password, role);
    return data;
  };

  const verifyOtpAndLogin = async (email, otp) => {
    const data = await verifyOtp(email, otp);
    setUser(data);
    return data;
  };

  const resendSignupOtp = async (email) => {
    return resendOtp(email);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    setLikedBooks([]);
    setCartItems([]);
  };

  const refreshProfile = async () => {
    const fresh = await getMe();
    setUser(fresh);
    return fresh;
  };

  const updateProfile = async (payload) => {
    const updated = await updateMe(payload);
    setUser(updated);
    return updated;
  };

  const updateSettingsState = (newSettings) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        settings: {
          ...prev.settings,
          ...newSettings,
        },
      };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const uploadProfilePicture = async (formData) => {
    const updated = await uploadProfilePic(formData);
    setUser(updated);
    return updated;
  };

  const removeProfilePicture = async () => {
    const updated = await deleteProfilePic();
    setUser(updated);
    return updated;
  };

  const toggleBookLike = async (bookId) => {
    await toggleLike(bookId);
    const favorites = await getFavorites();
    setLikedBooks(favorites);
  };

  const addBookToCart = async (bookId, quantity = 1) => {
    const updated = await addToCart(bookId, quantity);
    setCartItems(updated);
  };

  const updateBookInCart = async (itemId, quantity) => {
    const updated = await updateCartItem(itemId, quantity);
    setCartItems(updated);
  };

  const removeBookFromCart = async (itemId) => {
    const updated = await removeCartItem(itemId);
    setCartItems(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        likedBooks,
        cartItems,
        loginUser,
        registerUser,
        verifyOtpAndLogin,
        resendSignupOtp,
        logoutUser,
        refreshProfile,
        updateProfile,
        updateSettingsState,
        uploadProfilePicture,
        removeProfilePicture,
        toggleBookLike,
        addBookToCart,
        updateBookInCart,
        removeBookFromCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
