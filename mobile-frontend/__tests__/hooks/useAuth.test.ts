import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { AuthContext } from "../../src/contexts/AuthContext";
import { useAuth } from "../../src/hooks/useAuth";

const mockAuthContext = {
  user: { id: "1", email: "test@example.com", name: "Test User" },
  token: "mock-token",
  isAuthenticated: true,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  isConnected: true,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateProfile: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
  refreshToken: jest.fn(),
  clearError: jest.fn(),
  checkAuthStatus: jest.fn(),
  toggleBiometric: jest.fn(),
};

// Wrapper component to provide the context (no JSX)
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(
    AuthContext.Provider,
    { value: mockAuthContext as never },
    children,
  );

describe("useAuth Hook", () => {
  it("should return auth context when used inside AuthProvider", () => {
    // Pass the wrapper to renderHook
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockAuthContext.user);
    expect(result.current.token).toEqual(mockAuthContext.token);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.login).toBe(mockAuthContext.login);
    expect(result.current.isLoading).toBe(mockAuthContext.isLoading);
  });

  it("returns the default context when used outside AuthProvider", () => {
    const originalError = console.error;
    console.error = jest.fn();

    // AuthContext is created with a non-null default so that components reading
    // it via useContext can destructure safely. Outside a provider the hook
    // therefore returns that default (unauthenticated) context rather than
    // throwing.
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    console.error = originalError;
  });
});
