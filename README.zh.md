# WebDAV Uploader 插件适用于 Obsidian

<div align="center">
<a href="README.md">English</a> | <a href="README.zh.md">中文</a>
</div>

<br>

<p align="center"><img align="center" src="https://github.com/mingzhao2019/OB-WebDAV-Uploader/blob/b226a0e62aa5a516e8d2c92fac4d456b9d71e1ca/demo.gif" alt="highlight" /></p>

## 描述

此插件允许您通过单击将文档从 Obsidian 上传到 WebDAV 服务器。它支持 Obsidian 的桌面和移动版本，并为上传的文件提供可自定义的 URL 前缀。

### 功能

- 一键上传到 WebDAV 服务器。
- 为上传的文件提供可自定义的 URL 前缀。
- 剪贴板支持：上传文件的 URL 将复制到剪贴板。
- 支持 Obsidian 的桌面和移动版本。
- 支持多个 WebDAV 服务器。
- 在上传文件中发现内部注释时添加警告和建议。
- 自动替换上传文件中的内部链接为link模式，同时保持本地文件内部链接格式不变。根据提示，上传相关联的文件到同样目录即可实现跳转。

### 安装

1. 从 GitHub 仓库下载插件。
2. 将插件文件夹放在您的 Obsidian 插件目录中。
3. 在 Obsidian 设置中启用插件。

### 配置

1. 进入 Obsidian 中的插件设置。
2. 输入您的 WebDAV 服务器 URL、用户名和密码。
3. 可选：输入自定义 URL 前缀。
4. 点击“验证”以确保配置正确。

### 使用方法

1. 在 Obsidian 中打开一个文档。
2. 点击工具栏中的上传图标。
3. 文档将上传到 WebDAV 服务器，并且 URL 将复制到您的剪贴板。

### 许可证

此插件根据 MIT 许可证进行许可。

### 版本更新
- 版本 1.0.0: 首次提交。
- 版本 1.0.1: 实现自动替换内部链接同时保持格式。
- 版本 1.0.2: 修复匹配内链和外链逻辑。
