import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { PaperProvider } from "react-native-paper";
import { AuthContext } from "../../../../src/contexts/AuthContext";
import RegisterScreen from "../../../../src/features/Auth/screens/RegisterScreen";

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

// Mock AuthContext
const mockRegister = jest.fn();

const mockAuthContextValue = {
  register: mockRegister,
  loading: false,
  error: null,
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
};

// Mock Alert
jest.spyOn(Alert, "alert");

// Custom wrapper to provide necessary contexts and theme
const AllTheProviders = ({ children }) => (
  <AuthContext.Provider value={mockAuthContextValue}>
    <PaperProvider>{children}</PaperProvider>
  </AuthContext.Provider>
);

const VALID_DOB = "1990-01-01";

// Fills every required field except employment status (selected separately
// via the dropdown menu, since it isn't a plain text input).
const fillRequiredTextFields = (getByLabelText, overrides = {}) => {
  const values = {
    Username: "testuser",
    "First Name": "Test",
    "Last Name": "User",
    Email: "test@example.com",
    "Phone Number": "+15551234567",
    "Date of Birth": VALID_DOB,
    Password: "Password123!",
    "Confirm Password": "Password123!",
    ...overrides,
  };
  Object.entries(values).forEach(([label, value]) => {
    fireEvent.changeText(getByLabelText(label), value);
  });
};

const selectEmploymentStatus = (
  getByLabelText,
  getByText,
  label = "Full-time",
) => {
  const employmentInput = getByLabelText("Employment Status");
  act(() => {
    employmentInput.props.onPressIn();
  });
  fireEvent.press(getByText(label));
};

const checkRequiredConsents = (getByLabelText) => {
  fireEvent.press(
    getByLabelText(
      "I agree to the Terms of Service and essential data processing (required)",
    ),
  );
  fireEvent.press(
    getByLabelText(
      "I consent to credit checks and financial services processing (required)",
    ),
  );
};

