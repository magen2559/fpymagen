import { Stack } from 'expo-router';
import { Colors } from '../../constants/Tokens';

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.background.primary,
                },
                headerTintColor: Colors.text.primary,
                headerTitleStyle: {
                    fontWeight: '700',
                    color: Colors.text.primary,
                },
                contentStyle: {
                    backgroundColor: Colors.background.primary,
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Settings' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="help" options={{ title: 'Help & Feedback' }} />
        </Stack>
    );
}
