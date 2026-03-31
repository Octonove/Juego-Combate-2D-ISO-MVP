# Isometric 2D Combat MVP (Single Prompt Test)

This repository contains a test of a Minimum Viable Product (MVP) for a 3v3 isometric 2D combat arena game (Characters vs Enemies).
The goal of this project was to evaluate and test the creation of the entire structure, mechanics, and functional gameplay using a **single detailed prompt** with an AI agent.

## MVP Features:
- **2D Isometric View**: Perspective and map rendering using a tilemap as a grid.
- **3v3 Combat System**: Arena fights with multiple warrior classes (melee, mages, archers).
- **AI and FSM (Finite State Machine)**: Basic logic where different enemies and protagonists know how to attack, flee, and prioritize targets based on their stats.
- **Knockback and Basic Physics**: A push system to knock opponents out of the arena into the lava, which acts as 'instant death'.
- **Power-up System**: Random generation of buffs (strength, speed, healing, or knockback resistance).
- **Tech Stack**: Developed with native JavaScript combined with Phaser 3 and running locally via Vite.

## How to run locally
1. Clone the repository
2. Navigate to the `/game` folder: `cd game`
3. Install dependencies: `npm install`
4. Run the project in development mode: `npm run dev`

### Development Notes
This prototype is completely functional; in recent versions, the battle timing and balance have been tweaked to ensure more entertaining combat durations.
All assets, animations, and mechanics were implemented based purely on the design specifications provided in the original prompt.
