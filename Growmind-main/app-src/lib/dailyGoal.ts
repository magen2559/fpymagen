import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayStats } from './garden';

const DAILY_GOAL_KEY = '@growmind_daily_goal';
const DEFAULT_GOAL = 120; // 2 hours in minutes

/**
 * Get the user's daily focus goal in minutes
 */
export async function getDailyGoal(): Promise<number> {
    try {
        const value = await AsyncStorage.getItem(DAILY_GOAL_KEY);
        return value ? parseInt(value, 10) : DEFAULT_GOAL;
    } catch {
        return DEFAULT_GOAL;
    }
}

/**
 * Set the user's daily focus goal in minutes
 */
export async function setDailyGoal(minutes: number): Promise<void> {
    await AsyncStorage.setItem(DAILY_GOAL_KEY, String(minutes));
}

/**
 * Get today's progress toward the daily goal
 */
export async function getDailyProgress(userId: string): Promise<{
    goalMinutes: number;
    completedMinutes: number;
    percentage: number;
}> {
    const [goal, todayStats] = await Promise.all([
        getDailyGoal(),
        getTodayStats(userId),
    ]);

    const percentage = Math.min(1, todayStats.totalMinutes / goal);

    return {
        goalMinutes: goal,
        completedMinutes: todayStats.totalMinutes,
        percentage,
    };
}
