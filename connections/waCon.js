const axios = require('axios').default;
const fs = require('fs');
module.exports.sendMessage = async(phone,message) =>{
    try {
        console.log(message)
        const config = {
            headers : {
                "Authorization" : "Bearer EAAPPHJ4GZCbQBO5UPaxfcYFI53lTAzQ868zeGl1llyr9nbLuCmwZC42zZA1H0nPuqRrIYvBC002QCruu2iLFnO0iL8t2fcQWBVlUsZAvninze8UsEPL8IJoIJcNH3sqXZBVQLrnKNjq1YsqKVpAbxBVMnoMMxtj3SZBdrD5edipTACfVzUwg4k5ZCxVbvH5fNJg60Q2dRC9I6oRnnQeoxIxMhrpkpjf9QQYPxTt3t4ZD",
                "Content-Type": "application/json"
            }
        }
        const body = { "messaging_product": "whatsapp", "recipient_type": "individual","to": phone, "type": "text", "text" : { "preview_url": false,"body" : message}}
        const res = await axios.post("https://graph.facebook.com/v19.0/200411246498006/messages", body, config);
        console.log(res.data);
        if(res.status == 200) 
            return true 
        console.log("Error: ", res.data);
        return null
    } catch (e) {
        console.error(`Error in API Request ${e}`)
        return null
    }
}

module.exports.getMediaURL = async (id)=>{
    const config = {
        headers : {
            "Authorization" : "Bearer EAAPPHJ4GZCbQBO5UPaxfcYFI53lTAzQ868zeGl1llyr9nbLuCmwZC42zZA1H0nPuqRrIYvBC002QCruu2iLFnO0iL8t2fcQWBVlUsZAvninze8UsEPL8IJoIJcNH3sqXZBVQLrnKNjq1YsqKVpAbxBVMnoMMxtj3SZBdrD5edipTACfVzUwg4k5ZCxVbvH5fNJg60Q2dRC9I6oRnnQeoxIxMhrpkpjf9QQYPxTt3t4ZD",
        } 
    }
    const res = await axios.get("https://graph.facebook.com/v19.0/"+id, config);
        if(res.status == 200) 
            return res.data.url
        console.log("Error: ", res.data);
        return null
}

module.exports.uploadMediaURL = async (filePath,input)=> {
   try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream('/Users/naresh_dev/Developments/Solvathon-Zeus/backend/audio/audio_1708730242949.ogg'));
    formData.append('type', input);
    formData.append('messaging_product', 'whatsapp');
    const bodyData = {
        file : fs.createReadStream('/Users/naresh_dev/Developments/Solvathon-Zeus/backend/audio/audio_1708730242949.ogg'),
        type : input,
        messageing_product : 'whatsapp'
    }
    const config = {
        headers : {
            "Authorization" :  `Bearer EAAPPHJ4GZCbQBO5UPaxfcYFI53lTAzQ868zeGl1llyr9nbLuCmwZC42zZA1H0nPuqRrIYvBC002QCruu2iLFnO0iL8t2fcQWBVlUsZAvninze8UsEPL8IJoIJcNH3sqXZBVQLrnKNjq1YsqKVpAbxBVMnoMMxtj3SZBdrD5edipTACfVzUwg4k5ZCxVbvH5fNJg60Q2dRC9I6oRnnQeoxIxMhrpkpjf9QQYPxTt3t4ZD`,
            "Content-Type" : "application/json"
        }  
    }
    const res = await axios.post("https://graph.facebook.com/v19.0/200411246498006/media",bodyData, config);
    if(res.status == 200) {
        console.log(res.data);
        return res.data.id
    } else {
        console.log(res);
    }
   } catch (e) {
    console.log(e);
   }
    
}