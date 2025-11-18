console.log("app.js is running...");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, onSnapshot, doc, deleteDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBUDkpsg7-O_5gDNl3svk5PJPPhV3bornA",
    authDomain: "mycrudapp-c8bee.firebaseapp.com",
    projectId: "mycrudapp-c8bee",
    storageBucket: "mycrudapp-c8bee.appspot.com",
    messagingSenderId: "1244100476",
    appId: "1:1244100476:web:40fbf8b6182e35d84ed6f9",
    measurementId: "G-F0JFK9X7WS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const peopleCollection = collection(db, "people");

const showPage = (page) => {
    console.log(`Attempting to show page: ${page}`);

    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));

    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.remove("hidden");
    } else {
        console.error(`❌ Error: Page '${page}' not found!`);
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User logged in:", user.email);

        document.getElementById("authContainer").classList.add("hidden");
        document.getElementById("crudApp").classList.remove("hidden");

        loadData(); 
    } else {
        console.log("🔴 No user logged in.");

        document.getElementById("authContainer").classList.remove("hidden");
        document.getElementById("crudApp").classList.add("hidden");
    }
});

window.registerUser = async () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("🎉 Registration successful! You can now log in.");

        switchToLogin();

    } catch (error) {
        alert("⚠️ Error: " + error.message);
    }
};

window.loginUser = async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Login successful!");

        document.getElementById("authContainer").classList.add("hidden");
        document.getElementById("crudApp").classList.remove("hidden");

        loadData();
    } catch (error) {
        alert("❌ Login failed: " + error.message);
    }
};

window.logoutUser = async () => {
    try {
        await signOut(auth);
        alert("🚪 Logged out successfully!");

        document.getElementById("authContainer").classList.remove("hidden");
        document.getElementById("crudApp").classList.add("hidden");
    } catch (error) {
        alert("❌ Error logging out: " + error.message);
    }
};

window.switchToLogin = () => {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
};

window.switchToRegister = () => {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
};

document.getElementById("personForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        alert("⚠️ Please log in first.");
        return;
    }

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    try {
        await addDoc(peopleCollection, { name, email, userId: user.uid });
        alert("✅ Person added successfully!");
        document.getElementById("personForm").reset();
    } catch (error) {
        alert("❌ Error: " + error.message);
    }
});

const dataTable = document.getElementById("dataTable");
const loadData = () => {
    const user = auth.currentUser;
    if (!user) return;

    console.log("📥 Fetching Data from Firestore...");
    onSnapshot(peopleCollection, (snapshot) => {
        dataTable.innerHTML = ""; 

        snapshot.forEach((doc) => {
            const person = doc.data();
            if (person.userId !== user.uid) return;

            console.log("📄 Document Fetched:", doc.id, person);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${person.name}</td>
                <td>${person.email}</td>
                <td class="action-buttons">
                    <button class="edit-btn" onclick="editPerson('${doc.id}', '${person.name}', '${person.email}')">Edit</button>
                    <button class="delete-btn" onclick="deletePerson('${doc.id}')">Delete</button>
                </td>
            `;
            dataTable.appendChild(row);
        });
    });
};

window.editPerson = async (id, name, email) => {
    const newName = prompt("✏️ Edit Name:", name);
    const newEmail = prompt("📧 Edit Email:", email);

    if (newName && newEmail) {
        try {
            await updateDoc(doc(db, "people", id), { name: newName, email: newEmail });
            alert("✅ Updated successfully!");
        } catch (error) {
            alert("❌ Error updating: " + error.message);
        }
    }
};

window.deletePerson = async (id) => {
    if (confirm("⚠️ Are you sure you want to delete this person?")) {
        try {
            await deleteDoc(doc(db, "people", id));
            alert("✅ Deleted successfully!");
        } catch (error) {
            alert("❌ Error deleting: " + error.message);
        }
    }
};

console.log("✅ Firebase CRUD App with Authentication Loaded Successfully!");
