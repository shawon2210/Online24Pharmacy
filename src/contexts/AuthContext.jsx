/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "TOKEN_REFRESH":
      return { ...state, accessToken: action.payload };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,
};

const loadPersistedState = () => {
  try {
    const persistedUser = localStorage.getItem("auth_user");
    const persistedToken = localStorage.getItem("auth_token");
    if (persistedUser && persistedToken) {
      const user = JSON.parse(persistedUser);
      return {
        user,
        accessToken: persistedToken,
        isAuthenticated: true,
        loading: false,
      };
    }
  } catch (e) {
    console.error("Failed to load persisted auth state:", e);
  }
  return { ...initialState, loading: false };
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, loadPersistedState());

  // Set up axios interceptor
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [state.accessToken]);

  // Check authentication on app load
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const login = async (email, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      // Persist to localStorage
      localStorage.setItem("auth_user", JSON.stringify(response.data.user));
      localStorage.setItem("auth_token", response.data.accessToken);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          accessToken: response.data.accessToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  const signup = async (userData) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.post(
        `${API_URL}/api/auth/signup`,
        userData,
        { withCredentials: true }
      );

      localStorage.setItem("auth_user", JSON.stringify(response.data.user));
      localStorage.setItem("auth_token", response.data.accessToken);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          accessToken: response.data.accessToken,
        },
      });

      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      console.error("Signup error details:", JSON.stringify(errorData, null, 2));
      
      let errorMessage = "Signup failed";
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        console.log("Validation details:", errorData.details);
        errorMessage = errorData.details.map(d => d.message || d.msg || d.error || JSON.stringify(d)).join(", ");
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      dispatch({ type: "LOGOUT" });
      window.location.href = "/login";
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
    // Also update localStorage
    const currentUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ ...currentUser, ...userData })
    );
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
    isAdmin: state.user?.role === "ADMIN",
    isUser: state.user?.role === "USER" || state.user?.role === "CUSTOMER",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
