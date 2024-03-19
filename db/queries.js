const {db} = require('../connections/firebaseCon');

const {ref,set,child,update, get} = require('firebase/database');
const { v4: uuidv4 } = require('uuid');
module.exports.addPatient = async(patientDetails)=>{
    try {
        const dbRef = ref(db);
        const patientID = uuidv4();
        await set(child(dbRef, `/patients/${patientDetails.contactNumber}`), patientDetails);
        return true
    } catch (e) {
        console.error(e);
        return null
    }
}

module.exports.getAllPatients = async()=>{
    try {
        const dbRef = ref(db);
        const result = await get(child(dbRef,'/patients'));
        if(result.exists()){
            return result.val();
        }
    } catch (e) {
        console.error(e);
        return null
    }
}

module.exports.approveDetails = async (doctorID, patientID) =>{
    try {
        const dbRef = ref(db,`doctors/${doctorID}`);
        const getPaitents = await  get(child(dbRef,'patients'));
        if(getPaitents.exists()) {
            let data = getPaitents.val();
            console.log(data);
            data.push(patientID);
            const yd = {
                patients : data
            }
            await update(ref(db, `doctors/${doctorID}`), yd);
            
            return true
        } else {
            const patients = [patientID];
            await set(child(dbRef, 'patients'), patients);
            return true
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

module.exports.getDoctorDetails = async(id)=>{
    try {
        const dbRef = ref(db,`doctors/${id}`);
        const doctorData = await get(dbRef);
        if(doctorData.exists()) {
            return  doctorData.val();
        }else { 
            throw new Error('No Doctor Found');
        }
    } catch (e) {
        console.log(e);
        return null
    }
}

module.exports.checkPatient = async (patientNumber) =>{
    try {
        const dbRef = ref(db, `/patients/${patientNumber}`);
        const result = await get(dbRef);
        if(result.exists()) {
            return result.val();
        } else {
            console.log(result);
            return null
        }
    } catch(e) {
        console.log(e);
    }
}



module.exports.addDoctor = async (authID,doctorDetails) =>{
    try {
        console.log(authID);
        await set(ref(db,`doctors/${authID}`),doctorDetails);
        return true
    } catch (e) {
        console.log(e);
        return null    
    }
}