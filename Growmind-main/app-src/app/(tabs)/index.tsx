import { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, Platform, TextInput, Animated, Dimensions, RefreshControl } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors as StaticColors, Typography, Spacing, BorderRadius, Shadows, LightColors } from '../../constants/Tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getGarden } from '../../lib/garden';
import { harvestPlant, getProgression } from '../../lib/progression';
import { getDailyProgress } from '../../lib/dailyGoal';
import { useFocusEffect, router } from 'expo-router';
import type { Plant as PlantData } from '../../types/database';
import { soundManager, SoundName } from '../../lib/sounds';
import { Task, getTasks, addTask, toggleTaskCompletion, deleteTask, setActiveTask, getActiveTask } from '../../lib/tasks';
import { DashboardSkeleton } from '../../components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Motivational Quotes ---
const QUOTES = [
    "The secret of getting ahead is getting started.",
    "Focus on being productive instead of busy.",
    "Small daily improvements lead to stunning results.",
    "Your garden grows with every focused minute.",
    "Discipline is choosing between what you want now and what you want most.",
    "Progress, not perfection.",
    "Every session plants a seed for your future.",
];

function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
    if (hour < 21) return { text: 'Good Evening', emoji: '🌙' };
    return { text: 'Night Owl Mode', emoji: '🦉' };
}

// --- 3D Components (Garden Preview – Matches Garden Viewer) ---
function Ground({ isDark }: { isDark: boolean }) {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <circleGeometry args={[18, 64]} />
                <meshStandardMaterial color={isDark ? '#1a4a3a' : '#3d9970'} roughness={0.95} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial color={isDark ? '#050d0a' : '#1a5e40'} roughness={1} />
            </mesh>
        </group>
    );
}

function Lighting({ colors, isDark }: { colors: any; isDark: boolean }) {
    return (
        <>
            <ambientLight intensity={isDark ? 0.25 : 0.6} color={isDark ? '#a5b4fc' : '#fff7ed'} />
            <directionalLight position={[8, 12, 5]} intensity={isDark ? 0.8 : 1.8} color={isDark ? '#fef3c7' : '#fffbeb'} />
            <directionalLight position={[-5, 6, -3]} intensity={isDark ? 0.3 : 0.5} color={isDark ? '#c4b5fd' : '#fde68a'} />
            <pointLight position={[0, 0.5, 0]} intensity={isDark ? 0.2 : 0.3} color="#34d399" distance={15} />
        </>
    );
}

const PLANT_PALETTES: Record<string, { trunk: string; foliage: string[]; emissive?: string }> = {
    bonsai:  { trunk: '#6b3a10', foliage: ['#059669', '#10b981', '#34d399'] },
    sakura:  { trunk: '#5c2d0e', foliage: ['#f472b6', '#ec4899', '#f9a8d4'], emissive: '#fce7f3' },
    fern:    { trunk: '#4a3728', foliage: ['#22c55e', '#16a34a', '#4ade80'] },
    bamboo:  { trunk: '#365314', foliage: ['#84cc16', '#a3e635', '#d9f99d'] },
    lotus:   { trunk: '#44403c', foliage: ['#c084fc', '#a855f7', '#e9d5ff'], emissive: '#f3e8ff' },
};

