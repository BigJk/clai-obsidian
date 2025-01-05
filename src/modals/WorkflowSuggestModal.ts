import { App, FuzzySuggestModal, TFile } from 'obsidian';
import CLAI from 'main';
import { WorkflowInputModal } from './WorkflowInputModal';

export class WorkflowSuggestModal extends FuzzySuggestModal<TFile> {
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
