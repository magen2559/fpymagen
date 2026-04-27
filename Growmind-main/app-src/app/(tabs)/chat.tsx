import { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, FlatList,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { getProgression } from '../../lib/progression';
import { useFocusEffect } from 'expo-router';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

// --- Message Bubble ---
function MessageBubble({ message, colors, isDark }: { message: ChatMessage; colors: any; isDark: boolean }) {
    const isUser = message.role === 'user';
    return (
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
            {!isUser && (
                <View style={[styles.aiAvatarSmall, { backgroundColor: colors.primary[900], borderColor: colors.primary[700] + '60' }]}>
                    <Ionicons name="sparkles" size={14} color={colors.primary[400]} />
                </View>
            )}
            <View style={[
                styles.bubbleContent,
                isUser
                    ? { backgroundColor: colors.primary[600], borderBottomRightRadius: 4 }
                    : { backgroundColor: colors.background.secondary, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: isDark ? colors.neutral[800] : colors.neutral[200] }
            ]}>
                <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text.secondary }]}>{message.content}</Text>
            </View>
        </View>
    );
}

// --- Typing Indicator ---
function TypingIndicator({ colors, isDark }: { colors: any; isDark: boolean }) {
    return (
        <View style={[styles.bubble, styles.aiBubble]}>
            <View style={[styles.aiAvatarSmall, { backgroundColor: colors.primary[900], borderColor: colors.primary[700] + '60' }]}>
                <Ionicons name="sparkles" size={14} color={colors.primary[400]} />
            </View>
            <View style={[
                styles.bubbleContent,
                { backgroundColor: colors.background.secondary, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: isDark ? colors.neutral[800] : colors.neutral[200] },
                styles.typingBubble
            ]}>
                <Text style={[styles.typingDots, { color: colors.text.disabled }]}>● ● ●</Text>
            </View>
        </View>
    );
}

// Strip raw API URLs, JSON, and technical details from error messages
function sanitizeErrorMessage(msg: string): string {
    // If it contains URLs or looks like raw API output, replace entirely
    if (msg.includes('https://') || msg.includes('Resource has been exhausted') ||
        msg.includes('quota') || msg.includes('rate') || msg.includes('retry in')) {
        return '🌿 The AI Coach is taking a short breather. Please try again in a minute!';
    }
    // Strip anything that looks like a URL
    const cleaned = msg.replace(/https?:\/\/[^\s)]+/g, '').trim();
    return cleaned || "I'm having trouble connecting. Please try again! 🌿";
}

const SEND_COOLDOWN_MS = 5000; // 5 second minimum gap between messages

