import { supabase } from './supabase';
import { APP_CONFIG } from '../constants/Config';

// --- Achievement Definitions ---
export interface AchievementDef {
    key: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    check: (stats: UserStats) => boolean;
}

export interface UserStats {
    totalSessions: number;
    totalTrees: number;
    totalCoins: number;
    currentStreak: number;
    deadTrees: number;
    level: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    {
        key: 'first_seed',
        title: 'First Seed',
        subtitle: 'Plant your first tree',
        icon: 'leaf',
        color: '#10b981',
        check: (s) => s.totalTrees >= 1,
    },
    {
        key: 'on_fire',
        title: 'On Fire',
        subtitle: '3-day focus streak',
        icon: 'flame',
        color: '#f59e0b',
        check: (s) => s.currentStreak >= 3,
    },
    {
        key: 'forest_guardian',
        title: 'Forest Guardian',
        subtitle: 'Grow 10 trees',
        icon: 'trophy',
        color: '#a855f7',
        check: (s) => s.totalTrees >= 10,
    },
    {
        key: 'dedicated',
        title: 'Dedicated',
        subtitle: 'Complete 25 focus sessions',
        icon: 'medal',
        color: '#3b82f6',
        check: (s) => s.totalSessions >= 25,
    },
    {
        key: 'rich_soil',
        title: 'Rich Soil',
        subtitle: 'Earn 100 coins',
        icon: 'cash',
        color: '#f59e0b',
        check: (s) => s.totalCoins >= 100,
    },
    {
        key: 'week_warrior',
        title: 'Week Warrior',
        subtitle: '7-day focus streak',
        icon: 'shield-checkmark',
        color: '#ef4444',
        check: (s) => s.currentStreak >= 7,
    },
];

// --- Coins ---
const COINS_PER_SESSION = APP_CONFIG.COINS_PER_SESSION;
const DAILY_COIN_LIMIT = APP_CONFIG.DAILY_COIN_LIMIT;
const XP_PER_SESSION = 25;
const XP_PER_LEVEL = 100;

/**
 * Award coins and XP to user after completing a session.
 * Enforces a daily coin limit — XP is always awarded but coins stop after the cap.
 */
export async function awardCoinsAndXP(userId: string): Promise<{ coins: number; xp: number; level: number; coinsCapped: boolean } | undefined> {
    // Get current profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('coins, xp, level')
        .eq('id', userId)
        .single();

    if (!profile) return;

    // Check today's completed sessions to enforce daily coin limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todaySessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('start_time', today.toISOString());

    const todayEarned = ((todaySessions || 0) - 1) * COINS_PER_SESSION; // -1 because current session was already inserted
    const coinsCapped = todayEarned >= DAILY_COIN_LIMIT;
    const coinsToAdd = coinsCapped ? 0 : COINS_PER_SESSION;

    const newCoins = (profile.coins || 0) + coinsToAdd;
    const newXP = (profile.xp || 0) + XP_PER_SESSION;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

    await supabase
        .from('profiles')
        .update({ coins: newCoins, xp: newXP, level: newLevel })
        .eq('id', userId);

    return { coins: newCoins, xp: newXP, level: newLevel, coinsCapped };
}

/**
 * Get the total coins earned today from completed focus sessions.
 */
export async function getTodayEarnedCoins(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todaySessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('start_time', today.toISOString());

    return (todaySessions || 0) * COINS_PER_SESSION;
}

/**
 * Harvest a tree to earn bonus coins
 */
export async function harvestPlant(userId: string, plantId: string) {
    const HARVEST_REWARD = 50;

    // 1. Verify plant is harvestable and belongs to user
    const { data: plant, error: plantError } = await supabase
        .from('plants')
        .select('is_harvestable')
        .eq('id', plantId)
        .eq('user_id', userId)
        .single();

    if (plantError || !plant || !plant.is_harvestable) {
        throw new Error('Plant is not harvestable or does not belong to you.');
    }

    // 2. Add coins to profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();

    if (profileError || !profile) throw profileError;

    const newCoins = (profile.coins || 0) + HARVEST_REWARD;

    const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', userId);

    if (updateProfileError) throw updateProfileError;

    // 3. Mark plant as not harvestable
    const { error: updatePlantError } = await supabase
        .from('plants')
        .update({ is_harvestable: false })
        .eq('id', plantId);

    if (updatePlantError) throw updatePlantError;

    // Invalidate progression cache so other screens fetch the new coin balance
    invalidateProgressionCache();

    return { coinsAwarded: HARVEST_REWARD, totalCoins: newCoins };
}

