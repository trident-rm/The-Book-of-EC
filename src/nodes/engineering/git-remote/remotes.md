# 连接远程仓库

一个本地仓库可以连接多个不同的远程仓库，称为 remote。每个 remote 由名称和仓库 URL 组成，名称只在当前本地仓库中使用，用于引用对应的远程仓库。

大部分情况下，一个本地仓库只会用到一个远程仓库，并且习惯上将其命名为 `origin`。

## 选择连接方式

GitHub 仓库通常提供 SSH 和 HTTPS 两类 URL：

```
git@github.com:OWNER/REPOSITORY.git
https://github.com/OWNER/REPOSITORY.git
```

其中 `OWNER` 是用户或组织名，`REPOSITORY` 是仓库名。URL 决定 Git 连接哪个仓库以及使用哪种认证方式，不改变 commit 的内容。

本书推荐日常开发使用 SSH。请按照 [GitHub 的 SSH 配置说明](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)自行检查密钥、生成密钥并把公钥添加到 GitHub。配置后运行：

```sh
ssh -T git@github.com
```

首次连接前，应当先对照 GitHub 公布的指纹确认服务器身份。验证结果中应当出现自己的 GitHub 用户名和成功认证提示。

HTTPS 同样可以使用，但 GitHub 不接受账户密码作为 Git 操作的认证凭据。应使用系统的凭据管理器、GitHub CLI 或 personal access token，且不要把 token 写进 remote URL、命令记录或仓库文件。具体方式见 [GitHub 的认证说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)。

## 查看已有 remote

在仓库中运行：

```sh
git remote -v
```

每个 remote 通常显示 fetch 和 push 两个 URL。例如：

```
origin  git@github.com:OWNER/REPOSITORY.git (fetch)
origin  git@github.com:OWNER/REPOSITORY.git (push)
```

如果当前仓库还没有添加 remote，则什么也不会输出。

## 为本地仓库添加 remote

你在本地有一个用 `git init` 创建的仓库，同时在 GitHub 上有一个仓库。如何把后者添加为前者的 remote？

点击 GitHub 仓库主页的绿色 Code 按钮，其中提供了 HTTPS 和 SSH 两类 URL。复制其一，在本地仓库中运行：

```sh
# 添加名为 `origin` 的 remote
git remote add origin <REMOTE_URL>

# 查看 remote 是否添加成功
git remote -v
```

第二条命令应当显示刚添加的 `origin`。`remote add` 只保存名称和 URL，不会上传 commit。

## clone 已有仓库

如果 GitHub 上已经存在仓库，使用仓库页面给出的 URL：

```sh
git clone <REMOTE_URL>

# 进入克隆下来的仓库目录
cd <REPOSITORY>

# 查看 remote
git remote -v
```

`git clone` 会下载仓库历史、签出默认分支，并自动把克隆来源登记为 `origin`。因此，克隆完成后不要再次执行 `git init` 或 `git remote add origin`。
