import { TextFileView } from 'obsidian';
import { WorkflowSuggestModal } from '../modals/WorkflowSuggestModal';
import CLAI from '../../main';

export enum InsertionMode {
    ReplaceSelection = 'replace',
    BeforeSelection = 'before',
    AfterSelection = 'after',
    AtCursor = 'cursor',
    NewNote = 'new-note'
}

export const runWorkflowCommand = (plugin: CLAI) => {
    const createCommand = (id: string, name: string, mode: InsertionMode) => {
        plugin.addCommand({
            id: `clai-run-workflow${id ? '-' + id : ''}`,
            name: name,
            checkCallback: (checking: boolean) => {
                const view = plugin.app.workspace.getActiveViewOfType(TextFileView);
                if (view) {
                    if (!checking) {
                        const modal = new WorkflowSuggestModal(plugin.app, plugin);
                        modal.setPlaceholder("Select a workflow...");
                        modal.setInsertionMode(mode);
                        modal.open();
                    }
                    return true;
                }
            }
        });
    };

    // Default command - replaces selection
    createCommand('', 'Run Workflow', InsertionMode.ReplaceSelection);

    // Additional commands with different insertion modes
    createCommand('insert-before', 'Run Workflow (Insert Before Selection)', InsertionMode.BeforeSelection);
    createCommand('insert-after', 'Run Workflow (Insert After Selection)', InsertionMode.AfterSelection);
    createCommand('insert-at-cursor', 'Run Workflow (Insert At Cursor)', InsertionMode.AtCursor);
    createCommand('new-note', 'Run Workflow (Create New Note)', InsertionMode.NewNote);
};
