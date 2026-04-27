import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants/Tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { router, useFocusEffect } from 'expo-router';
import { getProgression } from '../lib/progression';
import { VOUCHERS, VOUCHER_CATEGORIES, claimVoucher, getClaimedVouchers, VoucherDef } from '../lib/vouchers';
import { useToast } from '../components/Toast';
import { APP_CONFIG } from '../constants/Config';

// ─── Voucher Card ──────────────────────────────────────────────────────────────
function VoucherCard({
    voucher, claimed, locked, userCoins, userLevel, onClaim, claimingKey, colors, isDark,
}: {
    voucher: VoucherDef; claimed: boolean; locked: boolean; userCoins: number;
    userLevel: number; onClaim: () => void; claimingKey: string | null; colors: any; isDark: boolean;
}) {
    const canAfford = userCoins >= voucher.cost;
    const isLoading = claimingKey === voucher.key;

    if (locked) {
        return (
            <View style={[styles.card, styles.lockedCard, { backgroundColor: isDark ? '#1a1a2e' : '#f8fafc', borderColor: isDark ? '#2d2d4e' : '#e2e8f0' }]}>
                <View style={[styles.lockedIconWrap]}>
                    <Ionicons name="lock-closed" size={22} color={isDark ? '#4b5563' : '#cbd5e1'} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#4b5563' : '#94a3b8' }]}>{voucher.title}</Text>
                    <Text style={[styles.cardDesc, { color: isDark ? '#374151' : '#cbd5e1' }]}>{voucher.description}</Text>
                    <View style={styles.costRow}>
                        <Ionicons name="cash" size={12} color={isDark ? '#374151' : '#cbd5e1'} />
                        <Text style={[styles.costText, { color: isDark ? '#374151' : '#cbd5e1' }]}>{voucher.cost} coins</Text>
                    </View>
                </View>
                <View style={[styles.lockBadge, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    <Text style={[styles.lockBadgeText, { color: isDark ? '#4b5563' : '#94a3b8' }]}>Lv {voucher.requiredLevel}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f1f5f9' }]}>
            <LinearGradient colors={voucher.gradient} style={styles.iconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={voucher.icon as any} size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>{voucher.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.text.tertiary }]}>{voucher.description}</Text>
                <View style={styles.costRow}>
                    <Ionicons name="cash" size={12} color="#f59e0b" />
                    <Text style={styles.costText}>{voucher.cost} coins</Text>
                </View>
            </View>

            {claimed ? (
                <View style={[styles.claimedBadge, { backgroundColor: isDark ? '#052e16' : '#dcfce7' }]}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={styles.claimedText}>Claimed</Text>
                </View>
            ) : (
                <Pressable onPress={onClaim} disabled={!canAfford || !!claimingKey} style={[styles.claimBtn, !canAfford && styles.claimBtnDisabled]}>
                    <LinearGradient
                        colors={canAfford ? ['#f59e0b', '#d97706'] : ['#9ca3af', '#6b7280']}
                        style={styles.claimBtnGrad}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.claimBtnText}>
                            {isLoading ? '...' : canAfford ? 'Claim' : 'Too few'}
                        </Text>
                    </LinearGradient>
                </Pressable>
            )}
        </View>
    );
}

// ─── Category Pill ─────────────────────────────────────────────────────────────
function CategoryPill({ label, emoji, active, color, onPress }: { label: string; emoji: string; active: boolean; color: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={[styles.pill, active && { backgroundColor: color }]}>
            <Text style={styles.pillEmoji}>{emoji}</Text>
            <Text style={[styles.pillLabel, active && { color: '#fff' }]}>{label}</Text>
        </Pressable>
    );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function VoucherShopScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { showToast } = useToast();

    const [coins, setCoins] = useState(0);
    const [level, setLevel] = useState(1);
    const [todayCoins, setTodayCoins] = useState(0);
    const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);
    const [claimingKey, setClaimingKey] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [showLocked, setShowLocked] = useState(true);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const [prog, claimed, today] = await Promise.all([
                getProgression(user.id),
                getClaimedVouchers(user.id),
                import('../lib/progression').then(m => m.getTodayEarnedCoins(user.id)),
            ]);
            setCoins(prog.coins);
            setLevel(prog.level);
            setClaimedVouchers(claimed);
            setTodayCoins(today);
        } catch (e) {
            console.warn('Voucher data load failed:', e);
        }
        setIsRefreshing(false);
    }, [user]);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const handleClaim = async (voucherKey: string) => {
        if (!user || claimingKey) return;
        setClaimingKey(voucherKey);
        try {
            const result = await claimVoucher(user.id, voucherKey);
            if (result.success) {
                showToast({ message: result.message, type: 'success', duration: 3000 });
                if (result.newCoins !== undefined) setCoins(result.newCoins);
                setClaimedVouchers(prev => [...prev, voucherKey]);
            } else {
                showToast({ message: result.message, type: 'error', duration: 3000 });
            }
        } catch {
            showToast({ message: 'Failed to claim voucher.', type: 'error', duration: 3000 });
        }
        setClaimingKey(null);
    };

    // Filter vouchers
    const filtered = VOUCHERS.filter(v =>
        activeCategory === 'all' || v.category === activeCategory
    );
    const unlocked = filtered.filter(v => v.requiredLevel <= level);
    const locked = showLocked ? filtered.filter(v => v.requiredLevel > level) : [];

    const claimedDefs = VOUCHERS.filter(v => claimedVouchers.includes(v.key));

    // Next level to unlock
    const nextUnlockLevel = VOUCHERS
        .filter(v => v.requiredLevel > level)
        .sort((a, b) => a.requiredLevel - b.requiredLevel)[0]?.requiredLevel;

    const categories = [
        { key: 'all', label: 'All', emoji: '🌟', color: '#6366f1' },
        ...Object.entries(VOUCHER_CATEGORIES).map(([k, v]) => ({ key: k, ...v })),
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Reward Shop</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* ── Coin Balance Banner ── */}
            <LinearGradient
                colors={isDark ? ['#78350f', '#451a03'] : ['#fffbeb', '#fef3c7']}
                style={styles.coinBanner}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
                <View style={styles.coinBannerLeft}>
                    <View style={styles.coinIconWrap}>
                        <Ionicons name="cash" size={26} color="#f59e0b" />
                    </View>
                    <View>
                        <Text style={[styles.coinValue, { color: isDark ? '#fde68a' : '#92400e' }]}>{coins}</Text>
                        <Text style={[styles.coinLabel, { color: isDark ? '#fbbf24' : '#b45309' }]}>coins available</Text>
                    </View>
                </View>
                <View style={styles.coinBannerRight}>
                    <View style={[styles.levelPill, { backgroundColor: isDark ? '#451a03' : '#fffbeb' }]}>
                        <Text style={styles.levelPillText}>🌿 Level {level}</Text>
                    </View>
                    <Text style={[styles.dailyText, { color: isDark ? '#fbbf24' : '#b45309' }]}>
                        Today: {todayCoins}/{APP_CONFIG.DAILY_COIN_LIMIT}
                    </Text>
                </View>
            </LinearGradient>

            {/* ── Next Unlock Hint ── */}
            {nextUnlockLevel && (
                <View style={[styles.hintBanner, { backgroundColor: isDark ? '#1e1b4b' : '#eef2ff', borderColor: isDark ? '#312e81' : '#c7d2fe' }]}>
                    <Ionicons name="lock-open-outline" size={14} color="#6366f1" />
                    <Text style={[styles.hintText, { color: isDark ? '#a5b4fc' : '#4338ca' }]}>
                        Reach Level {nextUnlockLevel} to unlock new rewards!
                    </Text>
                </View>
            )}

            {/* ── Category Pills ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
                {categories.map(c => (
                    <CategoryPill
                        key={c.key}
                        label={c.label}
                        emoji={c.emoji}
                        active={activeCategory === c.key}
                        color={c.color}
                        onPress={() => setActiveCategory(c.key)}
                    />
                ))}
            </ScrollView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} tintColor={colors.primary?.[400] ?? '#6366f1'} />}
            >
                {/* ── Unlocked Vouchers ── */}
                {unlocked.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Available for You 🎁</Text>
                        <Text style={[styles.sectionSub, { color: colors.text.tertiary }]}>Unlocked at your current level</Text>
                        {unlocked.map(v => (
                            <VoucherCard
                                key={v.key}
                                voucher={v}
                                claimed={claimedVouchers.includes(v.key)}
                                locked={false}
                                userCoins={coins}
                                userLevel={level}
                                onClaim={() => handleClaim(v.key)}
                                claimingKey={claimingKey}
                                colors={colors}
                                isDark={isDark}
                            />
                        ))}
                    </>
                )}

                {/* ── Locked Vouchers ── */}
                {filtered.filter(v => v.requiredLevel > level).length > 0 && (
                    <>
                        <Pressable style={styles.lockHeader} onPress={() => setShowLocked(p => !p)}>
                            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Coming Soon 🔒</Text>
                            <Ionicons name={showLocked ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.tertiary} />
                        </Pressable>
                        <Text style={[styles.sectionSub, { color: colors.text.tertiary }]}>Level up to unlock these rewards</Text>
                        {showLocked && filtered.filter(v => v.requiredLevel > level).map(v => (
                            <VoucherCard
                                key={v.key}
                                voucher={v}
                                claimed={false}
                                locked={true}
                                userCoins={coins}
                                userLevel={level}
                                onClaim={() => {}}
                                claimingKey={claimingKey}
                                colors={colors}
                                isDark={isDark}
                            />
                        ))}
                    </>
                )}

                {/* ── My Claimed Vouchers ── */}
                {claimedDefs.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary, marginTop: Spacing.xl }]}>My Claimed Vouchers ✅</Text>
                        <Text style={[styles.sectionSub, { color: colors.text.tertiary }]}>Your redeemed rewards</Text>
                        {claimedDefs.map(v => (
                            <View key={v.key} style={[styles.claimedCard, { backgroundColor: isDark ? '#052e16' : '#f0fdf4', borderColor: isDark ? '#14532d' : '#bbf7d0' }]}>
                                <LinearGradient colors={v.gradient} style={styles.claimedCardIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Ionicons name={v.icon as any} size={18} color="#fff" />
                                </LinearGradient>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.cardTitle, { color: colors.text.primary }]}>{v.title}</Text>
                                    <Text style={[styles.cardDesc, { color: colors.text.tertiary }]}>{v.description}</Text>
                                </View>
                                <View style={styles.redeemedBadge}>
                                    <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                                    <Text style={styles.redeemedText}>Done</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: Spacing.md,
    },
    backBtn: { width: 28 },
    headerTitle: { fontSize: 18, fontWeight: '700' },

    // Coin Banner
    coinBanner: {
        marginHorizontal: Spacing.xl, marginBottom: 10, padding: 16,
        borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    coinBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    coinBannerRight: { alignItems: 'flex-end', gap: 4 },
    coinIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(245,158,11,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    coinValue: { fontSize: 26, fontWeight: '800' },
    coinLabel: { fontSize: 11, fontWeight: '500' },
    levelPill: {
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    levelPillText: { fontSize: 11, fontWeight: '700', color: '#f59e0b' },
    dailyText: { fontSize: 10, fontWeight: '600' },

    // Hint
    hintBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginHorizontal: Spacing.xl, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1,
    },
    hintText: { fontSize: 12, fontWeight: '600' },

    // Category Pills
    pillsRow: { paddingHorizontal: Spacing.xl, paddingVertical: 8, gap: 8 },
    pill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: 'rgba(99,102,241,0.08)',
    },
    pillEmoji: { fontSize: 13 },
    pillLabel: { fontSize: 12, fontWeight: '600', color: '#6366f1' },

    // Scroll
    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: 4 },

    // Section
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2, marginTop: 16 },
    sectionSub: { fontSize: 11, marginBottom: 10 },
    lockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    // Voucher Card
    card: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderRadius: 16, borderWidth: 1, marginBottom: 8, ...Shadows.sm,
    },
    lockedCard: { opacity: 0.7 },
    iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    lockedIconWrap: {
        width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(148,163,184,0.12)',
    },
    cardInfo: { flex: 1, marginLeft: 12 },
    cardTitle: { fontSize: 13, fontWeight: '700' },
    cardDesc: { fontSize: 11, marginTop: 1 },
    costRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
    costText: { fontSize: 11, fontWeight: '700', color: '#f59e0b' },

    // Claim Button
    claimBtn: { marginLeft: 8 },
    claimBtnDisabled: { opacity: 0.5 },
    claimBtnGrad: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    claimBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },

    // Claimed Badge (inline)
    claimedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    claimedText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },

    // Lock badge
    lockBadge: {
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    lockBadgeText: { fontSize: 11, fontWeight: '700' },

    // Claimed Voucher Card
    claimedCard: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderRadius: 16, borderWidth: 1, marginBottom: 8,
    },
    claimedCardIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    redeemedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    redeemedText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
});
