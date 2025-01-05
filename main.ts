import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from 'src/constants';
import { SettingsTab } from 'src/settings/SettingsTab';
import { CLAISettings } from 'src/types';
import { addCommands } from 'src/commands';

export default class CLAI extends Plugin {
	settings: CLAISettings;

	async onload() {
		await this.loadSettings();
		addCommands(this);
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
