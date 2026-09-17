# 核心概念

## 单写实例

首期副本数固定为 **1**。所有写请求经同一进程的 Database Registry 路由，保证同一 logical database 只有唯一 writer。滚动升级必须先停旧实例、再启新实例。

## S3 是在线持久层

本地磁盘只作缓存与工作集。节点丢失本地数据后，可仅凭 S3 上的对象与 Catalog 恢复。用户库默认引擎为 DuckLake（SQLite catalog + Parquet）。

## 项目与鉴权

业务路由位于 `/v1/projects/:projectID/...`，需要：

```http
Authorization: Bearer <api-key>
```

权限按 project 校验，典型取值：`database:read` / `database:write` / `database:admin`。

## Catalog 与用户库隔离

平台元数据（租户、项目、数据库登记、API Key、配额、审计）存放在独立 Catalog，与用户 DuckLake 库使用不同前缀和权限，避免用户 SQL 影响控制面。

## 控制台项目上下文

控制台多数页面依赖右上角当前项目。文档站**不**绑定项目：没有项目时仍可阅读本文，不会出现空白内容区。