export default function ChatScreen() {
    const { user, session } = useAuth();
    const { colors, isDark } = useTheme();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [cooldown, setCooldown] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const lastSentRef = useRef<number>(0);

    // Load chat history when tab focused
    useFocusEffect(
        useCallback(() => {
            if (!user) {
                setLoadingHistory(false);
                return;
            }
            setLoadingHistory(true);
            supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(50)
                .then(({ data }) => {
                    setMessages((data || []) as any);
                    setLoadingHistory(false);
                });
        }, [user])
    );

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    const sendMessage = async () => {
        if (!inputText.trim() || sending || cooldown || !user || !session) return;

        // Enforce cooldown between messages
        const now = Date.now();
        const elapsed = now - lastSentRef.current;
        if (elapsed < SEND_COOLDOWN_MS) {
            setCooldown(true);
            setTimeout(() => setCooldown(false), SEND_COOLDOWN_MS - elapsed);
            return;
        }
        lastSentRef.current = now;

        const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: inputText.trim(),
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setSending(true);

        try {
            // Get user stats for context (only send serializable data)
            const progression = await getProgression(user.id);
            const stats = {
                level: progression.level,
                streak: progression.streak,
                totalTrees: progression.totalTrees,
                totalSessions: progression.totalSessions,
                coins: progression.coins,
            };

            // Call the Edge Function
            const { data, error } = await supabase.functions.invoke('chat', {
                body: { message: userMessage.content, stats },
            });

            if (error) {
                console.warn('Function invoke error:', error);
                throw new Error(error.message || 'Function error');
            }

            // Handle response — data might be a string or object
            const responseData = typeof data === 'string' ? JSON.parse(data) : data;

            if (responseData.error) {
                throw new Error(responseData.error);
            }

            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: responseData.reply || 'No response received.',
                created_at: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (e: any) {
            console.warn('Chat error:', e);
            const friendlyMsg = sanitizeErrorMessage(e.message || '');
            const errorMessage: ChatMessage = {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: friendlyMsg,
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setSending(false);
        }
    };

    const renderWelcome = () => (
        <View style={styles.welcome}>
            <View style={[styles.welcomeIcon, { backgroundColor: colors.primary[900], borderColor: colors.primary[700] + '40' }]}>
                <Ionicons name="sparkles" size={40} color={colors.primary[400]} />
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.text.primary }]}>GrowMind AI</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.text.tertiary }]}>Your personal productivity coach</Text>

            <View style={styles.suggestions}>
                {[
                    '💡 How can I study more effectively?',
                    '🎯 Tips for staying focused',
                    '📊 How am I doing?',
                ].map((suggestion, i) => (
                    <Pressable
                        key={i}
                        style={[styles.suggestionChip, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}
                        onPress={() => {
                            setInputText(suggestion.replace(/^[^\s]+ /, ''));
                        }}
                    >
                        <Text style={[styles.suggestionText, { color: colors.text.secondary }]}>{suggestion}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background.primary }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >

            {/* Messages */}
            {loadingHistory ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            ) : messages.length === 0 ? (
                renderWelcome()
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <MessageBubble message={item} colors={colors} isDark={isDark} />}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={sending ? <TypingIndicator colors={colors} isDark={isDark} /> : null}
                />
            )}

            {/* Input Bar */}
            <View style={[styles.inputBar, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200], backgroundColor: colors.background.primary }]}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.background.secondary, color: colors.text.primary, borderColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}
                    placeholder="Ask GrowMind AI..."
                    placeholderTextColor={colors.text.disabled}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                />
                <Pressable
                    style={[styles.sendBtn, { backgroundColor: colors.background.secondary }, (!inputText.trim() || sending || cooldown) && styles.sendBtnDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || sending || cooldown}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color={colors.primary[400]} />
                    ) : (
                        <Ionicons name="send" size={20} color={inputText.trim() ? colors.primary[400] : colors.neutral[600]} />
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // --- Loading ---
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // --- Messages ---
    messageList: { padding: Spacing.md, paddingBottom: Spacing.sm },

    bubble: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
    userBubble: { justifyContent: 'flex-end' },
    aiBubble: { justifyContent: 'flex-start' },

    aiAvatarSmall: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 8, borderWidth: 1,
    },

    bubbleContent: { maxWidth: '78%', borderRadius: 18, padding: 12, paddingHorizontal: 16 },

    bubbleText: { fontSize: Typography.sizes.sm, lineHeight: 20 },

    // --- Typing ---
    typingBubble: { paddingVertical: 14 },
    typingDots: { fontSize: 12, letterSpacing: 2 },

    // --- Welcome ---
    welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    welcomeIcon: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, marginBottom: Spacing.md,
    },
    welcomeTitle: { fontSize: Typography.sizes['2xl'], fontWeight: '800', marginBottom: 4 },
    welcomeSubtitle: { fontSize: Typography.sizes.sm, marginBottom: Spacing.xl },

    suggestions: { gap: 10, width: '100%' },
    suggestionChip: {
        paddingVertical: 12, paddingHorizontal: 16,
        borderRadius: BorderRadius.lg, borderWidth: 1,
    },
    suggestionText: { fontSize: Typography.sizes.sm },

    // --- Input ---
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', gap: 8,
        padding: Spacing.sm, paddingHorizontal: Spacing.md,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
        fontSize: Typography.sizes.sm,
        maxHeight: 100, borderWidth: 1,
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.5 },
});
