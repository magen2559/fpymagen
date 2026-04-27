import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, TextInput, Animated, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../../constants/Config';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

    const handleSignup = async () => {
        if (!email || !password || !username) { setError('Please fill in all fields'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');

        const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) { setLoading(false); setError(signUpError.message); return; }

        if (authData.user) {
            const { error: profileError } = await supabase.from('profiles').insert({ id: authData.user.id, username } as any);
            setLoading(false);
            if (profileError) { setError(profileError.message); } else { router.replace(APP_CONFIG.LITE_MODE ? '/(tabs)/focus' : '/(tabs)'); }
        }
    };

    return (
        <LinearGradient
            colors={['#09090b', '#0f0a1e', '#150d2e', '#09090b']}
            style={styles.gradient}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            {/* Background glow orbs */}
            <View style={styles.orbContainer} pointerEvents="none">
                <View style={[styles.orb, styles.orbPurple]} />
                <View style={[styles.orb, styles.orbBlue]} />
                <View style={[styles.orb, styles.orbGreen]} />
            </View>

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>

                        {/* Logo & Header */}
                        <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={['#22c55e', '#10b981', '#059669']}
                                    style={styles.logoGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name="sparkles" size={32} color="#ffffff" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.titleText}>Create Account</Text>
                            <Text style={styles.subtitleText}>Start growing your productivity</Text>
                        </Animated.View>

                        {/* Form Card */}
                        <Animated.View style={[styles.formCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>

                            {/* Username Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIconBox}>
                                    <Ionicons name="person-outline" size={18} color="#34d399" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    autoComplete="username"
                                />
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIconBox}>
                                    <Ionicons name="mail-outline" size={18} color="#34d399" />
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
                                    <Ionicons name="lock-closed-outline" size={18} color="#34d399" />
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

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIconBox}>
                                    <Ionicons name="shield-checkmark-outline" size={18} color="#34d399" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirm}
                                />
                                <Pressable style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
                                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.4)" />
                                </Pressable>
                            </View>

                            {/* Error */}
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color="#f87171" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            {/* Sign Up Button */}
                            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                                <Pressable
                                    onPress={handleSignup}
                                    onPressIn={handlePressIn}
                                    onPressOut={handlePressOut}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={loading ? ['#166534', '#14532d'] : ['#22c55e', '#10b981', '#059669']}
                                        style={styles.signupBtn}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {loading ? (
                                            <Text style={styles.signupBtnText}>Creating Account...</Text>
                                        ) : (
                                            <>
                                                <Text style={styles.signupBtnText}>Create Account</Text>
                                                <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                                            </>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                            </Animated.View>
                        </Animated.View>



                        {/* Login Link */}
                        <View style={styles.bottomLink}>
                            <Text style={styles.bottomText}>Already have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/login')}>
                                <Text style={styles.bottomLinkText}>Sign In</Text>
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
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
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
        width: 280,
        height: 280,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        top: -40,
        left: -60,
    },
    orbBlue: {
        width: 220,
        height: 220,
        backgroundColor: 'rgba(34, 197, 94, 0.06)',
        bottom: 80,
        right: -80,
    },
    orbGreen: {
        width: 160,
        height: 160,
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        top: '40%' as any,
        left: -30,
    },

    // Header
    headerSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    titleText: {
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
        marginBottom: 12,
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

    // Sign Up Button
    signupBtn: {
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 6,
        marginTop: 4,
    },
    signupBtnText: {
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
        color: '#34d399',
    },
});
