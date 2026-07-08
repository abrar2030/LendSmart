import { fireEvent, render } from "@testing-library/react-native";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import MarketplaceScreen from "../../../src/features/Loans/MarketplaceScreen";

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

const placeholderLoans = [
  {
    id: "1",
    amount: 1500,
    interestRate: 8.5,
    term: 12,
    purpose: "Debt Consolidation",
    creditScoreRange: "650-700",
    status: "Available",
    fundedAmount: 0,
  },
  {
    id: "2",
    amount: 500,
    interestRate: 12.0,
    term: 6,
    purpose: "Small Business",
    creditScoreRange: "600-650",
    status: "Available",
    fundedAmount: 100,
  },
  {
    id: "3",
    amount: 3000,
    interestRate: 7.0,
    term: 24,
    purpose: "Home Improvement",
    creditScoreRange: "700+",
    status: "Available",
    fundedAmount: 0,
  },
  {
    id: "4",
    amount: 1000,
    interestRate: 9.0,
    term: 9,
    purpose: "Education",
    creditScoreRange: "680-720",
    status: "Funded",
    fundedAmount: 1000,
  },
];

// Mock the marketplace API; filter by the search term the screen passes so the
// search tests exercise real behavior.
jest.mock("../../../src/services/apiService", () => ({
  getMarketplaceLoans: jest.fn(({ search } = {}) => {
    const q = (search || "").toLowerCase().trim();
    const data = q
      ? placeholderLoans.filter(
          (l) =>
            l.purpose.toLowerCase().includes(q) || String(l.amount).includes(q),
        )
      : placeholderLoans;
    return Promise.resolve({ data });
  }),
}));

const AllTheProviders = ({ children }) => (
  <PaperProvider theme={DefaultTheme}>{children}</PaperProvider>
);

describe("MarketplaceScreen", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the search bar and loads loans", async () => {
    const { getByPlaceholderText, findByText } = render(
      <MarketplaceScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    expect(getByPlaceholderText("Search loans...")).toBeTruthy();

    await findByText("$1,500");
    await findByText("Debt Consolidation");
    await findByText("$500");
    await findByText("Small Business");
  });

  it("filters loans based on the search query", async () => {
    const { getByPlaceholderText, queryByText, findByText } = render(
      <MarketplaceScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    await findByText("Debt Consolidation");

    const searchInput = getByPlaceholderText("Search loans...");
    fireEvent.changeText(searchInput, "Business");

    await findByText("Small Business");
    expect(queryByText("Debt Consolidation")).toBeNull();
    expect(queryByText("Home Improvement")).toBeNull();

    fireEvent.changeText(searchInput, "1500");
    await findByText("Debt Consolidation");
    expect(queryByText("Small Business")).toBeNull();
  });

  it("navigates to LoanDetails when Details is pressed", async () => {
    const { findAllByText } = render(
      <MarketplaceScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    const detailsButtons = await findAllByText("Details");
    fireEvent.press(detailsButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("LoanDetails", { loanId: "1" });

    mockNavigate.mockClear();
    fireEvent.press(detailsButtons[1]);
    expect(mockNavigate).toHaveBeenCalledWith("LoanDetails", { loanId: "2" });
  });

  it("navigates to LoanDetails with focusFund when Fund is pressed", async () => {
    const { findAllByText } = render(
      <MarketplaceScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    const fundButtons = await findAllByText("Fund");
    fireEvent.press(fundButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("LoanDetails", {
      loanId: "1",
      focusFund: true,
    });
  });

  it("shows the empty message when no loans match the search", async () => {
    const { getByPlaceholderText, findByText } = render(
      <MarketplaceScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    await findByText("Debt Consolidation");

    const searchInput = getByPlaceholderText("Search loans...");
    fireEvent.changeText(searchInput, "NonExistentPurpose12345");

    await findByText("No loans found.");
    await findByText("Try adjusting your search.");
  });
});
