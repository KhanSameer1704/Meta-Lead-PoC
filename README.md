# Meta Lead Ads Integration PoC

A proof of concept demonstrating a Meta Lead Ads webhook integration with a Node.js and Express backend and a React Native Expo mobile application.

## Architecture

Meta Lead Ads Webhook → Express Backend → Socket.IO → React Native Expo App

## Features

- Express health-check endpoint
- Meta webhook verification and event handling
- Socket.IO real-time communication
- Mock lead endpoint for testing the mobile flow
- React Native Expo app to display incoming leads

## Tech Stack

- Node.js and Express
- Socket.IO
- React Native and Expo
- Meta Graph API
- ngrok for local webhook testing

## Setup

### Backend

1. Open a terminal in the `backend` directory.
2. Install dependencies using `npm install`.
3. Configure the required environment variables in a local `.env` file.
4. Start the backend using the start command defined in `backend/package.json`.

### Mobile App

1. Open a terminal in the `mobile` directory.
2. Install dependencies using `npm install`.
3. Configure the backend URL for your development environment.
4. Start Expo using the command defined in `mobile/package.json`.

## Testing

The backend includes a mock-lead endpoint for demonstrating real-time updates in the mobile application.

## Current Status

The backend-to-mobile mock-lead flow and direct Meta webhook connectivity have been tested. Actual Meta test-lead delivery and retrieval remain unverified.

## Security

Never commit access tokens, secrets, or `.env` files to version control.
