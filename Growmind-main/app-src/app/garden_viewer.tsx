import { useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, Alert } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants/Tokens';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getGarden, resetGarden } from '../lib/garden';
import { harvestPlant, invalidateProgressionCache } from '../lib/progression';
import { useFocusEffect, router } from 'expo-router';
import type { Plant as PlantData } from '../types/database';
import { useToast } from '../components/Toast';
import { APP_CONFIG } from '../constants/Config';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🌍 ENVIRONMENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function Ground({ isDark }: { isDark: boolean }) {
    return (
        <group>
            {/* Main textured ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <circleGeometry args={[18, 64]} />
                <meshStandardMaterial
                    color={isDark ? '#1a4a3a' : '#3d9970'}
                    roughness={0.95}
                    metalness={0}
                />
            </mesh>
            {/* Outer ring (darker edge) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <ringGeometry args={[16, 22, 64]} />
                <meshStandardMaterial
                    color={isDark ? '#0d2e22' : '#2d7a55'}
                    roughness={1}
                />
            </mesh>
            {/* Fade-out ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial
                    color={isDark ? '#050d0a' : '#1a5e40'}
                    roughness={1}
                />
            </mesh>
        </group>
    );
}

// Decorative grass tufts scattered around the garden
function GrassPatches({ isDark }: { isDark: boolean }) {
    const patches = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 14;
            arr.push({
                x: Math.cos(angle) * dist,
                z: Math.sin(angle) * dist,
                scale: 0.3 + Math.random() * 0.5,
                rotY: Math.random() * Math.PI,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {patches.map((p, i) => (
                <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.rotY, 0]} scale={p.scale}>
                    {/* Three blades of grass */}
                    <mesh position={[0, 0.15, 0]} rotation={[0.1, 0, 0.15]}>
                        <coneGeometry args={[0.04, 0.4, 3]} />
                        <meshStandardMaterial color={isDark ? '#166534' : '#4ade80'} />
                    </mesh>
                    <mesh position={[0.06, 0.12, 0.02]} rotation={[-0.05, 0.3, -0.2]}>
                        <coneGeometry args={[0.03, 0.35, 3]} />
                        <meshStandardMaterial color={isDark ? '#15803d' : '#22c55e'} />
                    </mesh>
                    <mesh position={[-0.05, 0.1, -0.02]} rotation={[0.08, -0.2, 0.25]}>
                        <coneGeometry args={[0.03, 0.3, 3]} />
                        <meshStandardMaterial color={isDark ? '#14532d' : '#86efac'} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Decorative rocks
function Rocks({ isDark }: { isDark: boolean }) {
    const rocks = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 5 + Math.random() * 10;
            arr.push({
                x: Math.cos(angle) * dist,
                z: Math.sin(angle) * dist,
                scaleX: 0.2 + Math.random() * 0.4,
                scaleY: 0.15 + Math.random() * 0.2,
                scaleZ: 0.2 + Math.random() * 0.35,
                rotY: Math.random() * Math.PI,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {rocks.map((r, i) => (
                <mesh key={i} position={[r.x, r.scaleY * 0.4, r.z]} rotation={[0, r.rotY, 0]} scale={[r.scaleX, r.scaleY, r.scaleZ]} castShadow>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial
                        color={isDark ? '#374151' : '#9ca3af'}
                        roughness={0.95}
                        metalness={0.05}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Floating particle fireflies
function Fireflies({ count = 15, isDark }: { count?: number; isDark: boolean }) {
    const meshRef = useRef<any>(null);
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            x: (Math.random() - 0.5) * 20,
            y: 1.5 + Math.random() * 4,
            z: (Math.random() - 0.5) * 20,
            speed: 0.3 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2,
        }));
    }, [count]);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const t = clock.getElapsedTime();
        const positions = meshRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            const p = particles[i];
            positions.array[i * 3] = p.x + Math.sin(t * p.speed + p.phase) * 1.5;
            positions.array[i * 3 + 1] = p.y + Math.sin(t * p.speed * 0.7 + p.phase * 2) * 0.8;
            positions.array[i * 3 + 2] = p.z + Math.cos(t * p.speed + p.phase) * 1.5;
        }
        positions.needsUpdate = true;
    });

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = particles[i].x;
            pos[i * 3 + 1] = particles[i].y;
            pos[i * 3 + 2] = particles[i].z;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return geo;
    }, [count, particles]);

    return (
        <points ref={meshRef} geometry={geometry}>
            <pointsMaterial
                size={isDark ? 0.15 : 0.1}
                color={isDark ? '#fde68a' : '#fbbf24'}
                transparent
                opacity={isDark ? 0.9 : 0.5}
                sizeAttenuation
            />
        </points>
    );
}

