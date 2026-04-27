import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, TextInput, Animated, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../../constants/Config';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(60)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(cardFade, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(cardSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.spring(btnScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    };

    const handleLogin = async () => {
        if (!email || !password) { setError('Please fill in all fields'); return; }
        setLoading(true); setError(''); setSuccessMsg('');
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (signInError) { setError(signInError.message); } else { router.replace(APP_CONFIG.LITE_MODE ? '/(tabs)/focus' : '/(tabs)'); }
    };

    const handleForgotPassword = async () => {
        if (!email) { setError('Enter your email above first'); return; }
        setLoading(true); setError(''); setSuccessMsg('');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        setLoading(false);
        if (resetError) {
            setError(resetError.message);
        } else {
            setSuccessMsg('Password reset link sent! Check your email.');
        }
    };

    return (
        <LinearGradient
            colors={['#09090b', '#0f0a1e', '#150d2e', '#09090b']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Background glow orbs */}
            <View style={styles.orbContainer} pointerEvents="none">
                <View style={[styles.orb, styles.orbPurple]} />
                <View style={[styles.orb, styles.orbBlue]} />
                <View style={[styles.orb, styles.orbIndigo]} />
            </View>

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>

                        {/* Logo & Header */}
                        <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={['#6366f1', '#8b5cf6', '#a78bfa']}
                                    style={styles.logoGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name="leaf" size={32} color="#ffffff" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.subtitleText}>Sign in to continue your journey</Text>
                        </Animated.View>

                        {/* Form Card */}
                        <Animated.View style={[styles.formCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIconBox}>
                                    <Ionicons name="mail-outline" size={18} color="#a78bfa" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIconBox}>
                                    <Ionicons name="lock-closed-outline" size={18} color="#a78bfa" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.4)" />
                                </Pressable>
                            </View>

                            {/* Forgot Password */}
                            <Pressable style={styles.forgotBtn} onPress={handleForgotPassword}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </Pressable>

                            {/* Success */}
                            {successMsg ? (
                                <View style={[styles.errorContainer, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                    <Ionicons name="checkmark-circle" size={16} color="#34d399" />
                                    <Text style={[styles.errorText, { color: '#34d399' }]}>{successMsg}</Text>
                                </View>
                            ) : null}

                            {/* Error */}
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color="#f87171" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            {/* Login Button */}
                            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                                <Pressable
                                    onPress={handleLogin}
                                    onPressIn={handlePressIn}
                                    onPressOut={handlePressOut}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={loading ? ['#4338ca', '#3730a3'] : ['#6366f1', '#8b5cf6', '#a78bfa']}
                                        style={styles.loginBtn}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {loading ? (
                                            <Text style={styles.loginBtnText}>Signing in...</Text>
                                        ) : (
                                            <>
                                                <Text style={styles.loginBtnText}>Sign In</Text>
                                                <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                                            </>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                            </Animated.View>
                        </Animated.View>



                        {/* Sign Up Link */}
                        <View style={styles.bottomLink}>
                            <Text style={styles.bottomText}>Don't have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/signup')}>
                                <Text style={styles.bottomLinkText}>Sign Up</Text>
                            </Pressable>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    gradient: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: 40,
    },

    // Background orbs
    orbContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },
    orbPurple: {
        width: 300,
        height: 300,
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        top: -60,
        right: -80,
    },
    orbBlue: {
        width: 250,
        height: 250,
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        bottom: 100,
        left: -100,
    },
    orbIndigo: {
        width: 180,
        height: 180,
        backgroundColor: 'rgba(167, 139, 250, 0.06)',
        top: '45%' as any,
        right: -40,
    },

    // Header
    headerSection: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fafafa',
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 15,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.45)',
        marginTop: 8,
    },

    // Form Card (glass effect)
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 28,
    },

    // Inputs
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    inputIconBox: {
        width: 40,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 40,
        fontSize: 15,
        color: '#fafafa',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: 14,
    },

    // Forgot Password
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: 2,
    },
    forgotText: {
        fontSize: 13,
        color: '#a78bfa',
        fontWeight: '500',
    },

    // Error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        fontSize: 13,
        color: '#f87171',
        flex: 1,
    },

    // Login Button
    loginBtn: {
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 6,
    },
    loginBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.3,
    },



    // Bottom link
    bottomLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
    },
    bottomLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#a78bfa',
    },
});
