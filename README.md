# ts-express-template

后端模板

## 项目说明

默默的 TS-Express 后端模板，集合 esLint、prettier、commitlint 等审查相关库，cz-git、husky等代码提交库

### 项目安装

```shell
npm install
#or
pnpm i
```

### 项目运行

> 项目默认为开发模式，使用下方命令启动

```shell
npm run start
#or
pnpm start
```

> 生产模式启动，使用下方命令，会自动打包并启动

```shell
npm run start:prod
#or
pnpm start:prod
```

### 项目打包

```shell
npm run build
#or
pnpm build
```

## 脚本说明(部分)

```text
"prepare": "husky",                                                     // 每次执行 npm i 时触发，如果 husky 没有初始化，则初始化 husky
"check:type": "vue-tsc --build --noEmit --force",                       // 执行 TypeScript 类型检查，但不生成任何输出文件
"check:prettier": "prettier --check .",                                 // 检查项目所有文件并报告不符合格式化规则的代码
"check": "eslint .",                                                    // 检查项目所有文件并报告不符合格式化和校验规则的代码
"lint": "eslint . --fix",                                               // 检查项目所有文件并自动修改不符合格式化和校验规则的代码
"lint:prettier": "prettier . --write",                                  // 检查项目所有文件并自动修改不符合格式化规则的代码
"lint:commitlint": "commitlint --edit $1",                              // 检查上一次的 commit 信息格式
"lint-staged": "lint-staged",                                           // 检查暂存区所有文件，并自动修复格式及代码规范问题
"lint:diff": "git add . && npm exec lint-staged",                       // 代码暂存 && 格式化和校验（仅检查并修复本次修改的文件）
"commit": "npm run lint:diff && cz",                                    // 代码暂存 && 格式化和校验 && 引导式提交【需要全局安装 commitizen】
"start": "cross-env NODE_ENV=development TS_NODE_PROJECT=tsconfig.dev.json nodemon --exec tsx src/app.ts",//开发模式，额外使用tsconfig.dev.json配置文件
"start:prod": "pnpm build && cross-env NODE_ENV=production tsx dist/app.js",//生产模式(开发模式自动打包并运行)
"build": "tsc"
```

## 项目根目录结构说明

```text
│── .husky                  // Git Hooks 工具
│   ├── _                   // 此文件夹是 husky 的自带脚本，内部文件命名代表 git 的 Hooks 的生命周期
│   ├── commit-msg          // 提交信息完成之后执行
│   └── pre-commit          // 提交(引导完成之后)信息之前，提交代码到本地仓库之前执行执行的脚本
│── .vscode                 // VSCode项目相关配置
│   ├── extensions.json     // VSCode插件推荐
│   └── settings.json       // VSCode项目配置
│── dist                    // 打包后的文件,生产模式
│── doc                     // 说明文档
│── download                // 下载功能下载的文件存储地址
│── node_modules            // 依赖包
│── src                     // 项目主目录
│   └── middlewares         // 中间件
│   └── routes              // 路由
│   │   ├── test            // 示例路由test
│   │   │   ├── controller  // 所有test子路由的路由控制器函数
│   │   │   └── index.ts    // 所有test子路由
│   │   └── index.ts        // 主路由，添加并导出所有路由
│   └── types               // 类型定义
│   └── utils               // 工具
│   └── app.ts              // 项目入口文件
│── .env                    // 全局环境变量
│── .env.development        // 开发环境模式下的变量(开发环境下默认)
│── .env.production         // 生产环境模式下的变量，脚本带上 "--mode 环境名" 参数即可读取对应环境下的变量，如脚本 "build:prod" 使用的 "--mode production"
│── .prettierignore         // prettier 检查忽略文件
│── .prettierrc.cjs         // prettier 配置
│── commitlint.config.cjs   // commitlint 和 cz-git 配置
│── eslint.config.js        // eslint 配置
│── package.json            // 依赖管理，存储项目信息、依赖包、脚本命令等
│── tsconfig.json           // TypeScript 配置文件
└── tsconfig.dev.json       // 用于开发模式运行的差异化 TypeScript 配置
```