// Cinematic Lighting
function Lighting({ isDark }: { isDark: boolean }) {
    return (
        <>
            <ambientLight intensity={isDark ? 0.25 : 0.6} color={isDark ? '#a5b4fc' : '#fff7ed'} />
            {/* Main sun */}
            <directionalLight
                position={[8, 12, 5]}
                intensity={isDark ? 0.8 : 1.8}
                color={isDark ? '#fef3c7' : '#fffbeb'}
                castShadow
            />
            {/* Warm fill light */}
            <directionalLight
                position={[-5, 6, -3]}
                intensity={isDark ? 0.3 : 0.5}
                color={isDark ? '#c4b5fd' : '#fde68a'}
            />
            {/* Ground bounce */}
            <pointLight
                position={[0, 0.5, 0]}
                intensity={isDark ? 0.2 : 0.3}
                color="#34d399"
                distance={15}
            />
            {/* Firefly glow (dark mode only) */}
            {isDark && (
                <pointLight position={[0, 3, 0]} intensity={0.4} color="#fbbf24" distance={20} />
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌳 TREE & PLANT COMPONENTS — 5 Unique Types
// ═══════════════════════════════════════════════════════════════════════════

const PLANT_PALETTES: Record<string, { trunk: string; foliage: string[]; emissive?: string }> = {
    bonsai: { trunk: '#6b3a10', foliage: ['#059669', '#10b981', '#34d399'] },
    sakura: { trunk: '#5c2d0e', foliage: ['#f472b6', '#ec4899', '#f9a8d4'], emissive: '#fce7f3' },
    fern: { trunk: '#4a3728', foliage: ['#22c55e', '#16a34a', '#4ade80'] },
    bamboo: { trunk: '#365314', foliage: ['#84cc16', '#a3e635', '#d9f99d'] },
    lotus: { trunk: '#44403c', foliage: ['#c084fc', '#a855f7', '#e9d5ff'], emissive: '#f3e8ff' },
};

// Pulsing golden harvest orb
function HarvestOrb() {
    const ref = useRef<any>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime();
        ref.current.position.y = 3.5 + Math.sin(t * 2.5) * 0.15;
        ref.current.scale.setScalar(0.9 + Math.sin(t * 3) * 0.15);
    });
    return (
        <group ref={ref} position={[0, 3.5, 0]}>
            <mesh>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={3} />
            </mesh>
            {/* Outer glow ring */}
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#fcd34d" transparent opacity={0.15} />
            </mesh>
        </group>
    );
}

// ── BONSAI: Classic layered conifer ──
function BonsaiTree({ trunkColor, foliageColors }: { trunkColor: string; foliageColors: string[] }) {
    return (
        <>
            <mesh position={[0, 0.65, 0]}>
                <cylinderGeometry args={[0.12, 0.22, 1.3, 8]} />
                <meshStandardMaterial color={trunkColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.85, 12, 10]} />
                <meshStandardMaterial color={foliageColors[0]} roughness={0.6} />
            </mesh>
            <mesh position={[0.35, 2.0, 0.2]}>
                <sphereGeometry args={[0.55, 10, 8]} />
                <meshStandardMaterial color={foliageColors[1]} roughness={0.5} />
            </mesh>
            <mesh position={[-0.3, 2.2, -0.15]}>
                <sphereGeometry args={[0.45, 10, 8]} />
                <meshStandardMaterial color={foliageColors[2]} roughness={0.5} />
            </mesh>
        </>
    );
}

// ── SAKURA: Cherry blossom with wide cloud-like canopy ──
function SakuraTree({ trunkColor, foliageColors, emissive }: { trunkColor: string; foliageColors: string[]; emissive?: string }) {
    return (
        <>
            {/* Curved trunk */}
            <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.08]}>
                <cylinderGeometry args={[0.1, 0.2, 1.0, 8]} />
                <meshStandardMaterial color={trunkColor} roughness={0.85} />
            </mesh>
            <mesh position={[0.05, 1.1, 0]} rotation={[0, 0, -0.05]}>
                <cylinderGeometry args={[0.08, 0.12, 0.5, 6]} />
                <meshStandardMaterial color={trunkColor} roughness={0.85} />
            </mesh>
            {/* Wide blossom clusters */}
            <mesh position={[0, 1.7, 0]}>
                <sphereGeometry args={[0.95, 12, 10]} />
                <meshStandardMaterial color={foliageColors[0]} roughness={0.4} emissive={emissive} emissiveIntensity={0.08} />
            </mesh>
            <mesh position={[0.6, 1.9, 0.3]}>
                <sphereGeometry args={[0.6, 10, 8]} />
                <meshStandardMaterial color={foliageColors[1]} roughness={0.35} emissive={emissive} emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[-0.5, 2.0, -0.2]}>
                <sphereGeometry args={[0.5, 10, 8]} />
                <meshStandardMaterial color={foliageColors[2]} roughness={0.35} emissive={emissive} emissiveIntensity={0.12} />
            </mesh>
        </>
    );
}

