import '../lib/patchThree'; // Must be first — patches Three.js shader chunks
import { Stack } from 'expo-router';
import { Colors } from '../constants/Tokens';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider } from '../components/Toast';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ErrorBoundary>
                    <ToastProvider>
                        <AppNavigator />
                    </ToastProvider>
                </ErrorBoundary>
            </AuthProvider>
        </ThemeProvider>
    );
}

function AppNavigator() {
    const { colors: Colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.background.primary,
                },
                headerTintColor: Colors.text.primary,
                headerTitleStyle: {
                    fontWeight: '700',
                },
                contentStyle: {
                    backgroundColor: Colors.background.primary,
                },
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="garden_viewer" options={{ presentation: 'fullScreenModal', animation: 'fade', headerShown: false }} />
            <Stack.Screen name="voucher_shop" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
            <Stack.Screen name="menu_modal" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
        </Stack>
    );
}
