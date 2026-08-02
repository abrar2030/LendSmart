import { Formik } from "formik";
import PropTypes from "prop-types";
import { useContext, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Checkbox,
  Menu,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import * as Yup from "yup";
import { AuthContext } from "../../../contexts/AuthContext";

// Mirrors the backend's employmentStatus enum (code/backend/src/models/User.js)
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "self-employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
];

const isAdult = (value) => {
  if (!value) return false;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return false;
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  return dob <= eighteenYearsAgo;
};

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores allowed",
    )
    .min(3, "At least 3 characters")
    .max(30, "At most 30 characters")
    .required("Username is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  dateOfBirth: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use format YYYY-MM-DD")
    .required("Date of birth is required")
    .test("is-adult", "You must be at least 18 years old", isAdult),
  employmentStatus: Yup.string().required("Employment status is required"),
  income: Yup.number()
    .typeError("Income must be a number")
    .min(0, "Income cannot be negative")
    .optional(),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character",
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  essentialConsent: Yup.boolean().oneOf(
    [true],
    "You must accept the essential data processing consent",
  ),
  financialConsent: Yup.boolean().oneOf(
    [true],
    "You must accept the financial services consent",
  ),
  marketingConsent: Yup.boolean(),
});

const RegisterScreen = ({ navigation }) => {
  const { register, loading, error: authError } = useContext(AuthContext);
  const theme = useTheme();
  const styles = createStyles(theme);
  const [serverError, setServerError] = useState(null);
  const [employmentMenuVisible, setEmploymentMenuVisible] = useState(false);

  const handleRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      setServerError(null);
      const {
        // eslint-disable-next-line no-unused-vars
        confirmPassword,
        essentialConsent,
        financialConsent,
        marketingConsent,
        income,
        ...rest
      } = values;

      const userData = {
        ...rest,
        ...(income !== "" && income !== undefined
          ? { income: Number(income) }
          : {}),
        consents: {
          essential: essentialConsent,
          financial_services: financialConsent,
          marketing: marketingConsent,
        },
      };

      await register(userData);
      // Show success message and navigate to login
      Alert.alert(
        "Registration Successful",
        "You can now log in with your credentials.",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              navigation.navigate("Login");
            },
          },
        ],
      );
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join LendSmart today!</Text>

          <Formik
            initialValues={{
              username: "",
              firstName: "",
              lastName: "",
              email: "",
              phoneNumber: "",
              dateOfBirth: "",
              employmentStatus: "",
              income: "",
              password: "",
              confirmPassword: "",
              essentialConsent: false,
              financialConsent: false,
              marketingConsent: false,
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={styles.formContainer}>
                <TextInput
                  label="Username"
                  accessibilityLabel="Username"
                  value={values.username}
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  autoCapitalize="none"
                  style={styles.input}
                  mode="outlined"
                  error={touched.username && !!errors.username}
                  left={<TextInput.Icon icon="at" />}
                />
                {touched.username && errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}

                <TextInput
                  label="First Name"
                  accessibilityLabel="First Name"
                  value={values.firstName}
                  onChangeText={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  style={styles.input}
                  mode="outlined"
                  error={touched.firstName && !!errors.firstName}
                  left={<TextInput.Icon icon="account-outline" />}
                />
                {touched.firstName && errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}

                <TextInput
                  label="Last Name"
                  accessibilityLabel="Last Name"
                  value={values.lastName}
                  onChangeText={handleChange("lastName")}
                  onBlur={handleBlur("lastName")}
                  style={styles.input}
                  mode="outlined"
                  error={touched.lastName && !!errors.lastName}
                  left={<TextInput.Icon icon="account-outline" />}
                />
                {touched.lastName && errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}

                <TextInput
                  label="Email"
                  accessibilityLabel="Email"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  mode="outlined"
                  error={touched.email && !!errors.email}
                  left={<TextInput.Icon icon="email-outline" />}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                  label="Phone Number"
                  accessibilityLabel="Phone Number"
                  value={values.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  keyboardType="phone-pad"
                  placeholder="+1 555 123 4567"
                  style={styles.input}
                  mode="outlined"
                  error={touched.phoneNumber && !!errors.phoneNumber}
                  left={<TextInput.Icon icon="phone-outline" />}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                )}

                <TextInput
                  label="Date of Birth (YYYY-MM-DD)"
                  accessibilityLabel="Date of Birth"
                  value={values.dateOfBirth}
                  onChangeText={handleChange("dateOfBirth")}
                  onBlur={handleBlur("dateOfBirth")}
                  placeholder="1990-01-31"
                  style={styles.input}
                  mode="outlined"
                  error={touched.dateOfBirth && !!errors.dateOfBirth}
                  left={<TextInput.Icon icon="calendar-outline" />}
                />
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                )}

                <Menu
                  visible={employmentMenuVisible}
                  onDismiss={() => setEmploymentMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Employment Status"
                      accessibilityLabel="Employment Status"
                      value={
                        EMPLOYMENT_STATUS_OPTIONS.find(
                          (opt) => opt.value === values.employmentStatus,
                        )?.label || ""
                      }
                      editable={false}
                      onPressIn={() => setEmploymentMenuVisible(true)}
                      style={styles.input}
                      mode="outlined"
                      error={
                        touched.employmentStatus && !!errors.employmentStatus
                      }
                      left={<TextInput.Icon icon="briefcase-outline" />}
                      right={
                        <TextInput.Icon
                          icon="menu-down"
                          onPress={() => setEmploymentMenuVisible(true)}
                        />
                      }
                    />
                  }
                >
                  {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                    <Menu.Item
                      key={opt.value}
                      title={opt.label}
                      onPress={() => {
                        setFieldValue("employmentStatus", opt.value);
                        setEmploymentMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>
                {touched.employmentStatus && errors.employmentStatus && (
                  <Text style={styles.errorText}>
                    {errors.employmentStatus}
                  </Text>
                )}

                <TextInput
                  label="Annual Income (optional)"
                  accessibilityLabel="Annual Income"
                  value={values.income}
                  onChangeText={handleChange("income")}
                  onBlur={handleBlur("income")}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  error={touched.income && !!errors.income}
                  left={<TextInput.Icon icon="cash" />}
                />
                {touched.income && errors.income && (
                  <Text style={styles.errorText}>{errors.income}</Text>
                )}

                <TextInput
                  label="Password"
                  accessibilityLabel="Password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  error={touched.password && !!errors.password}
                  left={<TextInput.Icon icon="lock-outline" />}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TextInput
                  label="Confirm Password"
                  accessibilityLabel="Confirm Password"
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  left={<TextInput.Icon icon="lock-check-outline" />}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                <Checkbox.Item
                  label="I agree to the Terms of Service and essential data processing (required)"
                  status={values.essentialConsent ? "checked" : "unchecked"}
                  onPress={() =>
                    setFieldValue("essentialConsent", !values.essentialConsent)
                  }
                  labelStyle={styles.consentLabel}
                />
                {touched.essentialConsent && errors.essentialConsent && (
                  <Text style={styles.errorText}>
                    {errors.essentialConsent}
                  </Text>
                )}

                <Checkbox.Item
                  label="I consent to credit checks and financial services processing (required)"
                  status={values.financialConsent ? "checked" : "unchecked"}
                  onPress={() =>
                    setFieldValue("financialConsent", !values.financialConsent)
                  }
                  labelStyle={styles.consentLabel}
                />
                {touched.financialConsent && errors.financialConsent && (
                  <Text style={styles.errorText}>
                    {errors.financialConsent}
                  </Text>
                )}

                <Checkbox.Item
                  label="I'd like to receive product updates and offers (optional)"
                  status={values.marketingConsent ? "checked" : "unchecked"}
                  onPress={() =>
                    setFieldValue("marketingConsent", !values.marketingConsent)
                  }
                  labelStyle={styles.consentLabel}
                />

                {(authError || serverError) && (
                  <Text style={styles.serverErrorText}>
                    {authError || serverError}
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  disabled={isSubmitting || loading}
                  loading={loading}
                  icon="account-plus-outline"
                >
                  Register
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate("Login")}
                  style={styles.switchButton}
                  disabled={isSubmitting || loading}
                  labelStyle={styles.switchButtonLabel}
                >
                  Already have an account? Login
                </Button>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

RegisterScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

// Updated createStyles function using the modernized theme
const createStyles = (theme) =>
  StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: theme.fontSizes.h1,
      fontFamily: theme.fonts.primaryBold,
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSizes.body1,
      fontFamily: theme.fonts.primary,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    formContainer: {
      width: "100%",
    },
    input: {
      marginBottom: theme.spacing.md,
    },
    consentLabel: {
      fontSize: theme.fontSizes.caption,
      fontFamily: theme.fonts.primary,
    },
    button: {
      marginTop: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      elevation: 2,
    },
    buttonContent: {
      paddingVertical: theme.spacing.sm,
    },
    buttonLabel: {
      fontFamily: theme.fonts.primarySemiBold,
      fontSize: theme.fontSizes.h6,
    },
    switchButton: {
      marginTop: theme.spacing.md,
    },
    switchButtonLabel: {
      fontFamily: theme.fonts.primaryMedium,
      fontSize: theme.fontSizes.body2,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.fontSizes.caption,
      marginBottom: theme.spacing.md,
      marginLeft: theme.spacing.xs,
      marginTop: -theme.spacing.sm,
    },
    serverErrorText: {
      color: theme.colors.error,
      fontSize: theme.fontSizes.body2,
      fontFamily: theme.fonts.primaryMedium,
      textAlign: "center",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
  });

export default RegisterScreen;
