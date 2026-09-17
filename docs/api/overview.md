# HTTP API

所有业务路由位于 `/v1/projects/:projectID/...`，需 `Authorization: Bearer <api-key>`，并按 project 上下文校验权限。

## 数据库管理

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/v1/projects/:p/databases` | `database:admin` | 创建 logical database |
| GET | `/v1/projects/:p/databases` | `database:read` | 列出 project 下数据库 |
| GET | `/v1/projects/:p/databases/:id` | `database:read` | 查询状态与容量 |
| POST | `/v1/projects/:p/databases/:id/open` | `database:admin` | 预热数据库 |
| POST | `/v1/projects/:p/databases/:id/close` | `database:admin` | 释放本地资源 |
| POST | `/v1/projects/:p/databases/:id/backups` | `database:admin` | 创建独立恢复点 |
| POST | `/v1/projects/:p/databases/:id/restore` | `database:admin` | 恢复为新库后受控切换 |
| DELETE | `/v1/projects/:p/databases/:id` | `database:admin` | 软删除，异步清理 S3 |

## SQL 执行

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/v1/projects/:p/databases/:id/query` | `database:read` | 参数化查询 |
| POST | `/v1/projects/:p/databases/:id/execute` | `database:write` | 单条写语句 |
| POST | `/v1/projects/:p/databases/:id/batch` | `database:write` | 批量事务 |

约束：参数化 SQL、强制 context deadline、最大返回行数、请求体大小与并发数限制。

## LLM Gateway

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/v1/projects/:p/llm/chat` | `database:read` | 非流式 Chat |
| POST | `/v1/projects/:p/llm/stream` | `database:read` | SSE 流式响应 |
| GET | `/v1/projects/:p/llm/providers` | `database:read` | 列出允许的 provider/model |

## 配额与审计

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/v1/projects/:p/quota` | `database:read` | 当前配额使用 |
| GET | `/v1/projects/:p/audit` | `database:read` | 操作审计记录 |

完整字段与错误码见仓库 `plan/planv2.0/proto-http.md`。部署约束见 [部署](/docs/ops/deployment)。
