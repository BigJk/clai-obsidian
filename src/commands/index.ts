import CLAI from 'main';

import { runWorkflowCommand } from './run-workflow';
import { runWorkflowDryCommand } from './run-workflow-dry';
import { insertBoilerplateCommand } from './insert-boilerplate';
import { insertTemplateCommand } from './insert-template';

export const addCommands = (plugin: CLAI) => {
    runWorkflowCommand(plugin);
    runWorkflowDryCommand(plugin);
    insertBoilerplateCommand(plugin);
    insertTemplateCommand(plugin);
};