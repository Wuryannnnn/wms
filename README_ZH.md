# The Infinite Cafe - WMS 仓库管理系统

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-blue.svg)]()
[![JDK-17](https://img.shields.io/badge/JDK-17-green.svg)]()
[![Vue-3](https://img.shields.io/badge/Vue-3.2-brightgreen.svg)]()

[English](./README.md) | **中文**

The Infinite Cafe WMS 是一套仓库管理系统，用于管理仓库的入库、出库、移库、盘库等日常操作，提供库存看板、库存预警和数据可视化大屏，支持入库单/出库单的网页打印。

## 功能特性

- 仓库/库区管理：维护仓库基础数据
- 物料管理：管理物料信息
- 客户/供应商管理：联系人数据维护
- 入库管理：采购入库、外协入库、退货入库，支持网页打印
- 出库管理：销售出库、外协出库、调拨出库，支持网页打印
- 移库管理：库存在仓库间转移
- 盘库管理：库存盘点
- 库存看板：按仓库、库区、商品三维度查看库存
- 库存记录/明细：完整的操作记录追溯
- 数据大屏：首页可视化仪表盘

## 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    用户浏览器                         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP :80
┌─────────────────────▼───────────────────────────────┐
│                 Nginx (前端容器)                      │
│  ┌────────────────────┐  ┌────────────────────────┐ │
│  │   Vue 3 静态文件     │  │  /prod-api → 反向代理   │ │
│  │   (Vite 构建)       │  │  转发至后端 :8080       │ │
│  └────────────────────┘  └───────────┬────────────┘ │
└──────────────────────────────────────┼──────────────┘
                                       │
┌──────────────────────────────────────▼──────────────┐
│              Spring Boot 后端 (Java 17)              │
│                                                      │
│  Sa-Token 认证  │  MyBatis-Plus ORM  │  Redisson 缓存 │
└─────────┬────────────────┬───────────────┬──────────┘
          │                │               │
    ┌─────▼─────┐   ┌─────▼─────┐  ┌─────▼─────┐
    │  MySQL 8   │   │  Redis 7  │  │  OSS 存储  │
    │  数据持久化  │   │  会话/缓存 │  │  (可选)    │
    └───────────┘   └───────────┘  └───────────┘
```

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 + Vite | 3.2 |
| UI 组件库 | Element Plus | 2.2 |
| 状态管理 | Pinia | 2.0 |
| 后端框架 | Spring Boot | 3.2.6 |
| ORM | MyBatis-Plus | 3.5.6 |
| 认证 | Sa-Token + JWT | 1.37 |
| 缓存 | Redis + Redisson | 7 / 3.29 |
| 数据库 | MySQL | 8.0 |
| 容器化 | Docker + Docker Compose | - |
| CI/CD | GitHub Actions | - |

### 项目结构

```
wms/
├── docker-compose.yml              # Docker 编排配置
├── deploy/
│   ├── setup.sh                    # 服务器初始化脚本
│   └── deploy.sh                   # 部署执行脚本
├── wms/                            # 后端 (Spring Boot)
│   ├── ruoyi-admin-wms/            # 主应用入口
│   │   ├── Dockerfile
│   │   └── src/main/resources/
│   │       ├── application.yml     # 通用配置
│   │       ├── application-dev.yml # 开发环境
│   │       └── application-prod.yml# 生产环境 (Docker)
│   ├── ruoyi-common/               # 公共模块
│   ├── ruoyi-modules/              # 业务模块
│   │   ├── ruoyi-system/           #   系统管理
│   │   └── ruoyi-generator/        #   代码生成
│   └── script/sql/wms.sql          # 数据库初始化脚本
└── WMS-VUE/                        # 前端 (Vue 3)
    ├── Dockerfile
    ├── nginx.conf                  # Nginx 配置
    └── src/
        ├── api/                    # API 接口
        ├── views/                  # 页面
        ├── components/             # 组件
        ├── store/                  # 状态管理
        ├── router/                 # 路由
        └── utils/                  # 工具函数
```

## 本地开发

### 环境要求

- JDK 17
- Maven 3.8+
- Node.js 18+
- MySQL 8.0
- Redis 7

### 启动后端

```bash
cd wms

# 配置数据库：编辑 ruoyi-admin-wms/src/main/resources/application-dev.yml
# 修改 MySQL 和 Redis 连接信息

mvn clean package -DskipTests
java -jar ruoyi-admin-wms/target/ruoyi-admin-wms.jar
```

### 启动前端

```bash
cd WMS-VUE

npm install --registry=https://registry.npmmirror.com
npm run dev

# 访问 http://localhost:80
```

## Docker 部署

系统通过 Docker Compose 一键部署，包含 4 个容器：

| 容器 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| wms-mysql | mysql:8.0 | 3306 | 数据库，首次启动自动导入 wms.sql |
| wms-redis | redis:7-alpine | 6379 | 缓存和会话存储 |
| wms-backend | 自构建 (Java 17) | 8080 | Spring Boot 后端 |
| wms-frontend | 自构建 (Nginx) | **80** | 前端 + 反向代理 |

### 部署到云服务器

**1. 初始化服务器**（Ubuntu 22.04，首次执行一次）

```bash
# 在本地执行，自动安装 Docker、JDK 17、Maven、Git
ssh root@你的服务器IP 'bash -s' < deploy/setup.sh
```

安装完成后，到云控制台的**安全组/防火墙**中放行 **80** 端口。

**2. 部署应用**

```bash
ssh root@你的服务器IP

# 克隆代码到服务器
git clone https://github.com/Wuryannnnn/wms.git /opt/wms
cd /opt/wms

# 一键部署
bash deploy/deploy.sh
```

**3. 验证**

```bash
docker compose ps              # 4 个服务全部 Up
docker compose logs backend    # 看到 "Started" 表示成功
```

浏览器访问 `http://服务器IP` 即可看到登录页。

默认管理员账号：`admin`，密码：`wuxiankafei@2026`

### 常用运维命令

```bash
cd /opt/wms

docker compose ps              # 查看服务状态
docker compose logs -f         # 查看实时日志
docker compose logs backend    # 查看后端日志
docker compose restart backend # 重启后端
docker compose down            # 停止所有服务
docker compose up -d           # 启动所有服务
```

## CI/CD 自动部署

项目使用 GitHub Actions 实现持续部署，push 到 `main` 分支后自动部署到服务器。

```
git push → GitHub Actions → SSH 到服务器 → 拉代码 → 构建 → docker compose up
```

### 配置步骤

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中添加：

| Secret | 值 |
|--------|------|
| `SERVER_HOST` | 服务器公网 IP |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | SSH 私钥内容 |

配置完成后，每次 push 到 main 会自动触发部署。也可以在 GitHub Actions 页面手动触发（workflow_dispatch）。

### CI/CD 流程

```
┌──────────┐     ┌──────────────────┐     ┌──────────────────┐
│ git push │────▶│  GitHub Actions   │────▶│    云服务器        │
│ to main  │     │                  │     │                  │
└──────────┘     │ 1. SSH 连接服务器  │     │ 1. git pull      │
                 │ 2. 执行部署命令    │     │ 2. mvn package   │
                 │                  │     │ 3. docker compose│
                 └──────────────────┘     │    up --build    │
                                          └──────────────────┘
```

## 环境配置说明

| 环境 | Profile | 配置文件 | MySQL 地址 | Redis 地址 |
|------|---------|---------|-----------|-----------|
| 开发 | dev | application-dev.yml | localhost:3307 | localhost:6379 |
| 生产 | prod | application-prod.yml | mysql:3306 (Docker 内部) | redis:6379 (Docker 内部) |

生产环境通过 Docker 网络互通，服务间使用容器名（`mysql`、`redis`）作为主机名。

## 仓库地址

https://github.com/Wuryannnnn/wms.git

## License

[MIT](LICENSE)
