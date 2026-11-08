# hydrooj-resolver

Hydro OJ 的 ACM 比赛滚榜插件，适用于已结束且设置了封榜时间的比赛。

## 功能

- 逐步揭示封榜结果，以动画展示排名变化。
- 展示头像、学校、选手名称、题目状态、解题数和罚时。
- 在比赛榜单点击“滚榜”，按 **N** 或 **右方向键**前进一步，刷新页面重新开始。

仅比赛所有者或拥有“查看隐藏榜单”权限的用户可使用。

## 安装

需要 Node.js 22+ 和 Yarn 1.x，使用运行 Hydro 的用户执行：

```bash
hydrooj addon create
git clone https://github.com/HuParry/hydrooj-resolver.git ~/.hydro/addons/hydrooj-resolver
cd ~/.hydro/addons/hydrooj-resolver
yarn install
hydrooj addon add "$PWD"
pm2 restart hydrooj
```

## 更新
```bash
cd ~/.hydro/addons/hydrooj-resolver
git pull
```

## 卸载

```bash
hydrooj addon remove "$HOME/.hydro/addons/hydrooj-resolver"
pm2 restart hydrooj
rm -rf "$HOME/.hydro/addons/hydrooj-resolver"
```

若安装路径或 Hydro 进程名称不同，请替换为实际值。
