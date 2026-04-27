/**
 * Patch Three.js shader chunks to prevent "Cannot read property 'trim' of undefined"
 * errors on React Native. Some shader chunks may be undefined in certain Three.js
 * builds when used with expo-gl / React Three Fiber on mobile.
 *
 * This file should be imported BEFORE any Three.js / R3F usage.
 */
import { LogBox, Platform } from 'react-native';
import * as THREE from 'three';

// 1. Patch all ShaderChunk entries — replace undefined with empty string
if (THREE.ShaderChunk) {
    for (const key of Object.keys(THREE.ShaderChunk)) {
        if ((THREE.ShaderChunk as any)[key] === undefined || (THREE.ShaderChunk as any)[key] === null) {
            (THREE.ShaderChunk as any)[key] = '';
        }
    }
}

// 2. Patch ShaderLib entries that reference shaderChunks
if (THREE.ShaderLib) {
    for (const key of Object.keys(THREE.ShaderLib)) {
        const shader = (THREE.ShaderLib as any)[key];
        if (shader) {
            if (shader.vertexShader === undefined || shader.vertexShader === null) {
                shader.vertexShader = 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
            }
            if (shader.fragmentShader === undefined || shader.fragmentShader === null) {
                shader.fragmentShader = 'void main() { gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }';
            }
        }
    }
}

// 3. Suppress the "trim" error in LogBox so the red error screen doesn't appear
if (Platform.OS !== 'web') {
    LogBox.ignoreLogs([
        "Cannot read property 'trim' of undefined",
        "Cannot read properties of undefined (reading 'trim')",
    ]);
}

export {};
