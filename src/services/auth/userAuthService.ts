import { auth, googleProvider } from "./firebaseService.ts";
import { signInWithPopup, signOut } from 'firebase/auth'

export async function login() {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
}

export async function logout() {
    console.log("Logging out...");
    await signOut(auth)
}

