import { App, Modal, MarkdownView, TFile } from 'obsidian';
import CLAI from 'main';
import { runCLAI } from 'src/clai/run';

export class WorkflowInputModal extends Modal {
    file: TFile;
    plugin: CLAI;
    dry: boolean = false;

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
                editor?.replaceSelection(res);
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
