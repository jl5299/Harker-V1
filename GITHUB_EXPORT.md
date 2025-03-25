# Exporting to GitHub

This document provides step-by-step instructions for exporting this Replit project to GitHub.

## Prerequisites

1. A GitHub account
2. Git installed on your local machine (optional if using Replit's GitHub integration)

## Option 1: Using Replit's GitHub Integration (Recommended)

Replit provides built-in GitHub integration that makes it easy to connect your Replit project to a GitHub repository.

1. In your Replit project, click on the "Version Control" icon in the left sidebar (or press `Ctrl+Shift+G`)
2. Click "Create a Git Repository"
3. Once the repository is created, click "Connect to GitHub"
4. Authorize Replit to access your GitHub account if prompted
5. Create a new repository or select an existing one
6. Click "Push to GitHub"

Your project will now be pushed to GitHub with all the files and folders from your Replit project.

## Option 2: Manual Export

If you prefer to export manually or the Replit GitHub integration isn't working:

1. **Create a new repository on GitHub**
   - Go to [GitHub](https://github.com) and sign in
   - Click on the "+" icon in the top-right corner and select "New repository"
   - Give your repository a name (e.g., "harker")
   - Choose public or private visibility as needed
   - Do not initialize the repository with README, license, or .gitignore files
   - Click "Create repository"

2. **Clone the repository to your local machine**
   ```bash
   git clone https://github.com/yourusername/harker.git
   cd harker
   ```

3. **Download your Replit project**
   - In Replit, use the "Download as zip" option from the three-dot menu
   - Extract the zip file on your local machine

4. **Copy files to your local repository**
   - Copy all files and folders from the extracted Replit project to your local repository folder
   - Make sure to exclude node_modules, .replit, .cache, .config, .upm, and any other Replit-specific files

5. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit from Replit"
   git push origin main
   ```

## Important Files to Include

Make sure these important files are included in your GitHub repository:

- All source code in `/client`, `/server`, and `/shared` directories
- Configuration files: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`, etc.
- Documentation files: `README.md`, `SETUP.md`, `CONTRIBUTING.md`, `LICENSE`
- Environment example: `.env.example`
- Database configuration: `drizzle.config.ts`

## Files to Exclude

The `.gitignore` file should already be configured to exclude these files:

- `node_modules/` directory
- `.env` file with sensitive information
- Replit-specific files (`.replit`, `.cache/`, etc.)
- Build output files

## After Export

After exporting to GitHub:

1. Verify that all files were correctly pushed to the repository
2. Check that sensitive information is not included in any files
3. Update the README.md if necessary with repository-specific information
4. Set up any needed GitHub Actions or workflows

Your project is now ready for collaboration on GitHub!