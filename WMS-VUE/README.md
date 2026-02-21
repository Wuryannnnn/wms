# The Infinite Cafe - WMS 前端

[![Vue](https://img.shields.io/badge/Vue-3.2-brightgreen.svg)]()
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.2-blue.svg)]()
[![Vite](https://img.shields.io/badge/Vite-3.2-purple.svg)]()

The Infinite Cafe WMS 仓库管理系统的前端项目，基于 Vue 3 + Element Plus + Vite 构建。

## 本地开发

```bash
# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动开发服务器
npm run dev

# 访问 http://localhost:80
```

## 构建

```bash
# 生产环境构建
npm run build:prod
```

## Docker 部署

前端通过多阶段 Dockerfile 构建：Node 20 编译 → Nginx 提供静态文件服务 + 反向代理后端 API。

详细部署文档请参考后端仓库的 README。
