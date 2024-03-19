from fastapi import FastAPI, File, UploadFile, HTTPException

from pydantic import BaseModel
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
from nlpModel import SpeechToTextModel, TextToSpeechModel

app = FastAPI()

# Load the pre-trained model and tokenizer
model_path = "intent_finetuned_model"
tokenizer = DistilBertTokenizer.from_pretrained(model_path)
model = DistilBertForSequenceClassification.from_pretrained(model_path)
model.eval()

class InputText(BaseModel):
    text: str
class VoiceRequest(BaseModel):
    voice_file: UploadFile
class TextRequest(BaseModel):
    text: str

@app.post("/predict-intent")
async def predict_intent(input_text: InputText):
    text = input_text.text

    # Tokenize input text
    inputs = tokenizer(text, return_tensors="pt")

    # Forward pass through the model
    with torch.no_grad():
        outputs = model(**inputs)

    # Get predicted label (intent)
    logits = outputs.logits
    predicted_intent_id = torch.argmax(logits).item()
    
    # You may have a mapping of intent ids to human-readable labels
    intent_label_mapping = { 0:"query", 1: "record locators"} # Update with your intent labels
    print(f"Predicted intent id: {predicted_intent_id}")
    predicted_intent = intent_label_mapping[predicted_intent_id]

    return {"input_text": text, "predicted_intent": predicted_intent}

@app.get('/')
async def home():
    return "Hello! This is an API for classifying intents in natural language."

@app.post('/t2s')
async def t2s(input_text : TextRequest):
    path = TextToSpeechModel(input_text.text)
    return path
@app.post('/s2t')
async def s2t(voice_path:TextRequest):
    text = SpeechToTextModel(voice_path.text)
    return {"text" : text}