# 快速开始

## 构建

仓库根目录：

```bash
./build.sh
```

或分别构建：

```bash
# 前端
cd ui && yarn && yarn build

# 后端（嵌入 ui 产物，见 build.sh）
go build -o simplebased ./cmd/simplebased
```

本地前后端一起跑：

```bash
./build.sh dev
```

默认前端 `http://127.0.0.1:5173`（Vite 将 `/v1`、`/health`、`/ws` 代理到后端 `:8080`）。

## 配置

复制 `config.example.yaml` 为 `config.yaml`，或使用 `SIMPLEBASE_` 前缀环境变量。生产凭据（S3 密钥、catalog token、`server_secret`）必须从环境变量或 IAM 角色注入，禁止写入配置文件。

开发模式（`SIMPLEBASE_DEV_MODE=true`）可旁路真实 S3。DevMode 种子 Key：

```text
sb_live_dev_key_12345
```

在控制台右上角「连接设置」填入该 Key。

## 运行

```bash
./simplebased
```

默认监听 `:8080`。健康检查：

- `GET /health/live` — 进程存活
- `GET /health/ready` — Catalog 可用 + S3 可达

## 打开文档

控制台顶栏 **使用文档** 在新标签打开 `/docs`。也可直接访问：

- `/docs` — 默认进入本站首页（简介）
- `/docs/guide/quickstart` — 本页
- `/docs/ops/deployment` — 部署文档

## 下一步

- 生产部署约束见 [部署](/docs/ops/deployment)
- 从旧链路迁库见 [迁移指南](/docs/ops/migration)
