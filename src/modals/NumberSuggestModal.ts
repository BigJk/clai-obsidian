import { App, Editor, FuzzySuggestModal } from 'obsidian';

export class NumberSuggestModal extends FuzzySuggestModal<number> {
    constructor(
        app: App,
        private editor: Editor,
        private onChoose: (number: number) => void,
        placeholder: string = 'Choose a number (1-100)...'
    ) {
        super(app);
        this.setPlaceholder(placeholder);
    }

    getItems(): number[] {
        return Array.from({ length: 100 }, (_, i) => i + 1);
    }

    getItemText(item: number): string {
        return item.toString();
    }

    onChooseItem(item: number): void {
        this.onChoose(item);
    }
}
