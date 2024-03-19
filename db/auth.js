const {signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth} = require('firebase/auth');
const {db, auth} = require('../connections/firebaseCon');
const { addDoctor } = require('./queries');
const {ref, get, child, set} = require('firebase/database')

exports.loginQuery = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth,email, password);
        console.log(result);
        if(result) {
            return true
        } else {
            return {auth : false}
        }
    } catch (err) {

        console.error("Error in Signin : ", err);
        return {auth : false}
    }
}

exports.signUpQuery = async (email,password, userData) => {
    try {
        const result = await createUserWithEmailAndPassword(auth,email, password);
        console.log(result);
        if(result) {
            console.log(result);
            const uid = result.user.uid;
            const addDoctorResult = await addDoctor(uid, userData);
            if(addDoctorResult)
                return {auth : true, response : result}
            else
                return null
        } else {
            return null
        }
    } catch (err) {

        console.error("Error in Signin : ", err);
        return null
    }
}