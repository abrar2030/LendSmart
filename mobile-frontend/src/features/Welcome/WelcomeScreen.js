import PropTypes from "prop-types";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

/**
 * Welcome (landing) screen. The app opens here for signed-out users, mirroring
 * the web homepage: a brief value proposition, a ledger-style figures panel, and
 * two clear actions (create an account or sign in). From here users move into
 * the auth flow and then the dashboard.
 */
const WelcomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const c = theme.colors;
  const s = theme.spacing || { sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

  const stats = [
    { value: "12.4%", label: "Avg. lender return" },
    { value: "4,820", label: "Loans funded" },
    { value: "$38M", label: "Originated" },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.hero}>
        <View
          style={[
            styles.badge,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: c.success }]} />
          <Text style={[styles.badgeText, { color: c.textSecondary }]}>
            Peer to peer and on chain lending
          </Text>
        </View>

        <Text style={[styles.brand, { color: c.textPrimary }]}>LendSmart</Text>
        <Text style={[styles.headline, { color: c.textPrimary }]}>
          Lending that moves at the speed of trust.
        </Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          Borrow and lend with transparent rates, on chain settlement, and risk
          scoring you can actually read.
        </Text>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        {stats.map((item, i) => (
          <View
            key={item.label}
            style={[
              styles.stat,
              i < stats.length - 1 && {
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor: c.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                {
                  color: c.textPrimary,
                  fontFamily: theme.fonts?.mono || undefined,
                },
              ]}
            >
              {item.value}
            </Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.actions, { marginTop: s.xl }]}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Register")}
          style={styles.primaryBtn}
          contentStyle={styles.btnContent}
        >
          Create an account
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Login")}
          style={styles.secondaryBtn}
          contentStyle={styles.btnContent}
        >
          Sign in
        </Button>
      </View>

      <Text style={[styles.footnote, { color: c.textTertiary }]}>
        By continuing you agree to the Terms and Privacy Policy.
      </Text>
    </ScrollView>
  );
};

WelcomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 72, paddingBottom: 40 },
  hero: { marginBottom: 28 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  badgeText: { fontSize: 13, fontWeight: "500" },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  headline: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40,
    marginBottom: 12,
  },
  sub: { fontSize: 16, lineHeight: 24 },
  panel: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 20,
  },
  stat: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  statValue: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: "center" },
  actions: { gap: 12 },
  primaryBtn: { borderRadius: 12 },
  secondaryBtn: { borderRadius: 12 },
  btnContent: { paddingVertical: 6 },
  footnote: { fontSize: 12, textAlign: "center", marginTop: 20 },
});

export default WelcomeScreen;