// --- Streaks ---
/**
 * Calculate the user's current daily streak from session data
 */
export async function calculateStreak(userId: string): Promise<number> {
    try {
        const { data: sessions } = await supabase
            .from('sessions')
            .select('start_time')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('start_time', { ascending: false });

        if (!sessions || sessions.length === 0) return 0;

        // Get unique dates (YYYY-MM-DD)
        const uniqueDates = [...new Set(
            sessions.map(s => new Date(s.start_time).toISOString().split('T')[0])
        )].sort().reverse();

        // Count consecutive days from today
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            const expected = expectedDate.toISOString().split('T')[0];

            if (uniqueDates[i] === expected) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    } catch (e) {
        console.warn('[calculateStreak] Error:', e);
        return 0;
    }
}

// --- Achievements ---
/**
 * Check and unlock any new achievements the user has earned
 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
    // Get current stats
    const [
        { count: totalSessions },
        { count: totalTrees },
        { data: profile },
        { data: existingAchievements },
    ] = await Promise.all([
        supabase.from('sessions').select('*', { count: 'exact', head: true })
            .eq('user_id', userId).eq('status', 'completed'),
        supabase.from('plants').select('*', { count: 'exact', head: true })
            .eq('user_id', userId).gt('health', 0),
        supabase.from('profiles').select('coins, level').eq('id', userId).single(),
        supabase.from('achievements').select('key').eq('user_id', userId),
    ]);

    const { count: deadTrees } = await supabase
        .from('plants').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).eq('health', 0);

    const streak = await calculateStreak(userId);

    const stats: UserStats = {
        totalSessions: totalSessions || 0,
        totalTrees: totalTrees || 0,
        totalCoins: profile?.coins || 0,
        currentStreak: streak,
        deadTrees: deadTrees || 0,
        level: profile?.level || 1,
    };

    const unlockedKeys = new Set((existingAchievements || []).map(a => a.key));
    const newlyUnlocked: string[] = [];

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
        if (!unlockedKeys.has(achievement.key) && achievement.check(stats)) {
            const { error } = await supabase
                .from('achievements')
                .insert({ user_id: userId, key: achievement.key });

            if (!error) {
                newlyUnlocked.push(achievement.key);
            }
        }
    }

    return newlyUnlocked;
}

// --- Progression Cache ---
const CACHE_TTL_MS = 30_000; // 30 seconds
let _progressionCache: { data: any; timestamp: number; userId: string } | null = null;

/** Manually invalidate the progression cache (call after completing a session) */
export function invalidateProgressionCache() {
    _progressionCache = null;
}

/**
 * Get user's full progression data (with 30s cache)
 */
export async function getProgression(userId: string) {
    const defaults = {
        coins: 0, xp: 0, level: 1, streak: 0,
        totalTrees: 0, totalSessions: 0,
        unlockedAchievements: new Set<string>(),
    };

    // Return cached data if fresh
    if (_progressionCache
        && _progressionCache.userId === userId
        && Date.now() - _progressionCache.timestamp < CACHE_TTL_MS) {
        return _progressionCache.data;
    }
    try {
        const [
            { data: profile },
            { data: achievements },
            { count: totalTrees },
            { count: totalSessions },
        ] = await Promise.all([
            supabase.from('profiles').select('coins, xp, level').eq('id', userId).single(),
            supabase.from('achievements').select('key, unlocked_at').eq('user_id', userId),
            supabase.from('plants').select('*', { count: 'exact', head: true })
                .eq('user_id', userId).gt('health', 0),
            supabase.from('sessions').select('*', { count: 'exact', head: true })
                .eq('user_id', userId).eq('status', 'completed'),
        ]);

        const streak = await calculateStreak(userId);
        const unlockedKeys = new Set((achievements || []).map(a => a.key));

        const result = {
            coins: profile?.coins || 0,
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            streak,
            totalTrees: totalTrees || 0,
            totalSessions: totalSessions || 0,
            unlockedAchievements: unlockedKeys,
        };

        // Cache the result
        _progressionCache = { data: result, timestamp: Date.now(), userId };
        return result;
    } catch (e) {
        console.warn('[getProgression] Error:', e);
        return defaults;
    }
}

// Level titles
export function getLevelTitle(level: number): string {
    if (level <= 1) return 'Seedling';
    if (level <= 3) return 'Sprout';
    if (level <= 5) return 'Sapling';
    if (level <= 8) return 'Young Tree';
    if (level <= 12) return 'Growing Oak';
    if (level <= 18) return 'Forest Guardian';
    return 'Ancient Treant';
}
