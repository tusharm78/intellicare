import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("coordinator");
  const [error, setError] = useState("");

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: role });
        await setDoc(doc(db, "users", userCred.user.uid), {
          role,
          email,
          name: userCred.user.displayName || "",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // New user; prompt for role and save
        await setDoc(doc(db, "users", user.uid), {
          role,
          email: user.email,
          name: user.displayName || "",
        });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow p-6 mt-12">
      <img src="/logo.png" alt="IntelliCare logo" className="h-14 mx-auto mb-2" />
      <div className="text-center font-semibold text-xl text-primary mb-4">
        {isSignup ? "Sign Up" : "Login"}
      </div>
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email address"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600">
            <input
              type="radio"
              name="role"
              value="coordinator"
              checked={role === "coordinator"}
              onChange={() => setRole("coordinator")}
            /> Care Coordinator
          </label>
          <label className="text-sm text-gray-600">
            <input
              type="radio"
              name="role"
              value="patient"
              checked={role === "patient"}
              onChange={() => setRole("patient")}
            /> Patient
          </label>
        </div>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded">
          {isSignup ? "Create Account" : "Login"}
        </button>
      </form>
      <button
        onClick={handleGoogle}
        className="mt-3 w-full flex items-center justify-center gap-2 bg-accent text-white py-2 rounded"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.7 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l6.6-6.6C34.1 4.6 29.3 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c11.2 0 19.7-8 19.7-19.3 0-1.3-.1-2.3-.2-3.7z"></path><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.2 19.4 14 24 14c3.1 0 5.9 1.1 8.1 3l6.6-6.6C34.1 4.6 29.3 2 24 2 16.1 2 9 7.1 6.3 14.7z"></path><path fill="#FBBC05" d="M24 44c5.6 0 10.3-1.8 13.7-4.8l-6.3-5.2C29.6 36 24 36 24 36c-5.6 0-10.1-3.6-11.8-8.5l-7 5.4C9 40.9 16.1 46 24 46z"></path><path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.1 33.7 29.6 36 24 36v8c11.2 0 19.7-8 19.7-19.3 0-1.3-.1-2.3-.2-3.7z"></path></g></svg>
        Continue with Google
      </button>
      <div className="mt-3 text-sm text-center text-gray-600">
        {isSignup ? (
          <>Already have an account? <button className="text-primary" onClick={() => setIsSignup(false)}>Login</button></>
        ) : (
          <>No account? <button className="text-primary" onClick={() => setIsSignup(true)}>Sign up</button></>
        )}
      </div>
      {error && <div className="mt-2 text-red-600 text-sm text-center">{error}</div>}
    </div>
  );
}
