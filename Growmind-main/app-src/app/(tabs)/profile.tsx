import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { router, useFocusEffect } from 'expo-router';
import { getProgression, getLevelTitle, ACHIEVEMENTS } from '../../lib/progression';
import { getTodayStats, getWeeklyStats } from '../../lib/garden';
import { ProfileSkeleton } from '../../components/SkeletonLoader';

// --- Components ---
function TabSelector({ tabs, activeTab, onSelect }: any) {
    const { colors } = useTheme();
    return (
        <View style={styles.tabSelector}>
            {tabs.map((tab: string) => (
                <Pressable
                    key={tab}
                    onPress={() => onSelect(tab)}
                    style={[styles.tabBtn, activeTab === tab && { backgroundColor: colors.primary[100] }]}
                >
                    <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary[600] : colors.text.disabled }, activeTab === tab && { fontWeight: '700' }]}>
                        {tab}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

// --- Real Bar Chart ---
function BarChart({ data, colors: themeColors }: { data: { day: string; minutes: number; label: string }[]; colors: any }) {
    const maxMinutes = Math.max(...data.map(d => d.minutes), 1);

    return (
        <View style={styles.chartContainer}>
            {data.map((item, i) => {
                const heightPercent = Math.max(4, (item.minutes / maxMinutes) * 100);
                const isToday = i === data.length - 1;

                return (
                    <View key={i} style={styles.barCol}>
                        <View style={styles.barWrapper}>
                            {item.minutes > 0 && (
                                <Text style={[styles.barMinuteLabel, { color: themeColors.text.tertiary }]}>
                                    {item.minutes}
                                </Text>
                            )}
                            <LinearGradient
                                colors={isToday
                                    ? [themeColors.primary[300], themeColors.primary[500]]
                                    : [themeColors.primary[100], themeColors.primary[200]]
                                }
                                style={[styles.barFill, { height: `${heightPercent}%` }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />
                        </View>
                        <Text style={[
                            styles.barDayLabel,
                            { color: isToday ? themeColors.primary[500] : themeColors.text.disabled },
                            isToday && { fontWeight: '700' }
                        ]}>
                            {item.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { colors, isDark } = useTheme();

    const [progression, setProgression] = useState<any>({ coins: 0, xp: 0, level: 1, streak: 0, totalTrees: 0, totalSessions: 0, unlockedAchievements: new Set<string>() });
    const [todayStats, setTodayStats] = useState({ sessionsCompleted: 0, totalMinutes: 0, treesPlanted: 0 });
    const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number; label: string }[]>([]);
    const [activeChartTab, setActiveChartTab] = useState('Week');
    const [isLoading, setIsLoading] = useState(true);

    const loadProfileData = async (isRefreshing = false) => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        if (!isRefreshing) setIsLoading(true);

        const timeoutId = setTimeout(() => {
            setIsLoading(false);
        }, 6000);

        try {
            await Promise.all([
                getProgression(user.id).then((p: any) => setProgression(p)),
                getTodayStats(user.id).then(setTodayStats),
                getWeeklyStats(user.id).then(setWeeklyData),
            ]);
            clearTimeout(timeoutId);
        } catch (e) {
            console.warn('Profile data load failed:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => { loadProfileData(); }, [user])
    );

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login'); } },
        ]);
    };

    const formatHoursMins = (totalMins: number) => {
        if (totalMins < 60) return `${totalMins}min`;
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return m > 0 ? `${h}h ${m}min` : `${h}h`;
    };

    const totalWeeklyMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <View style={styles.header}>
                    <Pressable><Ionicons name="menu-outline" size={32} color={colors.text.primary} /></Pressable>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Activity</Text>
                    <View style={[styles.profileAvatar, { backgroundColor: colors.primary[100] }]}>
                        <Ionicons name="person" size={20} color={colors.primary[500]} />
                    </View>
                </View>
                <ProfileSkeleton />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable>
                    <Ionicons name="menu-outline" size={32} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Activity</Text>
                <View style={[styles.profileAvatar, { backgroundColor: colors.primary[100] }]}>
                    <Ionicons name="person" size={20} color={colors.primary[500]} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => loadProfileData(true)} tintColor={colors.primary[500]} />
                }
            >

                {/* Today Section */}
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Today</Text>

                <View style={styles.cardsRow}>
                    <LinearGradient colors={isDark ? ['#1e1b4b', '#312e81'] : ['#e0e7ff', '#eff6ff']} style={[styles.summaryCard, { flex: 1.2 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={[styles.cardSubtitle, { color: isDark ? '#a5b4fc' : '#64748b' }]}>Focus Time</Text>
                        <Text style={[styles.cardTitle, { color: isDark ? '#e0e7ff' : '#1e293b' }]}>{todayStats.totalMinutes === 0 ? '0min' : formatHoursMins(todayStats.totalMinutes)}</Text>
                    </LinearGradient>
                    <LinearGradient colors={isDark ? ['#1e1b3a', '#2d1b4e'] : ['#fae8ff', '#f3e8ff']} style={[styles.summaryCard, { flex: 1 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={[styles.cardSubtitle, { color: isDark ? '#c4b5fd' : '#94a3b8' }]}>Growth</Text>
                        <Text style={[styles.cardTitle, { color: isDark ? '#f3e8ff' : '#1e293b' }]}>
                            {todayStats.treesPlanted} <Text style={{ fontSize: 14, fontWeight: '500' }}>Trees</Text>
                        </Text>
                        <Text style={[styles.cardSubText, { color: isDark ? '#a78bfa' : '#64748b' }]}>{todayStats.sessionsCompleted} Sessions</Text>
                    </LinearGradient>
                </View>

                {/* Weekly Chart Section */}
                <View style={{ marginTop: Spacing.xl }}>
                    <View style={styles.chartHeader}>
                        <Text style={[styles.chartHeaderTitle, { color: colors.text.primary }]}>This Week</Text>
                        <Text style={[styles.chartHeaderSub, { color: colors.text.tertiary }]}>
                            {totalWeeklyMinutes > 0 ? formatHoursMins(totalWeeklyMinutes) + ' total' : 'No sessions yet'}
                        </Text>
                    </View>
                    <BarChart data={weeklyData} colors={colors} />
                </View>

                {/* Account Details / History */}
                <View style={[styles.historyCard, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f8fafc' }]}>
                    <View style={styles.historyHeader}>
                        <Text style={[styles.historyDate, { color: colors.text.primary }]}>Total Progress</Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Text style={{ fontSize: 10, color: colors.primary[500] }}>● Level {progression.level}</Text>
                            <Text style={{ fontSize: 10, color: colors.accent[500] }}>● {progression.streak} Day Streak</Text>
                        </View>
                    </View>

                    <View style={styles.historyStatsRow}>
                        <View>
                            <Text style={[styles.historyStatVal, { color: colors.text.primary }]}>{progression.totalTrees}</Text>
                            <Text style={[styles.historyStatLbl, { color: colors.text.tertiary }]}>Total Trees</Text>
                        </View>
                        <View>
                            <Text style={[styles.historyStatVal, { color: colors.text.primary }]}>{progression.totalSessions}</Text>
                            <Text style={[styles.historyStatLbl, { color: colors.text.tertiary }]}>Sessions</Text>
                        </View>
                        <View>
                            <Text style={[styles.historyStatVal, { color: colors.text.primary }]}>{progression.coins}</Text>
                            <Text style={[styles.historyStatLbl, { color: colors.text.tertiary }]}>Coins</Text>
                        </View>
                    </View>
                </View>

                {/* Achievement Showcase */}
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Achievements</Text>
                <View style={styles.achievementGrid}>
                    {ACHIEVEMENTS.map((a) => {
                        const isUnlocked = progression.unlockedAchievements?.has?.(a.key) ?? false;
                        return (
                            <View
                                key={a.key}
                                style={[
                                    styles.achievementCard,
                                    {
                                        backgroundColor: isUnlocked
                                            ? (isDark ? a.color + '18' : a.color + '12')
                                            : (isDark ? colors.neutral[900] : '#f8fafc'),
                                        borderColor: isUnlocked ? a.color + '40' : (isDark ? colors.neutral[800] : '#e2e8f0'),
                                    },
                                ]}
                            >
                                <View style={[
                                    styles.achievementIconWrap,
                                    {
                                        backgroundColor: isUnlocked ? a.color + '25' : (isDark ? '#1e293b' : '#f1f5f9'),
                                    },
                                ]}>
                                    <Ionicons
                                        name={(isUnlocked ? a.icon : 'lock-closed') as any}
                                        size={22}
                                        color={isUnlocked ? a.color : (isDark ? '#4b5563' : '#cbd5e1')}
                                    />
                                </View>
                                <Text style={[
                                    styles.achievementTitle,
                                    { color: isUnlocked ? colors.text.primary : colors.text.disabled },
                                ]} numberOfLines={1}>
                                    {a.title}
                                </Text>
                                <Text style={[
                                    styles.achievementSub,
                                    { color: isUnlocked ? colors.text.tertiary : colors.text.disabled },
                                ]} numberOfLines={2}>
                                    {a.subtitle}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Actions */}
                <View style={[styles.actionsCard, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f8fafc' }]}>
                    <Pressable style={[styles.actionItem, { backgroundColor: isDark ? '#1e1b4b' : colors.primary[50] }]} onPress={() => router.push('/voucher_shop')}>
                        <Ionicons name="gift-outline" size={20} color={colors.primary[500]} />
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>Reward Shop</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                    </Pressable>
                    <Pressable style={[styles.actionItem, { backgroundColor: isDark ? '#1a1a2e' : '#f8fafc' }]} onPress={() => router.push('/garden_viewer')}>
                        <Ionicons name="leaf-outline" size={20} color="#10b981" />
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>My Garden</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                    </Pressable>
                    <Pressable style={styles.actionItem} onPress={handleSignOut}>
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text style={[styles.actionText, { color: '#ef4444' }]}>Sign Out</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: Spacing.md,
    },
    headerTitle: { fontSize: Typography.sizes.lg, fontWeight: '700' },
    profileAvatar: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    content: { paddingHorizontal: Spacing.xl },

    sectionTitle: { fontSize: Typography.sizes.xl, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.md },

    cardsRow: { flexDirection: 'row', gap: Spacing.md },
    summaryCard: {
        padding: Spacing.lg, borderRadius: BorderRadius['2xl'],
        ...Shadows.sm, justifyContent: 'center',
    },
    cardSubtitle: { fontSize: Typography.sizes.sm, fontWeight: '500', marginBottom: Spacing.xs },
    cardTitle: { fontSize: Typography.sizes['2xl'], fontWeight: '600', letterSpacing: -0.5 },
    cardSubText: { fontSize: Typography.sizes.xs, marginTop: 4, fontWeight: '500' },

    // Chart
    chartHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: Spacing.lg,
    },
    chartHeaderTitle: { fontSize: Typography.sizes.base, fontWeight: '700' },
    chartHeaderSub: { fontSize: Typography.sizes.xs, fontWeight: '500' },

    chartContainer: {
        flexDirection: 'row', height: 160, alignItems: 'flex-end',
        justifyContent: 'space-between', paddingHorizontal: 4,
    },
    barCol: { flex: 1, alignItems: 'center' },
    barWrapper: { width: 20, height: 130, justifyContent: 'flex-end', alignItems: 'center' },
    barFill: { width: 20, borderRadius: 10, minHeight: 6 },
    barMinuteLabel: { fontSize: 9, fontWeight: '600', marginBottom: 4 },
    barDayLabel: { fontSize: 11, fontWeight: '500', marginTop: 6 },

    tabSelector: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
    tabBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    tabText: { fontSize: Typography.sizes.sm, fontWeight: '600' },

    historyCard: {
        marginTop: Spacing['2xl'], padding: Spacing.lg,
        borderRadius: BorderRadius['2xl'], borderWidth: 1, ...Shadows.sm,
    },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    historyDate: { fontSize: Typography.sizes.sm, fontWeight: '700' },

    historyStatsRow: { flexDirection: 'row', gap: 30, marginBottom: Spacing.lg },
    historyStatVal: { fontSize: Typography.sizes.xl, fontWeight: '600' },
    historyStatLbl: { fontSize: Typography.sizes.xs, marginTop: 2 },

    taskList: { gap: Spacing.sm },
    taskItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, gap: 12 },
    taskText: { fontSize: Typography.sizes.sm, fontWeight: '600' },

    // Achievement Showcase
    achievementGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    achievementCard: {
        width: '31%' as any, alignItems: 'center', padding: 14,
        borderRadius: 18, borderWidth: 1,
    },
    achievementIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    achievementTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' as const },
    achievementSub: { fontSize: 9, textAlign: 'center' as const, marginTop: 2, lineHeight: 12 },

    // Actions Card
    actionsCard: {
        marginTop: Spacing.xl, borderRadius: BorderRadius['2xl'],
        borderWidth: 1, overflow: 'hidden' as const, ...Shadows.sm,
    },
    actionItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16,
    },
    actionText: { flex: 1, fontSize: Typography.sizes.sm, fontWeight: '600' },
});
