import { View, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Spacing, Shadows } from '../constants/Tokens';
import { useTheme } from '../contexts/ThemeContext';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
    const { colors, isDark } = useTheme();

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: colors.background.secondary,
                borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            },
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        ...Shadows.lg,
    },
});