describe("RegisterScreen", () => {
  beforeEach(() => {
    mockRegister.mockClear();
    mockNavigate.mockClear();
    Alert.alert.mockClear();
    mockAuthContextValue.loading = false;
    mockAuthContextValue.error = null;
  });

  it("renders correctly with all form elements", () => {
    const { getByText, getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    expect(getByText("Create Account")).toBeTruthy();
    expect(getByText("Join LendSmart today!")).toBeTruthy();
    expect(getByLabelText("Username")).toBeTruthy();
    expect(getByLabelText("First Name")).toBeTruthy();
    expect(getByLabelText("Last Name")).toBeTruthy();
    expect(getByLabelText("Email")).toBeTruthy();
    expect(getByLabelText("Phone Number")).toBeTruthy();
    expect(getByLabelText("Date of Birth")).toBeTruthy();
    expect(getByLabelText("Employment Status")).toBeTruthy();
    expect(getByLabelText("Password")).toBeTruthy();
    expect(getByLabelText("Confirm Password")).toBeTruthy();
    expect(getByText("Register")).toBeTruthy();
    expect(getByText("Already have an account? Login")).toBeTruthy();
  });

  it("allows typing in form fields", () => {
    const { getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    fillRequiredTextFields(getByLabelText);

    expect(getByLabelText("Username").props.value).toBe("testuser");
    expect(getByLabelText("First Name").props.value).toBe("Test");
    expect(getByLabelText("Last Name").props.value).toBe("User");
    expect(getByLabelText("Email").props.value).toBe("test@example.com");
    expect(getByLabelText("Password").props.value).toBe("Password123!");
    expect(getByLabelText("Confirm Password").props.value).toBe("Password123!");
  });

  it("lets the user pick an employment status from the dropdown", () => {
    const { getByLabelText, getByText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    selectEmploymentStatus(getByLabelText, getByText, "Self-employed");

    expect(getByLabelText("Employment Status").props.value).toBe(
      "Self-employed",
    );
  });

  it("shows validation errors for empty required fields", async () => {
    const { getByText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(getByText("Username is required")).toBeTruthy();
      expect(getByText("First name is required")).toBeTruthy();
      expect(getByText("Last name is required")).toBeTruthy();
      expect(getByText("Email is required")).toBeTruthy();
      expect(getByText("Phone number is required")).toBeTruthy();
      expect(getByText("Date of birth is required")).toBeTruthy();
      expect(getByText("Password is required")).toBeTruthy();
      expect(getByText("Confirm password is required")).toBeTruthy();
    });
  });

  it("shows an error for an invalid email", async () => {
    const { getByText, getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    fireEvent.changeText(getByLabelText("Email"), "invalid-email");
    fireEvent.press(getByText("Register"));

    await waitFor(() => expect(getByText("Invalid email")).toBeTruthy());
  });

  it("shows an error when the applicant is under 18", async () => {
    const { getByText, getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    const recentYear = new Date().getFullYear() - 5;
    fireEvent.changeText(
      getByLabelText("Date of Birth"),
      `${recentYear}-01-01`,
    );
    fireEvent.press(getByText("Register"));

    await waitFor(() =>
      expect(getByText("You must be at least 18 years old")).toBeTruthy(),
    );
  });

  it("shows a mismatch error when passwords do not match", async () => {
    const { getByText, getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    fireEvent.changeText(getByLabelText("Password"), "Password123!");
    fireEvent.changeText(getByLabelText("Confirm Password"), "Different123!");
    fireEvent.press(getByText("Register"));

    await waitFor(() => expect(getByText("Passwords must match")).toBeTruthy());
  });

  it("calls register with the expected payload on valid submission and shows a success alert", async () => {
    mockRegister.mockResolvedValueOnce({ success: true });
    const { getByText, getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    fillRequiredTextFields(getByLabelText);
    selectEmploymentStatus(getByLabelText, getByText, "Full-time");
    fireEvent.changeText(getByLabelText("Annual Income"), "50000");
    checkRequiredConsents(getByLabelText);

    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledTimes(1);
      expect(mockRegister).toHaveBeenCalledWith({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phoneNumber: "+15551234567",
        dateOfBirth: VALID_DOB,
        employmentStatus: "full-time",
        password: "Password123!",
        income: 50000,
        consents: {
          essential: true,
          financial_services: true,
          marketing: false,
        },
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        "Registration Successful",
        "You can now log in with your credentials.",
        [{ text: "OK", onPress: expect.any(Function) }],
      );
    });

    // Simulate pressing OK on the alert
    const alertOkButton = Alert.alert.mock.calls[0][2][0].onPress;
    act(() => {
      alertOkButton();
    });
    expect(mockNavigate).toHaveBeenCalledWith("Login");
  });

  it("omits income from the payload when left blank", async () => {
    mockRegister.mockResolvedValueOnce({ success: true });
    const { getByText, getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    fillRequiredTextFields(getByLabelText);
    selectEmploymentStatus(getByLabelText, getByText, "Full-time");
    checkRequiredConsents(getByLabelText);

    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledTimes(1);
      const payload = mockRegister.mock.calls[0][0];
      expect(payload.income).toBeUndefined();
    });
  });

  it("disables the register button when auth is loading", () => {
    mockAuthContextValue.loading = true;
    const { getByText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );
    // Walk up from the label to the pressable that carries accessibilityState.
    let node = getByText("Register");
    while (node && !node.props?.accessibilityState) {
      node = node.parent;
    }
    expect(node?.props?.accessibilityState?.disabled).toBe(true);
    mockAuthContextValue.loading = false;
  });

  it("displays error message from AuthContext or server if registration fails", async () => {
    const authErrorMessage = "Email already exists.";
    mockAuthContextValue.error = authErrorMessage;
    const { getByText, getByLabelText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );
    expect(getByText(authErrorMessage)).toBeTruthy();
    mockAuthContextValue.error = null;

    // Test server-side error during submission
    const serverErrorMessage = "Registration failed. Please try again.";
    mockRegister.mockRejectedValueOnce(new Error(serverErrorMessage));
    fillRequiredTextFields(getByLabelText, {
      Email: "fail@example.com",
    });
    selectEmploymentStatus(getByLabelText, getByText, "Full-time");
    checkRequiredConsents(getByLabelText);
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(getByText(serverErrorMessage)).toBeTruthy();
    });
  });

  it('navigates to Login screen when "Login" button is pressed', () => {
    const { getByText } = render(
      <RegisterScreen navigation={mockNavigation} />,
      { wrapper: AllTheProviders },
    );

    const loginButton = getByText("Already have an account? Login");
    fireEvent.press(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("Login");
  });
});
