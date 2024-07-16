# WebDAV Uploader Plugin for Obsidian

<div align="center">
<a href="README.md">English</a> | <a href="README.zh.md">中文</a>
</div>

<br>

<p align="center"><img align="center" src="https://alist.zhaoming.org/d/opt/alist/data/onedrive/ImageHost///2024-07-16_1721147096790_demo.gif" alt="highlight" /></p>


## Description

This plugin allows you to upload documents from Obsidian to a WebDAV server with a single click. It supports both desktop and mobile versions of Obsidian and provides customizable URL prefixes for uploaded files.

### Features

- One-click upload to WebDAV server.
- Customizable URL prefix for uploaded files.
- Clipboard support: The URL of the uploaded file is copied to the clipboard.
- Works on both desktop and mobile versions of Obsidian.
- Support multiple WebDAV servers.
- Add warnings and suggestions when internal comments are found in the uploaded file.
- Automatically replaces internal links in uploaded files with LINK mode, while keeping the internal link format of local files unchanged. When prompted, upload the associated file to the same directory to realize the jump.

### Installation

1. Download the plugin from the GitHub repository.
2. Place the plugin folder in your Obsidian plugins directory.
3. Enable the plugin in the Obsidian settings.

### Configuration

1. Go to the plugin settings in Obsidian.
2. Enter your WebDAV server URL, username, and password.
3. Optionally, enter a custom URL prefix.
4. Click "Validate" to ensure the configuration is correct.

### Usage

1. Open a document in Obsidian.
2. Click the upload icon in the ribbon.
3. The document will be uploaded to the WebDAV server, and the URL will be copied to your clipboard.

### License

This plugin is licensed under the MIT License.

### Update in versions
- Version 1.0.0: First commit.
- Version 1.0.1: Enables automatic replacement of internal links while maintaining local formatting.
- Version 1.0.2: Fixed the logic for mapping internal and external links.
