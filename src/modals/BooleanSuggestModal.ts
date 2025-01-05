import { App, Editor, FuzzySuggestModal } from 'obsidian';

interface BooleanChoice {
    value: boolean;
    display: string;
}

export class BooleanSuggestModal extends FuzzySuggestModal<BooleanChoice> {
    constructor(
        app: App,
        private editor: Editor,
        private onChoose: (value: boolean) => void,
        placeholder: string = 'Choose Yes or No...'
    ) {
        super(app);
        this.setPlaceholder(placeholder);
    }

    getItems(): BooleanChoice[] {
        return [
            { value: true, display: 'Yes' },
            { value: false, display: 'No' }
        ];
    }

    getItemText(item: BooleanChoice): string {
        return item.display;
    }

    onChooseItem(item: BooleanChoice): void {
        this.onChoose(item.value);
    }
}
