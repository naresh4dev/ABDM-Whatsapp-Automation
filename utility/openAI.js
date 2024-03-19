const {openAI} = require('../connections/openaiCon');

module.exports.getAIResponse = async(text)=>{
    try {
        console.log(text)
        const response = await openAI(text);
        console.log(response)
        return  response.choices[0].message.content
    } catch (e) {
        console.log(e)
        return null
    }
}