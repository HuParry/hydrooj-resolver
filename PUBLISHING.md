# npm 发布

包名：`hydrooj-resolver`。GitHub 仓库：`HuParry/hydrooj-resolver`。
`package.json` 已配置公开发布、npm 官方仓库、GitHub 链接和发布文件清单。

## 首次发布

1. 在 [npm](https://www.npmjs.com/signup) 注册并验证邮箱，在 Account → Two-Factor Authentication 启用 2FA。
2. 在当前仓库目录执行：

   ```bash
   yarn install --frozen-lockfile --ignore-scripts --non-interactive
   npm login --registry=https://registry.npmjs.org/
   npm whoami --registry=https://registry.npmjs.org/
   npm publish
   ```

   按提示完成浏览器登录和发布认证。发布命令会先运行测试并检查打包内容。
   npm 包由首次成功发布创建，无需在网页上预先创建“仓库”。若名称被他人占用，需更换 `package.json` 的包名。

3. 发布后进入 [npm 包页面](https://www.npmjs.com/package/hydrooj-resolver)，确认版本和 GitHub 链接。

## 配置 GitHub 自动发布

首次发布后，在 npm 包页面进入 Settings → Trusted publishing，选择 GitHub Actions，填写：

| 设置 | 值 |
| --- | --- |
| Organization or user | `HuParry` |
| Repository | `hydrooj-resolver` |
| Workflow filename | `publish.yml` |
| Environment name | 留空 |
| Allowed actions | 允许 `npm publish` |

工作流名称只填 `publish.yml`，不填 `.github/workflows/`。
保存后无需配置 npm Token 或 GitHub Secret。

新建的 Trusted Publisher 需在 2 天内完成首次自动发布；如果过期，删除后重新配置。

## 后续版本

1. 更新 `package.json` 的版本号，例如 `1.0.1`。
2. 同步更新 `templates/resolver.html` 的页脚版本和 CSS 资源版本。
3. 提交并推送代码到 GitHub。
4. 在 GitHub Releases 创建正式 Release，标签为对应的 `v1.0.1`，指向上述提交。
5. `.github/workflows/publish.yml` 自动检查版本、安装依赖、测试并发布到 npm。

标签必须是 `v` 加包版本。同一个 npm 版本不能重复发布；首次本地发布 `1.0.0` 后，下一次自动发布应使用新的版本。
草稿和预发布 Release 不会发布到 npm。

发布完成后，用户可执行 `hydrooj install hydrooj-resolver` 安装，再重启 Hydro。

参考：[npm 公开包发布](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/)、[Trusted publishing](https://docs.npmjs.com/trusted-publishers/)。
