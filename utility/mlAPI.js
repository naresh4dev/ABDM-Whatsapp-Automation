const axios = require('axios').default;

module.exports.SpeechToText = async(filename) => {
    const path = "/Users/naresh_dev/Developments/Solvathon-Zeus/backend/audio/"+filename
    const bodyData = {
        text : path
    }
    const config = {
        headers : {
            "Content-Type" : "application/json"
        }
    }
    const result  = await axios.post('http://127.0.0.1:8000/s2t',bodyData, config);
    return result.data.text
}

module.exports.intentPrediction = async(text) => {
    const bodyData = {
        "text" : text
    }
    const config = {
        headers : {
            "Content-Type" : "application/json"
        }
    }
    const result  = await axios.post('http://127.0.0.1:8000/predict-intent',bodyData, config);
    return result.data.predicted_intent
}

module.exports.TextToSpeech = async(text)=>{
    const bodyData = {
        "text" : text
    }
    const config = {
        headers : {
            "Content-Type" : "application/json"
        }
    }
    const result  = await axios.post('http://127.0.0.1:8000/t2s',bodyData, config);
    return true
}