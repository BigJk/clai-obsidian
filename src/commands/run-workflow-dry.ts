import { TextFileView } from 'obsidian';
import { WorkflowSuggestModal } from '../modals/WorkflowSuggestModal';
import CLAI from '../../main';

export const runWorkflowDryCommand = (plugin: CLAI) => {
    return plugin.addCommand({
        id: 'clai-run-workflow-dry',
        name: 'Run Workflow (Dry)',
        checkCallback: (checking: boolean) => {
            const view = plugin.app.workspace.getActiveViewOfType(TextFileView);
            if (view) {
                if (!checking) {
                    const modal = new WorkflowSuggestModal(plugin.app, plugin);
                    modal.setPlaceholder("Select a workflow...");
                    modal.setDry(true);
                    modal.open();
                }
                return true;
            }
        }
    });
};
