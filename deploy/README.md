# Deployment Guide

This guide covers both local Docker testing and automated VPS deployment.

## Docker Deployment

### Testing Docker Locally

1. **Create environment file**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your actual values for:

   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENROUTER_API_KEY`
   - `PORT=4321` (optional, defaults to 4321 in Docker)
   - `HOST=0.0.0.0` (optional, defaults to 0.0.0.0 in Docker)

2. **Run the test script** (recommended)

   ```bash
   ./docker-test.sh
   ```

   This script will:

   - Validate your `.env` file
   - Build the Docker image
   - Start the container
   - Show initial logs

3. **Or use Docker commands directly**

   ```bash
   # Build the image
   docker build -t smicek/tenseai:latest .

   # Run the container (requires .env file)
   docker run -d -p 3000:4321 --env-file .env --name tense-ai-app --restart unless-stopped smicek/tenseai:latest

   # View logs
   docker logs tense-ai-app

   # Follow logs in real-time
   docker logs -f tense-ai-app

   # Stop the container
   docker stop tense-ai-app

   # Remove the container
   docker rm -f tense-ai-app
   ```

### Important Docker Notes

- **Port**: The application runs on port `4321` inside the container
- **Environment Variables**: All environment variables must be provided via `.env` file using `--env-file` flag
  - The container uses the same `start-server.mjs` as local development
  - Variables from `--env-file .env` are automatically loaded into `process.env`
- **Prompts**: AI prompt files are automatically copied from `src/server/prompts/` to `dist/server/prompts/` during build

### How Docker Handles Environment Variables

1. **Build time**: Only `PUBLIC_*` variables are embedded during build
2. **Runtime**: All other variables (OPENROUTER*API_KEY, SUPABASE*\*) are loaded from:
   - Docker: `--env-file .env` flag sets `process.env` directly
   - Local: `start-server.mjs` loads `.env` file using dotenv

The container startup will log which variables are loaded for debugging purposes.

### Troubleshooting Docker

If you get a 500 error when generating questions:

1. **Check environment variables are set correctly**

   ```bash
   docker exec tense-ai-app printenv | grep -E "(OPENROUTER|SUPABASE)"
   ```

2. **Check application logs**

   ```bash
   docker logs tense-ai-app
   ```

3. **Verify prompt files exist**

   ```bash
   docker exec tense-ai-app ls -la dist/server/prompts/
   ```

4. **Test API connectivity**
   ```bash
   # Test if OpenRouter API key works
   curl https://openrouter.ai/api/v1/auth/key \
     -H "Authorization: Bearer $OPENROUTER_API_KEY"
   ```

## Automated Deployment to VPS

The project includes a GitHub Actions workflow that automatically resets and redeploys the Docker container on your VPS whenever changes are pushed to the `main` branch.

### Setup

1. **Configure GitHub Secrets**

   Go to your repository settings → Secrets and variables → Actions, and add the following secrets:

   **Required Secrets:**

   - `VPS_HOST` - Your VPS hostname or IP address (e.g., `example.com` or `192.168.1.100`)
   - `VPS_USER` - SSH username for your VPS (e.g., `root` or `deploy`)
   - `VPS_SSH_KEY` - Private SSH key for authentication (the entire private key content)

   **Optional Secrets:**

   - `VPS_PORT` - SSH port (optional, defaults to `22`)
   - `VPS_PROJECT_PATH` - Path to project directory on VPS (optional, defaults to `~/TenseAI`)

2. **Generate SSH Key (if needed)**

   ```bash
   # On your local machine
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/vps_deploy_key

   # Copy public key to VPS
   ssh-copy-id -i ~/.ssh/vps_deploy_key.pub user@your-vps-host

   # Copy private key content to GitHub secret VPS_SSH_KEY
   cat ~/.ssh/vps_deploy_key
   ```

3. **Prepare VPS**

   Make sure your VPS has:

   - Git repository cloned and configured
   - Docker installed and running
   - `.env` file in the project directory with all required environment variables
   - Proper SSH access configured

4. **How It Works**

   When you push to `main` branch:

   1. GitHub Actions triggers the deployment workflow
   2. Connects to your VPS via SSH
   3. Executes `deploy/deploy.sh` script which:
      - Pulls latest changes from `main` branch
      - Uses existing `.env` file on VPS
      - Rebuilds Docker container (stops old, builds new image, starts new container)
      - Cleans up old Docker images

### Manual Deployment

If you need to manually trigger deployment or the automated workflow fails, you can run the deployment script directly:

```bash
# SSH into your VPS
ssh user@your-vps-host

# Navigate to project directory
cd ~/TenseAI  # or your configured path

# Run the deployment script
bash deploy/deploy.sh
```

The script will:

- Pull latest changes from `main` branch
- Use existing `.env` file in the project directory
- Rebuild and restart Docker container

**Note:** Make sure the `.env` file exists in the project directory with all required environment variables before running the script.

## Nginx Reverse Proxy Configuration

The deployment script does not automatically configure Nginx. You need to manually set up Nginx as a reverse proxy to access your application through a domain name.

### Using the Template

A template configuration file is provided at `deploy/nginx.conf.template`. Here's how to use it:

1. **Generate configuration from template:**

   ```bash
   # Replace YOUR_DOMAIN with your actual domain (e.g., tenseai.example.com or your Mikrus subdomain)
   sed "s/{{DOMAIN}}/YOUR_DOMAIN/g" deploy/nginx.conf.template > /tmp/tenseai-nginx.conf
   ```

2. **For standard Nginx installations (Debian/Ubuntu):**

   ```bash
   # Copy configuration
   sudo cp /tmp/tenseai-nginx.conf /etc/nginx/sites-available/tenseai

   # Enable site
   sudo ln -sf /etc/nginx/sites-available/tenseai /etc/nginx/sites-enabled/tenseai

   # Test configuration
   sudo nginx -t

   # Reload Nginx
   sudo systemctl reload nginx
   ```

3. **For Mikrus VPS or Alpine Linux:**

   ```bash
   # Copy configuration to conf.d directory
   sudo cp /tmp/tenseai-nginx.conf /etc/nginx/conf.d/tenseai.conf

   # Test configuration
   sudo nginx -t

   # Reload Nginx
   sudo rc-service nginx reload
   # or
   sudo service nginx reload
   ```

### Template Configuration

The template (`deploy/nginx.conf.template`) creates a reverse proxy that:

- Listens on port 80 (HTTP)
- Proxies requests to `http://127.0.0.1:3000` (where Docker container runs)
- Sets proper headers for WebSocket support
- Limits request body size to 10MB

**Example template content:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name YOUR_DOMAIN;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/HTTPS Configuration

For production, you should add SSL/HTTPS support. You can use Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx  # Debian/Ubuntu
# or
sudo apk add certbot certbot-nginx  # Alpine

# Obtain certificate
sudo certbot --nginx -d YOUR_DOMAIN
```

Certbot will automatically update your Nginx configuration to use HTTPS.

## Files in this directory

- `deploy.sh` - Main deployment script executed by GitHub Actions
- `nginx.conf.template` - Nginx reverse proxy configuration template
- `README.md` - This file
