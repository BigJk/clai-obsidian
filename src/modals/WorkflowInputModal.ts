import { App, Modal, MarkdownView, TFile } from 'obsidian';
import CLAI from 'main';
import { runCLAI } from 'src/clai/run';
import { InsertionMode } from 'src/commands/run-workflow';
import { WorkflowUserInputModal } from './WorkflowUserInputModal';
import { FileSuggestModal } from './FileSuggestModal';

export class WorkflowInputModal extends Modal {
    file: TFile;
    plugin: CLAI;
    dry: boolean = false;
    onlyLoader: boolean = false;
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

    setOnlyLoader(onlyLoader: boolean) {
        this.onlyLoader = onlyLoader;
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

        if (this.onlyLoader) {
            return;
        }

        const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (!editor) {
            this.close();
            return;
        }

        this.app.vault.read(this.file).then((workflowContent) => {
            const additionalSteps: Promise<any>[] = [];

            if (workflowContent.includes('.Input')) {
                additionalSteps.push(new Promise((resolve) => {
                    const inputModal = new WorkflowUserInputModal(this.app, (userInput) => {
                        resolve({ Input: userInput });
                    });
                    inputModal.open();
                }));
            }

            if (workflowContent.includes('.AskForNote')) {
                additionalSteps.push(new Promise((resolve) => {
                    const fileModal = new FileSuggestModal(this.app, editor, (file: TFile) => {
                        this.app.vault.read(file).then((content) => {
                            resolve({ AskForNote: content });
                        });
                    });
                    fileModal.setPlaceholder('Select a note...');
                    fileModal.open();
                }));
            }

            if (additionalSteps.length === 0) {
                this.executeWorkflow(editor);
            } else {
                this.close();
                Promise.all(additionalSteps).then((results) => {
                    this.setOnlyLoader(true);
                    this.open();
                    this.executeWorkflow(editor, Object.assign({}, ...results))
                }).catch((error) => {
                    console.log('CLAI processing failed:', error);
                });
            }
        });
    }

    private executeWorkflow(editor: any, additional?: any) {
        const contentEl = this.contentEl;
        contentEl.empty();
        const loadingEl = contentEl.createDiv();
        loadingEl.setText('Processing...');

        navigator.clipboard.readText().then((clipboard) => {
            const data = {
                Selection: editor.getSelection(),
                Clipboard: clipboard,
                ActiveTitle: this.app.workspace.getActiveFile()?.basename,
                ActiveNote: editor.getValue(),
            };

            // Add user input if provided
            if (additional !== undefined) {
                Object.assign(data, additional);
            }

            runCLAI(this.plugin.settings, this.file.path, data, this.app, { dry: !!this.dry }).then((res) => {
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
