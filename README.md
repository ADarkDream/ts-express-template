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
"build": "tsc",//打包命令
"push": "git push Gitee master && git push origin master"  //分别推送到Gitee和Github远程仓库
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

## Git 提交规范

项目已配置引导式提交工具，执行`commit`脚本,例如`npm run commit`，即可触发，大致步骤如下。

一、引导式提交

**需要全局安装`pnpm add -g commitizen`**

1、代码格式化和检查：

每次执行时会先将被修改的代码添加到暂存区，然后进行代码检查。如果检查出错，注意看报错信息，会提醒是否可自动修复。

如果可以**自动修复就使用`lint:diff`脚本**将文件添加到暂存区再自动修复，这仅会修复本次修改的代码(如果你使用`lint:fix`脚本会检查并修改整个项目的代码)，如果无法自动修复则前往错误文件手动修改(`Ctrl键+鼠标左键`可以快速跳转)。

代码检查通过之后才会进行引导式提交。

2、开始引导式提交：

在引导式提交中，会依次要求选择类型( type )、范围( scope )、主题( subject )和其他信息，依照提醒一步步完成即可（具体格式要求可阅下方自行提交第3步）。

3、commit 信息格式校验：

commit 信息输入完成之后会触发格式检查，检查无误才会将代码提交到本地仓库。（**如果试错多次仍无法过校验，有可能是配置问题**）

4、将本地仓库代码提交到远程仓库
【可选】配置用户名和邮箱，以便提交代码时能够识别身份：

`git config --global user.name 你的名字`

`git config --global user.email 你的邮箱`

执行命令`git remote -v`查看当前项目关联的远程仓库，如果你没有关联仓库，执行如下命令可关联本项目的仓库：

``` bash
git remote add origin https://github.com/ADarkDream/ts-express-template.git
# and
git remote add Gitee https://gitee.com/MuXi-Dream/ts-express-template.git
```

执行脚本`push`或命令`git push Gitee && git push origin`可将本地仓库代码提交到所有相关联的远程仓库

或`git push Gitee master` or `git push origin master`可分别推送到两个仓库

二、自行提交

如果不需要引导式提交，可执行命令`git add . && npm exec lint-staged && git commit`进行提交，命令说明如下：

1、`git add  .`：先将被修改的代码添加到暂存区；

2、`npm exec lint-staged`：引导式提交中的第1步，代码格式化和检查；

3、`git commit`：原版提交方式；

提交信息详细规则在`commitlint.config.cjs`中可以查看，大致格式如`{type}({scope,scope}): {subject}`。

**其中 type 和 subject 为必填项，scope 可不填，也可填多个，用英文逗号分隔，仅支持中文、英文小写、数字和下划线。冒号后需要加空格**。

4、引导式提交中的第3步和第4步

>如果你对这个工作流程感兴趣，欢迎阅读文章：[代码审查和 git commit 引导、校验工作流](https://mp.weixin.qq.com/s/ta7lt3-BZvkLyjyLW934BA)
