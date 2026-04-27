import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Single skeleton block with shimmer animation
 */
function SkeletonBlock({ width, height, borderRadius = 12, style }: {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
}) {
    const { colors } = useTheme();
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.6],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: colors.background.tertiary,
                    opacity,
                },
                style,
            ]}
        />
    );
}

/**
 * Skeleton for a dashboard card
 */
export function DashboardSkeleton() {
    return (
        <View style={skeletonStyles.container}>
            {/* Greeting skeleton */}
            <SkeletonBlock width={200} height={28} style={{ marginBottom: 8 }} />
            <SkeletonBlock width={260} height={16} style={{ marginBottom: 24 }} />

            {/* Stats row skeleton */}
            <View style={skeletonStyles.row}>
                <SkeletonBlock width={'48%'} height={80} borderRadius={20} />
                <SkeletonBlock width={'48%'} height={80} borderRadius={20} />
            </View>

            {/* Garden skeleton */}
            <SkeletonBlock width={'100%'} height={180} borderRadius={24} style={{ marginBottom: 24 }} />

            {/* Section header */}
            <SkeletonBlock width={120} height={18} style={{ marginBottom: 16 }} />

            {/* Sound cards row */}
            <View style={skeletonStyles.row}>
                <SkeletonBlock width={100} height={130} borderRadius={20} />
                <SkeletonBlock width={100} height={130} borderRadius={20} />
                <SkeletonBlock width={100} height={130} borderRadius={20} />
            </View>
        </View>
    );
}

/**
 * Skeleton for the profile / activity screen
 */
export function ProfileSkeleton() {
    return (
        <View style={skeletonStyles.container}>
            <SkeletonBlock width={140} height={22} style={{ marginBottom: 16 }} />
            <View style={skeletonStyles.row}>
                <SkeletonBlock width={'55%'} height={100} borderRadius={24} />
                <SkeletonBlock width={'40%'} height={100} borderRadius={24} />
            </View>
            <SkeletonBlock width={'100%'} height={160} borderRadius={24} style={{ marginTop: 24 }} />
        </View>
    );
}

const skeletonStyles = StyleSheet.create({
    container: {
        padding: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
});

export default SkeletonBlock;
