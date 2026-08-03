import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// The backend sets the refresh token as an httpOnly cookie; axios must be
// told to send credentials (cookies) on cross-origin requests for that to work.
axios.defaults.withCredentials = true;

// The access token is mirrored into this module-scoped variable (in
// addition to React state) so it can be read *synchronously*, at the exact
// moment each request is dispatched, by the request interceptor below.
//
// Previously the Authorization header was only ever set inside a
// useEffect. That created a real race: after login(), navigate("/dashboard")
// mounts Dashboard in the same commit as ApiProvider's own re-render, and
// React fires passive effects child-first - so Dashboard's own data-fetch
// effect could run *before* ApiProvider's effect had a chance to set
// axios.defaults.headers.common.Authorization. The very first authenticated
// request after login would then go out with no token, get a 401, trigger
// the (also broken) refresh flow, and the app would immediately log itself
// back out - bouncing straight back to the login page.
//
// Reading a synchronously-updated variable at request-dispatch time removes
// the dependency on effect ordering entirely.
let currentAccessToken = localStorage.getItem("token");

axios.interceptors.request.use((config) => {
  if (currentAccessToken && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// Create API context
const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(currentAccessToken);
  const [loading, setLoading] = useState(false);
  // Tracks only the one-time "do we have a valid session?" bootstrap check
  // performed on initial app load. Kept separate from the generic
  // per-request `loading` flag above so route guards (PrivateRoute) don't
  // flicker or momentarily bounce to /login every time some unrelated
  // page-level API call starts or finishes.
  const [authLoading, setAuthLoading] = useState(!!currentAccessToken);
  const [error, setError] = useState(null);

  // API base URL - should be environment variable in production
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

  // Synchronously updates the access token everywhere it's tracked: the
  // module-level variable read by the request interceptor, localStorage,
  // and React state (for components that render based on it).
  const applyToken = useCallback((newToken) => {
    currentAccessToken = newToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setToken(newToken);
  }, []);

  // Load user data
  const loadUser = useCallback(async () => {
    try {
      setError(null);

      const res = await axios.get(`${API_URL}/auth/me`);

      setUser(res.data.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error loading user:", err);
      setError("Failed to load user data");
      applyToken(null);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [API_URL, applyToken]);

  // Keep isAuthenticated/user in sync whenever the token changes. The
  // Authorization header itself no longer depends on this effect at all -
  // it's applied synchronously by applyToken()/the request interceptor.
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      loadUser();
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setAuthLoading(false);
    }
  }, [token, loadUser]);

  // Silently refresh the (short-lived, 15min) access token on a 401 instead
  // of forcing the user to log in again. Uses the httpOnly refresh cookie.
  useEffect(() => {
    let refreshPromise = null;

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;
        const isAuthEndpoint =
          originalRequest?.url?.includes("/auth/login") ||
          originalRequest?.url?.includes("/auth/register") ||
          originalRequest?.url?.includes("/auth/refresh");

        if (
          err.response?.status !== 401 ||
          isAuthEndpoint ||
          originalRequest._retry ||
          !currentAccessToken
        ) {
          return Promise.reject(err);
        }

        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_URL}/auth/refresh`)
              .finally(() => {
                refreshPromise = null;
              });
          }
          const refreshRes = await refreshPromise;
          const newAccessToken = refreshRes.data?.data?.accessToken;

          if (!newAccessToken) {
            throw new Error("No access token in refresh response");
          }

          applyToken(newAccessToken);
          // currentAccessToken is already updated by applyToken() above, so
          // re-dispatching through axios() will pick up the new header via
          // the request interceptor automatically.
          delete originalRequest.headers?.Authorization;

          return axios(originalRequest);
        } catch (refreshErr) {
          applyToken(null);
          setIsAuthenticated(false);
          setUser(null);
          return Promise.reject(err);
        }
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [API_URL, applyToken]);

  // Register user
  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/auth/register`, userData);

        // Registration requires email verification; no token is issued yet.
        setLoading(false);

        return res.data;
      } catch (err) {
        console.error("Error registering user:", err);
        setError(err.response?.data?.message || "Registration failed");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Login user
  const login = useCallback(
    async (email, password) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        const { user: loggedInUser, accessToken } = res.data.data;
        // Synchronous: any request dispatched immediately after login()
        // resolves (even from a page that mounts in the same render pass)
        // will already carry the correct Authorization header.
        applyToken(accessToken);
        setUser(loggedInUser);
        setIsAuthenticated(true);
        setAuthLoading(false);
        setLoading(false);

        return res.data;
      } catch (err) {
        console.error("Error logging in:", err);
        setError(err.response?.data?.message || "Login failed");
        setLoading(false);
        throw err;
      }
    },
    [API_URL, applyToken],
  );

  // Logout user
  const logout = useCallback(async () => {
    try {
      // Must be POST to match the backend route (GET was a mismatch that
      // 404'd and, worse, still counted against the auth rate limiter).
      await axios.post(`${API_URL}/auth/logout`);
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      applyToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [API_URL, applyToken]);

  // Update user profile
  const updateProfile = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.put(`${API_URL}/auth/updatedetails`, userData);

        setUser(res.data.data.user);
        setLoading(false);

        return res.data;
      } catch (err) {
        console.error("Error updating profile:", err);
        setError(err.response?.data?.message || "Profile update failed");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Update password
  const updatePassword = useCallback(
    async (passwordData) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.put(
          `${API_URL}/auth/updatepassword`,
          passwordData,
        );

        // Backend doesn't issue a new token on password change, so the
        // existing session token is left untouched.
        setLoading(false);

        return res.data;
      } catch (err) {
        console.error("Error updating password:", err);
        setError(err.response?.data?.message || "Password update failed");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Get all loans
  const getLoans = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams(filters).toString();
        const res = await axios.get(
          `${API_URL}/loans${queryParams ? `?${queryParams}` : ""}`,
        );

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error getting loans:", err);
        setError(err.response?.data?.message || "Failed to fetch loans");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Get user loans
  const getMyLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_URL}/loans/my-loans`);

      setLoading(false);
      return res.data;
    } catch (err) {
      console.error("Error getting user loans:", err);
      setError(err.response?.data?.message || "Failed to fetch your loans");
      setLoading(false);
      throw err;
    }
  }, [API_URL]);

  // Get loan details
  const getLoan = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_URL}/loans/${id}`);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error getting loan details:", err);
        setError(err.response?.data?.message || "Failed to fetch loan details");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Apply for loan
  const applyForLoan = useCallback(
    async (loanData) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/apply`, loanData);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error applying for loan:", err);
        setError(err.response?.data?.message || "Loan application failed");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Fund loan
  const fundLoan = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/fund`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error funding loan:", err);
        setError(err.response?.data?.message || "Failed to fund loan");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Disburse loan
  const disburseLoan = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/disburse`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error disbursing loan:", err);
        setError(err.response?.data?.message || "Failed to disburse loan");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Repay loan
  const repayLoan = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/repay`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error repaying loan:", err);
        setError(err.response?.data?.message || "Failed to repay loan");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Cancel loan
  const cancelLoan = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/cancel`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error cancelling loan:", err);
        setError(err.response?.data?.message || "Failed to cancel loan");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Create repayment schedule
  const createRepaymentSchedule = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/schedule`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error creating repayment schedule:", err);
        setError(
          err.response?.data?.message || "Failed to create repayment schedule",
        );
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Deposit collateral
  const depositCollateral = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/collateral`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error depositing collateral:", err);
        setError(err.response?.data?.message || "Failed to deposit collateral");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Set risk score
  const setRiskScore = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/risk`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error setting risk score:", err);
        setError(err.response?.data?.message || "Failed to set risk score");
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Mark loan as defaulted
  const markAsDefaulted = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.post(`${API_URL}/loans/${id}/default`, data);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error marking loan as defaulted:", err);
        setError(
          err.response?.data?.message || "Failed to mark loan as defaulted",
        );
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Get reputation score
  const getReputationScore = useCallback(
    async (address) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_URL}/loans/reputation/${address}`);

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Error getting reputation score:", err);
        setError(
          err.response?.data?.message || "Failed to get reputation score",
        );
        setLoading(false);
        throw err;
      }
    },
    [API_URL],
  );

  // Context value. Memoized so consumers that depend on the whole context
  // object (rather than a single destructured function) don't re-render or
  // re-fire effects on every unrelated state change either.
  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading,
      authLoading,
      error,
      register,
      login,
      logout,
      updateProfile,
      updatePassword,
      getLoans,
      getMyLoans,
      getLoan,
      applyForLoan,
      fundLoan,
      disburseLoan,
      repayLoan,
      cancelLoan,
      createRepaymentSchedule,
      depositCollateral,
      setRiskScore,
      markAsDefaulted,
      getReputationScore,
    }),
    [
      isAuthenticated,
      user,
      loading,
      authLoading,
      error,
      register,
      login,
      logout,
      updateProfile,
      updatePassword,
      getLoans,
      getMyLoans,
      getLoan,
      applyForLoan,
      fundLoan,
      disburseLoan,
      repayLoan,
      cancelLoan,
      createRepaymentSchedule,
      depositCollateral,
      setRiskScore,
      markAsDefaulted,
      getReputationScore,
    ],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export default ApiContext;
