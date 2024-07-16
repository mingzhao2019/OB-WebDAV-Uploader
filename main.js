const { Plugin, PluginSettingTab, Setting, Notice, Modal } = require('obsidian');

class WebDAVUploader extends Plugin {
    async onload() {
        await this.loadSettings();

        this.addRibbonIcon('upload-cloud', 'Upload to WebDAV', async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                const fileContent = await this.app.vault.read(activeFile);
                const selectedServer = await this.chooseWebDAVServer();
                if (selectedServer) {
                    try {
                        const fileUrl = await this.uploadToWebDAV(activeFile.name, fileContent, selectedServer);
                        if (navigator.clipboard) {
                            await navigator.clipboard.writeText(fileUrl);
                            new Notice(this.getLocalizedMessage('UPLOAD_SUCCESS'));
                        } else {
                            new Notice(this.getLocalizedMessage('UPLOAD_SUCCESS'));
                        }
                    } catch (error) {
                        new Notice(this.getLocalizedMessage('UPLOAD_FAILURE', error.message));
                    }
                } else {
                    new Notice(this.getLocalizedMessage('NO_SERVER_SELECTED'));
                }
            } else {
                new Notice(this.getLocalizedMessage('NO_ACTIVE_FILE'));
            }
        });

        this.addSettingTab(new WebDAVUploaderSettingTab(this.app, this));

        this.loadStyles();
    }

    onunload() {
        const styleEl = document.getElementById('webdav-uploader-styles');
        if (styleEl) styleEl.remove();
    }

    async chooseWebDAVServer() {
        const servers = this.settings.servers;
        if (servers.length === 0) {
            new Notice('No WebDAV server configured.');
            return null;
        }

        return new Promise((resolve) => {
            const modal = new ChooseServerModal(this.app, servers, resolve);
            modal.open();
        });
    }

    async uploadToWebDAV(filename, content, server) {
        const { webdavUrl, customUrlPrefix, username, password } = server;
        if (!webdavUrl || !username || !password) {
            throw new Error('WebDAV configuration is incomplete.');
        }
        const auth = 'Basic ' + btoa(`${username}:${this.decrypt(password)}`);

        const response = await fetch(webdavUrl + encodeURIComponent(filename), {
            method: 'PUT',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/octet-stream'
            },
            body: content
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const internalLinks = this.findInternalLinks(content);
        if (internalLinks.length > 0) {
            this.showInternalLinksNotice(internalLinks);
        }

        return customUrlPrefix + encodeURIComponent(filename);
    }

    findInternalLinks(content) {
        const regex = /\[\[([^\]]+)\]\]/g;
        return [...content.matchAll(regex)].map(match => match[1]);
    }

    showInternalLinksNotice(internalLinks) {
        const notice = new Notice('', 15000); // 15 seconds duration
        const container = notice.noticeEl.createDiv({ cls: 'internal-links-notice' });
        container.createEl('h4', { text: this.getLocalizedMessage('INTERNAL_LINKS_FOUND') });
        const ul = container.createEl('ul');
        internalLinks.forEach(link => {
            ul.createEl('li', { text: `[[${link}]]` });
        });
        container.createEl('p', { text: this.getLocalizedMessage('CONSIDER_UPLOADING') });

        notice.noticeEl.style.top = '50%';
        notice.noticeEl.style.left = '50%';
        notice.noticeEl.style.transform = 'translate(-50%, -50%)';
        notice.noticeEl.style.width = '350px';
        notice.noticeEl.style.maxHeight = '250px';
        notice.noticeEl.style.overflow = 'auto';
        notice.noticeEl.style.backgroundColor = 'var(--background-primary)';
        notice.noticeEl.style.color = 'var(--text-normal)';
        notice.noticeEl.style.border = '2px solid var(--interactive-accent)';
        notice.noticeEl.style.borderRadius = '10px';
        notice.noticeEl.style.padding = '15px';
        notice.noticeEl.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }

    loadStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = 'webdav-uploader-styles';
        styleEl.textContent = `
            .internal-links-notice {
                background-color: var(--background-primary);
                color: var(--text-normal);
                border-radius: 10px;
                padding: 15px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .internal-links-notice h4 {
                margin-top: 0;
                color: var(--text-accent);
                font-size: 1.2em;
            }
            .internal-links-notice ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .internal-links-notice li {
                margin-bottom: 5px;
            }
            .internal-links-notice p {
                margin-bottom: 0;
                font-style: italic;
            }
        `;
        document.head.appendChild(styleEl);
    }

    async loadSettings() {
        this.settings = Object.assign({
            servers: []
        }, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    encrypt(text) {
        return btoa(text);
    }

    decrypt(text) {
        return atob(text);
    }

    getLocalizedMessage(key, ...args) {
        const messages = {
            UPLOAD_SUCCESS: {
                en: 'Upload successful, link copied to clipboard!',
                zh: '上传成功，链接已复制到剪贴板！'
            },
            UPLOAD_FAILURE: {
                en: `Failed to upload file: ${args[0]}`,
                zh: `文件上传失败：${args[0]}`
            },
            NO_ACTIVE_FILE: {
                en: 'No active file to upload.',
                zh: '没有要上传的活动文件。'
            },
            PASSWORD_LOCAL: {
                en: 'Your password is fully localized and will not be accessed by the plugin.',
                zh: '您的密码完全本地化，不会被插件获取。'
            },
            NO_SERVER_SELECTED: {
                en: 'No server selected for upload.',
                zh: '未选择上传的服务器。'
            },
            INTERNAL_LINKS_FOUND: {
                en: 'Internal Links Found',
                zh: '发现内部链接'
            },
            CONSIDER_UPLOADING: {
                en: 'Consider uploading these notes and updating the links in the uploaded file.',
                zh: '考虑上传这些笔记并更新已上传文件中的链接。'
            }
        };

        const locale = this.app.vault.getConfig('language') || 'en';
        return messages[key][locale] || messages[key].en;
    }
}

class WebDAVUploaderSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'WebDAV Uploader Settings' });

        new Setting(containerEl)
            .setName('Add New WebDAV Server')
            .setDesc('Click to add a new WebDAV server configuration')
            .addButton(button => {
                button.setButtonText('Add Server')
                    .onClick(() => {
                        const server = { name: '', webdavUrl: '', customUrlPrefix: '', username: '', password: '' };
                        this.plugin.settings.servers.push(server);
                        this.plugin.saveSettings();
                        this.display();
                    });
            });

        this.plugin.settings.servers.forEach((server, index) => {
            containerEl.createEl('h3', { text: `Server ${index + 1}` });

            new Setting(containerEl)
                .setName('Server Name')
                .setDesc('A custom name for this server')
                .addText(text => {
                    text.setPlaceholder('My WebDAV Server')
                        .setValue(server.name || '')
                        .onChange(async (value) => {
                            server.name = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = '400px';
                });

            new Setting(containerEl)
                .setName('WebDAV URL')
                .setDesc('The URL of your WebDAV server')
                .addText(text => {
                    text.setPlaceholder('https://your-webdav-server.com/remote.php/webdav/')
                        .setValue(server.webdavUrl || '')
                        .onChange(async (value) => {
                            server.webdavUrl = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = '400px';
                });

            new Setting(containerEl)
                .setName('Custom URL Prefix')
                .setDesc('The custom URL prefix for the uploaded files')
                .addText(text => {
                    text.setPlaceholder('https://your-custom-url.com/files/')
                        .setValue(server.customUrlPrefix || '')
                        .onChange(async (value) => {
                            server.customUrlPrefix = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = '400px';
                });

            new Setting(containerEl)
                .setName('Username')
                .setDesc('Your WebDAV username')
                .addText(text => {
                    text.setPlaceholder('Username')
                        .setValue(server.username || '')
                        .onChange(async (value) => {
                            server.username = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = '400px';
                });

            new Setting(containerEl)
                .setName('Password')
                .setDesc('Your WebDAV password')
                .addText(text => {
                    text.setPlaceholder('Password')
                        .setValue(server.password ? this.plugin.decrypt(server.password) : '')
                        .onChange(async (value) => {
                            server.password = this.plugin.encrypt(value);
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = '400px';
                    text.inputEl.type = 'password';
                });

            new Setting(containerEl)
                .setName('Remove Server')
                .setDesc('Click to remove this server configuration')
                .addButton(button => {
                    button.setButtonText('Remove')
                        .onClick(async () => {
                            this.plugin.settings.servers.splice(index, 1);
                            await this.plugin.saveSettings();
                            this.display();
                        });
                });

            new Setting(containerEl)
                .setName('Validate Server')
                .setDesc('Click to validate this server configuration')
                .addButton(button => {
                    button.setButtonText('Validate')
                        .onClick(async () => {
                            try {
                                await this.plugin.uploadToWebDAV('test.txt', 'This is a test file.', server);
                                new Notice('WebDAV configuration is valid!');
                            } catch (error) {
                                new Notice('WebDAV configuration is invalid: ' + error.message);
                            }
                        });
                });
        });

        containerEl.createEl('p', { text: this.plugin.getLocalizedMessage('PASSWORD_LOCAL') });
    }
}

class ChooseServerModal extends Modal {
    constructor(app, servers, callback) {
        super(app);
        this.servers = servers;
        this.callback = callback;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Choose WebDAV Server' });

        this.servers.forEach((server, index) => {
            const button = contentEl.createEl('button', { text: server.name || `Server ${index + 1}` });
            button.addEventListener('click', () => {
                this.callback(server);
                this.close();
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

module.exports = WebDAVUploader;