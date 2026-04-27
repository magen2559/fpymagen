import { Tabs } from 'expo-router';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { APP_CONFIG } from '../../constants/Config';
import { useRef, useEffect } from 'react';

function AnimatedTabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (focused) {
            Animated.sequence([
                Animated.timing(scale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
        }
    }, [focused]);

    return (
        <View style={{ alignItems: 'center' }}>
            <Animated.View style={{ transform: [{ scale }] }}>
                <Ionicons name={name as any} size={24} color={color} />
            </Animated.View>
            {focused && (
                <View style={[tabStyles.activeIndicator, { backgroundColor: color }]} />
            )}
        </View>
    );
}

export default function TabLayout() {
    const { colors, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary[500],
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: colors.background.primary,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    elevation: 8,
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: -4 },
                    height: 80,
                    paddingBottom: 24,
                    paddingTop: 12,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    href: APP_CONFIG.LITE_MODE ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <AnimatedTabIcon name={focused ? "home" : "home-outline"} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="focus"
                options={{
                    title: 'Timer',
                    tabBarIcon: ({ color, focused }) => (
                        <AnimatedTabIcon name={focused ? "time" : "time-outline"} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Coach',
                    href: APP_CONFIG.LITE_MODE ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <AnimatedTabIcon name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Ranks',
                    href: APP_CONFIG.LITE_MODE ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <AnimatedTabIcon name={focused ? "podium" : "podium-outline"} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Activity',
                    href: APP_CONFIG.LITE_MODE ? null : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <AnimatedTabIcon name={focused ? "stats-chart" : "stats-chart-outline"} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="user_profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <AnimatedTabIcon name={focused ? "person" : "person-outline"} focused={focused} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const tabStyles = StyleSheet.create({
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
});
