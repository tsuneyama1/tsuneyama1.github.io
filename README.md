# KuzenBox Pro 公网下载站

这是 KuzenBox Pro 的纯静态下载页，可直接部署到 GitHub Pages。

## 文件结构

- `index.html`：页面入口
- `assets/site.css`：视觉样式与动画
- `assets/site.js`：下载链接配置与交互演示
- `assets/kuzenbox.png`：站点图标
- `downloads/`：仅用于本地预览，不提交到网站仓库

## 发布到 GitHub Pages

1. 在 GitHub 创建仓库：`kuzenbox-pro-site`
2. 将本目录除 `downloads/` 外的文件提交到仓库 `main` 分支。
3. 创建 Release：`v4.0.1-pro`
4. 上传安装器：`E:\kuzenbox\site\downloads\kuzenbox_pro-setup.exe`
5. 确认 Release Asset 下载地址为：

```text
https://github.com/tsuneyama1/kuzenbox-pro-site/releases/download/v4.0.1-pro/kuzenbox_pro-setup.exe
```

6. 在仓库 Settings -> Pages 中启用：
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /root

公开访问地址预计为：

```text
https://tsuneyama1.github.io/
```

如果 GitHub 用户名、仓库名或 Release tag 改变，只需要更新 `assets/site.js` 顶部的 `releaseDownloadUrl`。