function Plant({ position, scale = 1, plantType = 'bonsai', health = 1, isHarvestable = false, onHarvest }: any) {
    const groupRef = useRef<any>(null);
    const palette = PLANT_PALETTES[plantType] || PLANT_PALETTES.bonsai;
    const isDead = health <= 0;
    const trunkColor = isDead ? '#4a4a4a' : palette.trunk;
    const foliageColors = isDead ? ['#3a3a3a', '#333333', '#2d2d2d'] : palette.foliage;
    const treeScale = isDead ? scale * 0.6 : scale;

    useFrame(({ clock }) => {
        if (groupRef.current && !isDead) {
            const t = clock.getElapsedTime();
            groupRef.current.rotation.z = Math.sin(t * 0.8 + position[0] * 2) * 0.03;
        }
    });

    // Bonsai = spherical canopy
    const renderBonsai = () => (
        <>
            <mesh position={[0, 0.65, 0]}><cylinderGeometry args={[0.12, 0.22, 1.3, 8]} /><meshStandardMaterial color={trunkColor} roughness={0.9} /></mesh>
            <mesh position={[0, 1.5, 0]}><sphereGeometry args={[0.85, 12, 10]} /><meshStandardMaterial color={foliageColors[0]} roughness={0.6} /></mesh>
            <mesh position={[0.35, 2.0, 0.2]}><sphereGeometry args={[0.55, 10, 8]} /><meshStandardMaterial color={foliageColors[1]} roughness={0.5} /></mesh>
            <mesh position={[-0.3, 2.2, -0.15]}><sphereGeometry args={[0.45, 10, 8]} /><meshStandardMaterial color={foliageColors[2]} roughness={0.5} /></mesh>
        </>
    );

    // Sakura = cherry blossom clouds
    const renderSakura = () => (
        <>
            <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.1, 0.2, 1.0, 8]} /><meshStandardMaterial color={trunkColor} roughness={0.85} /></mesh>
            <mesh position={[0, 1.7, 0]}><sphereGeometry args={[0.95, 12, 10]} /><meshStandardMaterial color={foliageColors[0]} roughness={0.4} emissive={palette.emissive} emissiveIntensity={0.08} /></mesh>
            <mesh position={[0.6, 1.9, 0.3]}><sphereGeometry args={[0.6, 10, 8]} /><meshStandardMaterial color={foliageColors[1]} roughness={0.35} /></mesh>
            <mesh position={[-0.5, 2.0, -0.2]}><sphereGeometry args={[0.5, 10, 8]} /><meshStandardMaterial color={foliageColors[2]} roughness={0.35} /></mesh>
        </>
    );

    // Fern = bushy dodecahedron
    const renderFern = () => (
        <>
            <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.08, 0.14, 0.6, 6]} /><meshStandardMaterial color={trunkColor} roughness={0.9} /></mesh>
            <mesh position={[0, 0.8, 0]}><dodecahedronGeometry args={[0.7, 1]} /><meshStandardMaterial color={foliageColors[0]} roughness={0.55} /></mesh>
            <mesh position={[0.3, 1.0, 0.2]}><dodecahedronGeometry args={[0.5, 1]} /><meshStandardMaterial color={foliageColors[1]} roughness={0.5} /></mesh>
        </>
    );

    // Bamboo = tall multi-stalk
    const renderBamboo = () => (
        <>
            <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.06, 0.07, 2.4, 6]} /><meshStandardMaterial color={trunkColor} roughness={0.7} /></mesh>
            <mesh position={[0.2, 1.0, 0.12]}><cylinderGeometry args={[0.05, 0.06, 2.0, 6]} /><meshStandardMaterial color={trunkColor} roughness={0.7} /></mesh>
            <mesh position={[0, 2.6, 0]}><coneGeometry args={[0.4, 0.6, 6]} /><meshStandardMaterial color={foliageColors[0]} roughness={0.5} /></mesh>
            <mesh position={[0.2, 2.2, 0.12]}><coneGeometry args={[0.3, 0.5, 6]} /><meshStandardMaterial color={foliageColors[1]} roughness={0.5} /></mesh>
        </>
    );

    // Lotus = mystical flower
    const renderLotus = () => (
        <>
            <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.06, 0.1, 1.2, 6]} /><meshStandardMaterial color={trunkColor} roughness={0.8} /></mesh>
            <mesh position={[0, 1.3, 0]} scale={[1, 0.4, 1]}><sphereGeometry args={[0.8, 12, 10]} /><meshStandardMaterial color={foliageColors[0]} roughness={0.35} emissive={palette.emissive} emissiveIntensity={0.15} /></mesh>
            <mesh position={[0, 1.5, 0]} scale={[1, 0.35, 1]}><sphereGeometry args={[0.6, 12, 10]} /><meshStandardMaterial color={foliageColors[1]} roughness={0.3} /></mesh>
            <mesh position={[0, 1.65, 0]}><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial color={foliageColors[2]} roughness={0.3} emissive="#fef9c3" emissiveIntensity={0.3} /></mesh>
        </>
    );

    // Dead = stump
    const renderDead = () => (
        <>
            <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.08, 0.18, 0.7, 6]} /><meshStandardMaterial color="#4a4a4a" roughness={1} /></mesh>
            <mesh position={[0.1, 0.6, 0]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.03, 0.05, 0.3, 4]} /><meshStandardMaterial color="#3a3a3a" roughness={1} /></mesh>
        </>
    );

    const renderTree = isDead ? renderDead
        : plantType === 'sakura' ? renderSakura
        : plantType === 'fern' ? renderFern
        : plantType === 'bamboo' ? renderBamboo
        : plantType === 'lotus' ? renderLotus
        : renderBonsai;

    return (
        <group position={position} scale={treeScale}>
            <group ref={groupRef} onClick={(e) => { e.stopPropagation(); if (isHarvestable && onHarvest) onHarvest(); }}>
                {isHarvestable && (
                    <mesh position={[0, 3.5, 0]}>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={3} />
                    </mesh>
                )}
                {renderTree()}
            </group>
        </group>
    );
}

