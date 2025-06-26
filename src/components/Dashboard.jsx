import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPatients() {
      const snap = await getDocs(collection(db, "patients"));
      let arr = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setPatients(arr);
      setLoading(false);
    }
    fetchPatients();
  }, []);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">All Patients</h1>
        <button
          onClick={() => auth.signOut()}
          className="bg-gray-200 px-3 py-1 rounded text-xs"
        >
          Sign out
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {patients.map((p) => (
            <div key={p.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{p.name}</div>
                <div className="text-xs text-gray-500">{p.gender}, DOB: {p.dob}</div>
                <div className="text-xs text-gray-600">Email: {p.email}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit/${p.id}`)}
                  className="bg-primary text-white px-3 py-1 rounded text-xs"
                >
                  Edit Care Plan
                </button>
                <button
                  onClick={() => navigate(`/chat/${p.id}`)}
                  className="bg-accent text-white px-3 py-1 rounded text-xs"
                >
                  Team Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
