import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Tokens';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function MenuModal() {
    const { signOut } = useAuth();
    const { colors, isDark } = useTheme();

    const handleSignOut = () => {
        signOut();
        router.replace('/(auth)/login');
    };

    const MenuItem = ({ icon, label, onPress, isDestructive = false }: any) => (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name={icon} size={24} color={isDestructive ? '#ef4444' : colors.text.secondary} />
            <Text style={[styles.menuItemText, { color: isDestructive ? '#ef4444' : colors.text.primary }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} style={{ marginLeft: 'auto' }} />
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* Backdrop (tap to close) */}
            <Pressable style={styles.backdrop} onPress={() => router.back()}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
            </Pressable>

            {/* Sidebar Drawer */}
            <View style={[styles.drawer, { backgroundColor: colors.background.primary }]}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>GrowMind</Text>
                    <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close" size={28} color={colors.text.primary} />
                    </Pressable>
                </View>

                {/* Menu Items */}
                <View style={styles.menuList}>
                    <MenuItem icon="leaf-outline" label="3D Garden Viewer" onPress={() => { router.back(); router.push('/garden_viewer'); }} />
                    <MenuItem icon="bar-chart-outline" label="Statistics & History" onPress={() => { router.back(); router.navigate('/(tabs)/profile'); }} />
                    <MenuItem icon="trophy-outline" label="Leaderboard" onPress={() => { router.back(); }} />
                    <MenuItem icon="settings-outline" label="Settings" onPress={() => { router.back(); router.push('/settings'); }} />
                    <MenuItem icon="help-buoy-outline" label="Help & FAQ" onPress={() => { router.back(); }} />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleSignOut} isDestructive />
                    <Text style={[styles.versionText, { color: colors.text.disabled }]}>Version 1.0.0</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row' },
    backdrop: { flex: 1 },
    drawer: {
        width: DRAWER_WIDTH, height: '100%',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        position: 'absolute', left: 0, top: 0, bottom: 0,
        shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
        borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)'
    },
    headerTitle: { fontSize: Typography.sizes.xl, fontWeight: '700', letterSpacing: -0.5 },
    closeBtn: { padding: 4 },
    menuList: { flex: 1, paddingTop: Spacing.md },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    },
    menuItemText: { fontSize: Typography.sizes.base, fontWeight: '500' },
    footer: { paddingBottom: Spacing['2xl'], paddingHorizontal: Spacing.md },
    versionText: { fontSize: Typography.sizes.xs, textAlign: 'center', marginTop: Spacing.xl },
});
