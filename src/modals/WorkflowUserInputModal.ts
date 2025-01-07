import { App, Modal, TextComponent } from 'obsidian';

export class WorkflowUserInputModal extends Modal {
    private input: string = '';
    private onSubmit: (result: string) => void;

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h3', { text: 'Workflow Input Required' });

        const inputContainer = contentEl.createDiv('input-container');
        const inputField = new TextComponent(inputContainer);
        inputField.inputEl.style.width = '100%';
        inputField.setPlaceholder('Enter your input...');
        inputField.onChange((value) => {
            this.input = value;
        });
        inputField.inputEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.close();
                this.onSubmit(this.input);
            }
        });

        const buttonContainer = contentEl.createDiv('button-container');
        buttonContainer.style.marginTop = '1rem';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '0.5rem';

        const submitButton = buttonContainer.createEl('button', { text: 'Submit' });
        submitButton.addEventListener('click', () => {
            this.close();
            this.onSubmit(this.input);
        });

        const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelButton.addEventListener('click', () => {
            this.close();
        });

        // Focus the input field
        inputField.inputEl.focus();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