// ── FERN: Bushy low plant with layered fan leaves ──
function FernTree({ trunkColor, foliageColors }: { trunkColor: string; foliageColors: string[] }) {
    return (
        <>
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.08, 0.14, 0.6, 6]} />
                <meshStandardMaterial color={trunkColor} roughness={0.9} />
            </mesh>
            {/* Low bushy mass */}
            <mesh position={[0, 0.8, 0]}>
                <dodecahedronGeometry args={[0.7, 1]} />
                <meshStandardMaterial color={foliageColors[0]} roughness={0.55} />
            </mesh>
            <mesh position={[0.3, 1.0, 0.2]}>
                <dodecahedronGeometry args={[0.5, 1]} />
                <meshStandardMaterial color={foliageColors[1]} roughness={0.5} />
            </mesh>
            <mesh position={[-0.25, 1.1, -0.15]}>
                <dodecahedronGeometry args={[0.4, 1]} />
                <meshStandardMaterial color={foliageColors[2]} roughness={0.45} />
            </mesh>
        </>
    );
}

// ── BAMBOO: Tall, thin stalks with small leaf clusters on top ──
function BambooTree({ trunkColor, foliageColors }: { trunkColor: string; foliageColors: string[] }) {
    return (
        <>
            {/* Three bamboo stalks */}
            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.06, 0.07, 2.4, 6]} />
                <meshStandardMaterial color={trunkColor} roughness={0.7} />
            </mesh>
            <mesh position={[0.2, 1.0, 0.12]}>
                <cylinderGeometry args={[0.05, 0.06, 2.0, 6]} />
                <meshStandardMaterial color={trunkColor} roughness={0.7} />
            </mesh>
            <mesh position={[-0.15, 0.9, -0.1]}>
                <cylinderGeometry args={[0.05, 0.06, 1.8, 6]} />
                <meshStandardMaterial color={trunkColor} roughness={0.7} />
            </mesh>
            {/* Leaf clusters at top */}
            <mesh position={[0, 2.6, 0]}>
                <coneGeometry args={[0.4, 0.6, 6]} />
                <meshStandardMaterial color={foliageColors[0]} roughness={0.5} />
            </mesh>
            <mesh position={[0.2, 2.2, 0.12]}>
                <coneGeometry args={[0.3, 0.5, 6]} />
                <meshStandardMaterial color={foliageColors[1]} roughness={0.5} />
            </mesh>
            <mesh position={[-0.15, 2.0, -0.1]}>
                <coneGeometry args={[0.25, 0.4, 6]} />
                <meshStandardMaterial color={foliageColors[2]} roughness={0.5} />
            </mesh>
        </>
    );
}

