# CL(A)I for Obsidian

This is a plugin to add [CL(A)I](https://github.com/BigJk/clai) to Obsidian. CL(A)I is an LLM helper to quickly run workflows to generate content. This is useful for TTRPGs and other use cases.

For more information, visit the [CL(A)I documentation](https://github.com/BigJk/clai).

## Setup

When the plugin is installed, you need to go to the settings:
1. Press the button to install / update CL(A)I; this will fetch the latest version of CL(A)I from GitHub.
2. Select your API provider (OpenAI, OpenRouter, or Custom).
3. Enter your API key.
4. Select the model you want to use.

## Usage

- After installing the plugin, you can use the `Run Workflow` command to execute a workflow. This allows you to select the desired workflow, and the result will be inserted at the current cursor position or replace the current selection.
- For testing or debugging purposes, use the `Run Workflow (Dry)` command. This inserts the content that would be sent to the API at the current cursor position without actually executing the workflow.
- To quickly set up a new workflow, use the `Insert Boilerplate` command. This will insert the basic structure of a workflow at the current cursor position.
- To simplify the process of creating a workflow, use the `Insert Template Statement` command. This inserts a template statement at the current cursor position, making it easier to build your workflow.

## Template Tags

The plugin supports various template tags that can be inserted using the `Insert Template Statement` command:

### File Operations
- `{{ call .File "./path/to/file.md" }}`: Inserts the entire contents of the specified file
- `{{ call .SampleFiles "./folder/" n meta }}`: Inserts `n` random files from the specified folder. If `meta` is true, the filename will be passed to the LLM as metadata
- `{{ call .SampleFilesDeep "./folder/" n meta }}`: Same as SampleFiles but includes files from subfolders
- `{{ call .SampleLines "./file.md" n }}`: Inserts `n` random lines from the specified file
- `{{ call .SampleChunk "./file.md" n }}`: Inserts a random chunk of `n` consecutive lines from the specified file

### Context Variables
- `{{ .Clipboard }}`: Inserts the current contents of your clipboard
- `{{ .ActiveTitle }}`: Inserts the title of the currently active note
- `{{ .ActiveNote }}`: Inserts the entire contents of the currently active note
- `{{ .Selection }}`: Inserts the currently selected text in the editor

You can easily insert any of these tags using the `Insert Template Statement` command, which provides an interactive interface with:
1. A fuzzy-searchable list of all available template types with explanations
2. File/folder picker for paths when needed
3. Number selector for quantities
4. Yes/No prompts for metadata inclusion

## Use Case Example: Generating Random Monsters

Let's walk you through an example of what I use CL(A)I for to understand how it works.

1. Imagine you have a `monsters` folder in your vault.
2. In the `monsters` folder, you have all kinds of monsters for your TTRPG as separate notes.
3. Additionally, you have a `setting.md` file where a quick description of the setting is stored.
4. You want to generate a random monster.

Now you can create a `NewMonster` note in the `clai-workflows` folder and input:

```markdown
# CLAI::SYSTEM

You are a helpful assistant that generates new monsters for a tabletop roleplaying game. You will generate a new monster based on the given input.

# CLAI::USER

This is the setting:

{{ call .File "./setting.md" }}

Here are some examples of monsters:

{{ call .SampleFiles "./monsters/" 3 false }}

# CLAI::ASSISTANT

Thank you for the examples! Now tell me about the monster you want to generate.

# CLAI::USER

{{ .Selection }}
```

Now you can run the workflow by pressing the `Run Workflow` command and selecting `NewMonster`.

Let's break down what the workflow does:

- The `# CLAI::SYSTEM` defines the system prompt for this workflow.
- The following `# CLAI::USER` defines a user message:
  - The `{{ call .File "./setting.md" }}` inserts the content of the `setting.md` file.
  - The `{{ call .SampleFiles "./monsters/" 3 false }}` inserts 3 random files from the `monsters` folder used as examples. The `false` indicates that the file names should not be included.
- The `# CLAI::ASSISTANT` defines the assistant message.
- The `{{ .Selection }}` inserts the current selection from the user.

For more information about the `call` functions, see the [CL(A)I documentation](https://github.com/BigJk/clai). 