// --- UI Components ---
function SectionHeader({ title, actionText }: { title: string; actionText?: string }) {
    const { colors } = useTheme();
    return (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
            {actionText && <Text style={[styles.sectionAction, { color: colors.text.tertiary }]}>{actionText}</Text>}
        </View>
    );
}

function SoundCard({ title, colors: gradientColors, icon, soundName, activeSound, onPlay }: { title: string; colors: readonly [string, string, ...string[]]; icon: string; soundName: SoundName; activeSound: SoundName | null; onPlay: (name: SoundName) => void }) {
    const { colors } = useTheme();
    const isActive = activeSound === soundName;
    return (
        <Pressable style={styles.soundCardContainer} onPress={() => onPlay(soundName)}>
            <LinearGradient colors={gradientColors} style={[styles.soundCard, isActive && styles.soundCardActive]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={icon as any} size={32} color="#ffffff" style={styles.soundIcon} />
                {isActive && <Ionicons name="volume-high" size={16} color="#ffffff" style={{ position: 'absolute', bottom: 10, right: 10 }} />}
            </LinearGradient>
            <Text style={[styles.soundTitle, { color: colors.text.primary }]}>{title}</Text>
        </Pressable>
    );
}

function TaskItem({ task, isActive, onSelect, onToggle, onDelete }: { task: Task; isActive: boolean; onSelect: () => void; onToggle: () => void; onDelete: () => void }) {
    const { colors } = useTheme();
    return (
        <Pressable onPress={onSelect} style={[styles.taskItem, { backgroundColor: isActive ? colors.primary[50] : colors.background.secondary, borderColor: isActive ? colors.primary[200] : '#f8fafc' }]}>
            <Pressable onPress={onToggle} style={styles.taskCheckbox}>
                <Ionicons name={task.isCompleted ? "checkmark-circle" : "ellipse-outline"} size={24} color={task.isCompleted ? colors.primary[400] : colors.text.disabled} />
            </Pressable>

            <View style={styles.taskTextWrapper}>
                <Text style={[styles.taskTitle, { color: colors.text.primary, textDecorationLine: task.isCompleted ? 'line-through' : 'none' }]}>{task.title}</Text>
                <Text style={[styles.taskSubtitle, { color: colors.text.tertiary }]}>{task.completedPomodoros} / {task.estimatedPomodoros} Pomodoros</Text>
            </View>

            {isActive && <Ionicons name="star" size={16} color={colors.accent[400]} style={{ marginRight: 12 }} />}

            <Pressable onPress={onDelete} style={styles.taskDeleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#f87171" />
            </Pressable>
        </Pressable>
    );
}

// --- Daily Progress Ring ---
function DailyProgressRing({ percentage, completedMinutes, goalMinutes, colors }: any) {
    const size = 56;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const progress = Math.min(1, percentage);

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                width: size, height: size, borderRadius: size / 2,
                borderWidth: strokeWidth, borderColor: colors.background.tertiary, position: 'absolute',
            }} />
            <View style={{
                width: size, height: size, borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: colors.primary[400],
                borderTopColor: progress > 0.75 ? colors.primary[400] : 'transparent',
                borderRightColor: progress > 0.5 ? colors.primary[400] : 'transparent',
                borderBottomColor: progress > 0.25 ? colors.primary[400] : 'transparent',
                borderLeftColor: progress > 0 ? colors.primary[400] : 'transparent',
                position: 'absolute', transform: [{ rotate: '-90deg' }],
                opacity: progress > 0 ? 1 : 0.3,
            }} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text.primary }}>
                {completedMinutes}
            </Text>
        </View>
    );
}

