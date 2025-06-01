# 备忘录

## 文档

[HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status)

## 常用命令

### 合并分支

``` shell
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
