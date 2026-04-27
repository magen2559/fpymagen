/**
 * App Configuration
 * 
 * Set LITE_MODE to true to show only the Timer and Profile screens.
 * Timer durations are in minutes.
 */
export const APP_CONFIG = {
    LITE_MODE: false,

    // Timer durations (minutes)
    FOCUS_MINUTES: 0.10,
    SHORT_BREAK_MINUTES: 5,
    LONG_BREAK_MINUTES: 15,

    // After this many focus sessions, auto-offer a long break
    SESSIONS_BEFORE_LONG_BREAK: 4,

    // Coin economy
    COINS_PER_SESSION: 10,
    DAILY_COIN_LIMIT: 150, // Max coins earnable per day
};
