# Harker - Video Streaming Platform for Senior Communities

Harker is a video streaming platform specifically designed for senior communities, providing weekly cultural and academic content through both live events and on-demand videos, each accompanied by discussion guides.

## Features

- **Curated Educational Content**: Three on-demand videos and one live event each week covering topics like art history and cultural heritage
- **Discussion Guides**: Each video includes a discussion guide to facilitate community conversations
- **Conversation Recording**: Record and transcribe post-viewing discussions (feature available with OpenAI API key)
- **HIPAA-Compliant Storage**: Secure database for storing sensitive discussion data
- **User Authentication**: Secure login/registration system
- **YouTube Integration**: Leverages YouTube as a backend for reliable video content delivery
- **Senior-Friendly Design**: User interface designed with accessibility in mind

## Technology Stack

- **Frontend**: React with TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **API Integration**: YouTube API, OpenAI API for transcription
- **Routing**: wouter for lightweight client-side routing

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Environment Variables

The application requires the following environment variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_project_service_key
OPENAI_API_KEY=your_openai_api_key (optional, for transcription features)
```

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the client and server: `npm run dev:all`
4. Access the client application at `http://localhost:5173/`

## Project Structure

- `/client`: Frontend React application
- `/server`: Backend Express application
- `/shared`: Shared types and schemas used by both frontend and backend

## License

This project is licensed under the MIT License.