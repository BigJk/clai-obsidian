import CLAI from 'main';
import { App, Editor, FuzzyMatch, FuzzySuggestModal, TFile, TFolder } from 'obsidian';
import { FileSuggestModal } from 'src/modals/FileSuggestModal';
import { FolderSuggestModal } from 'src/modals/FolderSuggestModal';
import { NumberSuggestModal } from 'src/modals/NumberSuggestModal';
import { BooleanSuggestModal } from 'src/modals/BooleanSuggestModal';

enum TemplateType {
    File = 'File',
    SampleFiles = 'Sample Files',
    SampleFilesDeep = 'Sample Files Deep',
    SampleLines = 'Sample Lines',
    SampleChunk = 'Sample Chunk',
    Clipboard = 'Clipboard',
    ActiveTitle = 'Active Title',
    ActiveNote = 'Active Note',
    Selection = 'Selection'
}

function getTemplateTypeExplanation(type: TemplateType): string {
    switch (type) {
        case TemplateType.File:
            return 'Inserts the contents of a file.';
        case TemplateType.SampleFiles:
            return 'Inserts a random file from a folder.';
        case TemplateType.SampleFilesDeep:
            return 'Inserts a random file from a folder, including subfolders.';
        case TemplateType.SampleLines:
            return 'Inserts a random line from a file.';
        case TemplateType.SampleChunk:
            return 'Inserts a random consecutive chunk from a file.';
        case TemplateType.Clipboard:
            return 'Inserts the contents of the clipboard.';
        case TemplateType.ActiveTitle:
            return 'Inserts the title of the active note.';
        case TemplateType.ActiveNote:
            return 'Inserts the contents of the active note.';
        case TemplateType.Selection:
            return 'Inserts the selected text.';
        default:
            return 'Unknown template type.';
    }
}

class TemplateTypeSuggestModal extends FuzzySuggestModal<TemplateType> {
    constructor(
        app: App,
        private editor: Editor,
        private onChoose: (type: TemplateType) => void
    ) {
        super(app);
        this.setPlaceholder('Choose statement type...');
    }

    getItems(): TemplateType[] {
        return Object.values(TemplateType);
    }

    getItemText(item: TemplateType): string {
        return item;
    }

    renderSuggestion(item: FuzzyMatch<TemplateType>, el: HTMLElement): void {
        const type = item.item;
        const explanation = getTemplateTypeExplanation(type);
        const container = el.createDiv({ cls: 'suggestion-content' });
        const title = container.createDiv({ cls: 'suggestion-title' });
        title.setText(type);
        if (explanation) {
            let div = container.createDiv({
                text: explanation
            });
            div.style.opacity = '0.5';
            (div.style as any).zoom = '0.8';
        }
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
                            new NumberSuggestModal(plugin.app, editor, (count: number) => {
                                new BooleanSuggestModal(plugin.app, editor, (insertMeta: boolean) => {
                                    editor.replaceSelection(`{{ call .SampleFiles "./${folder.path}/" ${count} ${insertMeta} }}`);
                                }, "Should the filename be passed to the LLM as meta data?").open();
                            }, 'How many random files should be inserted?').open();
                        }).open();
                        break;
                    case TemplateType.SampleFilesDeep:
                        new FolderSuggestModal(plugin.app, editor, (folder: TFolder) => {
                            new NumberSuggestModal(plugin.app, editor, (count: number) => {
                                new BooleanSuggestModal(plugin.app, editor, (insertMeta: boolean) => {
                                    editor.replaceSelection(`{{ call .SampleFilesDeep "./${folder.path}/" ${count} ${insertMeta} }}`);
                                }, "Should the filename be passed to the LLM as meta data?").open();
                            }, 'How many random files should be inserted?').open();
                        }).open();
                        break;
                    case TemplateType.SampleLines:
                        new FileSuggestModal(plugin.app, editor, (file: TFile) => {
                            new NumberSuggestModal(plugin.app, editor, (count: number) => {
                                editor.replaceSelection(`{{ call .SampleLines "./${file.path}" ${count} }}`);
                            }, 'How many random lines should be inserted?').open();
                        }).open();
                        break;
                    case TemplateType.SampleChunk:
                        new FileSuggestModal(plugin.app, editor, (file: TFile) => {
                            new NumberSuggestModal(plugin.app, editor, (count: number) => {
                                editor.replaceSelection(`{{ call .SampleChunk "./${file.path}" ${count} }}`);
                            }, 'How many consecutive lines should be inserted?').open();
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
