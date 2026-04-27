import { supabase } from './supabase';

// Plant types matching the DB constraint
export type PlantType = 'bonsai' | 'sakura' | 'fern' | 'bamboo' | 'lotus';

const PLANT_TYPES: PlantType[] = ['bonsai', 'sakura', 'fern', 'bamboo', 'lotus'];

/**
 * Generate a random position for a new tree so they don't overlap.
 * Spreads trees in a circular pattern around the center.
 */
function generatePosition(treeCount: number): { x: number; z: number } {
    if (treeCount === 0) return { x: 0, z: 0 }; // First tree goes center

    const ring = Math.floor((treeCount - 1) / 6) + 1; // Which ring (1, 2, 3...)
    const index = (treeCount - 1) % 6;
    const angle = (index / 6) * Math.PI * 2 + ring * 0.5; // Offset each ring
    const radius = ring * 2.2;

    return {
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8,
        z: Math.sin(angle) * radius + (Math.random() - 0.5) * 0.8,
    };
}

/**
 * Start a focus session — creates a DB record with status tracking
 */
export async function startSession(userId: string, durationSeconds: number, tag?: string) {
    const { data, error } = await supabase
        .from('sessions')
        .insert({
            user_id: userId,
            start_time: new Date().toISOString(),
            duration_seconds: durationSeconds,
            status: 'completed' as const, // Will be updated to 'abandoned' if user exits
            tag: tag || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Complete a focus session — update end_time and status
 */
export async function completeSession(sessionId: string) {
    const { error } = await supabase
        .from('sessions')
        .update({
            end_time: new Date().toISOString(),
            status: 'completed' as const,
        })
        .eq('id', sessionId);

    if (error) throw error;
}

/**
 * Abandon a focus session (user left the app)
 */
export async function abandonSession(sessionId: string) {
    const { error } = await supabase
        .from('sessions')
        .update({
            end_time: new Date().toISOString(),
            status: 'abandoned' as const,
        })
        .eq('id', sessionId);

    if (error) throw error;
}

/**
 * Plant a tree in the garden after completing a focus session
 */
export async function plantTree(userId: string) {
    // Get current tree count to determine position
    const { count } = await supabase
        .from('plants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    const treeCount = count || 0;
    const pos = generatePosition(treeCount);
    const plantType = PLANT_TYPES[treeCount % PLANT_TYPES.length];

    const { data, error } = await supabase
        .from('plants')
        .insert({
            user_id: userId,
            type: plantType,
            stage: 3, // Fully grown (completed session)
            health: 1.0,
            position_x: pos.x,
            position_y: 0,
            position_z: pos.z,
            is_harvestable: true,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Plant a dead/withered tree (abandoned session)
 */
export async function plantDeadTree(userId: string) {
    const { count } = await supabase
        .from('plants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    const treeCount = count || 0;
    const pos = generatePosition(treeCount);

    const { data, error } = await supabase
        .from('plants')
        .insert({
            user_id: userId,
            type: 'fern',
            stage: 0, // Withered
            health: 0,
            position_x: pos.x,
            position_y: 0,
            position_z: pos.z,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get all plants for a user's garden
 */
export async function getGarden(userId: string) {
    try {
        const { data, error } = await supabase
            .from('plants')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            console.warn('[getGarden] Supabase error:', error.message);
            return [];
        }
        return data || [];
    } catch (e) {
        console.warn('[getGarden] Network error:', e);
        return [];
    }
}

/**
 * Get today's session stats for a user
 */
export async function getTodayStats(userId: string) {
    const defaultStats = { sessionsCompleted: 0, totalMinutes: 0, treesPlanted: 0 };
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('start_time', today.toISOString());

        if (error) {
            console.warn('[getTodayStats] Supabase error:', error.message);
            return defaultStats;
        }

        const sessions: any[] = data || [];
        const totalMinutes = sessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0) / 60;

        return {
            sessionsCompleted: sessions.length,
            totalMinutes: Math.round(totalMinutes),
            treesPlanted: sessions.length,
        };
    } catch (e) {
        console.warn('[getTodayStats] Network error:', e);
        return defaultStats;
    }
}

/**
 * Get weekly stats — focus minutes per day for the last 7 days
 */
export async function getWeeklyStats(userId: string): Promise<{ day: string; minutes: number; label: string }[]> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const results: { day: string; minutes: number; label: string }[] = [];

    // Build the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        results.push({
            day: date.toISOString().split('T')[0],
            minutes: 0,
            label: days[date.getDay()],
        });
    }

    // Query all completed sessions in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('sessions')
        .select('start_time, duration_seconds')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('start_time', sevenDaysAgo.toISOString());

    if (error || !data) return results;

    // Sum minutes per day
    for (const session of data) {
        const sessionDay = new Date(session.start_time).toISOString().split('T')[0];
        const entry = results.find(r => r.day === sessionDay);
        if (entry) {
            entry.minutes += Math.round((session.duration_seconds || 0) / 60);
        }
    }

    return results;
}

/**
 * Reset the garden — deletes ALL plants for the user.
 * Use this to clear the garden and start fresh.
 */
export async function resetGarden(userId: string) {
    const { error } = await supabase
        .from('plants')
        .delete()
        .eq('user_id', userId);

    if (error) throw error;
}
