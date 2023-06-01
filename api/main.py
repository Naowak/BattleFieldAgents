import os
from flask import Flask, request, jsonify, abort
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
    #model="gpt-3.5-turbo", 
    model="gpt-4", 
    temperature=0.7,
    openai_api_key=os.getenv('OPENAI_API_KEY'),
)

# Initialize the system message
system_message = SystemMessage(
    content=(
        "You're an artificial intelligence in a strategic turn-based video game played on a checkerboard. \n"
        "You take on the role of a character in this game, and are accompanied by other agents who, like you, move through the video game autonomously. \n"
        "Each of you starts with 100 life points, and can perform 4 actions per turn, which are restricted to the following:\n"
        "- move one square (up, down, right, left)\n"
        "- attack a square (removes 25 life points from the target)\n"
        "You are divided into two teams (red and blue).\n"
        "Each team has a target (200 life points) which it must defend, and wins when it has destroyed the opposing target, or killed all the opposing agents. \n"
        "\n"
        "Based on the information we'll give you (your position and what you see in your field of view), you'll have to explain your situation, what you plan to do and why.\n"
        "Then, based on these thoughts, you'll have to give us a sequence of 4 actions to carry out. Please note that each action has consequences, and is dependent on the previous actions.\n"
        "\n"
        "You can only attack squares that are in your field of view.\n"
        "You can only move on empty squares.\n"
        "When you choose to move, your position is modified as follows:\n"
        "- MOVE UP => position + (0, -1)\n"
        "- MOVE DOWN => position + (0, +1)\n"
        "- MOVE LEFT => position + (-1, 0)\n"
        "- MOVE UP => position + (+1, 0)\n"
        "\n"
        "Please answer strictly in the following format:\n"
        "```\n"
        "THOUGHTS:\n"
        "[situation, plans, why]\n"
        "\n"
        "ACTIONS:\n"
        "1. [action 1]\n"
        "2. [action 2]\n"
        "3. [action 3]\n"
        "4. [action 4]\n"
        "```\n"
        "\n"
        "Here is an example of what is expected for ACTIONS:\n"
        "```\n"
        "1. MOVE UP\n"
        "2. MOVE DOWN\n"
        "3. ATTACK [-1, 7]\n"
        "4. ATTACK [-1, 7]\n"
        "```\n"
    )
)

# Parse the response into thoughts and action
def read_answer(response):
    message = response.content
    try:
        lines = message.split('\n')
        thoughts = lines[1]
        actions = lines[4:8]
        actions = [a[3:] for a in actions]
        return thoughts, actions
    except:
        with open('response.txt', 'w') as f:
            f.write(response.content)
        return "", ["", "", "", ""]

@app.route('/play_one_turn', methods=['POST'])
def play():

    # Get the state from the request
    if not (request.json and 'state' in request.json):
        abort(400, 'Missing state parameter')

    # Get the response from the model
    message = HumanMessage(content=request.json['state'])
    response = model([system_message, message])
    thoughts, actions = read_answer(response)

    # Return the thoughts and action
    return jsonify({
        'thoughts': thoughts,
        'actions': actions
    })

if __name__ == '__main__':
    app.run(debug=True)
