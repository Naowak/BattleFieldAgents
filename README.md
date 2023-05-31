# BattleFieldAgents : 3D Battle Game with React and React-Three-Fiber

## Description

This project is a 3D version of a battle simulation game. The game is played on a grid and features two teams, each with a base (camp) and a set number of agents (soldiers). The agents' goal is to protect their own camp while trying to destroy the enemy's camp. 

The game is powered by an AI that uses OpenAI's GPT-3 model to make decisions for the agents. Agents have the ability to move in four directions, as well as to attack enemies or enemy camps by firing bullets. 

Each agent has a "sight" range, within which it can detect enemies, friends, camps, and obstacles. Based on this sight and the current state (location and life points), the agent interacts with the GPT-3 model to decide its next action.

This game was originally developed in Python with 2D graphics using Pygame. This project is aimed to recreate the game in 3D using React and React-Three-Fiber for the frontend, while keeping the game logic and AI aspects intact. 

## Goals

1. Understand and reimplement the original game logic in JavaScript.
2. Create a 3D visualization of the game using React-Three-Fiber.
3. Maintain the interaction between the game agents and the GPT-3 model.

## Getting Started

To launch the project, please follow these steps:

1. Clone the repository: `git clone <repository_url>`
2. Navigate to the project folder: `cd <project_folder>`
3. Install the required dependencies: `npm install` or `yarn install`
4. Launch the project: `npm start` or `yarn start`
   
You should now see the game running on `http://localhost:3000` in your web browser.

## Contribution

Feel free to contribute to this project by submitting pull requests. All contributions are welcome!
