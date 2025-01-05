import { App, Editor, MarkdownView, Modal, TextComponent, Plugin, PluginSettingTab, Setting, TextFileView, FuzzySuggestModal, TFile } from 'obsidian';
import { fetchCLAI } from './src/fetch-clai';
import { runCLAI, runCLAIVersion } from './src/run-clai';

export interface CLAISettings {
	provider: 'openai' | 'openrouter' | 'custom';
	apiKey: string;
	url: string;
	model: string;
	workflowFolder: string;
}

const DEFAULT_SETTINGS: CLAISettings = {
	provider: 'openai',
	apiKey: '',
	url: 'https://api.openai.com/v1/chat/completions',
	model: 'gpt-4o-mini',
	workflowFolder: 'clai-workflows',
}

const DEFAULT_URLS: Record<CLAISettings['provider'], string> = {
	'openai': 'https://api.openai.com/v1/chat/completions',
	'openrouter': 'https://api.openrouter.ai/v1/chat/completions',
	'custom': 'https://your-custom-api.com/v1/chat/completions',
}

export default class CLAI extends Plugin {
	settings: CLAISettings;

	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: 'clai-run-workflow',
			name: 'Run Workflow',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(TextFileView);
				if (view) {
					if (!checking) {
						const modal = new WorkflowSuggestModal(this.app, this);
						modal.setPlaceholder("Select a workflow...");
						modal.open();
					}
					return true;
				}
			}
		});

		this.addCommand({
			id: 'clai-run-workflow-dry',
			name: 'Run Workflow (Dry)',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(TextFileView);
				if (view) {
					if (!checking) {
						const modal = new WorkflowSuggestModal(this.app, this);
						modal.setPlaceholder("Select a workflow...");
						modal.setDry(true);
						modal.open();
					}
					return true;
				}
			}
		});
		this.addSettingTab(new SettingsTag(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class WorkflowSuggestModal extends FuzzySuggestModal<TFile> {
	plugin: CLAI;
	dry: boolean = false;

	constructor(app: App, plugin: CLAI) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder("Select a workflow...");
	}

	setDry(dry: boolean) {
		this.dry = dry;
	}

	getItems(): TFile[] {
		const workflowFolder = this.plugin.settings.workflowFolder;
		return this.app.vault.getFiles().filter(file =>
			file.path.startsWith(workflowFolder) && file.extension === 'md'
		);
	}

	getItemText(file: TFile): string {
		return file.basename;
	}

	async onChooseItem(file: TFile) {
		const inputModal = new WorkflowInputModal(this.app, this.plugin);
		inputModal.setFile(file);
		inputModal.setDry(this.dry);
		inputModal.open();
	}
}

class WorkflowInputModal extends Modal {
	file: TFile;
	plugin: CLAI;
	input: TextComponent;
	loadingEl: HTMLElement;
	dry: boolean = false;

	constructor(app: App, plugin: CLAI) {
		super(app);
		this.plugin = plugin;
	}

	setDry(dry: boolean) {
		this.dry = dry;
	}

	setFile(file: TFile) {
		this.file = file;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('b', { text: `Run Workflow: ${this.file.basename}` });
		contentEl.createEl('p', { text: `You can now input the data that should be passed to the workflow and hit ENTER.` });

		const inputContainer = contentEl.createDiv('input-container');
		this.input = new TextComponent(inputContainer);
		this.input.inputEl.style.width = '100%';
		this.input
			.setPlaceholder("Workflow Input...");

		this.loadingEl = contentEl.createDiv('loading-container');
		this.loadingEl.setText('Processing...');
		this.loadingEl.style.display = 'none';
		this.loadingEl.style.textAlign = 'center';
		this.loadingEl.style.marginTop = '10px';

		this.input.inputEl.addEventListener('keydown', async (event) => {
			if (event.key === 'Enter') {
				this.input.setDisabled(true);
				this.loadingEl.style.display = 'block';

				try {
					const res = await runCLAI(this.plugin.settings, this.file.path, this.input.getValue(), this.app, { dry: !!this.dry });
					const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
					editor?.replaceSelection(res);
					this.close();
				} catch (error) {
					console.error('CLAI processing failed:', error);
					this.loadingEl.setText('Processing failed. Please try again.');
					this.input.setDisabled(false);
				}
			}
		});

		this.input.inputEl.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingsTag extends PluginSettingTab {
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
		firstTimeSetupButton.addEventListener('click', async () => {
			fetchCLAI(this.plugin.app);
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
	}
}
