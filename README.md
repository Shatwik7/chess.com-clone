# Chess App

## Overview

Welcome to the Chess App, a robust and interactive chess platform designed to deliver a seamless online chess experience. This application is a clone of Chess.com, featuring real-time gameplay, player challenges, and in-game chat. Built with a modern tech stack, it leverages advanced architectural components to ensure smooth and scalable operations.

## Key Features

- **Real-Time Gameplay:** Players can engage in live chess matches using WebSocket (WS) connections, enabling instant moves and updates.
- **Player Challenges:** Users can challenge one another to games, fostering a competitive and interactive environment.
- **In-Game Chat:** Communicate with your opponent during the game, enhancing the social experience of playing chess.
- **Random Game Allocation:** Games are randomly assigned between players, ensuring diverse matchups and dynamic gameplay.

## Architecture

- **Pub/Sub Messaging:** Utilizes Redis Pub/Sub for real-time inter-server messaging, allowing players on different servers to play against each other.
- **Caching and Queue Management:** Redis is also used for caching game data and managing queues to efficiently allocate games between players.
- **Load Balancing:** Nginx acts as a load balancer for the WebSocket game server service, distributing incoming connections across multiple servers to ensure high availability and performance.
- **Frontend:** Developed using React to provide a responsive and interactive user interface.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Caching & Messaging:** Redis
- **Reverse Proxy & Load Balancing:** Nginx
- **Frontend:** React
- **Containerization:** Docker, Docker Compose

## Getting Started

### Prerequisites

1. **Node.js** (LTS version recommended)
2. **Docker** and **Docker Compose**
3. **MongoDB** and **Redis** (if not using Docker)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/chessapp.git
   cd chessapp
   
2. **Start the Redis and Nginx images**
   ```bash
   docker-compose up -d
3. **For Development Mode**
    ```bash
    npm run dev
