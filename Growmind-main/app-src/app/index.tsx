import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../constants/Config';
import { hasCompletedOnboarding } from './onboarding';

export default function Index() {
    const { session, loading } = useAuth();
    const { colors } = useTheme();
    const [onboardingChecked, setOnboardingChecked] = useState(false);
    const [hasOnboarded, setHasOnboarded] = useState(true);

    useEffect(() => {
        hasCompletedOnboarding().then((result) => {
            setHasOnboarded(result);
            setOnboardingChecked(true);
        });
    }, []);

    if (loading || !onboardingChecked) {
        return (
            <View style={[styles.loading, { backgroundColor: colors.background.primary }]}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    // First time user → show onboarding
    if (!hasOnboarded) {
        return <Redirect href="/onboarding" />;
    }

    if (session) {
        return <Redirect href={APP_CONFIG.LITE_MODE ? "/(tabs)/focus" : "/(tabs)"} />;
    }

    return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
