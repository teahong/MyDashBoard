import { db } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { Task, Bookmark } from "../types";

const TODOS_COLLECTION = "todos";
const SITES_COLLECTION = "sites";

export const getTasks = async (userId: string): Promise<Task[]> => {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, TODOS_COLLECTION),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Task[];

        // 메모리 내 정렬 (즐겨찾기와 동일한 방식)
        return tasks.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
            if (a.order !== undefined) return 1;
            if (b.order !== undefined) return -1;
            return (a.createdAt || 0) - (b.createdAt || 0);
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

export const addTask = async (userId: string, text: string): Promise<Task> => {
    // 가장 큰 order 값을 찾아 다음 순번 부여
    const tasks = await getTasks(userId);
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order || 0), -1);

    const newTask = {
        text,
        done: false,
        createdAt: Date.now(),
        userId,
        order: maxOrder + 1
    };
    const docRef = await addDoc(collection(db, TODOS_COLLECTION), newTask);
    return { id: docRef.id, ...newTask };
};

export const toggleTask = async (taskId: string, done: boolean): Promise<void> => {
    const taskRef = doc(db, TODOS_COLLECTION, taskId);
    await updateDoc(taskRef, { done });
};

export const deleteTask = async (taskId: string): Promise<void> => {
    const taskRef = doc(db, TODOS_COLLECTION, taskId);
    await deleteDoc(taskRef);
};

export const getSites = async (userId: string): Promise<Bookmark[]> => {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, SITES_COLLECTION),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const sites = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
        })) as Bookmark[];

        // 메모리 내 정렬: order 필드가 있으면 우선하고, 없으면 createdAt 기준 오름차순(옛날 것이 앞)
        return sites.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            if (a.order !== undefined) return 1; // b는 order가 없으므로 a를 뒤로
            if (b.order !== undefined) return -1; // a는 order가 없으므로 b를 뒤로
            return (a.createdAt || 0) - (b.createdAt || 0);
        });
    } catch (error) {
        console.error("Error fetching sites:", error);
        throw error;
    }
};

export const addSite = async (userId: string, site: Omit<Bookmark, "id" | "createdAt" | "userId">): Promise<Bookmark> => {
    // 가장 큰 order 값을 찾아 다음 순번 부여
    const sites = await getSites(userId);
    const maxOrder = sites.reduce((max, s) => Math.max(max, s.order || 0), -1);

    const newSite = {
        ...site,
        userId,
        createdAt: Date.now(),
        order: maxOrder + 1 // 마지막 순서로 추가
    };
    const docRef = await addDoc(collection(db, SITES_COLLECTION), newSite);
    return { id: docRef.id, ...newSite } as Bookmark;
};

export const deleteSite = async (siteId: string): Promise<void> => {
    const siteRef = doc(db, SITES_COLLECTION, siteId);
    await deleteDoc(siteRef);
};

export const updateSite = async (siteId: string, data: Partial<Bookmark>): Promise<void> => {
    const siteRef = doc(db, SITES_COLLECTION, siteId);
    await updateDoc(siteRef, data);
};

// 여러 사이트의 순서를 한꺼번에 업데이트하는 함수
export const updateSitesOrder = async (sites: Bookmark[]): Promise<void> => {
    const batchUpdates = sites.map((site, index) => {
        const siteRef = doc(db, SITES_COLLECTION, site.id);
        return updateDoc(siteRef, { order: index });
    });
    await Promise.all(batchUpdates);
};
// 여러 할 일의 순서를 한꺼번에 업데이트하는 함수
export const updateTasksOrder = async (tasks: Task[]): Promise<void> => {
    const batchUpdates = tasks.map((task, index) => {
        const taskRef = doc(db, TODOS_COLLECTION, task.id);
        return updateDoc(taskRef, { order: index });
    });
    await Promise.all(batchUpdates);
};
