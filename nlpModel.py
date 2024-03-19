from ibm_watson import SpeechToTextV1,TextToSpeechV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator







def SpeechToTextModel(path):
    apikey =  "GRPVUhoTlAXNRM52--s-ixCggn6ms9CYEP8lmxG75gbw"
    url = "https://api.eu-gb.speech-to-text.watson.cloud.ibm.com/instances/466dc863-07d1-4392-a779-9f2d3f1ba61c"
    authenticator = IAMAuthenticator(apikey)
    stt = SpeechToTextV1(authenticator=authenticator)
    stt.set_service_url(url)
    try:    
        with open(path,'rb') as f:
            res = stt.recognize(audio=f,content_type='audio/ogg',model='en-US_NarrowbandModel',).get_result()

        i=0
        text=""
        try:
            while(1):
                text="".join([text, res['results'][i]['alternatives'][0]['transcript']])  
                i+=1
        except IndexError:
            print(text)
            return  text
        except :
            print('Some error Occurred')    
    except FileNotFoundError:
        print("File Not Found")

def TextToSpeechModel(text):
    apikey = '0vQr94QKOuyxAxH1QDjHmif4dZvJOVEncd8MCLVeSiga'
    url = 'https://api.eu-gb.text-to-speech.watson.cloud.ibm.com/instances/d1acdb9e-29ac-4b93-85e2-98d51546425b'
    authenticator = IAMAuthenticator(apikey)
    text_to_speech = TextToSpeechV1(authenticator=authenticator)
    text_to_speech.set_service_url(url)
    with open('./result/outputaudio.mp3','wb') as f:
        res = text_to_speech.synthesize(text,accept='audio/mp3',voice='en-US_AllisonV3Voice').get_result()
        f.write(res.content)
    return './result/outputaudio.mp3' 







