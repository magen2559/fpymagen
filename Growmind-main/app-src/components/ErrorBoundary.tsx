import React, { Component, type ErrorInfo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    children: React.ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component that catches rendering errors in child components
 * and displays a friendly recovery screen instead of crashing the app.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error.message);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        {/* Icon */}
                        <View style={styles.iconCircle}>
                            <Ionicons name="warning-outline" size={48} color="#f59e0b" />
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>
                            {this.props.fallbackTitle || 'Something went wrong'}
                        </Text>

                        {/* Description */}
                        <Text style={styles.description}>
                            Don't worry, your data is safe. Try again or restart the app if the problem persists.
                        </Text>

                        {/* Error detail (dev only) */}
                        {__DEV__ && this.state.error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText} numberOfLines={3}>
                                    {this.state.error.message}
                                </Text>
                            </View>
                        )}

                        {/* Retry Button */}
                        <Pressable onPress={this.handleRetry}>
                            <LinearGradient
                                colors={['#6366f1', '#8b5cf6']}
                                style={styles.retryBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.retryBtnText}>Try Again</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    content: {
        alignItems: 'center',
        maxWidth: 320,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fafafa',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
        width: '100%',
    },
    errorText: {
        fontSize: 12,
        color: '#f87171',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 14,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    retryBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
});
