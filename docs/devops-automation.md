# DevOps 自动化说明

本项目已补充持续集成、代码扫描、镜像发布与容器化部署说明，核心文件如下：

- [.github/workflows/ci.yml](/C:/Users/塬森/Desktop/student-management-system/.github/workflows/ci.yml)
- [.github/workflows/codeql.yml](/C:/Users/塬森/Desktop/student-management-system/.github/workflows/codeql.yml)
- [.github/workflows/cd.yml](/C:/Users/塬森/Desktop/student-management-system/.github/workflows/cd.yml)
- [Dockerfile](/C:/Users/塬森/Desktop/student-management-system/Dockerfile)
- [docker-compose.yml](/C:/Users/塬森/Desktop/student-management-system/docker-compose.yml)

## 1. CI

`ci.yml` 在 `push` / `pull_request` 到 `main` 时自动执行：

- `npm ci`
- `npm run lint`
- `npm test`
- `npm audit --omit=dev --audit-level=high`
- `docker build`

这部分覆盖了代码规范检查、自动化测试、依赖审计与镜像构建。

## 2. CodeQL 代码扫描

`codeql.yml` 用于 GitHub Advanced Security / CodeQL 静态扫描，支持：

- `push`
- `pull_request`
- 每周定时扫描

该工作流补齐了实验要求中的“代码扫描”部分。

## 3. CD

`cd.yml` 监听 `CI` 工作流。当 `main` 分支上的 `CI` 成功完成后，自动执行：

- 登录 GitHub Container Registry
- 构建 Docker 镜像
- 推送镜像到 `ghcr.io/<owner>/student-management-system`

这样可以形成“提交 -> 校验 -> 发布镜像”的持续交付链路。

## 4. Docker 自包含部署

`docker-compose.yml` 现在同时编排：

- `mysql`
- `app`

其中：

- MySQL 自动初始化 `student_manage` 数据库
- `init.sql` 负责初始化表结构和基础数据
- `app` 依赖 `mysql` 健康检查通过后再启动

运行方式：

```powershell
docker compose up -d --build
```

停止方式：

```powershell
docker compose down
```

如需同时删除数据库卷：

```powershell
docker compose down -v
```
