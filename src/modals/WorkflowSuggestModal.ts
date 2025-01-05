import CLAI from 'main';
import { App, FuzzyMatch, FuzzySuggestModal, TFile } from 'obsidian';
import { WorkflowInputModal } from 'src/modals/WorkflowInputModal';

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
        const cache = this.app.metadataCache.getFileCache(file);

        if (cache?.frontmatter) {
            const { name, description } = cache.frontmatter;
            if (name) {
                return `${name} - ${description}`;
            }
        }

        return file.basename;
    }

    renderSuggestion(item: FuzzyMatch<TFile>, el: HTMLElement): void {
        const file = item.item;
        const cache = this.app.metadataCache.getFileCache(file);

        const container = el.createDiv({ cls: 'suggestion-content' });
        const title = container.createDiv({ cls: 'suggestion-title' });
        title.setText(file.basename);

        if (cache?.frontmatter) {
            const { name, description } = cache.frontmatter;
            if (name) {
                title.setText(name);
            }
            if (description) {
                let div = container.createDiv({
                    text: description
                });
                div.style.opacity = '0.5';
                (div.style as any).zoom = '0.8';
            }
        }
    }

    async onChooseItem(file: TFile) {
        const inputModal = new WorkflowInputModal(this.app, this.plugin);
        inputModal.setFile(file);
        inputModal.setDry(this.dry);
        inputModal.open();
    }
}
