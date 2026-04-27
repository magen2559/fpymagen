import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
    id: string;
    title: string;
    estimatedPomodoros: number;
    completedPomodoros: number;
    isCompleted: boolean;
}

const TASKS_KEY = '@growmind_tasks';
const ACTIVE_TASK_KEY = '@growmind_active_task';

export async function getTasks(): Promise<Task[]> {
    try {
        const data = await AsyncStorage.getItem(TASKS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
    try {
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) { }
}

export async function addTask(title: string, estimatedPomodoros: number): Promise<Task> {
    const tasks = await getTasks();
    const newTask: Task = {
        id: Date.now().toString(),
        title,
        estimatedPomodoros,
        completedPomodoros: 0,
        isCompleted: false,
    };
    await saveTasks([...tasks, newTask]);
    return newTask;
}

export async function toggleTaskCompletion(id: string): Promise<Task[]> {
    const tasks = await getTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    await saveTasks(updated);
    return updated;
}

export async function deleteTask(id: string): Promise<Task[]> {
    const tasks = await getTasks();
    const updated = tasks.filter(t => t.id !== id);
    await saveTasks(updated);

    // Clear active task if it was deleted
    const active = await getActiveTask();
    if (active?.id === id) await clearActiveTask();

    return updated;
}

export async function incrementTaskPomodoro(id: string): Promise<void> {
    const tasks = await getTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t);
    await saveTasks(updated);
}

export async function getActiveTask(): Promise<Task | null> {
    try {
        const data = await AsyncStorage.getItem(ACTIVE_TASK_KEY);
        if (!data) return null;

        const taskId = data;
        const tasks = await getTasks();
        return tasks.find(t => t.id === taskId) || null;
    } catch (e) {
        return null;
    }
}

export async function setActiveTask(id: string): Promise<void> {
    try {
        await AsyncStorage.setItem(ACTIVE_TASK_KEY, id);
    } catch (e) { }
}

export async function clearActiveTask(): Promise<void> {
    try {
        await AsyncStorage.removeItem(ACTIVE_TASK_KEY);
    } catch (e) { }
}
