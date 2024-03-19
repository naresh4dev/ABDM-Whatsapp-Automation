require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {sendMessage, getMediaURL, uploadMediaURL} = require('./connections/waCon');
const ejs = require('ejs');
const { loginQuery, signUpQuery } = require('./db/auth');
const crypto = require('crypto');
const app  = express();
const fs = require('fs');
const { url } = require('inspector');
const { default: axios } = require('axios');
const {auth}  = require('./connections/firebaseCon')
const { SpeechToText, intentPrediction, TextToSpeech } = require('./utility/mlAPI');
const { getAIResponse } = require('./utility/openAI');
const { addPatient, getAllPatients, checkPatient, getDoctorDetails, approveDetails } = require('./db/queries');
const {onAuthStateChanged} = require('firebase/auth');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static('public'));
app.set('view engine', 'ejs')

app.get('/',(req,res)=>{
    res.send("Welcome to WhatsApp API");
});


app.get('/login',(req,res)=>{
    res.render('loginPage');
});

app.post('/login',async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const authStatus = await loginQuery(email,password);
        if (authStatus) {
            res.redirect('/dashboard');
        } else {
            console.log('Login Failed!');
            res.status(402).send('Failed to Login');
        }
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }

});

app.get('/signup',(req,res)=>{
    res.render('signupPage');
});

app.post('/signup',async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const doctorDetails = {
            gender : req.body.gender,
            institution_name : req.body.institution,
            designation : req.body.designation,
            username : req.body.uname,
            dob : req.body.birthday,
            lname : req.body.lname,
            fname : req.body.fname,
            patients : []
        }
        const result = await signUpQuery(email,password,doctorDetails);
        if(result) {
            res.redirect('/dashboard');
        } else {
            res.status(503).json({"message":"Error in Signing Up!"});
        }
    } catch (e) {
        console.log("Failed to register");
        res.status(501).send("Failed to Register!");
    }
});

app.get('/dashboard', async(req,res)=>{
    onAuthStateChanged(auth, async function(user) {
        if (user) {
            console.log(user.uid);
            const doctorDetails = await getDoctorDetails(user.uid)
            console.log(doctorDetails);
            res.render('dashboard', {user_data:doctorDetails});
        } else {
            res.redirect('/login');
        }
      });
});

app.get('/patients', async (req,res)=>{
    onAuthStateChanged(auth, async function(user) {
        if (user) {
            console.log(req.user)
            const allPatients = await getAllPatients();
            console.log(Object.values(allPatients));
            const doctorDetails = await getDoctorDetails(user.uid)
            console.log(doctorDetails);
            let patients = []
            doctorDetails.patients.forEach(element => {
                Object.values(allPatients).forEach(patient => {
                    if(element == patient.contactNumber){
                        patients.push({name:patient.name, contactNumber: element}) 
                    
                    }
                });
            });
            res.render('patientPage', {patients : Object.values(allPatients), user_data:patients});
        } else {
            res.redirect('/login');
        }
      });
    
});



app.get('/create-patient',(req,res)=>{
    res.render('createPatient');
});

app.get('/blood-requirement',(req,res)=>{
    res.render('BloodRequirement');
});

app.post('/blood-requirement',async (req,res)=>{
    
    await sendMessage(919747773300, `Dear User, We have a Urgent requirement of blood. \n Blood Type : ${req.body.bloodType}\n Location : ${req.body.location}\n City : ${req.body.city}\n Hospital : ${req.body.hospital} \nMessage from the requirer : ${req.body.msg}`)
    await sendMessage(918870401331, `Dear User, We have a Urgent requirement of blood. \n Blood Type : ${req.body.bloodType}\n Location : ${req.body.location}\n City : ${req.body.city}\n Hospital : ${req.body.hospital} \nMessage from the requirer : ${req.body.msg}`)
    await sendMessage(916300133708, `Dear User, We have a Urgent requirement of blood. \n Blood Type : ${req.body.bloodType}\n Location : ${req.body.location}\n City : ${req.body.city}\n Hospital : ${req.body.hospital} \nMessage from the requirer : ${req.body.msg}`)
    res.redirect('/patients');
});

app.post('/create-patient',async (req,res)=>{
    const paitentDetails = {
        name : req.body.name,
        age : req.body.age,
        gender : req.body.gender,
        contactNumber : "91"+req.body.contact,
    }
    const result = await addPatient(paitentDetails);
    if(result) {
        sendMessage(paitentDetails.contactNumber, `Dear ${paitentDetails.name}, \n Your ABHA Account has been created`);
        res.redirect("/patients");
    } else {
        res.send("Something went wrong while adding the patient.");
    }
});

