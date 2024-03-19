from pydantic import BaseModel
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, TrainingArguments, Trainer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from torch.utils.data import Dataset, DataLoader
import torch

df = [
      {"text": "How do I cite a website in APA format?", "intent": "query"},
    {"text": "What are the major theories of international relations?", "intent": "query"},
    {"text": "Where can I find articles on quantum mechanics?", "intent": "document retrieval"},
    {"text": "Can you explain the concept of artificial neural networks?", "intent": "query"},
    {"text": "How do I calculate the standard deviation of a dataset?", "intent": "query"},
    {"text": "Where can I access peer-reviewed journals in psychology?", "intent": "document retrieval"},
    {"text": "What are the stages of mitosis?", "intent": "query"},
    {"text": "How do I access the online library resources from off-campus?", "intent": "query"},
    {"text": "What is the difference between MLA and APA citation styles?", "intent": "query"},
    {"text": "Where can I find information on the impact of climate change on biodiversity?", "intent": "query"},
    {"text": "How do I cite a journal article in MLA format?", "intent": "query"},
    {"text": "What are the main branches of psychology?", "intent": "query"},
    {"text": "Where can I access research papers on astrophysics?", "intent": "document retrieval"},
    {"text": "Can you explain the concept of backpropagation in neural networks?", "intent": "query"},
    {"text": "How do I calculate the variance of a dataset?", "intent": "query"},
    {"text": "Where can I find peer-reviewed articles on clinical psychology?", "intent": "document retrieval"},
    {"text": "What are the stages of meiosis?", "intent": "query"},
    {"text": "How do I renew my library card online?", "intent": "query"},
    {"text": "What is the difference between primary and secondary sources?", "intent": "query"},
    {"text": "Where can I find information on the role of DNA in evolution?", "intent": "query"},
    {"text": "What are the recent advancements in artificial intelligence research?", "intent": "query"},
    {"text": "How do I calculate the probability density function?", "intent": "query"},
    {"text": "Where can I access journals on environmental science?", "intent": "document retrieval"},
    {"text": "What are the steps involved in conducting a literature review?", "intent": "query"},
    {"text": "How do I reserve a study room in the library?", "intent": "query"},
    {"text": "What are the differences between qualitative and quantitative research?", "intent": "query"},
    {"text": "Where can I find articles on renewable energy technologies?", "intent": "document retrieval"},
    {"text": "Can you explain the concept of cultural relativism in anthropology?", "intent": "query"},
    {"text": "How do I access past exam papers for biology?", "intent": "query"}
]

texts = list(map(lambda x: x['text'], df))
intents = list(map(lambda x: x['intent'], df))
train_texts, valid_texts, train_intents, valid_intents = train_test_split(texts, intents, test_size=0.2, random_state=42)
intent_label_mapping = {"query" : 0, "document retrieval" : 1}
class IntentDataset(Dataset):
    def __init__(self, texts, intents, tokenizer, max_length=128):
        self.texts = texts
        self.intents = intents
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(self.texts[idx], truncation=True, padding='max_length', max_length=self.max_length, return_tensors='pt')
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'label': torch.tensor(intent_label_mapping[self.intents[idx]])
        }

tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased')

train_dataset = IntentDataset(train_texts, train_intents, tokenizer)
valid_dataset = IntentDataset(valid_texts, valid_intents, tokenizer)

training_args = TrainingArguments(
    output_dir="./intent_finetuned_model",
    num_train_epochs=50,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir="./logs",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=valid_dataset,
)

# Fine-tune the model
trainer.train()

# Evaluate the model on the validation set
results = trainer.evaluate()

# Print evaluation results
print(results)

# Save the fine-tuned model
model.save_pretrained("intent_finetuned_model")
tokenizer.save_pretrained("intent_finetuned_model")