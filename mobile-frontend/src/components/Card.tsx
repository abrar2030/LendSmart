import type React from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { Card as PaperCard, useTheme } from "react-native-paper";
import type { AppTheme } from "../theme/appTheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  onPress,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <PaperCard
      style={[styles.card, { backgroundColor: theme.colors.surface }, style]}
      elevation={elevation as never}
      onPress={onPress}
    >
      {children}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
  },
});

export default Card;
