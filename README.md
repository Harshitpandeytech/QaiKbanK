# QaiKbanK

QaiKbanK is a modern, AI-driven financial platform that leverages autonomous agents to streamline banking processes, loan applications, and customer support. The system features a robust backend architecture paired with an interactive frontend interface.

## Project Structure

The repository is organized into the following main directories:

- **agentflow-finance/**: Contains the core application codebase, including both frontend and backend components.
- **ui_elements/**: Contains raw graphical assets, logos, and background images used in the application.

## Core Features

- **Multi-Agent Architecture**: Employs specialized AI agents (Master, Sales, Sanction, Underwriting, and Verification agents) to handle different stages of the financial workflow.
- **Interactive Chat Interface**: A real-time chat window allowing users to interact with the AI agents for inquiries and processing.
- **Comprehensive Backend Services**: Handles authentication, credit scoring, OCR (Optical Character Recognition) for documents, EMI calculations, and CRM functionalities.
- **Gemini Integration**: Utilizes advanced language models via the Gemini service for intelligent conversational capabilities.

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Radix UI (shadcn/ui), React Router.
- **Backend**: Node.js, Express.js.
- **Database / ORM**: Document and relationship modeling for Users, Loan Applications, and Conversations.
- **Tooling**: TypeScript, ESLint, Prettier, Cloudflare Wrangler.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Navigate to the core application directory:
   ```bash
   cd agentflow-finance
   ```

2. Install dependencies for the frontend:
   ```bash
   npm install
   ```

3. Navigate to the backend directory and install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

### Running the Application Locally

1. **Start the Backend Server**:
   From the `agentflow-finance/backend` directory, run:
   ```bash
   npm run start
   ```
   (Ensure you have the necessary environment variables set up, such as `.env.local` if required by the services).

2. **Start the Frontend Development Server**:
   From the `agentflow-finance` directory, run:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local server URL provided by Vite (typically http://localhost:5173).

## Asset Usage

The `ui_elements` folder contains the canonical versions of the brand assets (e.g., Ducky mascots, primary logos, and backgrounds). When updating the UI, reference these high-resolution assets to ensure brand consistency.
