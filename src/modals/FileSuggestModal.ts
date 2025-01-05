import { App, Editor, FuzzySuggestModal, TFile } from 'obsidian';

export class FileSuggestModal extends FuzzySuggestModal<TFile> {
    constructor(
        app: App,
        private editor: Editor,
        private onChoose: (file: TFile) => void
    ) {
        super(app);
        this.setPlaceholder('Choose a file...');
    }

    getItems(): TFile[] {
        return this.app.vault.getMarkdownFiles();
    }

    getItemText(file: TFile): string {
        return file.path;
    }

    onChooseItem(file: TFile): void {
        this.onChoose(file);
    }
}