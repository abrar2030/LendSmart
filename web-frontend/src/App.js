import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/routing/PrivateRoute";
import { ApiProvider } from "./contexts/ApiContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import theme from "./theme/muiTheme";

// Pages
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LoanMarketplace from "./pages/LoanMarketplace";
import LoanDetails from "./pages/LoanDetails";
import ApplyForLoan from "./pages/ApplyForLoan";
import LoanApplicationPage from "./pages/LoanApplicationPage";
import MyLoans from "./pages/MyLoans";
import RiskAssessment from "./pages/RiskAssessment";
import ProfilePage from "./pages/ProfilePage";
import WalletConnectionPage from "./pages/WalletConnectionPage";
import TransactionsHistoryPage from "./pages/TransactionsHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import KycVerificationPage from "./pages/KycVerificationPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

function protectedRoute(element) {
  return <PrivateRoute>{element}</PrivateRoute>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BlockchainProvider>
        <ApiProvider>
          <Layout>
            <Routes>
              {/* Public: the app opens on the homepage */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marketplace" element={<LoanMarketplace />} />
              <Route path="/loans/:id" element={<LoanDetails />} />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={protectedRoute(<Dashboard />)}
              />
              <Route
                path="/profile"
                element={protectedRoute(<ProfilePage />)}
              />
              <Route path="/apply" element={protectedRoute(<ApplyForLoan />)} />
              <Route
                path="/loans/apply"
                element={protectedRoute(<LoanApplicationPage />)}
              />
              <Route path="/my-loans" element={protectedRoute(<MyLoans />)} />
              <Route
                path="/risk-assessment"
                element={protectedRoute(<RiskAssessment />)}
              />
              <Route
                path="/wallet"
                element={protectedRoute(<WalletConnectionPage />)}
              />
              <Route
                path="/transactions"
                element={protectedRoute(<TransactionsHistoryPage />)}
              />
              <Route
                path="/settings"
                element={protectedRoute(<SettingsPage />)}
              />
              <Route
                path="/kyc-verification"
                element={protectedRoute(<KycVerificationPage />)}
              />
              <Route
                path="/admin"
                element={protectedRoute(<AdminDashboardPage />)}
              />

              {/* Errors */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Layout>
        </ApiProvider>
      </BlockchainProvider>
    </ThemeProvider>
  );
}

export default App;
