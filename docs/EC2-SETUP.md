# EC2 Backend Setup Guide

No SSH keys. No port 22. GitHub Actions uses IAM user credentials to call AWS SSM, which runs the deploy script on EC2.

---

## Architecture

```
GitHub Actions (AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY)
  └─ ssm:SendCommand → EC2 Instance
       └─ SSM Agent runs: git pull → npm ci → pm2 restart
```

EC2 never exposes port 22. SSM Agent communicates outbound over HTTPS to AWS endpoints.

---

## Part 1 — EC2 Instance

### 1.1 Provision

| Setting | Value |
|---|---|
| AMI | Ubuntu Server 22.04 LTS |
| Instance type | t3.small (minimum) |
| Key pair | None required (SSM replaces SSH) |
| Storage | 20 GB gp3 |

**Security group inbound rules — port 22 not needed:**

| Port | Source | Purpose |
|---|---|---|
| 80 | 0.0.0.0/0 | HTTP → Nginx |
| 443 | 0.0.0.0/0 | HTTPS → Nginx |

**Outbound:** allow 443 to `0.0.0.0/0` so SSM Agent can reach AWS endpoints.

---

### 1.2 Create EC2 IAM Role

In **IAM → Roles → Create role**:

- **Trusted entity:** AWS service → EC2
- **Permissions:** attach `AmazonSSMManagedInstanceCore`
- **Role name:** `omnify-ec2-ssm-role`

Attach to instance:  
**EC2 → Instance → Actions → Security → Modify IAM role → omnify-ec2-ssm-role**

Verify SSM connectivity (takes ~2 min after attach):

```bash
# AWS Console → Systems Manager → Fleet Manager
# Instance should appear as "Online"
```

---

### 1.3 Connect via SSM Session (replaces SSH)

```bash
# Install AWS CLI locally if needed
aws ssm start-session --target i-xxxxxxxxxxxxxxxxx --region ap-south-1
```

Or use **AWS Console → EC2 → Connect → Session Manager**.

---

### 1.4 Bootstrap the Server

Once connected via Session Manager:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx
```

#### GitHub Deploy Key (private repo — do this before cloning)

```bash
ssh-keygen -t ed25519 -C "omnify-ec2" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub
```

Copy the output. Add it to **GitHub → repo → Settings → Deploy keys → Add deploy key** (read-only, no write access needed).

```bash
cat >> ~/.ssh/config << 'EOF'
Host github.com
  IdentityFile ~/.ssh/deploy_key
  StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config

# Verify
ssh -T git@github.com
# Expected: "Hi <org>/inventory-solution-SaaS! You've successfully authenticated..."
```

#### Node, PM2, and App

```bash
# Node 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm alias default 20

# PM2
npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# run the printed sudo command

# Clone via SSH (not HTTPS — works with private repos)
mkdir -p ~/omnify && cd ~/omnify
git clone git@github.com:<your-org>/inventory-solution-SaaS.git .
cd api
npm ci --omit=dev

# Environment
cp .env.example .env
nano .env   # fill in all values

# Start
pm2 start src/index.js --name omnify-api
pm2 save
```

---

### 1.5 Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/omnify-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/omnify-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### SSL with Certbot

Before running Certbot, the domain must resolve to this EC2 IP. Certbot fails with `NXDOMAIN` if the DNS record is missing.

**Step 1 — Point the domain to EC2:**

Add an A record in your DNS provider (Route 53, Cloudflare, etc.):

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `omnify-api` | `<EC2 Elastic IP>` | 300 |

> Use an **Elastic IP** — regular EC2 public IPs change on stop/start and will break DNS.

**Step 2 — Verify propagation before running Certbot:**

```bash
dig omnify-api.commit4solutions.com A +short
# Must return your EC2 IP before proceeding
```

**Step 3 — Issue certificate:**

```bash
sudo certbot --nginx -d omnify-api.commit4solutions.com
```

---

## Part 2 — IAM User for GitHub Actions

### 2.1 Create IAM User

**IAM → Users → Create user:**

- **User name:** `omnify-github-deploy`
- **Access type:** Programmatic access only (no console login)

### 2.2 Attach Inline Policy

After creating the user, go to **Permissions → Add inline policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand",
        "ssm:GetCommandInvocation",
        "ssm:ListCommandInvocations"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2.3 Generate Access Keys

**IAM → Users → omnify-github-deploy → Security credentials → Create access key:**

- Use case: **Application running outside AWS**
- Save the **Access key ID** and **Secret access key** — shown once only

---

## Part 3 — GitHub Secrets

**GitHub → repo → Settings → Secrets and variables → Actions:**

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key ID from step 2.3 |
| `AWS_SECRET_ACCESS_KEY` | Secret access key from step 2.3 |
| `AWS_REGION` | `ap-south-1` |
| `EC2_INSTANCE_ID` | `i-xxxxxxxxxxxxxxxxx` |

---

## Deploy Flow

Every push to `main` touching `api/**`:

1. `aws-actions/configure-aws-credentials` authenticates with the IAM user access key
2. `aws ssm send-command` dispatches the deploy script to the EC2 instance
4. SSM Agent on EC2 runs: `git pull` → `npm ci` → `pm2 restart`
5. Workflow polls and prints stdout/stderr, fails the job if status ≠ `Success`

**Check logs on EC2:**

```bash
pm2 logs omnify-api
pm2 monit
```

**Check SSM command history:**

```
AWS Console → Systems Manager → Run Command → Command history
```
