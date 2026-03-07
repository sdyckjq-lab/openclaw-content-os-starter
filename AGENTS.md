# AGENTS.md
给会在本仓库内工作的 agent 使用。
目标：先按仓库真实结构做判断，再做最小必要修改。

## 仓库定位
- 这是 OpenClaw 内容系统 starter，不是传统 Web 应用。
- 主要内容在 `docs/`、`templates/`、`skills/`、`scripts/`。
- 运行面是 Bash 包装脚本 + Node ESM 启动脚本。
- 核心逻辑在 `scripts/bootstrap/install.mjs` 和 `scripts/bootstrap/check.mjs`。
- 不要先假设存在 `package.json`、前端构建链、数据库或 HTTP 服务端。

## 规则来源
优先参考：
- `README.md`
- `docs/quickstart.md`
- `docs/testing-sandbox.md`
- `docs/maintainer-safety.md`
- `docs/security.md`
- `docs/roadmap.md`
- `docs/local-reference-rules.md`
- `docs/agency-agents-learning-checklist.md`
- `docs/public-safe-content-contract.md`
- `scripts/install.sh`
- `scripts/check.sh`
- `scripts/sandbox-test.sh`
- `scripts/bootstrap/install.mjs`
- `scripts/bootstrap/check.mjs`
- `templates/openclaw.json5.template`
- `templates/content-system/config/style-guide.md`

补充：
- 本文件是仓库根级规则。
- `templates/workspaces/*/AGENTS.md` 是各角色子规则，改对应 workspace 时要一起看。
- 未发现 `.cursor/rules/`、`.cursorrules`、`.github/copilot-instructions.md`，所以没有额外 Cursor/Copilot 规则。

## 用户协作默认规则
- 如果仓库根目录存在 `USER.md`，优先把它当成当前维护者画像与协作偏好的入口。
- 默认把当前维护者视为零基础用户：不预设会 Git、终端、JSON5、环境变量、OpenClaw 配置结构。
- 第一次提到术语、命令、配置项或英文报错时，要先用中文解释它是什么、为什么要这样做。
- 遇到多步任务时，先给最小可执行计划，再推进实施；结束时明确“现在做到哪里了”和“下一步最推荐做什么”。
- 优先给一个推荐方案和简短理由，不要一次抛出过多并列选项。
- 如果用户提供了本地参考项目或成熟开源实现，先比较是否值得复用或改造，再决定是否从零实现，避免重复造轮子。
- 参考项目默认只用于本地学习、对比和设计参考；除非用户明确要求，不要把外部项目内容直接并入、复制或上传到当前仓库。

## 命令面
这个仓库没有常见的 `npm` / `pnpm` / `yarn` 命令面。
已确认可用：
- 安装：`bash scripts/install.sh`
- 自检：`bash scripts/check.sh`
- 沙箱测试：`bash scripts/sandbox-test.sh`
- Windows 自检：`scripts/check.bat`
安装后常用：
- 已安装副本自检：`bash ~/.openclaw/content-os-starter/scripts/check.sh`
- 打开控制台：`openclaw dashboard`
- 查看网关状态：`openclaw gateway status`
- 重启网关：`openclaw gateway restart`
直接 Node 入口：
- `node scripts/bootstrap/install.mjs`
- `node scripts/bootstrap/check.mjs`
注意：除非你明确知道影响范围，否则不要优先直接跑 `.mjs` 入口。

## Build / Lint / Typecheck / Test
结论要直接，不要编造脚本：
- Build：未提供正式 build 命令。
- Lint：未发现仓库级 ESLint、Prettier、Biome、ShellCheck 配置。
- Typecheck：未提供独立 typecheck 命令。
- Test：未发现 Vitest、Jest、Playwright、Cypress、Bats 等正式测试框架；当前可用的是 Node 原生测试入口 `bash scripts/bootstrap-test.sh`。
- 当前“测试”主要靠 bootstrap 原生测试 + 沙箱安装流程 + 自检脚本。

