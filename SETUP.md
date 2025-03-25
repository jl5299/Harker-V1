# Harker - Project Setup Guide

This guide will help you set up the Harker video streaming platform from the GitHub repository.

## Prerequisites

Before you begin, ensure you have the following installed:

1. Node.js (v18 or higher)
2. PostgreSQL (v14 or higher)
3. Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd harker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Edit the `.env` file with your database connection details and other required settings:

```
DATABASE_URL=postgresql://username:password@localhost:5432/harker_db
SESSION_SECRET=your_session_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here (optional, for transcription features)
```

### 4. Set Up the Database

Create a PostgreSQL database:

```bash
createdb harker_db
```

Run the database migrations:

```bash
npm run db:push
```

### 5. Start the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

## Features and Usage

The application will be available at `http://localhost:5000`. 

- Home page: View upcoming live events and available videos
- Video page: Watch videos with discussion guides
- Discussion page: Participate in discussions and record conversations
- Admin page: Manage content (requires admin privileges)

## Troubleshooting

- If you encounter database connection issues, verify your DATABASE_URL is correct
- For transcription features, ensure you have provided a valid OPENAI_API_KEY
- For more detailed logs, check the console output when running the application

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.