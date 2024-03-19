require('dotenv').config();
const {OpenAI} = require('openai');

module.exports.openAI = async message=>{
    try {
        const openai = new OpenAI({apiKey : process.env.API_KEY})
        
       
        const conversationContextPrompt = " Considering you are academics assistant for college student, who is helpful, creative, clever, and very friendly. Give valid and convinent response to be question and help them to resolve their queries:";
        const response =  await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "You are a helpful academics assistant and resolve their queries for thr college students."},
                {"role":"user","content":message},
            ],
            temperature: 0.9,
            max_tokens: 500,
        });
       return response;
    } catch (err) {
        console.error(`Error in connecting to OpenAI: ${err}`);
    }

}