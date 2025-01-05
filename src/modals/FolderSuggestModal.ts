import { App, Editor, FuzzySuggestModal, TFolder } from 'obsidian';

export class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
    constructor(
        app: App,
        private editor: Editor,
        private onChoose: (folder: TFolder) => void
    ) {
        super(app);
        this.setPlaceholder('Choose a folder...');
    }

    getItems(): TFolder[] {
        const folders: TFolder[] = [];
        this.app.vault.getAllLoadedFiles().forEach(file => {
            if (file instanceof TFolder) {
                folders.push(file);
            }
        });
        return folders;
    }

    getItemText(folder: TFolder): string {
        return folder.path;
    }

    onChooseItem(folder: TFolder): void {
        this.onChoose(folder);
    }
}