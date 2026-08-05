#!/bin/bash
# ==============================================================================
# InstaBot AI Studio - VPS Installation & Management Interactive Script
# ==============================================================================
# Project: Instagram Automation Studio & AI Content Generator
# Author: InstaBot DevOps Team
# ==============================================================================

set -e

# Colors for Terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

LOG_FILE="install.log"
INSTALL_DIR=$(pwd)
CREDENTIALS_FILE="/root/.instabot_credentials.txt"

log() {
  local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
  echo -e "$2$msg${NC}"
  echo "$msg" >> "$LOG_FILE"
}

print_header() {
  clear
  echo -e "${CYAN}======================================================================${NC}"
  echo -e "${BOLD}${PURPLE}     🤖 اسکریپت نصب و مدیریت ربات اتوماسیون هوشمند اینستاگرام (VPS)     ${NC}"
  echo -e "${CYAN}======================================================================${NC}"
  echo -e "${YELLOW} مسیر جاری: ${INSTALL_DIR}${NC}"
  echo -e "${CYAN}----------------------------------------------------------------------${NC}"
}

check_root() {
  if [ "$EUID" -ne 0 ]; then
    log "لطفاً اسکریپت را با دسترسی root اجرا کنید (sudo ./install.sh)" "${RED}"
    exit 1
  fi
}

install_prerequisites() {
  print_header
  log "شروع مرحله ۱: بررسی و نصب پیش‌نیازها و راه‌اندازی پروژه..." "${BLUE}"

  # OS Detection
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
  else
    OS=$(uname -s)
  fi
  log "سیستم‌عامل تشخیص داده شد: $OS" "${GREEN}"

  log "در حال بروزرسانی پکیج‌های سیستم..." "${YELLOW}"
  apt-get update -y && apt-get upgrade -y || true

  # Check & Install Required Packages
  PACKAGES="curl git wget ufw certbot python3-certbot-nginx ca-certificates gnupg"
  for pkg in $PACKAGES; do
    if ! dpkg -s $pkg >/dev/null 2>&1; then
      log "در حال نصب $pkg..." "${YELLOW}"
      apt-get install -y $pkg
    fi
  done

  # Docker Installation Check
  if ! command -v docker &> /dev/null; then
    log "داکر یافت نشد. در حال نصب Docker..." "${YELLOW}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    log "Docker با موفقیت نصب شد." "${GREEN}"
  else
    log "Docker از قبل نصب شده است." "${GREEN}"
  fi

  # Docker Compose Check
  if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log "Docker Compose یافت نشد. در حال نصب..." "${YELLOW}"
    apt-get install -y docker-compose-plugin || apt-get install -y docker-compose
    log "Docker Compose با موفقیت نصب شد." "${GREEN}"
  fi

  # Interactive .env Generation
  echo -e "\n${BOLD}${CYAN}--- پیکربندی تنظیمات اولیه (.env) ---${NC}"
  
  if [ -f .env ]; then
    echo -e "${YELLOW}فایل .env از قبل موجود است. آیا می‌خواهید بازنویسی شود؟ (y/N):${NC} "
    read -r REWRITE_ENV
    if [[ ! "$REWRITE_ENV" =~ ^[Yy]$ ]]; then
      log "استفاده از تنظیمات .env موجود." "${GREEN}"
    else
      CREATE_NEW_ENV=true
    fi
  else
    CREATE_NEW_ENV=true
  fi

  if [ "$CREATE_NEW_ENV" = true ]; then
    echo -e "${CYAN}لطفاً اولین کلید Google Gemini API را وارد کنید:${NC}"
    read -r GEMINI_KEY
    GEMINI_KEY=${GEMINI_KEY:-"MY_GEMINI_API_KEY"}

    echo -e "${CYAN}رمز عبور پنل مدیریت (Admin Password):${NC}"
    read -r ADMIN_PASS
    ADMIN_PASS=${ADMIN_PASS:-"admin123456"}

    echo -e "${CYAN}پورت اجرایی برنامه (پیش‌فرض: 3000):${NC}"
    read -r PORT
    PORT=${PORT:-"3000"}

    cat <<EOF > .env
# InstaBot Environment Configuration
NODE_ENV=production
PORT=$PORT
GEMINI_API_KEY=$GEMINI_KEY
ADMIN_PASSWORD=$ADMIN_PASS
POSTGRES_USER=instabot
POSTGRES_PASSWORD=$(openssl rand -hex 12 2>/dev/null || echo "secDbPass123")
POSTGRES_DB=instabot_db
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://instabot:secDbPass123@db:5432/instabot_db
APP_URL=http://localhost:$PORT
EOF
    log "فایل .env با موفقیت ساخته شد." "${GREEN}"
  fi

  # Ensure Docker network and containers up
  log "در حال ساخت و اجرای کانتینرها با Docker Compose..." "${BLUE}"
  if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
  else
    docker compose up -d --build
  fi

  # Save credentials file securely
  mkdir -p /root
  cat <<EOF > "$CREDENTIALS_FILE"
======================================================================
     اطلاعات دسترسی به ربات اتوماسیون اینستاگرام
======================================================================
تاریخ نصب: $(date)
مسیر نصب: $INSTALL_DIR
آدرس محلی: http://localhost:${PORT:-3000}
نام کاربری: admin
رمز عبور: ${ADMIN_PASS:-admin123456}
======================================================================
EOF
  chmod 600 "$CREDENTIALS_FILE"

  log "نصب کامل شد! اطلاعات دسترسی در $CREDENTIALS_FILE ذخیره شد." "${GREEN}"
  echo -e "\n${GREEN}✔ سرویس‌ها در حال اجرا هستند. جهت ورود به پنل، به پورت ${PORT:-3000} مراجعه کنید.${NC}\n"
  read -p "کلید Enter را برای بازگشت به منو فشار دهید..."
}

