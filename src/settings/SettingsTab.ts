import CLAI from 'main';
import { App, PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_URLS } from 'src/constants';
import { fetchCLAI } from 'src/fetch-clai';
import { runCLAIVersion } from 'src/run-clai';
import { CLAISettings } from 'src/types';

export class SettingsTab extends PluginSettingTab {
    plugin: CLAI;
    version: string;

    constructor(app: App, plugin: CLAI) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h1', { text: 'Settings for CL(A)I' });

        // first time setup button
        const firstTimeSetupButton = containerEl.createEl('button', { text: 'Install / Update CL(A)I' });
        const statusEl = containerEl.createEl('span', { text: '' });
        statusEl.style.marginLeft = '10px';

        firstTimeSetupButton.addEventListener('click', async () => {
            try {
                firstTimeSetupButton.disabled = true;
                statusEl.setText('Installing...');
                await fetchCLAI(this.plugin.app);
                statusEl.setText('✓ Installation complete!');
                statusEl.style.color = 'green';
            } catch (error) {
                statusEl.setText('❌ Installation failed: ' + (error instanceof Error ? error.message : String(error)));
                statusEl.style.color = 'red';
            } finally {
                firstTimeSetupButton.disabled = false;
            }
        });

        containerEl.createEl('p', { text: 'You need to install clai the first time you use this plugin!' });

        const checkVersionButton = containerEl.createEl('button', { text: 'Check Version' });
        checkVersionButton.addEventListener('click', async () => {
            try {
                const version = await runCLAIVersion(this.plugin.app);
                this.version = version;
                this.display();
            } catch (error) {
                this.version = 'Error: CLAI not installed?';
                this.display();
                return;
            }
        });

        if (this.version) {
            containerEl.createEl('p', { text: `${this.version}` });
        }

        containerEl.createEl('h1', { text: 'API Settings' });

        new Setting(containerEl)
            .setName('API Provider')
            .setDesc('Select the API provider')
            .addDropdown(dropdown => dropdown
                .addOption('openai', 'OpenAI')
                .addOption('openrouter', 'OpenRouter')
                .addOption('custom', 'Custom')
                .setValue(this.plugin.settings.provider)
                .onChange(async (value) => {
                    this.plugin.settings.provider = value as CLAISettings['provider'];
                    this.plugin.settings.url = DEFAULT_URLS[this.plugin.settings.provider];
                    await this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.provider === 'custom') {
            new Setting(containerEl)
                .setName('API URL')
                .setDesc('Enter your API URL')
                .addText(text => text
                    .setPlaceholder('Enter your API URL')
                    .setValue(this.plugin.settings.url)
                    .onChange(async (value) => {
                        this.plugin.settings.url = value;
                        await this.plugin.saveSettings();
                    }));
        }

        new Setting(containerEl)
            .setName('API Model')
            .setDesc('Enter your API model')
            .addText(text => text
                .setPlaceholder('Enter your API model')
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Enter your API key')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));


        containerEl.createEl('h1', { text: 'Workflows' });

        new Setting(containerEl)
            .setName('Workflow Folder')
            .setDesc('Enter your workflow folder')
            .addText(text => text
                .setPlaceholder('Enter your workflow folder')
                .setValue(this.plugin.settings.workflowFolder)
                .onChange(async (value) => {
                    this.plugin.settings.workflowFolder = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h1', { text: 'Links' });

        containerEl.createEl('div', { cls: 'link-entry' }, (div) => {
            div.createEl('span', { text: 'Plugin on Github: ' });
            div.createEl('a', { text: 'https://github.com/BigJk/clai-obsidian', href: 'https://github.com/BigJk/clai-obsidian' });
        });
        containerEl.createEl('div', { cls: 'link-entry' }, (div) => {
            div.createEl('span', { text: 'CL(A)I on Github: ' });
            div.createEl('a', { text: 'https://github.com/BigJk/clai', href: 'https://github.com/BigJk/clai' });
        });
        containerEl.createEl('div', { cls: 'link-entry' }, (div) => {
            div.createEl('span', { text: 'Buy me a coffee: ' });
            div.createEl('a', { text: 'https://ko-fi.com/BigJk', href: 'https://ko-fi.com/BigJk' });
        });
    }
}