import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Chat({ user }) {
  const { patientId } = useParams();
  const [messages, setMessages] = useState([]);
  const [patient, setPatient] = useState({});
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch patient info
    async function fetchPatient() {
      const pDoc = await getDoc(doc(db, "patients", patientId));
      if (pDoc.exists()) setPatient(pDoc.data());
    }
    fetchPatient();
  }, [patientId]);

  useEffect(() => {
    // Real-time listen for messages
    const q = query(
      collection(db, "patients", patientId, "chat"),
      orderBy("timestamp")
    );
    const unsub = onSnapshot(q, (snap) => {
      let arr = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setMessages(arr);
      // Scroll to bottom
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    });
    return () => unsub();
  }, [patientId]);

  async function sendMsg(e) {
    e.preventDefault();
    if (!input.trim()) return;
    await addDoc(collection(db, "patients", patientId, "chat"), {
      sender: user.displayName || user.email,
      senderEmail: user.email,
      text: input,
      timestamp: new Date(),
    });
    setInput("");
  }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="mb-3 text-accent text-sm">
        &larr; Back
      </button>
      <div className="font-bold text-lg text-primary mb-1">
        Care Team Chat: {patient.name}
      </div>
      <div className="h-64 bg-white rounded shadow p-2 overflow-y-auto mb-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-gray-400 text-sm mt-16 text-center">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex flex-col ${
              msg.senderEmail === user.email
                ? "items-end"
                : "items-start"
            }`}
          >
            <div
              className={`px-3 py-1 rounded max-w-xs ${
                msg.senderEmail === user.email
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {msg.sender}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMsg} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-accent text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
