# DXGen GitHub App

Automated documentation generation for pull requests using AI.

## Features

- Automatically generates documentation summaries when PRs are opened
- Uses RAG (Retrieval-Augmented Generation) to provide context-aware summaries
- Posts formatted comments directly to PRs
- Creates GitHub status checks for documentation generation

## Setup

### 1. Create GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in the details:
   - **Name**: DXGen Documentation Bot
   - **Homepage URL**: Your app URL
   - **Webhook URL**: `https://your-app.railway.app/` (or your deployment URL)
   - **Webhook Secret**: Generate a random secret and save it

4. Set permissions:
   - **Pull requests**: Read & Write
   - **Contents**: Read
   - **Checks**: Write
   - **Metadata**: Read (automatic)

5. Subscribe to events:
   - Pull request

6. Click "Create GitHub App"
7. Generate a private key and download it
8. Note your App ID

### 2. Install the App

1. In your GitHub App settings, click "Install App"
2. Choose the repositories you want to enable
3. Complete installation

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
- `APP_ID`: Your GitHub App ID
- `PRIVATE_KEY`: Your GitHub App private key (the entire content)
- `WEBHOOK_SECRET`: Your webhook secret
- `OPENAI_API_KEY`: OpenAI API key for embeddings and LLM
- `PINECONE_API_KEY`: Pinecone API key for vector storage

### 4. Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

For local testing with webhooks, use [smee.io](https://smee.io):

```bash
# Install smee-client
npm install -g smee-client

# Create a channel at https://smee.io and copy the URL
smee -u https://smee.io/YOUR_CHANNEL -t http://localhost:3000/

# Update your GitHub App webhook URL to the smee URL
```

### 5. Deploy to Railway

1. Push your code to GitHub
2. Create a new project in Railway
3. Connect to your GitHub repository
4. Set the root directory to `apps/github-app`
5. Configure environment variables in Railway dashboard
6. Deploy!
7. Update your GitHub App webhook URL to your Railway URL

## How It Works

1. **PR Opened**: When a pull request is opened, GitHub sends a webhook to the app
2. **Extract Context**: The app extracts PR metadata and list of modified files
3. **RAG Pipeline**: Syncs the project to Pinecone and retrieves relevant documents
4. **Generate Summary**: Uses AI to generate a comprehensive summary focused on PR changes
5. **Post Comment**: Formats and posts the summary as a PR comment
6. **Status Check**: Creates a GitHub check showing success/failure

## Architecture

```
GitHub → Webhook → Probot → RAG Pipeline → AI Generator → Comment
```

The app reuses existing packages:
- `@repo/ai`: AI-powered documentation generation
- `@repo/rag`: RAG pipeline for document retrieval

## Troubleshooting

### Webhooks not received

- Check that your webhook URL is correct in GitHub App settings
- Verify webhook secret matches between GitHub and your .env
- Check Railway logs for incoming requests

### Documentation generation fails

- Verify OpenAI API key is valid and has credits
- Verify Pinecone API key is valid
- Check that modified files are accessible
- Review logs for specific error messages

### Permission errors

- Ensure GitHub App has correct permissions (Pull requests: R/W, Contents: R, Checks: W)
- Reinstall the app if you changed permissions

## License

MIT

