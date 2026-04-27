import { View, Text, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Spacing, Typography, BorderRadius } from '../../constants/Tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { theme, isDark, colors, setTheme } = useTheme();

    const handleDeleteAccount = () => {
        Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account') }
        ]);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <Stack.Screen
                options={{
                    title: 'Settings',
                    headerStyle: { backgroundColor: colors.background.primary },
                    headerTintColor: colors.text.primary,
                    headerShadowVisible: false,
                    headerTitleStyle: { color: colors.text.primary }
                }}
            />

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.tertiary }]}>Account</Text>
                <View style={[styles.row, { borderBottomColor: isDark ? colors.neutral[900] : colors.neutral[200] }]}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Email</Text>
                    <Text style={[styles.value, { color: colors.text.secondary }]}>{user?.email}</Text>
                </View>
                <View style={[styles.row, { borderBottomColor: isDark ? colors.neutral[900] : colors.neutral[200] }]}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>User ID</Text>
                    <Text style={[styles.value, { color: colors.text.secondary }]} numberOfLines={1} ellipsizeMode="middle">{user?.id}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.tertiary }]}>App Preferences</Text>
                <View style={[styles.row, { borderBottomColor: isDark ? colors.neutral[900] : colors.neutral[200] }]}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Dark Mode</Text>
                    <Switch
                        value={isDark}
                        onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                        trackColor={{ false: colors.neutral[400], true: colors.primary[500] }}
                        thumbColor={isDark ? colors.primary[200] : colors.neutral[50]}
                    />
                </View>
                <View style={[styles.row, { borderBottomColor: isDark ? colors.neutral[900] : colors.neutral[200] }]}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Sound Effects</Text>
                    <Switch value={true} onValueChange={() => { }} trackColor={{ false: colors.neutral[400], true: colors.primary[500] }} />
                </View>
                <View style={[styles.row, { borderBottomColor: isDark ? colors.neutral[900] : colors.neutral[200] }]}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Haptic Feedback</Text>
                    <Switch value={true} onValueChange={() => { }} trackColor={{ false: colors.neutral[400], true: colors.primary[500] }} />
                </View>
            </View>

            <View style={styles.section}>
                <View style={[styles.row, { borderBottomColor: isDark ? colors.neutral[900] : colors.neutral[200] }]}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Version</Text>
                    <Text style={[styles.value, { color: colors.text.secondary }]}>1.0.0 (Beta)</Text>
                </View>
            </View>

            <View style={[styles.section, { marginTop: 20 }]}>
                <Button title="Sign Out" onPress={signOut} variant="outline" style={{ marginBottom: 12 }} />
                <Button
                    title="Delete Account"
                    onPress={handleDeleteAccount}
                    variant="secondary"
                    style={{ backgroundColor: colors.accent[500] + '15', borderColor: colors.accent[500] + '40' }}
                    textStyle={{ color: colors.accent[500] }}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Spacing.md },
    section: { marginBottom: Spacing.xl },
    sectionTitle: { fontSize: Typography.sizes.xs, fontWeight: '700', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
    label: { fontSize: Typography.sizes.base, fontWeight: '500' },
    value: { fontSize: Typography.sizes.sm, maxWidth: '60%' },
});
