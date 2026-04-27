import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
    message: string;
    type?: ToastType;
    duration?: number;
    icon?: string;
}

interface ToastContextType {
    showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
    success: { bg: 'rgba(7, 152, 113, 0.95)', border: 'rgba(16, 185, 129, 0.6)', text: '#6ee7b7', icon: 'checkmark-circle' },
    error: { bg: 'rgba(127, 29, 29, 0.95)', border: 'rgba(239, 68, 68, 0.6)', text: '#fca5a5', icon: 'alert-circle' },
    info: { bg: 'rgba(37, 33, 142, 0.95)', border: 'rgba(99, 102, 241, 0.6)', text: '#c7d2fe', icon: 'information-circle' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastConfig | null>(null);
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((config: ToastConfig) => {
        // Clear any existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setToast(config);

        // Slide in
        Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        // Auto dismiss
        timeoutRef.current = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => setToast(null));
        }, config.duration || 3000);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const type = toast?.type || 'success';
    const colors = TOAST_COLORS[type];
    const iconName = toast?.icon || colors.icon;

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        {
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                            transform: [{ translateY }],
                            opacity,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <Ionicons name={iconName as any} size={20} color={colors.text} />
                    <Text style={[styles.toastText, { color: colors.text }]} numberOfLines={2}>
                        {toast.message}
                    </Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 9999,
    },
    toastText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
});