setup_domain_ssl() {
  print_header
  log "مرحله ۲: پیکربندی دامنه و گواهی رایگان SSL (Let's Encrypt)" "${BLUE}"

  echo -e "${CYAN}لطفاً نام دامنه خود را وارد کنید (مثلاً: insta.yourdomain.com):${NC}"
  read -r DOMAIN_NAME

  if [ -z "$DOMAIN_NAME" ]; then
    log "نام دامنه وارد نشد. لغو عملیات." "${RED}"
    read -p "کلید Enter را فشار دهید..."
    return
  fi

  log "در حال بررسی رکورد DNS (A Record) برای $DOMAIN_NAME..." "${YELLOW}"
  SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
  RESOLVED_IP=$(getent ahosts "$DOMAIN_NAME" | awk '{ print $1 }' | head -n 1 || echo "")

  echo -e "آی‌پی سرور شما: ${BOLD}$SERVER_IP${NC}"
  echo -e "آی‌پی رکورد دامنه: ${BOLD}$RESOLVED_IP${NC}"

  if [ "$SERVER_IP" != "$RESOLVED_IP" ]; then
    echo -e "${RED}هشدار: رکورد DNS دامنه هنوز به آی‌پی سرور اشاره نمی‌کند یا انتشار DNS کامل نشده است!${NC}"
    echo -e "${YELLOW}آیا می‌خواهید با این وجود ادامه دهید؟ (y/N):${NC}"
    read -r IGNORE_DNS
    if [[ ! "$IGNORE_DNS" =~ ^[Yy]$ ]]; then
      log "توقف عملیات صدور SSL جهت بررسی تنظیمات DNS." "${YELLOW}"
      read -p "کلید Enter را فشار دهید..."
      return
    fi
  fi

  # Configure Nginx Reverse Proxy
  log "در حال ساخت تنظیمات Reverse Proxy در Nginx..." "${YELLOW}"
  cat <<EOF > "/etc/nginx/sites-available/$DOMAIN_NAME"
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

  ln -sf "/etc/nginx/sites-available/$DOMAIN_NAME" "/etc/nginx/sites-enabled/"
  nginx -t && systemctl reload nginx

  log "در حال درخواست گواهی SSL از Let's Encrypt..." "${BLUE}"
  certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "admin@$DOMAIN_NAME" || {
    log "خطا در صدور SSL. مطمئن شوید پورت ۸۰ باز است و DNS تنظیم شده است." "${RED}"
    read -p "کلید Enter را فشار دهید..."
    return
  }

  log "گواهی SSL با موفقیت فعال شد! آدرس امن شما: https://$DOMAIN_NAME" "${GREEN}"
  read -p "کلید Enter را فشار دهید..."
}

update_project() {
  print_header
  log "مرحله ۳: بروزرسانی سورس‌کد و کانتینرها..." "${BLUE}"
  if [ -d .git ]; then
    log "در حال دریافت آخرین تغییرات از Git..." "${YELLOW}"
    git pull origin main || git pull || true
  fi

  log "در حال بازسازی ایمیج‌ها و ریستارت کانتینرها..." "${YELLOW}"
  if command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose up -d --build
  else
    docker compose down
    docker compose up -d --build
  fi

  log "بروزرسانی با موفقیت انجام شد." "${GREEN}"
  read -p "کلید Enter را فشار دهید..."
}

