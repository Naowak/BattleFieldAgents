import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize the model
model = ChatOpenAI(
    client="openai", 
    model_name="gpt-3.5-turbo", 
    temperature=0.7,
    openai_api_key=os.getenv('OPENAI_API_KEY'),
)

# Initialize the system message
system_message = SystemMessage(
    content=(
        "You are a soldier in a battle.\n"
        "You have to protect your camp, and destory the ennemy's camp.\n"
        "The only informations you have are your state, and what you see.\n"
        "You must make four of the following actions :\n"
        "- MOVE UP\n"
        "- MOVE LEFT\n"
        "- MOVE RIGHT\n"
        "- MOVE DOWN\n"
        "- ATTACK (position)\n"
        "If you choose to attack, you have to indicate the position [x, y] where you want to fire.\n"
        "You must answer in the following format :\n"
        "\"TOUGHTS : [your thoughts]\n"
        "ACTIONS : [the action you choose]\"\n"
        "Do not add anything else."
    )
)

@app.route('/play_one_turn', methods=['POST'])
def play():
    # Get the state from the request
    state = request.json['state']
    with open('state.txt', 'w') as f:
        f.write(state)

    # Set the message for the model
    message = HumanMessage(content=state)

    # Get the response from the model
    response = model([system_message, message])

    # Parse the response into thoughts and action
    split_response = [s for s in response.content.split('\n') if s != '']
    thoughts = split_response[0].replace('TOUGHTS:\n', '')
    actions = split_response[1].replace('ACTIONS:\n', '').split('\n')
    actions = [a[3:] for a in actions]

    with open('response.txt', 'w') as f:
        f.write(response.content)

    # Return the thoughts and action
    return jsonify({
        'thoughts': thoughts,
        'actions': actions
    })

if __name__ == '__main__':
    app.run(debug=True)