// ── LOTUS: Mystical floating flower ──
function LotusTree({ trunkColor, foliageColors, emissive }: { trunkColor: string; foliageColors: string[]; emissive?: string }) {
    return (
        <>
            {/* Stem */}
            <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.06, 0.1, 1.2, 6]} />
                <meshStandardMaterial color={trunkColor} roughness={0.8} />
            </mesh>
            {/* Large flower petals (a stack of flattened spheres & torus shapes) */}
            <mesh position={[0, 1.3, 0]} scale={[1, 0.4, 1]}>
                <sphereGeometry args={[0.8, 12, 10]} />
                <meshStandardMaterial color={foliageColors[0]} roughness={0.35} emissive={emissive} emissiveIntensity={0.15} />
            </mesh>
            <mesh position={[0, 1.5, 0]} scale={[1, 0.35, 1]}>
                <sphereGeometry args={[0.6, 12, 10]} />
                <meshStandardMaterial color={foliageColors[1]} roughness={0.3} emissive={emissive} emissiveIntensity={0.2} />
            </mesh>
            {/* Central pistil */}
            <mesh position={[0, 1.65, 0]}>
                <sphereGeometry args={[0.2, 10, 10]} />
                <meshStandardMaterial color={foliageColors[2]} roughness={0.3} emissive="#fef9c3" emissiveIntensity={0.3} />
            </mesh>
        </>
    );
}

// ── DEAD TREE: Withered stump ──
function DeadTree() {
    return (
        <>
            <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.08, 0.18, 0.7, 6]} />
                <meshStandardMaterial color="#4a4a4a" roughness={1} />
            </mesh>
            <mesh position={[0.1, 0.6, 0]} rotation={[0, 0, 0.5]}>
                <cylinderGeometry args={[0.03, 0.05, 0.3, 4]} />
                <meshStandardMaterial color="#3a3a3a" roughness={1} />
            </mesh>
        </>
    );
}

