import { MarkdownView, Plugin, TextFileView } from 'obsidian';
import { DEFAULT_SETTINGS } from 'src/constants';
import { WorkflowSuggestModal } from 'src/modals/WorkflowSuggestModal';
import { SettingsTab } from 'src/settings/SettingsTab';
import { CLAISettings } from 'src/types';

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

		this.addCommand({
			id: 'clai-insert-boilerplate',
			name: 'Insert Boilerplate',
			checkCallback: (checking: boolean) => {
				const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
				if (editor) {
					if (!checking) {
						editor.replaceSelection(`# CLAI::SYSTEM

You are a helpful assistant that ...

# CLAI::USER

...

{{ call .File "./some_file.md" }}
{{ call .SampleFiles "./some_folder/" 3 false }}
{{ .Clipboard }}
{{ .ActiveTitle }}
{{ .ActiveNote}}

# CLAI::ASSISTANT

Thank you for the examples! Now tell me about ...

# CLAI::USER

{{ .Selection }}`);
					}
					return true;
				}
			}
		});

		this.addSettingTab(new SettingsTab(this.app, this));
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
