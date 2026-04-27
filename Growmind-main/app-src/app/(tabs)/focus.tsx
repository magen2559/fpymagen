import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Vibration, AppState, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { startSession, completeSession, abandonSession, plantTree, plantDeadTree, getTodayStats } from '../../lib/garden';
import { awardCoinsAndXP, checkAndUnlockAchievements, invalidateProgressionCache } from '../../lib/progression';
import { soundManager } from '../../lib/sounds';
import { Task, getActiveTask, incrementTaskPomodoro } from '../../lib/tasks';
import { router } from 'expo-router';
import { useToast } from '../../components/Toast';
import { APP_CONFIG } from '../../constants/Config';

// --- Constants (from config) ---
const FOCUS_MINUTES = APP_CONFIG.FOCUS_MINUTES;
const SHORT_BREAK = APP_CONFIG.SHORT_BREAK_MINUTES;
const LONG_BREAK = APP_CONFIG.LONG_BREAK_MINUTES;

type SessionType = 'focus' | 'shortBreak' | 'longBreak';

// --- Session Tags ---
const SESSION_TAGS = [
    { key: 'study', label: 'Study', emoji: '📖', color: '#6366f1' },
    { key: 'work', label: 'Work', emoji: '💼', color: '#f59e0b' },
    { key: 'reading', label: 'Reading', emoji: '📚', color: '#10b981' },
    { key: 'exercise', label: 'Exercise', emoji: '🏃', color: '#ec4899' },
    { key: 'other', label: 'Other', emoji: '✨', color: '#8b5cf6' },
    { key: 'meditate', label: 'Meditate', emoji: '🧘‍♂️', color: '#a855f7' }
];

// --- Circular Progress Ring ---
function CircularProgress({ progress, size, strokeWidth, color, colors, innerGradientColors }: any) {
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Track */}
            <View style={{
                width: size, height: size, borderRadius: size / 2,
                borderWidth: strokeWidth, borderColor: colors.background.tertiary, position: 'absolute',
            }} />

            {/* Inner fill visual */}
            <View style={{
                width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: size,
                backgroundColor: colors.background.primary, position: 'absolute', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end'
            }}>
                <LinearGradient
                    colors={innerGradientColors}
                    style={{ width: '100%', height: `${Math.max(10, progress * 100)}%`, opacity: 0.15 }}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                />
            </View>

            {/* Active Progress */}
            <View style={{
                width: size, height: size, borderRadius: size / 2,
                borderWidth: strokeWidth, borderColor: color,
                borderTopColor: progress > 0.75 ? color : 'transparent',
                borderRightColor: progress > 0.5 ? color : 'transparent',
                borderBottomColor: progress > 0.25 ? color : 'transparent',
                borderLeftColor: progress > 0 ? color : 'transparent',
                position: 'absolute', transform: [{ rotate: '-90deg' }],
                opacity: progress > 0 ? 1 : 0,
            }} />
        </View>
    );
}

// --- Period Indicator Dots ---
function PeriodIndicator({ currentPeriod }: { currentPeriod: number }) {
    const { colors } = useTheme();
    return (
        <View style={styles.periodDots}>
            {[1, 2, 3, 4].map((p) => (
                <View key={p} style={[
                    styles.dot,
                    { backgroundColor: p <= currentPeriod ? colors.primary[400] : colors.background.tertiary },
                    p === currentPeriod && { width: 16 }
                ]} />
            ))}
        </View>
    );
}