## 单测与单项验证
这里没有真正意义上的“单个测试文件”。
最接近的单项验证方式：
1. 改 bootstrap 辅助逻辑时，先跑：`bash scripts/bootstrap-test.sh`
2. 改安装相关逻辑时，优先跑：`bash scripts/sandbox-test.sh`
3. 沙箱安装完成后，再跑：`bash "$OPENCLAW_HOME/content-os-starter/scripts/check.sh"`
4. 只改自检逻辑时，可直接跑：`bash scripts/check.sh`
验证原则：
- 不要优先在真实 `~/.openclaw` 上验证安装改动。
- 对安装器的改动，默认走沙箱，因为 `docs/testing-sandbox.md` 明确要求隔离真实环境。
- 默认不要修改你本机真实的 `~/.openclaw/openclaw.json`、`~/.openclaw/.env`、真实 workspace、真实 agent 注册或真实 gateway。
- 如果任务确实需要动真实 OpenClaw 配置，必须先明确说明影响范围，并得到用户确认后再动手。
- 只改文档、模板或 skill 文案时，可以不跑安装，但要核对路径、命名、示例和安全约束。

## 真实环境保护
- 把用户真实 `~/.openclaw` 视为生产环境，不要把仓库开发验证直接做在上面。
- 安装器、自检、gateway、模板合并、agent 注册这类动作，默认先在沙箱验证。
- 优先顺序：`bash scripts/bootstrap-test.sh` -> `bash scripts/sandbox-test.sh` -> `bash "$OPENCLAW_HOME/content-os-starter/scripts/check.sh"`。
- 除非用户明确要求并确认风险，否则不要覆盖、重置、重建或清空真实 OpenClaw 配置。
- 如果只需要验证文案、模板或静态结构，优先用只读检查，不要为了“确认一下”去碰真实环境。

## 路径约定
- 默认 OpenClaw 主目录：`~/.openclaw`
- 默认内容目录：`~/Documents/openclaw-content-os-data`，可被 `CONTENT_OS_HOME` 覆盖
- 首次安装常见 boss workspace：`~/.openclaw/workspace-starter-boss`
- 其他 workspace 通常是：`~/.openclaw/workspace-<当前前缀>-<role>`
- agent id 通常是：`<当前前缀>-<role>`；首次安装常见为 `starter-<role>`
沙箱模式常见环境变量：
- `OPENCLAW_HOME`
- `CONTENT_OS_HOME`
- `OPENCLAW_CONTENT_OS_SANDBOX=1`
- `OPENCLAW_CONTENT_OS_GATEWAY_PORT`

## JavaScript / Node 风格
信号主要来自 `scripts/bootstrap/*.mjs`。
模块与导入：
- 使用 ESM，不用 CommonJS。
- Node 内置模块统一写成 `node:` 前缀，如 `node:fs`、`node:path`。
- 导入放文件顶部，按模块分组，一行一个模块导入。
- 常见写法是命名导入，不混用默认导入。
变量与函数：
- 默认用 `const`，确实需要重赋值时才用 `let`。
- 函数名使用 `lowerCamelCase`。
- 顶层常量也多为 `lowerCamelCase`，不是全大写常量风格。
- 小函数拆分明确，例如 `configGet`、`configSet`、`copyIfNeeded`、`printSummary`。
路径与文件处理：
- 路径统一通过 `join()`、`resolve()`、`dirname()` 处理。
- 不要手写跨平台路径分隔符。
- 操作文件前先判断存在性，常见组合是 `existsSync` + `mkdirSync` / `copyFileSync`。
控制流：
- 偏好早返回，减少多层嵌套。
- 探测型逻辑允许返回 `null` 或 fallback，例如 `tryOpenClaw()`、`configGet()`。
- 真正失败的命令要明确抛错，不吞异常。

