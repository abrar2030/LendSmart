import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  applyLoan as apiApplyLoan,
  fundLoan as apiFundLoan,
  getLoanDetails,
  getMarketplaceLoans,
  getMyLoans,
  recordRepayment,
} from "../services/apiService";

/**
 * Loan context: shared loan state and API-backed actions for the loan features
 * (marketplace, my loans, details, funding, repayment). Screens can read from
 * here via the useLoan hook instead of each managing their own fetch state.
 */
export const LoanContext = createContext(null);

export const LoanProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLoans = useCallback(async (params = {}, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = await getMarketplaceLoans(params);
      setLoans(res?.data?.data || res?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load the loan marketplace",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMyLoans = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyLoans(params);
      setMyLoans(res?.data?.data || res?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your loans");
    } finally {
      setLoading(false);
    }
  }, []);

  const getLoanById = useCallback(async (loanId) => {
    const res = await getLoanDetails(loanId);
    return res?.data?.data || res?.data || null;
  }, []);

  const applyLoan = useCallback(async (loanData) => {
    const res = await apiApplyLoan(loanData);
    return res?.data?.data || res?.data || null;
  }, []);

  const fundLoan = useCallback(
    async (loanId, fundingData) => {
      const res = await apiFundLoan(loanId, fundingData);
      await fetchLoans();
      return res?.data?.data || res?.data || null;
    },
    [fetchLoans],
  );

  const repayLoan = useCallback(async (loanId, repaymentData) => {
    const res = await recordRepayment(loanId, repaymentData);
    return res?.data?.data || res?.data || null;
  }, []);

  const value = useMemo(
    () => ({
      loans,
      myLoans,
      loading,
      refreshing,
      error,
      fetchLoans,
      fetchMyLoans,
      getLoanById,
      applyLoan,
      fundLoan,
      repayLoan,
    }),
    [
      loans,
      myLoans,
      loading,
      refreshing,
      error,
      fetchLoans,
      fetchMyLoans,
      getLoanById,
      applyLoan,
      fundLoan,
      repayLoan,
    ],
  );

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
};

LoanProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error("useLoan must be used within a LoanProvider");
  }
  return context;
};

export default LoanProvider;
