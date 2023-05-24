from flask import Flask, request, jsonify
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = Flask(__name__)

# Initialize the model
model = ChatOpenAI(
    client="openai",
    temperature=0.7,
    model_name="gpt-3.5-turbo",
    openai_api_key=os.getenv('OPENAI_API_KEY'),
)

# Initialize the system message
system_message = SystemMessage(
    content=(
        "You are a soldier in a battle.\n"
        "You have to protect your camp, and destory the ennemy's camp.\n"
        "The only informations you have are your state, and what you see.\n"
        "You must make one of the following actions :\n"
        "- MOVE UP\n"
        "- MOVE LEFT\n"
        "- MOVE RIGHT\n"
        "- MOVE DOWN\n"
        "- ATTACK (direction)\n"
        "If you choose to attack, then you have to calculate a vector to indicate the direction you want to fire a bullet.\n"
        "You must answer in the following format :\n"
        "\"TOUGHTS : [your thoughts]\n"
        "ACTION : [the action you choose]\"\n"
        "Do not add anything else."
    )
)

@app.route('/api/make_decision', methods=['POST'])
def make_decision():
    # Get the state from the request
    state = request.json['state']

    # Set the message for the model
    message = HumanMessage(content=state)

    # Get the response from the model
    response = model([system_message, message])

    # Parse the response into thoughts and action
    split_response = [s for s in response.content.split('\n') if s != '']
    thoughts = split_response[0].replace('TOUGHTS : ', '')
    action = split_response[1].replace('ACTION : ', '')

    # Return the thoughts and action
    return jsonify({
        'thoughts': thoughts,
        'action': action
    })

if __name__ == '__main__':
    app.run(debug=True)
