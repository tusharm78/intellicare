// seeds demo patients and care plans in Firestore
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const demoPatients = [
  {
    name: "Riya Sharma",
    email: "riya.sharma@example.com",
    dob: "1994-09-08",
    gender: "Female",
    carePlan: [
      { step: "Initial Consult", due: "2024-07-01", completed: false },
      { step: "Blood Test (CBC)", due: "2024-07-03", completed: false },
      { step: "Specialist Referral", due: "2024-07-08", completed: false }
    ]
  },
  {
    name: "Amit Patel",
    email: "amit.patel@example.com",
    dob: "1988-02-21",
    gender: "Male",
    carePlan: [
      { step: "Diabetes Screening", due: "2024-07-04", completed: false },
      { step: "Dietitian Appointment", due: "2024-07-09", completed: false }
    ]
  },
  {
    name: "Sanjana Rao",
    email: "sanjana.rao@example.com",
    dob: "1978-12-16",
    gender: "Female",
    carePlan: [
      { step: "Hypertension Review", due: "2024-07-02", completed: false },
      { step: "ECG", due: "2024-07-06", completed: false }
    ]
  }
];

export default async function seedDemoPatients() {
  // Each demo patient gets their own doc in 'patients', carePlan is subcollection
  for (const p of demoPatients) {
    const patientRef = await addDoc(collection(db, "patients"), {
      name: p.name,
      email: p.email,
      dob: p.dob,
      gender: p.gender,
      createdAt: new Date()
    });
    // Attach care plan as subcollection
    for (const step of p.carePlan) {
      await addDoc(collection(db, "patients", patientRef.id, "carePlan"), step);
    }
    // Create a corresponding user doc for patient login (passwordless; for demo)
    await setDoc(doc(db, "users", patientRef.id), {
      role: "patient",
      name: p.name,
      email: p.email,
      patientId: patientRef.id
    });
  }
}
