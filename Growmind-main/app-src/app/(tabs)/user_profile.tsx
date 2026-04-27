import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { router, useFocusEffect } from 'expo-router';
import { getProgression, getLevelTitle, ACHIEVEMENTS } from '../../lib/progression';
import { APP_CONFIG } from '../../constants/Config';

// --- Stat Card ---
function StatCard({ icon, label, value, gradient }: { icon: string; label: string; value: string; gradient: readonly [string, string] }) {
    const { colors } = useTheme();
    return (
        <LinearGradient colors={gradient} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.statIconWrap}>
                <Ionicons name={icon as any} size={20} color="#fff" />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </LinearGradient>
    );
}

// --- Weekly Streak Day ---
function StreakDay({ label, active, colors }: { label: string; active: boolean; colors: any }) {
    return (
        <View style={[styles.streakDot, active ? { backgroundColor: colors.primary[400] } : { backgroundColor: colors.background.tertiary }]}>
            <Text style={[styles.streakDotText, active ? { color: '#fff' } : { color: colors.text.disabled }]}>{label}</Text>
        </View>
    );
}

// --- Achievement Card ---
function AchievementCard({ title, subtitle, icon, color, unlocked, colors }: any) {
    return (
        <View style={[styles.achievementCard, !unlocked && { opacity: 0.4 }]}>
            <View style={[styles.achievementIcon, { backgroundColor: unlocked ? color + '22' : colors.background.tertiary }]}>
                <Ionicons name={icon} size={22} color={unlocked ? color : colors.text.disabled} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.achievementTitle, { color: colors.text.primary }]}>{title}</Text>
                <Text style={[styles.achievementSubtitle, { color: colors.text.tertiary }]}>{subtitle}</Text>
            </View>
            {unlocked && <Ionicons name="checkmark-circle" size={20} color={colors.primary[400]} />}
        </View>
    );
}

// --- Menu Item ---
function MenuItem({ icon, label, onPress, colors, destructive }: any) {
    return (
        <Pressable style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconBg, { backgroundColor: destructive ? '#fef2f2' : colors.background.tertiary }]}>
                <Ionicons name={icon} size={20} color={destructive ? '#ef4444' : colors.text.secondary} />
            </View>
            <Text style={[styles.menuLabel, { color: destructive ? '#ef4444' : colors.text.primary }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.disabled} />
        </Pressable>
    );
}

