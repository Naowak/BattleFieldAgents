import os
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Initialize the app
app = Flask(__name__)
CORS(app)

# Initialize the model
model = ChatOpenAI(
    client="openai", 
    #model="gpt-3.5-turbo", 
    model="gpt-4", 
    temperature=0.7,
    openai_api_key=os.getenv('OPENAI_API_KEY'),
)

# Initialize the system message
system_txt = ""
with open('./prompts/system_message.txt', 'r') as f:
    system_txt = f.read()
system_message = SystemMessage(content=(system_txt))



# Parse the response into thoughts and action
def read_answer(response):
    message = response.content
    try:
        lines = message.split('\n')
        thoughts = [l for l in lines if l.startswith('THOUGHTS: ')][0][10:]
        action = [l for l in lines if l.startswith('ACTION: ')][0][8:]
        return thoughts, action
    except:
        with open('response.txt', 'w') as f:
            f.write(response.content)
        return "", ""



# Define the API routes
@app.route('/play_one_turn', methods=['POST'])
def play():

    # Get the state from the request
    if not (request.json and 'state' in request.json):
        abort(400, 'Missing state parameter')

    # Get the response from the model
    message = HumanMessage(content=str(request.json['state']))
    response = model([system_message, message])
    thoughts, action = read_answer(response)

    # Return the thoughts and action
    return jsonify({
        'thoughts': thoughts,
        'action': action
    })




if __name__ == '__main__':
    app.run(debug=True)
