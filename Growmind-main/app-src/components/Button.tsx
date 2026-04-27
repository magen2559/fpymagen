import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants/Tokens';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle: customTextStyle
}: ButtonProps) {
    const { colors } = useTheme();

    const buttonStyle = [
        styles.button,
        variant === 'primary' && { backgroundColor: colors.primary[500] },
        variant === 'secondary' && { backgroundColor: colors.secondary[500] },
        variant === 'outline' && {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary[500],
        },
        (disabled || loading) && styles.disabledButton,
        style,
    ];

    const textStyle = [
        styles.text,
        variant === 'primary' && { color: colors.text.primary },
        variant === 'secondary' && { color: colors.text.primary },
        variant === 'outline' && { color: colors.primary[500] },
        (disabled || loading) && { color: colors.text.disabled },
        customTextStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary[500] : colors.text.primary} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        ...Shadows.md,
    },
    disabledButton: {
        opacity: 0.5,
    },
    text: {
        fontSize: Typography.sizes.base,
        fontWeight: '600',
    },
});
