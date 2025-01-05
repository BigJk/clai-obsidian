import { TextFileView } from 'obsidian';
import { WorkflowSuggestModal } from '../modals/WorkflowSuggestModal';
import CLAI from '../../main';

export const runWorkflowCommand = (plugin: CLAI) => {
    return plugin.addCommand({
        id: 'clai-run-workflow',
        name: 'Run Workflow',
        checkCallback: (checking: boolean) => {
            const view = plugin.app.workspace.getActiveViewOfType(TextFileView);
            if (view) {
                if (!checking) {
                    const modal = new WorkflowSuggestModal(plugin.app, plugin);
                    modal.setPlaceholder("Select a workflow...");
                    modal.open();
                }
                return true;
            }
        }
    });
};
