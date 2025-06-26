import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function CarePlanEditor() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState({});
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStep, setNewStep] = useState("");
  const [newDue, setNewDue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPatient() {
      const pDoc = await getDoc(doc(db, "patients", patientId));
      setPatient({ id: pDoc.id, ...pDoc.data() });

      const stepsSnap = await getDocs(
        collection(db, "patients", patientId, "carePlan")
      );
      let arr = [];
      stepsSnap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setSteps(arr);
      setLoading(false);
    }
    fetchPatient();
  }, [patientId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!newStep || !newDue) {
      setError("Step and due date required.");
      return;
    }
    await addDoc(collection(db, "patients", patientId, "carePlan"), {
      step: newStep,
      due: newDue,
      completed: false,
    });
    setNewStep("");
    setNewDue("");
    // reload steps
    const stepsSnap = await getDocs(
      collection(db, "patients", patientId, "carePlan")
    );
    let arr = [];
    stepsSnap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
    setSteps(arr);
  }

  async function markComplete(stepId, done) {
    await updateDoc(
      doc(db, "patients", patientId, "carePlan", stepId),
      { completed: !done }
    );
    // reload steps
    const stepsSnap = await getDocs(
      collection(db, "patients", patientId, "carePlan")
    );
    let arr = [];
    stepsSnap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
    setSteps(arr);
  }

  async function handleDelete(stepId) {
    await deleteDoc(doc(db, "patients", patientId, "carePlan", stepId));
    setSteps(steps.filter((s) => s.id !== stepId));
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-3 text-accent text-sm">
        &larr; Back to Dashboard
      </button>
      <div className="mb-2 font-bold text-primary text-lg">
        Edit Care Plan: {patient.name}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <form onSubmit={handleAdd} className="mb-4 flex gap-2 items-end flex-wrap">
            <div>
              <label className="block text-xs text-gray-600">Step</label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="E.g. Blood Test"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Due Date</label>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </form>
          {error && (
            <div className="mb-2 text-red-600 text-xs">{error}</div>
          )}
          <div>
            <div className="mb-2 text-accent font-semibold text-md">
              Care Steps
            </div>
            <ul className="space-y-2">
              {steps.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded shadow ${
                    s.completed ? "bg-healthgreen/10" : "bg-white"
                  }`}
                >
                  <div>
                    <b>{s.step}</b>{" "}
                    <span className="text-xs text-gray-600">
                      (Due: {s.due})
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => markComplete(s.id, s.completed)}
                      className={
                        s.completed
                          ? "text-xs text-green-700 underline"
                          : "text-xs text-orange-600 underline"
                      }
                    >
                      {s.completed ? "Mark Pending" : "Mark Complete"}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-600 underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