backup_database() {
  print_header
  log "مرحله ۴: پشتیبان‌گیری از دیتابیس و فایل‌های پیکربندی..." "${BLUE}"
  BACKUP_DIR="${INSTALL_DIR}/backups"
  mkdir -p "$BACKUP_DIR"
  TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
  BACKUP_FILE="${BACKUP_DIR}/instabot_backup_${TIMESTAMP}.tar.gz"

  log "در حال بسته‌بندی فایل‌ها و دیتابیس..." "${YELLOW}"
  tar -czf "$BACKUP_FILE" --exclude='./node_modules' --exclude='./dist' --exclude='./backups' .env src/ data/ 2>/dev/null || true

  log "بکاپ با موفقیت در مسیر $BACKUP_FILE ذخیره گردید." "${GREEN}"
  read -p "کلید Enter را فشار دهید..."
}

view_logs() {
  print_header
  log "مرحله ۵: نمایش لاگ زنده سرویس‌ها (برای خروج Ctrl+C را بزنید)..." "${BLUE}"
  if command -v docker-compose &> /dev/null; then
    docker-compose logs -f --tail=100
  else
    docker compose logs -f --tail=100
  fi
}

uninstall_bot() {
  print_header
  echo -e "${RED}${BOLD}⚠️  هشدار جدی: حذف کامل ربات غیرقابل بازگشت است!${NC}"
  echo -e "${YELLOW}تمام کانتینرها، ایمیج‌ها، تنظیمات و اطلاعات پاک خواهد شد.${NC}\n"

  echo -e "آیا قبل از حذف، تمایل به گرفتن پشتیبان (Backup) دارید؟ (Y/n): "
  read -r DO_BACKUP
  if [[ ! "$DO_BACKUP" =~ ^[Nn]$ ]]; then
    backup_database
  fi

  echo -e "${RED}آیا از حذف کامل ربات اطمینان دارید؟ تایپ کنید 'DELETE':${NC} "
  read -r CONFIRM
  if [ "$CONFIRM" != "DELETE" ]; then
    log "عملیات حذف لغو گردید." "${GREEN}"
    read -p "کلید Enter را فشار دهید..."
    return
  fi

  log "در حال توقف و پاکسازی کانتینرهای داکر..." "${RED}"
  if command -v docker-compose &> /dev/null; then
    docker-compose down -v --rmi all 2>/dev/null || true
  else
    docker compose down -v --rmi all 2>/dev/null || true
  fi

  log "حذف فایل‌های ذخیره‌شده و کانفیگ‌ها..." "${RED}"
  rm -f "$CREDENTIALS_FILE"
  rm -rf dist node_modules

  log "پاکسازی با موفقیت انجام پذیرفت." "${GREEN}"
  read -p "کلید Enter را فشار دهید..."
}

# Main Interactive Loop
check_root

while true; do
  print_header
  echo -e "  ${BOLD}${GREEN}1)${NC} نصب کامل + پیش‌نیازها (Full Install & Setup)"
  echo -e "  ${BOLD}${GREEN}2)${NC} تعریف دامنه و صدور SSL (Domain & Let's Encrypt)"
  echo -e "  ${BOLD}${GREEN}3)${NC} بروزرسانی پروژه (Git Pull & Rebuild)"
  echo -e "  ${BOLD}${GREEN}4)${NC} پشتیبان‌گیری از دیتابیس (Backup)"
  echo -e "  ${BOLD}${GREEN}5)${NC} مشاهده لاگ سرویس‌ها (Service Logs)"
  echo -e "  ${BOLD}${GREEN}6)${NC} حذف کامل ربات (Uninstall)"
  echo -e "  ${BOLD}${RED}0)${NC} خروج (Exit)"
  echo -e "${CYAN}======================================================================${NC}"
  echo -n -e "${BOLD}گزینه مورد نظر را انتخاب کنید [0-6]: ${NC}"
  read -r CHOICE

  case $CHOICE in
    1) install_prerequisites ;;
    2) setup_domain_ssl ;;
    3) update_project ;;
    4) backup_database ;;
    5) view_logs ;;
    6) uninstall_bot ;;
    0) echo -e "\n${GREEN}با تشکر از استفاده شما. خروج...${NC}\n"; exit 0 ;;
    *) echo -e "${RED}گزینه نامعتبر است!${NC}"; sleep 1 ;;
  esac
done
