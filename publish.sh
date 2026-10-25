#!/usr/bin/env zsh
set -e

APP_NAME="buddham"
REMOTE_HOST="Ubuntu-server"
REMOTE_BASE_DIR="/var/www/${APP_NAME}"
LOCAL_DIST_DIR="dist/buddham-co-kr"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "${YELLOW}🔨 Building Angular application...${NC}"
ng build --configuration=production || {
    echo "${RED}❌ Build failed${NC}"
    exit 1
}

if [[ ! -d "$LOCAL_DIST_DIR" ]]; then
    echo "${RED}❌ Error: Build directory not found: $LOCAL_DIST_DIR${NC}"
    exit 1
fi

RELEASE=$(date +%Y%m%d_%H%M%S)
REMOTE_RELEASE_DIR="${REMOTE_BASE_DIR}/releases/${RELEASE}"

echo "${GREEN}📦 Release: $RELEASE${NC}"
echo "${GREEN}🚀 Deploying to ${REMOTE_HOST}...${NC}"

echo "${YELLOW}▶ Creating release directory...${NC}"
ssh ${REMOTE_HOST} "mkdir -p ${REMOTE_RELEASE_DIR}"

echo "${YELLOW}▶ Transferring files...${NC}"
rsync -avz \
    --delete \
    --progress \
    -e "ssh" \
    ${LOCAL_DIST_DIR}/ \
    ${REMOTE_HOST}:${REMOTE_RELEASE_DIR}/

echo "${YELLOW}▶ Setting permissions and updating symlink...${NC}"
ssh ${REMOTE_HOST} bash << EOF
    # 권한 변경 (sudo 없이 먼저 시도)
    find ${REMOTE_RELEASE_DIR} -type d -exec chmod 755 {} + 2>/dev/null || true
    find ${REMOTE_RELEASE_DIR} -type f -exec chmod 644 {} + 2>/dev/null || true

    # 심볼릭 링크 (sudo 없이)
    ln -sfn ${REMOTE_RELEASE_DIR} ${REMOTE_BASE_DIR}/current

    echo "✅ Permissions and symlink updated"
EOF

# sudo 권한이 필요한 작업은 별도로 실행
echo "${YELLOW}▶ Updating ownership (requires sudo)...${NC}"
# ssh -t ${REMOTE_HOST} "sudo chown -R www-data:www-data ${REMOTE_RELEASE_DIR} && sudo chown -h www-data:www-data ${REMOTE_BASE_DIR}/current"
# 옛날 릴리즈 5개만 보관하고 이전 것은 자동 삭제 (서버에서 실행)
ssh -t ${REMOTE_HOST} "sudo chown -R www-data:www-data ${REMOTE_RELEASE_DIR} && sudo chown -h www-data:www-data ${REMOTE_BASE_DIR}/current && \
    cd ${REMOTE_BASE_DIR}/releases && ls -dt */ | tail -n +6 | sudo xargs -r rm -rf"
echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}🎉 Deployment successful!${NC}"
echo "${GREEN}📍 Release: $RELEASE${NC}"
echo "${GREEN}🔗 Current: ${REMOTE_BASE_DIR}/current -> releases/${RELEASE}${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
