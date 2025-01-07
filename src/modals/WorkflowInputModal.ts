import { App, Modal, MarkdownView, TFile } from 'obsidian';
import CLAI from 'main';
import { runCLAI } from 'src/clai/run';
import { InsertionMode } from 'src/commands/run-workflow';

export class WorkflowInputModal extends Modal {
    file: TFile;
    plugin: CLAI;
    dry: boolean = false;
    insertionMode: InsertionMode = InsertionMode.ReplaceSelection;

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

    setInsertionMode(mode: InsertionMode) {
        this.insertionMode = mode;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('b', { text: `Run Workflow: ${this.file.basename}` });

        let loadingEl = contentEl.createDiv('loading-container');
        loadingEl.setText('Processing...');
        loadingEl.style.marginTop = '10px';

        const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (!editor) {
            this.close();
            return;
        }

        navigator.clipboard.readText().then((clipboard) => {
            runCLAI(this.plugin.settings, this.file.path, {
                Selection: editor.getSelection(),
                Clipboard: clipboard,
                ActiveTitle: this.app.workspace.getActiveFile()?.basename,
                ActiveNote: editor.getValue(),
            }, this.app, { dry: !!this.dry }).then((res) => {
                const cursor = editor.getCursor();
                const selection = editor.getSelection();

                switch (this.insertionMode) {
                    case InsertionMode.BeforeSelection:
                        const from = editor.posToOffset(editor.getCursor('from'));
                        editor.replaceRange(res + '\n', editor.offsetToPos(from));
                        break;
                    case InsertionMode.AfterSelection:
                        const to = editor.posToOffset(editor.getCursor('to'));
                        editor.replaceRange('\n' + res, editor.offsetToPos(to));
                        break;
                    case InsertionMode.AtCursor:
                        editor.replaceRange(res, cursor);
                        break;
                    case InsertionMode.NewNote:
                        const fileName = 'clai result.md';
                        const filePath = this.app.vault.getRoot().path + '/' + fileName;
                        this.app.vault.create(filePath, res).then((file) => {
                            this.app.workspace.getLeaf().openFile(file);
                        });
                        break;
                    case InsertionMode.ReplaceSelection:
                    default:
                        editor.replaceSelection(res);
                        break;
                }
                this.close();
            }).catch((error) => {
                console.error('CLAI processing failed:', error);
                loadingEl.setText('Processing failed. Please try again.');
                setTimeout(() => {
                    this.close();
                }, 1500);
            })
        });
    }
}