## Shell 风格
- 统一使用 `#!/usr/bin/env bash`
- 统一开启 `set -euo pipefail`
- 先计算 `SCRIPT_DIR`，再基于它调用下层脚本
- 包装层尽量薄，只负责定位并 `exec` 到真正入口
- 如果新增 shell 脚本，优先保持同样模式。

## 命名约定
文件名：
- 文档和脚本大量使用 `kebab-case`
- 示例：`sandbox-test.sh`、`provider-guide.md`、`public-safe-content-contract.md`
agent / workspace / skill：
- agent id：优先写成 `<当前前缀>-<role>`，不要假设永远是 `content-*`
- workspace 目录：优先写成 `workspace-<当前前缀>-<role>`；首次安装常见为 `workspace-starter-<role>`
- skill 目录与 skill 名称通常用 `kebab-case`
环境变量：
- 统一使用 `UPPER_SNAKE_CASE`
- 与 starter 相关的变量统一前缀：`OPENCLAW_CONTENT_OS_`
- 提供商 key 变量直接使用品牌名，如 `MINIMAX_API_KEY`、`MOONSHOT_API_KEY`

## 配置与模板风格
- 公共配置模板用 JSON5，允许注释，示例见 `templates/openclaw.json5.template`
- 模板里必须保持脱敏，不放真实 token、真实账号、真实路径
- 示例值应偏“可理解”，而不是追求完整生产配置
- 新增模板字段时，优先和已有字段风格一致：短名字、强语义、少嵌套

## 错误处理与日志
错误处理：
- 外部命令调用统一检查退出状态。
- 失败时输出真实 stderr/stdout 或抛出明确错误。
- 不要写空 `catch {}` 去吞错误语义。
- 只有“探测是否存在”的逻辑才适合 fallback。
日志风格：
- 日志短而直接。
- 常见状态前缀：`[OK]`、`[WARN]`、`[FAIL]`。
- 文件操作日志偏好：`copy:`、`skip:`、`backup:`、`agent added:`。
- 面向用户的说明会直接告诉“下一步做什么”。

## 文档与文案风格
仓库大多数内容写给新手，这一点不能丢。
- 多用短句。
- 先给最小可执行步骤。
- 解释“会做什么”和“不会做什么”。
- 优先给一条能跑通的路径，而不是很多高级选项。
- 避免广告腔和空洞口号。
- 不隐瞒真实难点，但也不要过度抽象。
参考：`README.md`、`docs/quickstart.md`、`templates/content-system/config/style-guide.md`

## 安全与公开仓库约束
这是公开 starter，默认按“可公开发布”标准维护。
绝对不要提交：
- 真实 API key
- 真实 bot token
- 真实 chatId / allowFrom / accountId
- 私有草稿和私有素材
- 真实用户路径
- 私有人设或内部运维信息
优先使用：
- `.env` 或本地私有配置
- 占位符
- 模板文件
- 脱敏后的示例值
动手前先看：
- `docs/security.md`
- `docs/public-safe-content-contract.md`

## 修改建议
- 改安装流程：优先看 `scripts/bootstrap/install.mjs`
- 改自检流程：优先看 `scripts/bootstrap/check.mjs`
- 规划后续扩展路线：优先看 `docs/roadmap.md`
- 参考外部或本地成熟项目：优先看 `docs/local-reference-rules.md`
- 参考 `agency-agents` 的学习顺序：优先看 `docs/agency-agents-learning-checklist.md`
- 改公开配置示例：改 `templates/openclaw.json5.template`
- 改内容系统默认文风：改 `templates/content-system/config/style-guide.md`
- 改角色行为：改对应 `templates/workspaces/<role>/AGENTS.md`、`SOUL.md`、`TOOLS.md`

## Agent 执行守则
- 不要假设存在前端、数据库或 API 服务端代码。
- 不要引入与仓库现状不匹配的工程化工具链。
- 不要编造未存在的测试命令。
- 做安装相关改动时，默认建议用沙箱验证。
- 做公开模板改动时，先检查是否违反安全文档。
- 保持修改小、路径清晰、说明可执行。
