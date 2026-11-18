# hydrooj-resolver

Hydro OJ 的 ACM 比赛滚榜插件，适用于已结束且设置了封榜时间的比赛。

## 功能

- 逐步揭示封榜结果，以动画展示排名变化。
- 展示头像、学校、选手名称、题目状态、解题数和罚时。
- 在比赛榜单点击“滚榜”，按 **N** 或 **右方向键**前进一步，刷新页面重新开始。

仅比赛所有者或拥有“查看隐藏榜单”权限的用户可使用。

## 作为 Hydro 插件安装

使用运行 Hydro 的用户执行：

```bash
hydrooj install hydrooj-resolver
pm2 restart hydrooj
```

安装完成后会自动注册插件，重启 Hydro 即可使用。

## 更新插件

重新执行安装命令即可更新：

```bash
hydrooj install hydrooj-resolver
pm2 restart hydrooj
```

## 卸载

```bash
hydrooj uninstall hydrooj-resolver
pm2 restart hydrooj
```
