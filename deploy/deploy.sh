#!/bin/bash
# ============================================
# WMS 部署脚本（在服务器上执行）
# 用法: cd /opt/wms && bash deploy/deploy.sh
# ============================================

set -e

PROJECT_DIR="/opt/wms"
cd "$PROJECT_DIR"

echo "===== 1. 拉取最新代码 ====="
git pull origin main

echo "===== 2. 构建后端 JAR ====="
cd "$PROJECT_DIR/wms"
mvn clean package -P prod -DskipTests -q
echo "后端构建完成: $(ls -lh ruoyi-admin-wms/target/ruoyi-admin-wms.jar)"

echo "===== 3. 构建并启动 Docker 容器 ====="
cd "$PROJECT_DIR"
docker compose down
docker compose up -d --build

echo "===== 4. 等待服务启动 ====="
echo "等待 30 秒让服务完全启动..."
sleep 30

echo "===== 5. 检查服务状态 ====="
docker compose ps

echo ""
echo "============================================"
echo "  部署完成！"
echo "  访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo '你的服务器IP')"
echo "============================================"