// --- Tag Selector ---
function TagSelector({ selectedTag, onSelect, colors }: { selectedTag: string; onSelect: (tag: string) => void; colors: any }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
            {SESSION_TAGS.map((tag) => (
                <Pressable
                    key={tag.key}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onSelect(tag.key);
                    }}
                    style={[
                        styles.tagChip,
                        selectedTag === tag.key
                            ? { backgroundColor: tag.color + '20', borderColor: tag.color }
                            : { backgroundColor: colors.background.secondary, borderColor: 'transparent' }
                    ]}
                >
                    <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                    <Text style={[
                        styles.tagLabel,
                        { color: selectedTag === tag.key ? tag.color : colors.text.tertiary }
                    ]}>{tag.label}</Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

export default function FocusScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { showToast } = useToast();

    const SESSION_CONFIG: Record<SessionType, { label: string; minutes: number; color: string; gradient: readonly [string, string, ...string[]] }> = {
        focus: { label: 'Focus Session', minutes: FOCUS_MINUTES, color: colors.primary[400], gradient: [colors.primary[200], colors.primary[400]] },
        shortBreak: { label: 'Short Break', minutes: SHORT_BREAK, color: colors.secondary[400], gradient: [colors.secondary[200], colors.secondary[400]] },
        longBreak: { label: 'Long Break', minutes: LONG_BREAK, color: colors.accent[400], gradient: [colors.accent[200], colors.accent[400]] },
    };

    const [sessionType, setSessionType] = useState<SessionType>('focus');
    const [isRunning, setIsRunning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(Math.round(FOCUS_MINUTES * 60));
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [todayStats, setTodayStats] = useState({ sessionsCompleted: 0, totalMinutes: 0, treesPlanted: 0 });
    const [strictMode, setStrictMode] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTag, setSelectedTag] = useState('study');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const celebrateAnim = useRef(new Animated.Value(0)).current;

    const isRunningRef = useRef(isRunning);
    const activeSessionIdRef = useRef(activeSessionId);
    const strictModeRef = useRef(strictMode);
    useEffect(() => {
        isRunningRef.current = isRunning;
        activeSessionIdRef.current = activeSessionId;
        strictModeRef.current = strictMode;
    }, [isRunning, activeSessionId, strictMode]);

    const config = SESSION_CONFIG[sessionType];
    const totalSeconds = Math.round(config.minutes * 60);
    const progress = 1 - secondsLeft / totalSeconds;
    const currentPeriod = (todayStats.sessionsCompleted % 4) + 1;

    const loadStats = useCallback(async () => {
        if (!user) return;
        try {
            const [stats, task] = await Promise.all([getTodayStats(user.id), getActiveTask()]);
            setTodayStats(stats);
            setActiveTask(task);
        } catch (e) { }
    }, [user]);
    useEffect(() => { loadStats(); }, [loadStats]);

    const formatTime = useCallback((secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, []);

    // Pulse animation
    useEffect(() => {
        if (isRunning) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRunning]);

    // Strict Mode: AppState listener
    useEffect(() => {
        const sub = AppState.addEventListener('change', async (state) => {
            if (state === 'background' && isRunningRef.current && activeSessionIdRef.current && user && sessionType === 'focus') {
                if (strictModeRef.current) {
                    const abandonedId = activeSessionIdRef.current;
                    setIsRunning(false);
                    setActiveSessionId(null);
                    setSecondsLeft(totalSeconds);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setTimeout(() => {
                        showToast({ message: 'You left the app during focus! Your tree withered away. 🥀', type: 'error', duration: 4000 });
                    }, 500);
                    try {
                        await abandonSession(abandonedId);
                        await plantDeadTree(user.id);
                        loadStats();
                    } catch (e) { }
                } else {
                    setIsRunning(false);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setTimeout(() => {
                        showToast({ message: 'Timer paused — you left the app. No trees were harmed! ⏸️', type: 'info', duration: 3000 });
                    }, 500);
                }
            }
        });
        return () => sub.remove();
    }, [user, sessionType, totalSeconds, loadStats]);

    // Countdown interval
    useEffect(() => {
        if (isRunning && secondsLeft > 0) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        Vibration.vibrate(2000);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        }
    }, [isRunning]);

    const playCelebrateAnimation = () => {
        Animated.sequence([
            Animated.timing(celebrateAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(celebrateAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    };

    const handleSessionComplete = async () => {
        if (!user) return;
        try {
            if (activeSessionId) await completeSession(activeSessionId);
            if (sessionType === 'focus') {
                if (activeTask) await incrementTaskPomodoro(activeTask.id);
                await plantTree(user.id);
                const reward = await awardCoinsAndXP(user.id);
                const newAchievements = await checkAndUnlockAchievements(user.id);
                invalidateProgressionCache();
                playCelebrateAnimation();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Detailed celebration toast
                const coinText = reward?.coinsCapped ? '(Daily cap reached!)' : `+${APP_CONFIG.COINS_PER_SESSION} coins`;
                const xpText = '+25 XP';
                const achievementText = newAchievements.length > 0 ? ` 🏆 New badge unlocked!` : '';
                showToast({
                    message: `🌳 Tree planted! ${coinText} • ${xpText}${achievementText}`,
                    type: 'success',
                    duration: 5000,
                });

                setTimeout(() => switchSession('shortBreak'), 2500);
            }
        } catch (e) { }
        setActiveSessionId(null); loadStats();
    };

    const switchSession = (type: SessionType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRunning(false); setSessionType(type); setSecondsLeft(Math.round(SESSION_CONFIG[type].minutes * 60)); setActiveSessionId(null);
    };

    const toggleTimer = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (secondsLeft === 0) { setSecondsLeft(totalSeconds); return; }
        if (!isRunning) {
            if (!activeSessionId && user && sessionType === 'focus') {
                try {
                    const session = await startSession(user.id, totalSeconds, selectedTag);
                    setActiveSessionId((session as any).id);
                } catch (e) { }
            }
            setIsRunning(true);
        } else {
            setIsRunning(false);
        }
    };

    const handleReset = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);

        if (activeSessionId && user && sessionType === 'focus') {
            try {
                await abandonSession(activeSessionId);
                await plantDeadTree(user.id);
                loadStats();
            } catch (e) { }
        }

        setSecondsLeft(totalSeconds);
        setActiveSessionId(null);
    };

    const handleMuteToggle = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const nowMuted = await soundManager.toggleMute();
        setIsMuted(nowMuted);
    };

    const celebrateScale = celebrateAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.15, 1],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Pomodoro Timer</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Strict Mode Toggle */}
            <Pressable
                style={[styles.strictToggle, { backgroundColor: strictMode ? colors.primary[50] : colors.background.tertiary }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStrictMode(!strictMode); }}
            >
                <Ionicons name={strictMode ? "shield-checkmark" : "shield-outline"} size={18} color={strictMode ? colors.primary[500] : colors.text.disabled} />
                <Text style={[styles.strictText, { color: strictMode ? colors.primary[600] : colors.text.disabled }]}>
                    Strict Mode {strictMode ? 'ON' : 'OFF'}
                </Text>
            </Pressable>

            {/* Tag Selector (only show during focus) */}
            {sessionType === 'focus' && !isRunning && (
                <TagSelector selectedTag={selectedTag} onSelect={setSelectedTag} colors={colors} />
            )}

            {/* Task Indicator Pill */}
            <View style={[styles.taskIndicator, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f1f5f9' }]}>
                <View style={[styles.taskIconBg, { backgroundColor: colors.primary[50] }]}>
                    <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.taskTitle, { color: colors.text.primary }]}>{sessionType === 'focus' && activeTask ? activeTask.title : config.label}</Text>
                    <Text style={[styles.taskSubtitle, { color: colors.text.tertiary }]}>{activeTask && sessionType === 'focus' ? `${activeTask.completedPomodoros}/${activeTask.estimatedPomodoros} Pomodoros` : `Period ${currentPeriod}`}</Text>
                </View>
                {strictMode && <Ionicons name="shield-checkmark" size={18} color={colors.primary[400]} />}
            </View>

            {/* Timer Circle */}
            <View style={styles.timerWrapper}>
                <Animated.View style={[styles.timerCircle, { transform: [{ scale: Animated.multiply(pulseAnim, celebrateScale) }] }]}>
                    <CircularProgress progress={progress} size={280} strokeWidth={12} color={config.color} colors={colors} innerGradientColors={config.gradient} />
                    <View style={styles.timerContent}>
                        <Text style={[styles.timerText, { color: colors.text.primary }]}>
                            {formatTime(secondsLeft)}
                        </Text>
                        {sessionType === 'focus' && !isRunning && secondsLeft === totalSeconds && (
                            <Text style={[styles.timerTagLabel, { color: colors.text.tertiary }]}>
                                {SESSION_TAGS.find(t => t.key === selectedTag)?.emoji} {SESSION_TAGS.find(t => t.key === selectedTag)?.label}
                            </Text>
                        )}
                    </View>
                </Animated.View>
            </View>

            {/* Dots */}
            <PeriodIndicator currentPeriod={currentPeriod} />

            {/* Controls */}
            <View style={styles.controls}>
                <Pressable style={styles.controlIconBtn} onPress={handleMuteToggle}>
                    <Ionicons name={isMuted ? "volume-mute-outline" : "volume-high-outline"} size={28} color={isMuted ? colors.text.disabled : colors.primary[400]} />
                </Pressable>

                <Pressable onPress={toggleTimer}>
                    <LinearGradient colors={config.gradient} style={styles.playBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Ionicons name={isRunning ? 'pause' : secondsLeft === 0 ? 'refresh' : 'play'} size={36} color="#ffffff" style={{ marginLeft: isRunning ? 0 : 4 }} />
                    </LinearGradient>
                </Pressable>

                <Pressable onPress={handleReset} style={styles.controlIconBtn}>
                    <Ionicons name="refresh-outline" size={28} color={colors.text.tertiary} />
                </Pressable>
            </View>

            {/* Session Type Switcher */}
            <View style={styles.sessionSwitcher}>
                {(['focus', 'shortBreak', 'longBreak'] as SessionType[]).map((type) => (
                    <Pressable
                        key={type}
                        onPress={() => switchSession(type)}
                        style={[styles.sessionBtn, sessionType === type && { backgroundColor: colors.primary[100] }]}
                    >
                        <Text style={[styles.sessionBtnText, { color: sessionType === type ? colors.primary[600] : colors.text.disabled }]}>
                            {type === 'focus' ? 'Focus' : type === 'shortBreak' ? 'Short' : 'Long'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Today's mini stats bar */}
            <View style={[styles.todayBar, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f1f5f9' }]}>
                <View style={styles.todayBarItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary[400]} />
                    <Text style={[styles.todayBarText, { color: colors.text.secondary }]}>{todayStats.sessionsCompleted} sessions</Text>
                </View>
                <View style={styles.todayBarDivider} />
                <View style={styles.todayBarItem}>
                    <Ionicons name="time" size={16} color={colors.accent[400]} />
                    <Text style={[styles.todayBarText, { color: colors.text.secondary }]}>{todayStats.totalMinutes} min</Text>
                </View>
                <View style={styles.todayBarDivider} />
                <View style={styles.todayBarItem}>
                    <Ionicons name="leaf" size={16} color="#10b981" />
                    <Text style={[styles.todayBarText, { color: colors.text.secondary }]}>{todayStats.treesPlanted} trees</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: Spacing.xl },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    headerTitle: { fontSize: Typography.sizes.lg, fontWeight: '700' },

    strictToggle: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, marginBottom: Spacing.sm,
    },
    strictText: { fontSize: Typography.sizes.xs, fontWeight: '700' },

    // Tags
    tagRow: {
        paddingHorizontal: 4, gap: 8, marginBottom: Spacing.sm,
    },
    tagChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
        borderWidth: 1.5,
    },
    tagEmoji: { fontSize: 14 },
    tagLabel: { fontSize: 12, fontWeight: '600' },

    taskIndicator: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
        borderRadius: BorderRadius.xl, borderWidth: 1, ...Shadows.sm,
        marginBottom: 24,
    },
    taskIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    taskTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', marginBottom: 2 },
    taskSubtitle: { fontSize: Typography.sizes.xs },

    timerWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
    timerCircle: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
    timerContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    timerText: { fontSize: 64, fontWeight: '500', letterSpacing: -1 },
    timerTagLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },

    periodDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30 },
    dot: { width: 8, height: 8, borderRadius: 4 },

    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
    controlIconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    playBtn: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center', ...Shadows.lg,
    },

    sessionSwitcher: {
        flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 28,
    },
    sessionBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    sessionBtnText: { fontSize: Typography.sizes.xs, fontWeight: '700' },

    // Today bar
    todayBar: {
        flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
        paddingVertical: 12, borderRadius: BorderRadius.xl, borderWidth: 1,
        marginTop: 20, ...Shadows.sm,
    },
    todayBarItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    todayBarText: { fontSize: 12, fontWeight: '600' },
    todayBarDivider: { width: 1, height: 16, backgroundColor: 'rgba(128,128,128,0.2)' },
});