export default function UserProfileScreen() {
    const { user, signOut } = useAuth();
    const { colors, isDark } = useTheme();

    const [progression, setProgression] = useState({
        coins: 0, xp: 0, level: 1, streak: 0,
        totalTrees: 0, totalSessions: 0,
        unlockedAchievements: new Set<string>(),
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadProgression = useCallback(async () => {
        if (!user) return;
        try {
            const data = await getProgression(user.id);
            setProgression(data);
        } catch (e) {
            console.warn('Failed to load progression:', e);
        }
        setIsRefreshing(false);
    }, [user]);

    useFocusEffect(
        useCallback(() => { loadProgression(); }, [loadProgression])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadProgression();
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login'); } },
        ]);
    };

    const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
    const displayEmail = user?.email || '';
    const levelTitle = getLevelTitle(progression.level);
    const xpInLevel = progression.xp % 100;

    const today = new Date().getDay();
    const streakDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
        const dayIndex = i + 1;
        const adjustedToday = today === 0 ? 7 : today;
        return { label, active: dayIndex <= adjustedToday && i < progression.streak };
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.push('/menu_modal')}>
                    <Ionicons name="menu-outline" size={32} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>
                <Pressable onPress={() => router.push('/settings')}>
                    <Ionicons name="settings-outline" size={26} color={colors.text.tertiary} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary[400]}
                        colors={[colors.primary[400]]}
                    />
                }
            >
                {/* Avatar + Name */}
                <View style={styles.profileHeader}>
                    <LinearGradient colors={[colors.primary[400], colors.secondary[400]] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarGradient}>
                        <View style={[styles.avatarInner, { backgroundColor: colors.background.secondary }]}>
                            <Ionicons name="person" size={36} color={colors.primary[400]} />
                        </View>
                    </LinearGradient>
                    <Text style={[styles.userName, { color: colors.text.primary }]}>{displayName}</Text>
                    <Text style={[styles.userEmail, { color: colors.text.tertiary }]}>{displayEmail}</Text>

                    {/* Level Badge */}
                    <View style={[styles.levelBadge, { backgroundColor: colors.primary[50] }]}>
                        <Ionicons name="leaf" size={14} color={colors.primary[500]} />
                        <Text style={[styles.levelText, { color: colors.primary[600] }]}>Level {progression.level} · {levelTitle}</Text>
                    </View>

                    {/* XP Bar */}
                    <View style={[styles.xpBarOuter, { backgroundColor: colors.background.tertiary }]}>
                        <LinearGradient colors={[colors.primary[300], colors.primary[500]] as const} style={[styles.xpBarInner, { width: `${xpInLevel}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                    </View>
                    <Text style={[styles.xpLabel, { color: colors.text.disabled }]}>{xpInLevel}/100 XP to next level</Text>
                </View>

                {/* Coins */}
                <View style={[styles.coinCard, { backgroundColor: '#fffbeb', borderColor: '#fef3c7' }]}>
                    <Ionicons name="cash" size={22} color="#f59e0b" />
                    <Text style={styles.coinValue}>{progression.coins}</Text>
                    <Text style={{ fontSize: 14, color: '#92400e' }}>coins</Text>
                </View>

                {/* Voucher Shop Button */}
                <Pressable onPress={() => router.push('/voucher_shop')} style={({ pressed }) => [styles.voucherShopBtn, pressed && { opacity: 0.85 }]}>
                    <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.voucherShopGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <View style={styles.voucherShopLeft}>
                            <View style={styles.voucherShopIconWrap}>
                                <Ionicons name="gift" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.voucherShopTitle}>Voucher Shop</Text>
                                <Text style={styles.voucherShopSub}>Spend coins on rewards 🎁</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
                    </LinearGradient>
                </Pressable>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard icon="flame" label="Streak" value={`${progression.streak}🔥`} gradient={['#fb923c', '#f97316'] as const} />
                    <StatCard icon="time" label="Sessions" value={String(progression.totalSessions)} gradient={[colors.primary[300], colors.primary[500]] as const} />
                    <StatCard icon="leaf" label="Trees" value={String(progression.totalTrees)} gradient={['#34d399', '#10b981'] as const} />
                </View>

                {/* Weekly Streak */}
                <View style={[styles.sectionCard, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f8fafc' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>This Week</Text>
                    <View style={styles.streakRow}>
                        {streakDays.map((day, i) => <StreakDay key={i} label={day.label} active={day.active} colors={colors} />)}
                    </View>
                </View>

                {/* Achievements */}
                <View style={[styles.sectionCard, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f8fafc' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Achievements ({progression.unlockedAchievements.size}/{ACHIEVEMENTS.length})
                    </Text>
                    {ACHIEVEMENTS.map(a => (
                        <AchievementCard key={a.key} title={a.title} subtitle={a.subtitle} icon={a.icon} color={a.color} unlocked={progression.unlockedAchievements.has(a.key)} colors={colors} />
                    ))}
                </View>

                {/* Settings Menu */}
                <View style={[styles.sectionCard, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f8fafc' }]}>
                    <MenuItem icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} colors={colors} />
                    <MenuItem icon="notifications-outline" label="Notifications" onPress={() => router.push('/settings/notifications')} colors={colors} />
                    <MenuItem icon="help-circle-outline" label="Help & Feedback" onPress={() => router.push('/settings/help')} colors={colors} />
                    <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleSignOut} colors={colors} destructive />
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
    content: { paddingHorizontal: Spacing.xl },

    profileHeader: { alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.sm },
    avatarGradient: { width: 96, height: 96, borderRadius: 48, padding: 3 },
    avatarInner: { flex: 1, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
    userName: { fontSize: Typography.sizes.xl, fontWeight: '700', marginTop: Spacing.md },
    userEmail: { fontSize: Typography.sizes.sm, marginBottom: 8 },
    levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full },
    levelText: { fontSize: Typography.sizes.xs, fontWeight: '600' },

    xpBarOuter: { width: '60%', height: 8, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
    xpBarInner: { height: '100%', borderRadius: 4 },
    xpLabel: { fontSize: Typography.sizes.xs, marginTop: 6 },

    coinCard: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 10,
        paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.full, borderWidth: 1,
        marginBottom: Spacing.md, ...Shadows.sm,
    },
    coinValue: { fontSize: Typography.sizes.xl, fontWeight: '800', color: '#f59e0b' },

    // Voucher Shop Button
    voucherShopBtn: { marginBottom: Spacing.lg },
    voucherShopGradient: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderRadius: BorderRadius['2xl'], ...Shadows.md,
    },
    voucherShopLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    voucherShopIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    },
    voucherShopTitle: { fontSize: Typography.sizes.base, fontWeight: '700', color: '#fff' },
    voucherShopSub: { fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
    statCard: { flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: 6, ...Shadows.md },
    statIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.25)' },
    statValue: { fontSize: Typography.sizes.lg, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.8)' },

    sectionCard: {
        borderRadius: BorderRadius['2xl'], padding: Spacing.lg, marginBottom: Spacing.md,
        borderWidth: 1, ...Shadows.sm,
    },
    sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: '700', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },

    streakRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
    streakDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    streakDotText: { fontSize: Typography.sizes.xs, fontWeight: '600' },

    achievementCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    achievementIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    achievementTitle: { fontSize: Typography.sizes.sm, fontWeight: '700' },
    achievementSubtitle: { fontSize: Typography.sizes.xs, marginTop: 2 },

    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
    menuIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, fontSize: Typography.sizes.sm, fontWeight: '600' },
});
