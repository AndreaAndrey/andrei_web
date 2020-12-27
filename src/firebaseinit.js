import firebase from "firebase";

// firebase
const firebaseConfig = {
    apiKey: "AIzaSyAhaVmynpdTdwmIq_Vidk0vqqXxO34FaLo",
    authDomain: "andrei-web.firebaseapp.com",
    projectId: "andrei-web",
    storageBucket: "andrei-web.appspot.com",
    messagingSenderId: "980339182929",
    appId: "1:980339182929:web:09d7b485e92a822ef0d770"
};
// firebase
firebase.initializeApp(firebaseConfig);

firebase.getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        }, reject);
    })
};

export default firebase;