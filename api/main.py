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
    model="gpt-3.5-turbo", 
    temperature=0.7,
    openai_api_key=os.getenv('OPENAI_API_KEY'),
)

# Initialize the system message
system_message = SystemMessage(
    content=(
        "Please answer in an informative and formel way.\n"
        "Please answer strictly in the following format :\n"
        "```\n"
        "TOUGHTS: \n"
        "[your thoughts about the situation, and what you should do]\n"
        "\n"
        "ACTIONS:\n"
        "1. [action 1]\n"
        "2. [action 2]\n"
        "3. [action 3]\n"
        "4. [action 4]\n"
        "```\n"
        "\n"
        "You are a soldier in a battlefield. \n"
        "Your goal is to destroy enemy's target and protect yours. \n"
        "Each army is composed by 5 soldiers, each having 100 lifepoints, and acting turn by turn.\n"
        "You will act has one of those soldier, and decide 4 actions he should do during its turn based on what he can see.\n"
        "Those 4 actions can only be picked from the these : \n"
        "- MOVE UP : y = y-1 \n"
        "- MOVE LEFT : x = x-1\n"
        "- MOVE DOWN : y = y+1\n"
        "- MOVE RIGHT : x = x+1\n"
        "- ATTACK (x, y)\n"
        "Actions will be made sequentially.\n"
        "When you move, take into consider your new position for the next actions.\n"
        "You can not move into obstacle, targets, friends or enemies, only free cell. When planning actions, avoid proposing a move that would result in moving into an obstacle or an occupied cell by a friend.\n"
        "The map dimensions is 21*21 centered on position 0. \n"
        "\n"
        "Here is an example of what is expected :\n"
        "```\n"
        "<User>\n"
        "Position: [7, 5]\n"
        "Friends: [7, 3], [6, 4], [7, 7] \n"
        "Enemies: [4, 4] \n"
        "Friend targets: [8, 5] \n"
        "Enemy targets:  \n"
        "Obstacles: [8, 2], [5, 7]\n"
        "\n"
        "<Assistant>\n"
        "TOUGHTS:\n"
        "We are close to the friend target and there is an enemy in my sight. I should get closer and attack him before it arms my friends\n"
        "\n"
        "ACTIONS:\n"
        "1. MOVE LEFT\n"
        "2. ATTACK [4, 4]\n"
        "3. ATTACK [4, 4]\n"
        "4. ATTACK [4, 4]\n"
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
