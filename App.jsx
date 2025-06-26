import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PatientPage from "./components/PatientPage";
import CarePlanEditor from "./components/CarePlanEditor";
import Chat from "./components/Chat";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import seedDemoPatients from "./seedDemo";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(""); // 'patient' or 'coordinator'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      // On first visit, auto-seed demo patients
      if (u) {
        const demoRef = doc(db, "meta", "demoSeeded");
        const demoDoc = await getDoc(demoRef);
        if (!demoDoc.exists()) {
          await seedDemoPatients();
          await setDoc(demoRef, { seeded: true });
        }
        // Fetch role from user doc
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole(""); // Not set yet
        }
      } else {
        setRole("");
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-xl text-primary">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow flex items-center p-3">
          <img src="/logo.png" alt="IntelliCare logo" className="h-12 mr-3" />
          <div>
            <div className="font-bold text-2xl text-primary">IntelliCare</div>
            <div className="text-xs text-gray-500">Intelligent Care Coordination</div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  role === "coordinator" ? (
                    <Dashboard user={user} />
                  ) : role === "patient" ? (
                    <Navigate to="/mypath" />
                  ) : (
                    <div>Loading role...</div>
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/mypath"
              element={
                user ? (
                  role === "patient" ? (
                    <PatientPage user={user} />
                  ) : (
                    <Navigate to="/dashboard" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/edit/:patientId"
              element={user && role === "coordinator" ? <CarePlanEditor /> : <Navigate to="/login" />}
            />
            <Route
              path="/chat/:patientId"
              element={user ? <Chat user={user} /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
