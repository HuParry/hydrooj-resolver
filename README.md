# hydrooj-resolver

Hydro OJ 的 ACM 比赛滚榜插件。比赛结束后，通过键盘逐步揭示封榜期间的提交结果，以动画展示排名变化。

## 功能

- 从排名末位开始，依次选中选手、揭示题目结果并更新名次。
- 展示头像、学校、选手名称、题目状态、解题数和罚时。
- 按 Hydro 的 ACM 规则处理提交与罚时，使用秒级罚时排序，页面以分钟显示。
- 滚动和动画期间忽略重复按键，支持系统的减少动态效果设置。

未填写学校时默认显示“西安理工大学”。页头为 `@XAUT OJ/Resolver`，页脚仅显示插件名称和版本。

## 使用条件

- 已安装 Hydro OJ，Node.js 22 或更高版本。
- 比赛采用 ACM 赛制，已结束并设置了封榜时间。
- 当前用户是比赛所有者，或拥有“查看隐藏榜单”权限。

## 安装

### 从源码安装

将仓库放到 `~/.hydro/addons/hydrooj-resolver`，在运行 Hydro 的用户和 Node.js 环境下执行：

```bash
cd ~/.hydro/addons/hydrooj-resolver
yarn install --production --frozen-lockfile --ignore-scripts --non-interactive
hydrooj addon add "$PWD"
pm2 restart hydrooj
```

依赖安装使用 Yarn 1.x。Hydro 会编译 TypeScript 和前端资源，React、ReactDOM 由宿主提供。
如果采用其他进程管理方式，请按实际部署方式重启 Hydro。

可运行 `hydrooj addon list` 检查插件是否已注册。

### 从 npm 安装

发布到 npm 后，可通过以下命令下载插件、安装依赖并注册（需要 Yarn 1.x）：

```bash
hydrooj install hydrooj-resolver
pm2 restart hydrooj
```

## 滚榜操作

进入比赛榜单，点击“滚榜”，或访问：

```text
/contest/<比赛 ID>/scoreboard/resolver
```

按 **N** 或 **右方向键**前进一步：选中选手 → 选中题目 → 揭示结果 → 更新排名。
等待当前滚动或动画结束后再继续。刷新页面会从头开始，滚榜操作只影响当前页面展示。

## 更新与停用

更新前备份插件目录。源码安装时，更新代码后重新安装生产依赖并重启 Hydro；npm 安装时，重新执行 `hydrooj install hydrooj-resolver` 并重启。

停用源码安装的插件：

```bash
hydrooj addon remove "$HOME/.hydro/addons/hydrooj-resolver"
pm2 restart hydrooj
```

如果安装目录不同，请使用实际注册的路径。停用命令保留插件目录。

## 开发与发布

```bash
yarn install --frozen-lockfile --ignore-scripts --non-interactive
npm test
npm pack --dry-run
```

测试覆盖访问权限、比赛条件、提交归属、前端构建和滚榜过程。实际浏览器中的动画与布局需在 Hydro 中验收。

npm 发布包仅包含运行所需源码、模板、样式、README 和许可证，不包含测试、本地依赖或缓存。
发布前确认 npm 包名可用，并同步更新 `package.json` 与 `templates/resolver.html` 中的版本号及样式资源版本。

登录 npm 后执行 `npm publish`。发布前会自动运行测试。

## 许可证

[AGPL-3.0](LICENSE)。