app.get('/consent-request',(req,res)=>{
    res.render("consentApprovalPage")
});

app.post('/consent-request',async(req,res)=>{
    const check = await checkPatient("91"+req.body.patientnum);
    if(!check){
        res.send("Patient doesn't exists");
        return;
    } 
    const  msg = `Hello Mr.${check.name}. The doctor would like to have your consent to get access to your medical records\n Purpose : ${req.body.purpose} \n Type : "Approve" to approve the consent request.`
    sendMessage(check.contactNumber,msg);
    res.redirect('/patients');
});



app.post('/',async (req,res)=>{
    try {
        const result = await sendMessage(req.body.msg);
        if(result)
            res.send("Msg Sent");
        else 
            res.send("Error in sending whatsapp message");
    } catch (e) {
        console.error(`Error in sending whatsapp message : ${JSON.stringify(e)}`);
    }
});
app.get('/webhook', (req, res) => {
    const { query } = req;
  
    // Verify the challenge parameter for the initial setup
    if (query['hub.verify_token'] === "naresh2003solvathon") {
      return res.status(200).send(query['hub.challenge']);
    }
  
    res.status(403).send('Invalid verify token');
  });

app.post('/webhook',(req,res)=>{
    const { body, headers } = req;

  // Check if the request has a valid signature
//   if (!isValidSignature(headers['x-wa-signature'], body, process.env.WA_SYSTEM_ACCESS_TOKEN)) {
//     return res.status(401).send('Invalid signature');
//   }

if (body.entry) {
    body.entry.forEach(entry => {
      if (entry.changes) {
        entry.changes.forEach(change => {
          if (change.value && change.value.messages) {
            change.value.messages.forEach(message => {
              if (message.type === 'audio' && message.audio) {
                const audioData = message.audio;
                const fileName = `audio_${Date.now()}.ogg`;
                const filePath = `./audio/${fileName}`;
                getMediaURL(audioData.id).then(url=>{
                    if(url) {
                       
                        axios({
                            method: 'get',
                            url: url,
                            responseType: 'arraybuffer',
                            headers: {
                              'Authorization': `Bearer ${process.env.WA_SYSTEM_ACCESS_TOKEN}`,
                            },
                          }).then(response=>{
                            fs.writeFileSync(filePath, Buffer.from(response.data));
                            SpeechToText(fileName).then(resultText=>{
                                console.log("The User Spoke", resultText);
                                intentPrediction(resultText).then((intentName)=> {
                                    console.log("The intent recognised for user speech", intentName);
                                    if (intentName === "emergency services" || true) {
                                        getAIResponse(resultText).then((aiResponse)=>{
                                            console.log("AI Response", aiResponse);
                                            sendMessage(message.from, aiResponse);
                                            TextToSpeech(aiResponse)
                                        });
                                    }
                                });
                            });
                        }).catch((err)=> {
                            console.log("Error\n\n\n")
                            console.log(err)
                        }
                        
                        )
                    } else {
                        console.log("No file found");
                    }
                });
               

                console.log('Audio file saved:', fileName);
              } else if (message.type === 'text') {
                const msg = message.text.body;
                const phone = message.from;
                console.log(`Received text from WhatsApp: "${message.text.body}" from ${phone}`);
                if(msg ===  "approve" || msg === "Approve"){
                    console.log("Your request has been approved! Thank you.");
                    const docID = "yrXyyJWxtFNlQmxvAGygRuh0ibU2";
                    approveDetails(docID, phone);
                    sendMessage(phone,"Your request has been approved! Thank you.")
                } else {
                    intentPrediction(msg).then((intentName)=> {
                        console.log("The intent recognised for user speech", intentName);
                        if (true) {
                            getAIResponse(msg).then(async (aiResponse)=>{
                                // await uploadMediaURL('','audio/ogg');
                                console.log("AI Response", aiResponse);
                                await sendMessage(message.from, aiResponse);
                                // await TextToSpeech(aiResponse)
                                
                            });
                        }
                    });
                }
              }
            });
          }
        });
      }
    });
  }
  
  
  res.status(200).send('Webhook received successfully');
});



function isValidSignature(signature, body, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const calculatedSignature = 'sha256=' + hmac.update(JSON.stringify(body)).digest('hex');
    return signature === calculatedSignature;
  }

app.listen(process.env.PORT, (err)=>{
    if(!err) {
        console.log(`Server initiated at port ${process.env.PORT}`);
    } else {
        console.error(`Error in server  initiation: ${err}`);
    }
});