// ── Main Plant Component — Routes to the Correct Type ──
function Plant({ position, scale = 1, plantType = 'bonsai', health = 1, isHarvestable = false, onHarvest }: any) {
    const groupRef = useRef<any>(null);
    const palette = PLANT_PALETTES[plantType] || PLANT_PALETTES.bonsai;
    const isDead = health <= 0;
    const treeScale = isDead ? scale * 0.6 : scale;

    useFrame(({ clock }) => {
        if (groupRef.current && !isDead) {
            const t = clock.getElapsedTime();
            groupRef.current.rotation.z = Math.sin(t * 0.8 + position[0] * 2) * 0.03;
        }
    });

    const TreeComponent = isDead ? DeadTree
        : plantType === 'sakura' ? SakuraTree
            : plantType === 'fern' ? FernTree
                : plantType === 'bamboo' ? BambooTree
                    : plantType === 'lotus' ? LotusTree
                        : BonsaiTree;

    const treeProps: any = isDead ? {} : { trunkColor: palette.trunk, foliageColors: palette.foliage, emissive: palette.emissive };

    return (
        <group position={position} scale={treeScale}>
            <group ref={groupRef} onClick={(e) => { e.stopPropagation(); if (isHarvestable && onHarvest) onHarvest(); }}>
                {isHarvestable && <HarvestOrb />}
                <TreeComponent {...treeProps} />
            </group>
            {/* Tree shadow circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <circleGeometry args={[isDead ? 0.3 : 0.6, 16]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.15} />
            </mesh>
        </group>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 📱 MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════

export default function GardenViewerScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { showToast } = useToast();
    const [plants, setPlants] = useState<PlantData[]>([]);
    const [todayCoins, setTodayCoins] = useState(0);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            getGarden(user.id).then((d: any) => setPlants(d)).catch(e => console.warn('Garden load failed:', e));
            import('../lib/progression').then(m => m.getTodayEarnedCoins(user.id)).then(setTodayCoins).catch(() => { });
        }, [user])
    );

    const handleHarvest = async (plantId: string) => {
        if (!user) return;
        try {
            await harvestPlant(user.id, plantId);
            invalidateProgressionCache();
            setPlants(prev => prev.map(p => p.id === plantId ? { ...p, is_harvestable: false } : p));
            showToast({ message: '🪙 +50 coins harvested!', type: 'success', duration: 3000 });
            import('../lib/progression').then(m => m.getTodayEarnedCoins(user.id)).then(setTodayCoins).catch(() => { });
        } catch (e) { }
    };

    const handleResetGarden = () => {
        Alert.alert(
            '🗑️ Reset Garden',
            'This will remove ALL trees from your garden. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        if (!user) return;
                        try {
                            await resetGarden(user.id);
                            invalidateProgressionCache();
                            setPlants([]);
                            showToast({ message: '🌱 Garden cleared! Start fresh.', type: 'success', duration: 3000 });
                        } catch (e) {
                            showToast({ message: 'Failed to reset garden.', type: 'error', duration: 3000 });
                        }
                    }
                },
            ]
        );
    };

    const harvestableCount = plants.filter(p => p.is_harvestable).length;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#050d0a' : '#d4edda' }]}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.pillBtn}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                </Pressable>

                <View style={styles.topBarCenter}>
                    <View style={styles.statPill}>
                        <Ionicons name="leaf" size={15} color="#4ade80" />
                        <Text style={styles.statText}>{plants.length} trees</Text>
                    </View>
                    <View style={[styles.statPill, { backgroundColor: 'rgba(245,158,11,0.5)' }]}>
                        <Ionicons name="cash" size={15} color="#fde68a" />
                        <Text style={styles.statText}>{todayCoins}/{APP_CONFIG.DAILY_COIN_LIMIT}</Text>
                    </View>
                    {harvestableCount > 0 && (
                        <View style={[styles.statPill, { backgroundColor: 'rgba(250,204,21,0.5)' }]}>
                            <Ionicons name="sparkles" size={15} color="#fde68a" />
                            <Text style={styles.statText}>{harvestableCount} ready</Text>
                        </View>
                    )}
                </View>

                <Pressable onPress={handleResetGarden} style={[styles.pillBtn, { backgroundColor: 'rgba(239,68,68,0.5)' }]}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                </Pressable>
            </View>

            {/* ── Instructions ── */}
            <View style={styles.instructionsBadge}>
                <Text style={styles.instructionsText}>Drag to orbit · Pinch to zoom · Tap gold orbs to harvest</Text>
            </View>

            {/* ── Fullscreen 3D Canvas ── */}
            <Canvas
                camera={{ fov: 45, position: [0, 5, 12], near: 0.1, far: 100 }}
                gl={{ antialias: true }}
            >
                <OrbitControls
                    makeDefault
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minPolarAngle={Math.PI / 8}
                    maxPolarAngle={Math.PI / 2 - 0.05}
                    minDistance={3}
                    maxDistance={30}
                    target={[0, 1, 0]}
                />

                {/* Sky color */}
                <color attach="background" args={[isDark ? '#050d0a' : '#c8e6c9']} />
                <fog attach="fog" args={[isDark ? '#050d0a' : '#c8e6c9', 20, 50]} />

                <Lighting isDark={isDark} />
                <Ground isDark={isDark} />
                <GrassPatches isDark={isDark} />
                <Rocks isDark={isDark} />
                <Fireflies isDark={isDark} count={isDark ? 20 : 8} />

                {/* Center path marker */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                    <ringGeometry args={[0.8, 1.0, 32]} />
                    <meshStandardMaterial color={isDark ? '#1a4a3a' : '#2d7a55'} transparent opacity={0.4} />
                </mesh>

                {plants.length === 0 ? (
                    /* Show a sample bonsai when garden is empty */
                    <Plant position={[0, 0, 0]} plantType="bonsai" scale={0.9} />
                ) : (
                    plants.map(p => (
                        <Plant
                            key={p.id}
                            position={[p.position_x, p.position_y, p.position_z]}
                            scale={0.85}
                            plantType={p.type}
                            health={p.health}
                            isHarvestable={p.is_harvestable}
                            onHarvest={() => handleHarvest(p.id)}
                        />
                    ))
                )}
            </Canvas>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: { flex: 1 },

    topBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 36,
        left: 16, right: 16,
        zIndex: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBarCenter: {
        flexDirection: 'row', gap: 8,
    },
    pillBtn: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center', justifyContent: 'center',
    },
    statPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    },
    statText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    instructionsBadge: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 46 : 26,
        alignSelf: 'center',
        zIndex: 20,
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 20,
    },
    instructionsText: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '500' },
});
