# SimpleBase 简介

SimpleBase 是一套云端数据库控制面：以 **DuckLake** 管理用户数据，以 **S3 兼容对象存储** 作为在线持久层，并提供项目管理、SQL、配额与 Cloud Agent。

本站是控制台内的使用文档。顶栏「使用文档」会打开独立文档壳（文档目录 + 正文），不会套用控制台侧栏。

## 能做什么

- **项目隔离**：租户 / 项目拥有独立 logical database 与 S3 前缀；认证、配额、审计按项目划分。
- **数据库生命周期**：创建、打开、关闭、备份、恢复、删除。
- **SQL**：参数化 query / execute / batch，带超时与行数限制。
- **对象存储**：项目级 S3 对象浏览与上传。
- **Cloud Agent**：只读工具调用，协助排查与操作引导。

## 阅读顺序

1. [快速开始](/docs/guide/quickstart) — 构建、配置、启动
2. [核心概念](/docs/guide/concepts) — 单写实例、S3 持久层、Catalog
3. [控制台概览](/docs/console/overview) — 页面与工作流
4. [部署](/docs/ops/deployment) — 生产约束与 Runbook
5. [HTTP API](/docs/api/overview) — `/v1/projects/:projectID/...` 契约

## 技术栈（服务端）

- Go + Echo v4
- DuckLake（用户库）/ 独立 Catalog
- S3 兼容存储（AWS SDK v2）
- 可选 LLM Gateway（litellm）
