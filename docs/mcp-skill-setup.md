# MCP 与 Skill 配置说明

本项目已补充仓库级 Codex 配置文件 [.codex/config.toml](/C:/Users/塬森/Desktop/student-management-system/.codex/config.toml) 与团队级 Skill 资产目录 [.agents/skills](/C:/Users/塬森/Desktop/student-management-system/.agents/skills)。

## 1. MCP 服务

当前项目启用了两个标准 MCP 服务：

- `filesystem`：通过 `@modelcontextprotocol/server-filesystem` 暴露当前仓库目录
- `git`：通过 `mcp-server-git` 提供当前仓库的 Git 读写上下文

配置文件位于：

- [.codex/config.toml](/C:/Users/塬森/Desktop/student-management-system/.codex/config.toml)

使用前需要满足以下前置条件：

- 本机可执行 `npx`
- 本机已安装 `uv`，从而可执行 `uvx`

如果仓库移动到其他路径，需要同步修改 `.codex/config.toml` 中的仓库绝对路径。

## 2. 团队级 Skill 资产

当前已将“重构”和“修复”两类高频提示词封装为仓库级 Skill：

- [.agents/skills/refactor-review/SKILL.md](/C:/Users/塬森/Desktop/student-management-system/.agents/skills/refactor-review/SKILL.md)
- [.agents/skills/bugfix-debug/SKILL.md](/C:/Users/塬森/Desktop/student-management-system/.agents/skills/bugfix-debug/SKILL.md)

其中定义了：

- 适用场景
- 允许使用的上下文工具
- 推荐排查/重构流程
- 输出要求与验证要求

这样做的目的，是把原先散落在 `docs/skill-prompts.md` 中的提示词，升级为可复用的团队资产。

## 3. 实验报告可写结论

可描述为：

> 项目已完成标准文件系统与 Git MCP 服务配置，并在仓库内建立团队级 Skill 资产目录，将代码重构与缺陷修复提示词固化为可复用的技能说明文件，实现了从“文档提示词”向“可执行协作资产”的转化。
