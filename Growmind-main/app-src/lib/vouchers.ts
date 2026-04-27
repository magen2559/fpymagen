import { supabase } from './supabase';

// --- Voucher Definitions ---
export interface VoucherDef {
    key: string;
    title: string;
    description: string;
    cost: number;
    icon: string;
    gradient: readonly [string, string];
    category: 'food' | 'digital' | 'campus' | 'premium' | 'lifestyle';
    requiredLevel: number; // 0 = available from start
}

export const VOUCHER_CATEGORIES = {
    food:      { label: 'Food & Drinks',    emoji: '🍔', color: '#f59e0b' },
    digital:   { label: 'Digital Rewards',  emoji: '💻', color: '#6366f1' },
    campus:    { label: 'Campus Perks',     emoji: '🏫', color: '#10b981' },
    lifestyle: { label: 'Lifestyle',        emoji: '✨', color: '#ec4899' },
    premium:   { label: 'Premium Rewards',  emoji: '👑', color: '#8b5cf6' },
} as const;

export const VOUCHERS: VoucherDef[] = [
    // ── LEVEL 1 (Starter) ───────────────────────────────────────────────
    {
        key: 'free_coffee',
        title: 'Free Coffee',
        description: 'Redeem at any campus café',
        cost: 80,
        icon: 'cafe',
        gradient: ['#fbbf24', '#f59e0b'],
        category: 'food',
        requiredLevel: 1,
    },
    {
        key: 'study_snack',
        title: 'Study Snack Pack',
        description: 'Grab a snack from the campus kiosk',
        cost: 60,
        icon: 'fast-food',
        gradient: ['#fb923c', '#ea580c'],
        category: 'food',
        requiredLevel: 1,
    },
    {
        key: 'library_pass',
        title: 'Library Extended Pass',
        description: 'Access the library after hours',
        cost: 100,
        icon: 'book',
        gradient: ['#818cf8', '#6366f1'],
        category: 'campus',
        requiredLevel: 1,
    },
    {
        key: 'print_credits',
        title: '10 Free Print Pages',
        description: 'Print anything at campus library',
        cost: 50,
        icon: 'print',
        gradient: ['#6ee7b7', '#10b981'],
        category: 'campus',
        requiredLevel: 1,
    },

    // ── LEVEL 2 ──────────────────────────────────────────────────────────
    {
        key: 'bubble_tea',
        title: 'Bubble Tea Voucher',
        description: 'Any drink at Tealive or Chatime',
        cost: 120,
        icon: 'nutrition',
        gradient: ['#f9a8d4', '#ec4899'],
        category: 'food',
        requiredLevel: 2,
    },
    {
        key: 'spotify_1day',
        title: 'Spotify Premium (1 Day)',
        description: 'Ad-free music for 24 hours',
        cost: 150,
        icon: 'musical-notes',
        gradient: ['#34d399', '#059669'],
        category: 'digital',
        requiredLevel: 2,
    },
    {
        key: 'campus_parking',
        title: 'Campus Parking Pass',
        description: 'Free parking for one day',
        cost: 130,
        icon: 'car',
        gradient: ['#93c5fd', '#3b82f6'],
        category: 'campus',
        requiredLevel: 2,
    },
    {
        key: 'gym_day_pass',
        title: 'Campus Gym Day Pass',
        description: 'Access the gym for a full day',
        cost: 140,
        icon: 'barbell',
        gradient: ['#fca5a5', '#ef4444'],
        category: 'lifestyle',
        requiredLevel: 2,
    },

    // ── LEVEL 3 ──────────────────────────────────────────────────────────
    {
        key: 'meal_combo',
        title: 'Meal Combo Deal',
        description: 'Full set meal at campus canteen',
        cost: 180,
        icon: 'restaurant',
        gradient: ['#fde68a', '#f59e0b'],
        category: 'food',
        requiredLevel: 3,
    },
    {
        key: 'youtube_premium_1w',
        title: 'YouTube Premium (1 Week)',
        description: 'No ads + background play for 7 days',
        cost: 200,
        icon: 'logo-youtube',
        gradient: ['#fca5a5', '#dc2626'],
        category: 'digital',
        requiredLevel: 3,
    },
    {
        key: 'notebook',
        title: 'Study Notebook',
        description: 'A5 notebook from campus bookstore',
        cost: 170,
        icon: 'journal',
        gradient: ['#c4b5fd', '#8b5cf6'],
        category: 'campus',
        requiredLevel: 3,
    },
    {
        key: 'massage_chair',
        title: 'Massage Chair Session',
        description: '15-min session at the wellness center',
        cost: 210,
        icon: 'body',
        gradient: ['#a5f3fc', '#06b6d4'],
        category: 'lifestyle',
        requiredLevel: 3,
    },

    // ── LEVEL 4 ──────────────────────────────────────────────────────────
    {
        key: 'canteen_credit',
        title: 'RM10 Canteen Credit',
        description: 'Spend at any campus food outlet',
        cost: 250,
        icon: 'wallet',
        gradient: ['#86efac', '#22c55e'],
        category: 'food',
        requiredLevel: 4,
    },
    {
        key: 'netflix_1day',
        title: 'Netflix (1 Day)',
        description: 'Stream anything for 24 hours',
        cost: 300,
        icon: 'tv',
        gradient: ['#fca5a5', '#b91c1c'],
        category: 'digital',
        requiredLevel: 4,
    },
    {
        key: 'course_ebook',
        title: 'Course eBook Voucher',
        description: 'RM15 off any eBook at campus store',
        cost: 280,
        icon: 'book',
        gradient: ['#bfdbfe', '#3b82f6'],
        category: 'campus',
        requiredLevel: 4,
    },
    {
        key: 'swimming_pool',
        title: 'Swimming Pool Access',
        description: 'Campus Olympic-size pool for a day',
        cost: 260,
        icon: 'water',
        gradient: ['#67e8f9', '#0891b2'],
        category: 'lifestyle',
        requiredLevel: 4,
    },

    // ── LEVEL 5 ──────────────────────────────────────────────────────────
    {
        key: 'movie_ticket',
        title: 'Movie Ticket',
        description: 'One free ticket at GSC or TGV',
        cost: 350,
        icon: 'film',
        gradient: ['#f472b6', '#db2777'],
        category: 'lifestyle',
        requiredLevel: 5,
    },
    {
        key: 'spotify_1week',
        title: 'Spotify Premium (1 Week)',
        description: '7 days of ad-free music',
        cost: 400,
        icon: 'musical-notes',
        gradient: ['#4ade80', '#16a34a'],
        category: 'digital',
        requiredLevel: 5,
    },
    {
        key: 'campus_store_rm20',
        title: 'RM20 Campus Store Credit',
        description: 'Use at the official campus merchandise store',
        cost: 380,
        icon: 'bag',
        gradient: ['#fbbf24', '#d97706'],
        category: 'campus',
        requiredLevel: 5,
    },

    // ── LEVEL 7 (Advanced) ───────────────────────────────────────────────
    {
        key: 'grab_voucher',
        title: 'Grab Food RM15 Voucher',
        description: 'Order delivery right to your dorm',
        cost: 480,
        icon: 'bicycle',
        gradient: ['#6ee7b7', '#047857'],
        category: 'food',
        requiredLevel: 7,
    },
    {
        key: 'icloud_1month',
        title: 'iCloud+ (1 Month)',
        description: '50GB extra storage for a month',
        cost: 500,
        icon: 'cloud',
        gradient: ['#93c5fd', '#1d4ed8'],
        category: 'digital',
        requiredLevel: 7,
    },
    {
        key: 'spa_voucher',
        title: 'Campus Spa Treatment',
        description: '30-min relaxation session',
        cost: 520,
        icon: 'sparkles',
        gradient: ['#f9a8d4', '#be185d'],
        category: 'lifestyle',
        requiredLevel: 7,
    },

    // ── LEVEL 10 (Premium) ───────────────────────────────────────────────
    {
        key: 'amazon_gift_card',
        title: 'RM30 Amazon Gift Card',
        description: 'Shop anything on Amazon',
        cost: 700,
        icon: 'gift',
        gradient: ['#fde68a', '#b45309'],
        category: 'premium',
        requiredLevel: 10,
    },
    {
        key: 'airpods_raffle',
        title: 'AirPods Raffle Entry',
        description: '1 raffle ticket for monthly AirPods draw',
        cost: 800,
        icon: 'headset',
        gradient: ['#e0e7ff', '#6366f1'],
        category: 'premium',
        requiredLevel: 10,
    },
    {
        key: 'spotify_1month',
        title: 'Spotify Premium (1 Month)',
        description: '30 full days of Spotify Premium',
        cost: 900,
        icon: 'musical-notes',
        gradient: ['#bbf7d0', '#15803d'],
        category: 'premium',
        requiredLevel: 10,
    },

    // ── LEVEL 15 (Elite) ─────────────────────────────────────────────────
    {
        key: 'ipad_raffle',
        title: 'iPad Raffle Entry',
        description: 'Chance to win an iPad in semester draw',
        cost: 1200,
        icon: 'tablet-portrait',
        gradient: ['#a5b4fc', '#4f46e5'],
        category: 'premium',
        requiredLevel: 15,
    },
    {
        key: 'tuition_discount',
        title: 'RM50 Tuition Discount',
        description: 'Applied directly to next semester fees',
        cost: 1500,
        icon: 'school',
        gradient: ['#fcd34d', '#92400e'],
        category: 'premium',
        requiredLevel: 15,
    },
];