// --- Main Screen ---
export default function HomeScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const [plants, setPlants] = useState<PlantData[]>([]);
    const [totalCoins, setTotalCoins] = useState(0);
    const [activeSound, setActiveSound] = useState<SoundName | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [dailyProgress, setDailyProgress] = useState({ goalMinutes: 120, completedMinutes: 0, percentage: 0 });
    const [progression, setProgression] = useState({ streak: 0, level: 1, totalTrees: 0 });
    const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const greeting = getGreeting();
    const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

    const handlePlaySound = async (name: SoundName) => {
        if (activeSound === name) {
            await soundManager.stop();
            setActiveSound(null);
        } else {
            await soundManager.play(name);
            setActiveSound(name);
        }
    };

    const loadGardenData = async (isRefreshing = false) => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        try {
            if (!isRefreshing) setIsLoading(true);

            // Safety timeout: force stop loading after 5s so the UI isn't stuck forever
            const timeoutId = setTimeout(() => {
                if (isLoading) {
                    console.warn('Garden data load timed out');
                    setIsLoading(false);
                }
            }, 5000);

            console.log('Fetching garden data for user:', user.id);
            const [gardenData, prog, loadedTasks, activeTask, daily] = await Promise.all([
                getGarden(user.id),
                getProgression(user.id),
                getTasks(),
                getActiveTask(),
                getDailyProgress(user.id)
            ]);

            clearTimeout(timeoutId);
            setPlants(gardenData as any);
            setTotalCoins(prog.coins);
            setProgression({ streak: prog.streak, level: prog.level, totalTrees: prog.totalTrees });
            setTasks(loadedTasks);
            setActiveTaskId(activeTask?.id || null);
            setDailyProgress(daily);
            console.log('Garden data loaded successfully');
        } catch (e) {
            console.warn('Failed to load garden data:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadGardenData(); }, [user]));

    const handleHarvest = async (plantId: string) => {
        if (!user) return;
        try {
            const result = await harvestPlant(user.id, plantId);
            setTotalCoins(result.totalCoins);
            setPlants(prev => prev.map(p => p.id === plantId ? { ...p, is_harvestable: false } : p));
        } catch (e) { }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        const nt = await addTask(newTaskTitle.trim(), 4);
        setTasks(await getTasks());
        setNewTaskTitle('');
        if (!activeTaskId) handleSelectTask(nt.id);
    };

    const handleSelectTask = async (id: string) => {
        await setActiveTask(id);
        setActiveTaskId(id);
    };

    const handleToggleTask = async (id: string) => {
        await toggleTaskCompletion(id);
        setTasks(await getTasks());
    };

    const handleDeleteTask = async (id: string) => {
        await deleteTask(id);
        const [updatedTasks, activeTask] = await Promise.all([getTasks(), getActiveTask()]);
        setTasks(updatedTasks);
        setActiveTaskId(activeTask?.id || null);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.push('/menu_modal')}>
                        <Ionicons name="menu-outline" size={32} color={colors.text.primary} />
                    </Pressable>
                    <View style={[styles.profileAvatar, { backgroundColor: colors.primary[100] }]}>
                        <Ionicons name="person" size={20} color={colors.primary[500]} />
                    </View>
                </View>
                <DashboardSkeleton />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>

            {/* Custom Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.push('/menu_modal')}>
                    <Ionicons name="menu-outline" size={32} color={colors.text.primary} />
                </Pressable>
                <View style={[styles.profileAvatar, { backgroundColor: colors.primary[100] }]}>
                    <Ionicons name="person" size={20} color={colors.primary[500]} />
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => loadGardenData(true)} tintColor={colors.primary[500]} />
                }
            >

                {/* Greeting Section */}
                <View style={styles.greetingSection}>
                    <Text style={[styles.greetingText, { color: colors.text.primary }]}>{greeting.text}, {displayName} {greeting.emoji}</Text>
                    <Text style={[styles.quoteText, { color: colors.text.tertiary }]}>{quote}</Text>
                </View>

                {/* Quick Stats Row */}
                <View style={styles.quickStatsRow}>
                    {/* Daily Progress */}
                    <View style={[styles.quickStatCard, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f1f5f9' }]}>
                        <DailyProgressRing
                            percentage={dailyProgress.percentage}
                            completedMinutes={dailyProgress.completedMinutes}
                            goalMinutes={dailyProgress.goalMinutes}
                            colors={colors}
                        />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={[styles.quickStatLabel, { color: colors.text.tertiary }]}>Today's Focus</Text>
                            <Text style={[styles.quickStatValue, { color: colors.text.primary }]}>{dailyProgress.completedMinutes}/{dailyProgress.goalMinutes} min</Text>
                        </View>
                    </View>

                    {/* Streak + Level */}
                    <View style={[styles.quickStatCard, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f1f5f9' }]}>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <View style={styles.streakRow}>
                                <Ionicons name="flame" size={20} color="#f59e0b" />
                                <Text style={[styles.streakValue, { color: colors.text.primary }]}>{progression.streak}</Text>
                            </View>
                            <Text style={[styles.quickStatLabel, { color: colors.text.tertiary }]}>Day Streak</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <View style={styles.streakRow}>
                                <Ionicons name="leaf" size={18} color={colors.primary[400]} />
                                <Text style={[styles.streakValue, { color: colors.text.primary }]}>Lv.{progression.level}</Text>
                            </View>
                            <Text style={[styles.quickStatLabel, { color: colors.text.tertiary }]}>{progression.totalTrees} Trees</Text>
                        </View>
                    </View>
                </View>

                {/* 3D Garden Preview */}
                <Pressable onPress={() => router.push('/garden_viewer')} style={[styles.gardenContainer, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : 'transparent' }]}>
                    <View style={styles.gardenHeaderBadge}>
                        <Text style={[styles.gardenBadgeText, { color: colors.primary[700] }]}>🪙 {totalCoins}</Text>
                    </View>
                    <Canvas camera={{ fov: 60, position: [0, 2, 6] }}>
                        <OrbitControls makeDefault minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2 - 0.1} enablePan={false} enableZoom={false} />
                        <Lighting colors={colors} isDark={isDark} />
                        <Ground isDark={isDark} />
                        {plants.length === 0 ? (
                            <Plant position={[0, 0, 0]} plantType="bonsai" />
                        ) : (
                            plants.map(p => <Plant key={p.id} position={[p.position_x, p.position_y, p.position_z]} scale={0.7} plantType={p.type} health={p.health} isHarvestable={p.is_harvestable} onHarvest={() => handleHarvest(p.id)} />)
                        )}
                    </Canvas>
                    <View style={styles.gardenTapHint}>
                        <Ionicons name="expand-outline" size={14} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600', marginLeft: 4 }}>Tap to explore</Text>
                    </View>
                </Pressable>

                {/* Choose Sound */}
                <SectionHeader title="Choose Sound" actionText="View all" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.soundList}>
                    <SoundCard title="Ocean" colors={['#93c5fd', '#fed7aa'] as const} icon="water-outline" soundName="ocean" activeSound={activeSound} onPlay={handlePlaySound} />
                    <SoundCard title="Night" colors={['#a78bfa', '#fbcfe8'] as const} icon="moon-outline" soundName="night" activeSound={activeSound} onPlay={handlePlaySound} />
                    <SoundCard title="Forest" colors={['#6ee7b7', '#34d399'] as const} icon="leaf-outline" soundName="forest" activeSound={activeSound} onPlay={handlePlaySound} />
                    <SoundCard title="Rain" colors={['#7dd3fc', '#a5b4fc'] as const} icon="rainy-outline" soundName="rain" activeSound={activeSound} onPlay={handlePlaySound} />
                </ScrollView>

                {/* To-Do List */}
                <SectionHeader title="Today's Tasks" actionText={`${tasks.filter(t => t.isCompleted).length}/${tasks.length} done`} />
                <View style={styles.tasksList}>
                    {tasks.map(t => (
                        <TaskItem
                            key={t.id} task={t} isActive={activeTaskId === t.id}
                            onSelect={() => handleSelectTask(t.id)}
                            onToggle={() => handleToggleTask(t.id)}
                            onDelete={() => handleDeleteTask(t.id)}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <View style={[styles.emptyState, { backgroundColor: colors.background.secondary, borderColor: isDark ? colors.neutral[800] : '#f1f5f9' }]}>
                            <View style={[styles.emptyIconWrap, { backgroundColor: colors.primary[50] }]}>
                                <Ionicons name="clipboard-outline" size={28} color={colors.primary[400]} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No tasks yet</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.text.tertiary }]}>Add a task below and start focusing!</Text>
                        </View>
                    )}

                    {/* Add Task Input */}
                    <View style={styles.addTaskContainer}>
                        <TextInput
                            style={[styles.addTaskInput, { backgroundColor: colors.background.secondary, color: colors.text.primary }]}
                            placeholder="I want to focus on..."
                            placeholderTextColor={colors.text.disabled}
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            onSubmitEditing={handleAddTask}
                            returnKeyType="done"
                        />
                        <Pressable onPress={handleAddTask} style={[styles.addTaskBtn, { backgroundColor: colors.primary[400] }]}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </Pressable>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: Spacing.md,
    },
    profileAvatar: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    scrollContent: { paddingHorizontal: Spacing.lg },

    // Greeting
    greetingSection: { marginBottom: 20 },
    greetingText: {
        fontSize: 24, fontWeight: '700', letterSpacing: -0.3,
    },
    quoteText: {
        fontSize: 13, marginTop: 6, fontStyle: 'italic',
    },

    // Quick Stats
    quickStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    quickStatCard: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 14,
        borderRadius: BorderRadius.xl, borderWidth: 1, ...Shadows.sm,
    },
    quickStatLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
    quickStatValue: { fontSize: 14, fontWeight: '700' },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    streakValue: { fontSize: 18, fontWeight: '800' },
    statDivider: { width: 1, height: 32, backgroundColor: 'rgba(128,128,128,0.15)', marginHorizontal: 8 },

    // Garden
    gardenContainer: {
        height: 180, borderRadius: BorderRadius['2xl'], overflow: 'hidden',
        marginBottom: Spacing.xl, ...Shadows.sm, borderWidth: 1, borderColor: '#f1f5f9',
    },
    gardenHeaderBadge: {
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    },
    gardenBadgeText: { fontSize: Typography.sizes.xs, fontWeight: '700' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Spacing.md },
    sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: '700' },
    sectionAction: { fontSize: Typography.sizes.sm },

    soundList: { gap: Spacing.md, marginBottom: Spacing.xl, paddingRight: Spacing.xl },
    soundCardContainer: { alignItems: 'flex-start', width: 110 },
    soundCard: {
        width: 100, height: 130, borderRadius: BorderRadius.xl,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    soundIcon: { opacity: 0.9 },
    soundTitle: { fontSize: Typography.sizes.sm, fontWeight: '600', marginLeft: 4 },

    tasksList: { gap: Spacing.sm },
    taskItem: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
        borderRadius: BorderRadius.xl, ...Shadows.sm, borderWidth: 1,
    },
    taskCheckbox: { marginRight: 12 },
    taskTextWrapper: { flex: 1 },
    taskTitle: { fontSize: Typography.sizes.base, fontWeight: '600', marginBottom: 2 },
    taskSubtitle: { fontSize: Typography.sizes.xs },
    taskDeleteBtn: { padding: 4 },

    addTaskContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    addTaskInput: { flex: 1, padding: 14, borderRadius: BorderRadius.xl, fontSize: Typography.sizes.base },
    addTaskBtn: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },

    soundCardActive: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)' },
    gardenTapHint: {
        position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },

    // Empty state
    emptyState: {
        alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20,
        borderRadius: BorderRadius['2xl'], borderWidth: 1,
    },
    emptyIconWrap: {
        width: 52, height: 52, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    emptyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    emptySubtitle: { fontSize: 13, textAlign: 'center' },
});
