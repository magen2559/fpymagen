import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography } from '../../constants/Tokens';
import { useState } from 'react';

export default function NotificationsScreen() {
    const [dailyReminder, setDailyReminder] = useState(true);
    const [sessionAlerts, setSessionAlerts] = useState(true);
    const [streakAlerts, setStreakAlerts] = useState(true);
    const [tips, setTips] = useState(false);

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Notifications', headerStyle: { backgroundColor: Colors.background.primary }, headerTintColor: Colors.text.primary }} />

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>Stay on track with your gardening goals. We'll only notify you when it's important.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Focus Reminders</Text>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>Daily Reminder</Text>
                        <Text style={styles.subLabel}>Remind me to plant a tree every morning</Text>
                    </View>
                    <Switch value={dailyReminder} onValueChange={setDailyReminder} trackColor={{ false: Colors.neutral[700], true: Colors.primary[500] }} />
                </View>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>Streak Alerts</Text>
                        <Text style={styles.subLabel}>Get notified if you're about to lose a streak</Text>
                    </View>
                    <Switch value={streakAlerts} onValueChange={setStreakAlerts} trackColor={{ false: Colors.neutral[700], true: Colors.primary[500] }} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activity</Text>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>Session Completion</Text>
                        <Text style={styles.subLabel}>Play a sound when timer ends</Text>
                    </View>
                    <Switch value={sessionAlerts} onValueChange={setSessionAlerts} trackColor={{ false: Colors.neutral[700], true: Colors.primary[500] }} />
                </View>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>Gardening Tips</Text>
                        <Text style={styles.subLabel}>Occasional advice from your AI Coach</Text>
                    </View>
                    <Switch value={tips} onValueChange={setTips} trackColor={{ false: Colors.neutral[700], true: Colors.primary[500] }} />
                </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.primary, padding: Spacing.md },
    infoBox: { backgroundColor: Colors.primary[900] + '40', padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary[800] },
    infoText: { color: Colors.primary[200], fontSize: Typography.sizes.sm, lineHeight: 20 },
    section: { marginBottom: Spacing.xl },
    sectionTitle: { color: Colors.text.tertiary, fontSize: Typography.sizes.xs, fontWeight: '700', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.neutral[900] },
    label: { color: Colors.text.primary, fontSize: Typography.sizes.base, fontWeight: '500', marginBottom: 2 },
    subLabel: { color: Colors.text.tertiary, fontSize: Typography.sizes.xs, maxWidth: 240 },
});