/**
 * Claim a voucher — deducts coins and records the claim.
 */
export async function claimVoucher(userId: string, voucherKey: string): Promise<{ success: boolean; message: string; newCoins?: number }> {
    const voucher = VOUCHERS.find(v => v.key === voucherKey);
    if (!voucher) return { success: false, message: 'Voucher not found.' };

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();

    if (profileError || !profile) return { success: false, message: 'Could not load profile.' };

    if ((profile.coins || 0) < voucher.cost) {
        return { success: false, message: `Need ${voucher.cost} coins — you have ${profile.coins || 0}.` };
    }

    const { data: existing } = await supabase
        .from('voucher_claims')
        .select('id')
        .eq('user_id', userId)
        .eq('voucher_key', voucherKey)
        .limit(1);

    if (existing && existing.length > 0) {
        return { success: false, message: 'You already claimed this voucher!' };
    }

    const newCoins = (profile.coins || 0) - voucher.cost;
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', userId);

    if (updateError) return { success: false, message: 'Failed to deduct coins.' };

    const { error: claimError } = await supabase
        .from('voucher_claims')
        .insert({ user_id: userId, voucher_key: voucherKey, coins_spent: voucher.cost });

    if (claimError) {
        await supabase.from('profiles').update({ coins: profile.coins }).eq('id', userId);
        return { success: false, message: 'Failed to record claim.' };
    }

    return { success: true, message: `🎉 ${voucher.title} claimed!`, newCoins };
}

/**
 * Get all claimed voucher keys for a user
 */
export async function getClaimedVouchers(userId: string): Promise<string[]> {
    try {
        const { data } = await supabase
            .from('voucher_claims')
            .select('voucher_key')
            .eq('user_id', userId);
        return (data || []).map(d => d.voucher_key);
    } catch {
        return [];
    }
}
