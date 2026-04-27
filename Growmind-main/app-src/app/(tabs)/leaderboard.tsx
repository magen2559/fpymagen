import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

// --- League Definitions ---
const LEAGUES = [
    { key: 'bronze', label: 'Bronze League', icon: 'ribbon', color: '#CD7F32', bgGradient: ['#CD7F32', '#a0622a'] as const, minXP: 0 },
    { key: 'silver', label: 'Silver League', icon: 'ribbon', color: '#C0C0C0', bgGradient: ['#C0C0C0', '#9a9a9a'] as const, minXP: 500 },
    { key: 'gold', label: 'Gold League', icon: 'ribbon', color: '#FFD700', bgGradient: ['#FFD700', '#e6c200'] as const, minXP: 1500 },
    { key: 'diamond', label: 'Diamond League', icon: 'diamond', color: '#b9f2ff', bgGradient: ['#7dd3fc', '#38bdf8'] as const, minXP: 3000 },
    { key: 'master', label: 'Master League', icon: 'trophy', color: '#a855f7', bgGradient: ['#a855f7', '#7c3aed'] as const, minXP: 5000 },
];

interface LeaderboardEntry {
    id: string;
    username: string;
    xp: number;
    level: number;
}

function getLeagueForXP(xp: number) {
    for (let i = LEAGUES.length - 1; i >= 0; i--) {
        if (xp >= LEAGUES[i].minXP) return LEAGUES[i];
    }
    return LEAGUES[0];
}

function getTimeUntilReset(): string {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(0, 0, 0, 0);
    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
}

// --- Rank Badge ---
function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <View style={[styles.rankBadge, { backgroundColor: '#FFD700' }]}><Text style={styles.rankBadgeText}>1</Text></View>;
    if (rank === 2) return <View style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}><Text style={styles.rankBadgeText}>2</Text></View>;
    if (rank === 3) return <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}><Text style={styles.rankBadgeText}>3</Text></View>;
    return <Text style={styles.rankNumber}>{rank}</Text>;
}

