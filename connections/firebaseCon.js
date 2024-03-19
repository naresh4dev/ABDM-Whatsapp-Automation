const { initializeApp } = require("firebase/app");
const {getAuth} = require("firebase/auth");
const {getDatabase} = require("firebase/database");

const firebaseConfig = {
    apiKey: "AIzaSyDU5cLU7g_7TX2Hz8ifugMtYyN5SmsTDZE",
    authDomain: "solvathon-iit.firebaseapp.com",
    projectId: "solvathon-iit",
    storageBucket: "solvathon-iit.appspot.com",
    messagingSenderId: "338584306909",
    appId: "1:338584306909:web:f9bb5255efb52e1d0f8734",
    measurementId: "G-9T4021PNWC",
    databaseURL : "https://solvathon-iit-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);

const db  = getDatabase(app);

const auth = getAuth(app);



module.exports = {app,db,auth};