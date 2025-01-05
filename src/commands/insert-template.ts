import CLAI from 'main';
import { App, Editor, FuzzySuggestModal, TFile, TFolder } from 'obsidian';
import { FileSuggestModal } from 'src/modals/FileSuggestModal';
import { FolderSuggestModal } from 'src/modals/FolderSuggestModal';

enum TemplateType {
    File = 'File',
    SampleFiles = 'Sample Files',
    SampleFilesDeep = 'Sample Files Deep',
    SampleLines = 'Sample Lines',
    Clipboard = 'Clipboard',
    ActiveTitle = 'Active Title',
    ActiveNote = 'Active Note',
    Selection = 'Selection'
}

class TemplateTypeSuggestModal extends FuzzySuggestModal<TemplateType> {
    constructor(
        app: App,
        private editor: Editor,
        private onChoose: (type: TemplateType) => void
    ) {
        super(app);
        this.setPlaceholder('Choose template type...');
    }

    getItems(): TemplateType[] {
        return Object.values(TemplateType);
    }

    getItemText(item: TemplateType): string {
        return item;
    }

    onChooseItem(item: TemplateType): void {
        this.onChoose(item);
    }
}

export const insertTemplateCommand = (plugin: CLAI) => {
    return plugin.addCommand({
        id: 'clai-insert-template',
        name: 'Insert Template Statement',
        editorCallback: (editor: Editor) => {
            const templateModal = new TemplateTypeSuggestModal(plugin.app, editor, (type: TemplateType) => {
                switch (type) {
                    case TemplateType.File:
                        new FileSuggestModal(plugin.app, editor, (file: TFile) => {
                            editor.replaceSelection(`{{ call .File "./${file.path}" }}`);
                        }).open();
                        break;
                    case TemplateType.SampleFiles:
                        new FolderSuggestModal(plugin.app, editor, (folder: TFolder) => {
                            editor.replaceSelection(`{{ call .SampleFiles "./${folder.path}/" 3 false }}`);
                        }).open();
                        break;
                    case TemplateType.SampleFilesDeep:
                        new FolderSuggestModal(plugin.app, editor, (folder: TFolder) => {
                            editor.replaceSelection(`{{ call .SampleFilesDeep "./${folder.path}/" 3 false }}`);
                        }).open();
                        break;
                    case TemplateType.SampleLines:
                        new FileSuggestModal(plugin.app, editor, (file: TFile) => {
                            editor.replaceSelection(`{{ call .SampleLines "./${file.path}" 1 }}`);
                        }).open();
                        break;
                    case TemplateType.Clipboard:
                        editor.replaceSelection('{{ .Clipboard }}');
                        break;
                    case TemplateType.ActiveTitle:
                        editor.replaceSelection('{{ .ActiveTitle }}');
                        break;
                    case TemplateType.ActiveNote:
                        editor.replaceSelection('{{ .ActiveNote }}');
                        break;
                    case TemplateType.Selection:
                        editor.replaceSelection('{{ .Selection }}');
                        break;
                }
            });
            templateModal.open();
        }
    });
};
