import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@growmind_onboarded';

interface OnboardingSlide {
    icon: string;
    iconColor: string;
    gradientColors: readonly [string, string, ...string[]];
    title: string;
    subtitle: string;
    description: string;
}

const SLIDES: OnboardingSlide[] = [
    {
        icon: 'time',
        iconColor: '#818cf8',
        gradientColors: ['#6366f1', '#8b5cf6'],
        title: 'Focus & Grow',
        subtitle: 'Pomodoro Timer',
        description: 'Stay focused with a beautiful timer. Every completed session plants a tree in your virtual garden.',
    },
    {
        icon: 'leaf',
        iconColor: '#34d399',
        gradientColors: ['#10b981', '#059669'],
        title: 'Build Your Garden',
        subtitle: 'Gamified Productivity',
        description: 'Watch your garden grow as you study. Earn coins, unlock achievements, and climb the levels.',
    },
    {
        icon: 'sparkles',
        iconColor: '#fbbf24',
        gradientColors: ['#f59e0b', '#d97706'],
        title: 'AI-Powered Coach',
        subtitle: 'Personalized Tips',
        description: 'Get smart productivity advice from your AI coach. Track your progress and stay motivated.',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const handleNext = async () => {
        if (currentIndex < SLIDES.length - 1) {
            // Animate fade out, change slide, fade in
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
                setCurrentIndex(currentIndex + 1);
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            });
        } else {
            await completeOnboarding();
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        router.replace('/(auth)/login');
    };

    const slide = SLIDES[currentIndex];
    const isLast = currentIndex === SLIDES.length - 1;

    return (
        <LinearGradient
            colors={['#09090b', '#0f0a1e', '#150d2e', '#09090b']}
            style={styles.container}
        >
            {/* Skip button */}
            {!isLast && (
                <Pressable style={styles.skipBtn} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </Pressable>
            )}

            <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
                {/* Icon Circle */}
                <View style={styles.iconOuterRing}>
                    <LinearGradient
                        colors={slide.gradientColors}
                        style={styles.iconCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name={slide.icon as any} size={56} color="#ffffff" />
                    </LinearGradient>
                </View>

                {/* Subtitle pill */}
                <View style={styles.subtitlePill}>
                    <Text style={styles.subtitleText}>{slide.subtitle}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{slide.title}</Text>

                {/* Description */}
                <Text style={styles.description}>{slide.description}</Text>
            </Animated.View>

            {/* Bottom section */}
            <View style={styles.bottomSection}>
                {/* Dots */}
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === currentIndex
                                    ? { backgroundColor: '#a78bfa', width: 24 }
                                    : { backgroundColor: 'rgba(255,255,255,0.2)' },
                            ]}
                        />
                    ))}
                </View>

                {/* CTA Button */}
                <Pressable onPress={handleNext}>
                    <LinearGradient
                        colors={isLast ? ['#22c55e', '#10b981'] : ['#6366f1', '#8b5cf6']}
                        style={styles.ctaBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.ctaBtnText}>
                            {isLast ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons
                            name={isLast ? 'rocket' : 'arrow-forward'}
                            size={20}
                            color="#ffffff"
                            style={{ marginLeft: 8 }}
                        />
                    </LinearGradient>
                </Pressable>
            </View>
        </LinearGradient>
    );
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        return value === 'true';
    } catch {
        return false;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 24,
        zIndex: 10,
    },
    skipText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },

    slideContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },

    iconOuterRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },

    subtitlePill: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    subtitleText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fafafa',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 16,
    },

    description: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 24,
    },

    bottomSection: {
        paddingBottom: Platform.OS === 'ios' ? 60 : 40,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 32,
    },

    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 16,
        width: width - 64,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
    },
    ctaBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
});
