# Quick Start Guide - Hostinger VPS Deployment

## 🚀 Quick Deployment Steps

### 1. Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### 2. Run Initial Setup
```bash
# Download setup script
wget -O setup-vps.sh https://raw.githubusercontent.com/your-repo/shakti-yoga/main/deploy/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

### 3. Clone Repository
```bash
cd /var/www
git clone https://github.com/your-username/shakti-yoga.git
cd shakti-yoga
```

### 4. Configure Environment
```bash
# Copy template
cp env.template .env

# Edit with your values
nano .env
```

**Required changes in `.env`:**
- `DATABASE_URL` - PostgreSQL connection string
- `MINIO_ENDPOINT` - Your VPS IP (e.g., `http://123.45.67.89:9000`)
- `MINIO_ACCESS_KEY` - Secure access key
- `MINIO_SECRET_KEY` - Secure secret key
- `NEXT_PUBLIC_APP_URL` - Your domain (e.g., `https://yourdomain.com`)

### 5. Start Database & MinIO
```bash
# Create .env file for docker-compose (or use same .env)
cp .env docker.env

# Update docker-compose.yml with your values OR
# Create docker.env with these variables:
# POSTGRES_USER=shaktiyoga
# POSTGRES_PASSWORD=your_secure_password
# POSTGRES_DB=shaktiyoga
# MINIO_ROOT_USER=your_minio_user
# MINIO_ROOT_PASSWORD=your_minio_password
# MINIO_BUCKET=shakti-yoga-assets

# Start services
docker-compose up -d

# Verify
docker ps
```

### 6. Deploy Application
```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

### 7. Setup Nginx
```bash
# Copy nginx config
cp deploy/nginx.conf /etc/nginx/sites-available/shakti-yoga

# Edit domain name
nano /etc/nginx/sites-available/shakti-yoga
# Replace "your-domain.com" with your actual domain

# Enable site
ln -s /etc/nginx/sites-available/shakti-yoga /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 8. Setup SSL
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 9. Verify
- Visit: `https://your-domain.com`
- Check logs: `pm2 logs shakti-yoga`
- MinIO Console: `http://your-vps-ip:9001`

## 📝 Important Notes

1. **Change all default passwords** before going to production
2. **Update domain names** in nginx.conf and .env
3. **Secure MinIO ports** (9000, 9001) - consider restricting access
4. **Run database seed** after first deployment: `npm run db:seed`

## 🔧 Common Commands

```bash
# View logs
pm2 logs shakti-yoga

# Restart app
pm2 restart shakti-yoga

# Database migrations
npm run db:migrate

# Database seed
npm run db:seed

# Prisma Studio (database GUI)
npm run db:studio
```

## 🆘 Troubleshooting

**App won't start:**
```bash
pm2 logs shakti-yoga
# Check for errors
```

**Database connection issues:**
```bash
docker ps | grep postgres
docker logs shakti-postgres
```

**MinIO issues:**
```bash
docker ps | grep minio
docker logs shakti-minio
```

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

