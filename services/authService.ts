import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from "firebase/auth";

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // The signed-in user info.
        const user = result.user;
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        localStorage.setItem('google_access_token', credential?.accessToken || '');

        return user;
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
};

export const logout = async () => {
    localStorage.removeItem('google_access_token');
    await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const getAccessToken = () => {
    return localStorage.getItem('google_access_token');
}
