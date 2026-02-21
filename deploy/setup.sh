#!/bin/bash
# ============================================
# WMS 云服务器初始化脚本
# 适用于: Ubuntu 22.04 (腾讯云/阿里云轻量应用服务器)
# 用法:  ssh root@你的服务器IP 'bash -s' < deploy/setup.sh
# ============================================

set -e

echo "===== 1. 更新系统 ====="
apt-get update -y && apt-get upgrade -y

echo "===== 2. 安装 Docker ====="
# 使用阿里云镜像安装 Docker（国内速度快）
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "===== 3. 配置 Docker 镜像加速 ====="
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
EOF
systemctl daemon-reload
systemctl restart docker
systemctl enable docker

echo "===== 4. 安装 JDK 17 + Maven（用于构建后端） ====="
apt-get install -y openjdk-17-jdk-headless maven

echo "===== 5. 配置 Maven 使用阿里云镜像 ====="
mkdir -p /root/.m2
cat > /root/.m2/settings.xml <<'EOF'
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>*</mirrorOf>
      <name>Alibaba Cloud Maven Mirror</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
EOF

echo "===== 6. 安装 Git ====="
apt-get install -y git

echo "===== 7. 创建项目目录 ====="
mkdir -p /opt/wms

echo "===== 8. 开放防火墙端口 ====="
# UFW 防火墙（如果启用了的话）
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    echo "UFW 规则已添加（80, 443, 22）"
fi
# 注意：腾讯云/阿里云还需要在控制台的安全组中放行 80 端口！

echo ""
echo "============================================"
echo "  服务器初始化完成！"
echo "============================================"
echo ""
echo "  Docker:  $(docker --version)"
echo "  Java:    $(java --version 2>&1 | head -1)"
echo "  Maven:   $(mvn --version 2>&1 | head -1)"
echo "  Git:     $(git --version)"
echo ""
echo "  下一步："
echo "  1. 在云控制台的【安全组】中放行 80 端口"
echo "  2. 将代码克隆到 /opt/wms"
echo "  3. 配置 GitHub Actions（参考 .github/workflows/deploy.yml）"
echo "============================================"
