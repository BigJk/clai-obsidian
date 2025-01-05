import { MarkdownView } from 'obsidian';
import CLAI from '../../main';

export const insertBoilerplateCommand = (plugin: CLAI) => {
    return plugin.addCommand({
        id: 'clai-insert-boilerplate',
        name: 'Insert Boilerplate',
        checkCallback: (checking: boolean) => {
            const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
            if (editor) {
                if (!checking) {
                    editor.replaceSelection(`---
name: "Test Name"
description: "Test Description"
---

# CLAI::SYSTEM

You are a helpful assistant that ...

# CLAI::USER

...

{{ call .File "./some_file.md" }}
{{ call .SampleFiles "./some_folder/" 3 false }}
{{ .Clipboard }}
{{ .ActiveTitle }}
{{ .ActiveNote}}

# CLAI::ASSISTANT

Thank you for the examples! Now tell me about ...

# CLAI::USER

{{ .Selection }}`);
                }
                return true;
            }
        }
    });
};
