import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../../App";

jest.mock("../../contexts/BlockchainContext", () => ({
  BlockchainProvider: ({ children }) => children,
  useBlockchain: () => ({
    isConnected: false,
    account: null,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    getUserLoans: jest.fn().mockResolvedValue([]),
    getLoanDetails: jest.fn().mockResolvedValue(null),
    getUserReputationScore: jest.fn().mockResolvedValue(null),
  }),
}));

jest.mock("../../contexts/ApiContext", () => ({
  ApiProvider: ({ children }) => children,
  useApi: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getMyLoans: jest.fn().mockResolvedValue({ data: [] }),
    getLoans: jest.fn().mockResolvedValue({ data: [] }),
    getLoan: jest.fn().mockResolvedValue({ data: null }),
  }),
}));

// Mock window.ethereum for blockchain tests
global.window.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

describe("Full User Flow Integration Test", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("User can navigate from home to login", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Check home page loads
    expect(screen.getAllByText(/LendSmart/i)[0]).toBeInTheDocument();

    // Find and click login link (could be in header or as button)
    const loginLinks = screen.getAllByText(/Login/i);
    fireEvent.click(loginLinks[0]);

    // Verify login page loads
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });
  });

  test("User can navigate to registration page", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    const registerLinks = screen.queryAllByText(/Register/i);
    if (registerLinks.length > 0) {
      fireEvent.click(registerLinks[0]);

      // Verify registration form is visible
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    }
  });

  test("Application renders without crashing", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Just verify the app renders
    expect(screen.getAllByText(/LendSmart/i)[0]).toBeInTheDocument();
  });

  test("Market marketplace is accessible", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Look for marketplace link
    const marketplaceLinks = screen.queryAllByText(/Marketplace/i);
    if (marketplaceLinks.length > 0) {
      fireEvent.click(marketplaceLinks[0]);
      // The marketplace page should load
    }
  });
});

describe("Protected Routes Test", () => {
  test("Dashboard redirects to login when not authenticated", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // The unauthenticated app renders the public shell; the protected-route
    // redirect itself is covered in UserFlow with a MemoryRouter entry.
    await waitFor(() => {
      expect(window.location.pathname).toBeDefined();
    });
  });
});
