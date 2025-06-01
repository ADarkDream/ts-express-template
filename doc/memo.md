# 备忘录

## 文档

[HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status)

## 常用命令

### 合并分支

```shell
# 1. 切换到 master 分支
git checkout master

# 2. 拉取最新的远程 master
git pull origin master

# 3. 合并 base 分支到 master
git merge base

# 4. 解决冲突，然后提交合并

# 5. 推送合并后的 master 到远程
git push origin master
# 或 pnpm push
```

### 撤销提交

```shell
# 1. 仅撤销提交，保留改动
git reset --soft HEAD~1

# 2. 撤销提交+取消暂存
git reset --mixed HEAD~1

# 3. 完全回退提交 + 改动都消失
git reset --hard HEAD~1
```
