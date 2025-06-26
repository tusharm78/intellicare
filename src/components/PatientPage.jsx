import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function PatientPage({ user }) {
  const [carePlan, setCarePlan] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCarePlan() {
      // Find patient record by email (since this is a demo, works for seeded users)
      const snap = await getDocs(
        query(collection(db, "patients"), where("email", "==", user.email))
      );
      if (!snap.empty) {
        const patientDoc = snap.docs[0];
        setPatientInfo(patientDoc.data());
        // Fetch care plan subcollection
        const stepsSnap = await getDocs(collection(db, "patients", patientDoc.id, "carePlan"));
        let steps = [];
        stepsSnap.forEach((doc) => steps.push({ id: doc.id, ...doc.data() }));
        setCarePlan(steps);
      }
      setLoading(false);
    }
    fetchCarePlan();
  }, [user.email]);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">My Care Plan</h1>
        <button
          onClick={() => auth.signOut()}
          className="bg-gray-200 px-3 py-1 rounded text-xs"
        >
          Sign out
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : !carePlan.length ? (
        <div>No care plan found. Please contact your care coordinator.</div>
      ) : (
        <div>
          <div className="mb-2 text-sm text-gray-600">
            <b>Name:</b> {patientInfo.name} <br />
            <b>DOB:</b> {patientInfo.dob} <br />
            <b>Gender:</b> {patientInfo.gender}
          </div>
          <div className="mb-3 text-md font-semibold text-accent">Your Steps</div>
          <ul className="space-y-2">
            {carePlan.map((step) => (
              <li
                key={step.id}
                className={`flex justify-between items-center p-3 rounded shadow ${
                  step.completed ? "bg-healthgreen/10" : "bg-white"
                }`}
              >
                <span>
                  <b>{step.step}</b>{" "}
                  <span className="text-xs text-gray-600">
                    (Due: {step.due})
                  </span>
                </span>
                <span
                  className={
                    step.completed
                      ? "text-xs text-green-700 font-bold"
                      : "text-xs text-orange-600"
                  }
                >
                  {step.completed ? "Completed" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
