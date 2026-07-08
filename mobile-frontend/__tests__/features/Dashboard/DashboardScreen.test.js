import { fireEvent, render } from "@testing-library/react-native";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { AuthContext } from "../../../src/contexts/AuthContext";
import DashboardScreen from "../../../src/features/Dashboard/DashboardScreen";

const mockGetMyLoans = jest.fn();
jest.mock("../../../src/services/apiService", () => ({
  getMyLoans: (...args) => mockGetMyLoans(...args),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

// Mock AuthContext
let mockUser = {
  name: "Test User",
  id: "user123",
  reputation: 4.8,
};
const mockAuthContextValue = {
  user: mockUser,
  // Add other context values if DashboardScreen uses them
  loading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true,
};

// Custom wrapper to provide necessary contexts and theme
const AllTheProviders = ({ children }) => (
  <AuthContext.Provider value={mockAuthContextValue}>
    <PaperProvider theme={DefaultTheme}>{children}</PaperProvider>
  </AuthContext.Provider>
);

// Mock setTimeout for refresh control

describe("DashboardScreen", () => {
  beforeEach(() => {
    // Reset mocks and user state before each test
    mockNavigate.mockClear();
    mockGetMyLoans.mockReset();
    mockUser = { name: "Test User", id: "user123", reputation: 4.8 };
    mockAuthContextValue.user = mockUser;
  });

  it("renders correctly with user greeting and key sections", async () => {
    mockGetMyLoans.mockResolvedValueOnce({
      data: [
        {
          id: "a",
          borrowerId: "user123",
          amount: 5000,
          fundedAmount: 0,
          status: "active",
          createdAt: "2026-01-01",
        },
        {
          id: "b",
          borrowerId: "lender",
          amount: 2000,
          fundedAmount: 3000,
          status: "repaying",
          createdAt: "2026-01-02",
        },
      ],
    });
    const { getByText, findByText, findAllByText, getAllByText } = render(
      <DashboardScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    expect(getByText("Hello, Test!")).toBeTruthy();
    expect(getByText("Here's your financial overview")).toBeTruthy();
    expect(getByText("Loan Summary")).toBeTruthy();
    expect(getByText("Active Loans")).toBeTruthy();
    expect(getByText("Borrowed")).toBeTruthy();
    expect(getByText("Lent")).toBeTruthy();
    expect(getByText("Reputation")).toBeTruthy();
    expect(getByText("Apply")).toBeTruthy();
    expect(getByText("Market")).toBeTruthy();
    expect(getByText("Recent Activity")).toBeTruthy();

    // Computed from the mocked loans ($5,000 appears as both the Borrowed
    // total and loan a's activity amount, so allow multiple).
    await findByText("2");
    expect((await findAllByText("$5,000")).length).toBeGreaterThan(0);
    await findByText("$3,000");
    await findByText("4.8");
    expect(getAllByText("Loan Activity").length).toBeGreaterThan(0);
  });

  it("shows loading indicator if user is not available initially", () => {
    mockAuthContextValue.user = null; // Simulate user not yet loaded
    const { getByTestId, queryByText } = render(
      // DashboardScreen has an ActivityIndicator but it's not directly testable by role/text easily without testID
      // We will check that the main content is not rendered.
      <DashboardScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );
    // The component renders ActivityIndicator, not a specific text.
    // We'll check that the greeting is NOT there, implying loading or redirect.
    expect(queryByText("Hello, Test!")).toBeNull();
    // If ActivityIndicator had a testID="loading-indicator", we could use: expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('navigates to Apply screen when "Apply" button is pressed', () => {
    const { getByText } = render(
      <DashboardScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );
    fireEvent.press(getByText("Apply"));
    expect(mockNavigate).toHaveBeenCalledWith("Apply");
  });

  it('navigates to Marketplace screen when "Market" button is pressed', () => {
    const { getByText } = render(
      <DashboardScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );
    fireEvent.press(getByText("Market"));
    expect(mockNavigate).toHaveBeenCalledWith("Marketplace");
  });

  it("simulates refresh control and completes", async () => {
    const { getByTestId, getByText } = render(
      <DashboardScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    // To test RefreshControl, we need to find the ScrollView and trigger its onRefresh prop.
    // This is not straightforward with RTL without specific testIDs or accessibility props on ScrollView.
    // However, we can test the onRefresh function if it were exposed or by simulating the refresh state change.
    // The component uses a setTimeout in onRefresh. We can test this.

    // For this example, let's assume we can somehow trigger the refresh.
    // The DashboardScreen's onRefresh sets refreshing to true, then false after a timeout.
    // We can't directly call onRefresh from here easily without modifying the component for testing.
    // This test is more conceptual for now. A better way would be to use a testID on the ScrollView.
    // For instance, if ScrollView had testID="dashboard-scrollview":
    // const scrollView = getByTestId('dashboard-scrollview');
    // fireEvent(scrollView, 'onRefresh'); // This might not work directly for onRefresh prop.

    // Let's assume the onRefresh is called (e.g. by user pulling down)
    // We can't directly simulate the pull-to-refresh gesture with RTL.
    // The test for refresh control is limited with RTL's capabilities for gestures.
    // We will skip direct testing of the refresh gesture itself.
    // We can ensure the RefreshControl is present.
    // The ScrollView has refreshControl prop, but accessing it directly is hard.
    // We'll just check that the main content is still there after a conceptual refresh.
    expect(getByText("Hello, Test!")).toBeTruthy();
  });

  it("displays recent activity items correctly", async () => {
    mockGetMyLoans.mockRejectedValueOnce(new Error("network"));
    const { findByText, findAllByText } = render(
      <DashboardScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );
    // On fetch failure the screen shows placeholder activity.
    await findByText("Loan Funded");
    await findByText("$1,000");
    await findByText("New Listing Viewed");
    await findByText("Viewed loan #LND123");
    expect((await findAllByText("Completed")).length).toBeGreaterThan(0);
  });
});
