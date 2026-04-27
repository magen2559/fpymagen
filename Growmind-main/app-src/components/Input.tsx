import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Typography, Spacing, BorderRadius } from '../constants/Tokens';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.background.tertiary,
                        color: colors.text.primary,
                        borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                    },
                    isFocused && { borderColor: colors.primary[500] },
                    error && { borderColor: colors.error },
                ]}
                placeholderTextColor={colors.text.tertiary}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    input: {
        borderWidth: 2,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.sizes.base,
        minHeight: 48,
    },
    errorText: {
        fontSize: Typography.sizes.xs,
        marginTop: Spacing.xs,
    },
});
