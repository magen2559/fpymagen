import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Tokens';
import Button from '../../components/Button';

function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
        <View style={styles.faqItem}>
            <Text style={styles.question}>{question}</Text>
            <Text style={styles.answer}>{answer}</Text>
        </View>
    );
}

export default function HelpScreen() {
    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@growmind.app?subject=Help with GrowMind');
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Help & Feedback', headerStyle: { backgroundColor: Colors.background.primary }, headerTintColor: Colors.text.primary }} />

            <View style={styles.header}>
                <Ionicons name="chatbubbles-outline" size={48} color={Colors.primary[400]} />
                <Text style={styles.title}>How can we help?</Text>
                <Text style={styles.subtitle}>Check our FAQ or send us a message.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                <FAQItem
                    question="How do I grow a tree?"
                    answer="Start a Focus Session from the Focus tab. When the timer completes successfully, a new tree is planted in your garden!"
                />
                <FAQItem
                    question="What happens if I leave the app?"
                    answer="If you leave the app while a focus session is running, your tree might wither. Stay focused to keep it healthy!"
                />
                <FAQItem
                    question="How does the AI Coach work?"
                    answer="The AI Coach analyzes your focus patterns and gives you personalized advice. You can chat with it in the 'AI Coach' tab."
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Us</Text>
                <View style={styles.contactCard}>
                    <Text style={styles.contactText}>Have a bug to report or a feature idea?</Text>
                    <Button title="Email Support" onPress={handleEmailSupport} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.primary, padding: Spacing.md },
    header: { alignItems: 'center', marginVertical: Spacing.lg },
    title: { fontSize: Typography.sizes.xl, fontWeight: '700', color: Colors.text.primary, marginTop: Spacing.md },
    subtitle: { fontSize: Typography.sizes.base, color: Colors.text.secondary, marginTop: 4 },

    section: { marginBottom: Spacing.xl },
    sectionTitle: { color: Colors.text.tertiary, fontSize: Typography.sizes.xs, fontWeight: '700', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },

    faqItem: { marginBottom: Spacing.md, backgroundColor: Colors.neutral[900], padding: Spacing.md, borderRadius: BorderRadius.md },
    question: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 },
    answer: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, lineHeight: 20 },

    contactCard: { backgroundColor: Colors.glass.light, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.neutral[800], alignItems: 'center', gap: 12 },
    contactText: { color: Colors.text.secondary, textAlign: 'center' },
});
