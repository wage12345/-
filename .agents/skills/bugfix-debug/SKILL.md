---
name: bugfix-debug
description: 面向当前仓库的故障定位与修复技能，适用于 Express 路由、EJS 页面、MySQL 查询、Docker 运行和 CI 报错场景。
allowed-tools:
  - filesystem
  - git
---

# Bugfix Debug

你正在修复学生管理系统中的缺陷。重点是快速定位根因、给出可验证修复，并保留实验工程的已有结构。

## 使用时机

- 用户提供报错堆栈、异常页面、测试失败或容器启动失败信息
- 登录、学生管理、班级管理、导出、数据库初始化等功能出现问题
- GitHub Actions、Docker Compose、MySQL 连接或 session 流程异常

## 排查顺序

1. 先确认问题所在层次：路由、控制器、模型、视图、数据库、容器或 CI。
2. 对照 `app.js`、相关 route、controller 和 model 的调用链。
3. 涉及数据库时同时检查 `config/db.js`、`config/schemaSync.js` 和 `init.sql`。
4. 涉及部署时检查 `Dockerfile`、`docker-compose.yml` 和 `.github/workflows/`。
5. 修复后必须运行对应验证：`npm test`、`npm run lint`、`docker compose config` 或定向接口测试。

## 输出要求

- 先说明根因，再说明修复点。
- 给出受影响文件。
- 明确写出已完成的验证和未验证部分。