// --- League Icon Badge ---
function LeagueIcon({ league, isActive, size = 48 }: { league: typeof LEAGUES[0]; isActive: boolean; size?: number }) {
    return (
        <View style={[styles.leagueIconOuter, { opacity: isActive ? 1 : 0.3, width: size, height: size }]}>
            <LinearGradient
                colors={league.bgGradient}
                style={[styles.leagueIconInner, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={league.icon as any} size={size * 0.4} color="#fff" />
            </LinearGradient>
        </View>
    );
}

// --- User Row ---
function UserRow({ entry, rank, isCurrentUser, colors, isDark }: { entry: LeaderboardEntry; rank: number; isCurrentUser: boolean; colors: any; isDark: boolean }) {
    const initial = (entry.username || '?')[0].toUpperCase();
    const avatarColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6'];
    const avatarBg = avatarColors[entry.username.length % avatarColors.length];

    return (
        <View style={[
            styles.userRow,
            isCurrentUser && { backgroundColor: isDark ? '#064e3b' : '#dcfce7', borderRadius: 16 },
        ]}>
            <RankBadge rank={rank} />

            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={styles.avatarText}>{initial}</Text>
            </View>

            {/* Name */}
            <Text style={[
                styles.userName,
                { color: isCurrentUser ? (isDark ? '#34d399' : '#166534') : colors.text.primary },
                isCurrentUser && { fontWeight: '700' },
            ]} numberOfLines={1}>
                {entry.username}{isCurrentUser ? ' (You)' : ''}
            </Text>

            {/* XP */}
            <Text style={[
                styles.userXP,
                { color: isCurrentUser ? (isDark ? '#34d399' : '#166534') : colors.text.secondary },
                isCurrentUser && { fontWeight: '700' },
            ]}>
                {entry.xp} XP
            </Text>
        </View>
    );
}

export default function LeaderboardScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentUserXP, setCurrentUserXP] = useState(0);

    const fetchData = useCallback(async (showLoader = true) => {
        if (!user) { setIsLoading(false); return; }
        if (showLoader) setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, xp, level')
                .order('xp', { ascending: false })
                .limit(30);

            if (error) { console.warn('Leaderboard fetch error:', error); setIsLoading(false); return; }

            const mapped: LeaderboardEntry[] = (data || []).map((p: any) => ({
                id: p.id,
                username: p.username || `User ${p.id.slice(0, 4)}`,
                xp: p.xp || 0,
                level: p.level || 1,
            }));

            setEntries(mapped);
            const me = mapped.find(e => e.id === user.id);
            if (me) setCurrentUserXP(me.xp);
        } catch (e) {
            console.warn('Leaderboard fetch error:', e);
        }
        setIsLoading(false);
        setIsRefreshing(false);
    }, [user]);

    useFocusEffect(
        useCallback(() => { fetchData(); }, [fetchData])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(false);
    };

    const currentLeague = getLeagueForXP(currentUserXP);
    const timeLeft = getTimeUntilReset();
    const currentLeagueIndex = LEAGUES.findIndex(l => l.key === currentLeague.key);

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 28 }} />
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Leaderboard</Text>
                <Ionicons name="help-circle-outline" size={24} color={colors.text.tertiary} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary[400]}
                        colors={[colors.primary[400]]}
                    />
                }
            >

                {/* League Icons Row */}
                <View style={styles.leagueRow}>
                    {LEAGUES.map((league, i) => (
                        <LeagueIcon
                            key={league.key}
                            league={league}
                            isActive={i === currentLeagueIndex}
                            size={i === currentLeagueIndex ? 56 : 40}
                        />
                    ))}
                </View>

                {/* League Info */}
                <View style={styles.leagueInfo}>
                    <Text style={[styles.leagueName, { color: colors.text.primary }]}>{currentLeague.label}</Text>
                    <Text style={[styles.leagueSubtitle, { color: colors.text.tertiary }]}>
                        Top 20 advance to the next league
                    </Text>
                    <Text style={[styles.leagueTimer, { color: currentLeague.color }]}>
                        {timeLeft}
                    </Text>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[800] : '#f1f5f9' }]} />

                {/* Leaderboard List */}
                {isLoading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={colors.primary[500]} />
                    </View>
                ) : entries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color={colors.text.disabled} />
                        <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>No one here yet!</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.text.tertiary }]}>Complete focus sessions to earn XP and appear on the leaderboard.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {entries.map((entry, i) => (
                            <UserRow
                                key={entry.id}
                                entry={entry}
                                rank={i + 1}
                                isCurrentUser={entry.id === user?.id}
                                colors={colors}
                                isDark={isDark}
                            />
                        ))}
                    </View>
                )}

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
    scrollContent: { paddingHorizontal: Spacing.xl },

    // League row
    leagueRow: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        gap: 12, marginTop: Spacing.md, marginBottom: Spacing.lg,
    },
    leagueIconOuter: {
        borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    },
    leagueIconInner: {
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },

    // League info
    leagueInfo: { alignItems: 'center', marginBottom: Spacing.lg },
    leagueName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    leagueSubtitle: { fontSize: 13, marginBottom: 4 },
    leagueTimer: { fontSize: 15, fontWeight: '700' },

    divider: { height: 1, marginBottom: Spacing.md },

    // User row
    userRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 12,
    },
    rankBadge: {
        width: 26, height: 26, borderRadius: 13,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    rankBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
    rankNumber: { fontSize: 14, fontWeight: '600', color: '#94a3b8', width: 26, textAlign: 'center', marginRight: 12 },

    avatar: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },

    userName: { flex: 1, fontSize: 15, fontWeight: '500' },
    userXP: { fontSize: 14, fontWeight: '600', marginLeft: 8 },

    list: {},

    // Loading / Empty
    loadingWrap: { paddingVertical: 60, alignItems: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
    emptySubtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
});
