# CL(A)I for Obsidian

[![Discord](https://img.shields.io/discord/1099310842564059168?label=discord)](https://discord.gg/XpDvfvVuB2) [![GitHub release (latest by date)](https://img.shields.io/github/v/release/BigJk/clai-obsidian)](https://github.com/BigJk/clai-obsidian/releases)

*This is a plugin to add [CL(A)I](https://github.com/BigJk/clai) to Obsidian. CL(A)I is an LLM helper to quickly run workflows to generate or modify content. This is useful for automating things like creating notes for TTRPGs and other repetitive use cases (summarise, convert to bullet points, spell & grammar check, and more). CL(A)I can serve as a LLM macro toolbox in Obsidian.*

---

![Screenshot](./.github/screenshot.png)

> [!IMPORTANT]  
> [Watch the video to see it in action](https://streamable.com/mj43tn)

> [!NOTE]  
> In the above example the left workflow results in the right result when run. The template syntax essentially tells the template to insert the ``setting`` note where the basic information about the setting is stored. Then the notes ``race``, ``background``and ``cities`` contain said content as list. The Template will take random lines from them before sending it to the LLM. For example ``{{ call .SampleLines "./races.md" 1 }}`` means ``to take 1 random line from the races.md note and put it there``.
>
> With this you can build really creative generator workflows!

## Setup

When the plugin is installed, you need to go to the settings:
1. Press the button to install / update CL(A)I; this will fetch the latest version of CL(A)I from GitHub.
2. Select your API provider (OpenAI, OpenRouter, or Custom).
3. Enter your API key.
4. Select the model you want to use.

## Usage

![Screenshot](./.github/screenshot_commands.png)

- After installing the plugin, you can use the `Run Workflow` command to execute a workflow. This allows you to select the desired workflow, and the result will be inserted at the current cursor position or replace the current selection.
- For testing or debugging purposes, use the `Run Workflow (Dry)` command. This inserts the content that would be sent to the API at the current cursor position without actually executing the workflow.
- To quickly set up a new workflow, use the `Insert Boilerplate` command. This will insert the basic structure of a workflow at the current cursor position.
- To simplify the process of creating a workflow, use the `Insert Template Statement` command. This inserts a template statement at the current cursor position, making it easier to build your workflow.

## Template Tags

The plugin supports various template tags that can be inserted using the `Insert Template Statement` command:

### Interactive Variables
- `{{ .Input }}`: Prompts the user for input when the workflow is run. The entered text will be inserted at this position.
- `{{ .AskForNote }}`: Opens a file selector to choose a note from your vault. The content of the selected note will be inserted at this position.

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

## Use Case Example: Refactor Text

A very simple example of what you can do with CL(A)I is to refactor the selected text based on user input. 
You can create a `Refactor` note in the `clai-workflows` folder and input:

```markdown
---
name: "📙 Refactor"
description: "Refactor based on input"
---

# CLAI::SYSTEM

You are a helpful assistant that refactors text.
Only output the refactored text, nothing else.
Your goal is: {{ .Input }}

# CLAI::USER

{{ .Selection }}
```

Let's break down what the workflow does:

- The frontmatter defines the name and description of the workflow that will be shown in the selection list.
- The `# CLAI::SYSTEM` defines the system prompt for this workflow.
  - When `{{ .Input }}` is present running the workflow will open a text input dialog. The result will be inserted at this position.
- The following `# CLAI::USER` defines a user message:
  - The `{{ .Selection }}` inserts the current selection from the user.

## Use Case Example: Generating Random Monsters

Let's walk you through an example of what I use CL(A)I for to understand how it works.

1. Imagine you have a `monsters` folder in your vault.
2. In the `monsters` folder, you have all kinds of monsters for your TTRPG as separate notes.
3. Additionally, you have a `setting.md` file where a quick description of the setting is stored.
4. You want to generate a random monster.

Now you can create a `NewMonster` note in the `clai-workflows` folder and input:

```markdown
---
name: "🐊 Generate a random Monster"
description: "Generates a random monster based on selection text"
---

# CLAI::SYSTEM

You are a helpful assistant that generates new monsters for a tabletop roleplaying game.
You will generate a new monster based on the given input.

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

- The frontmatter defines the name and description of the workflow that will be shown in the selection list.
- The `# CLAI::SYSTEM` defines the system prompt for this workflow.
- The following `# CLAI::USER` defines a user message:
  - The `{{ call .File "./setting.md" }}` inserts the content of the `setting.md` file.
  - The `{{ call .SampleFiles "./monsters/" 3 false }}` inserts 3 random files from the `monsters` folder used as examples. The `false` indicates that the file names should not be included.
- The `# CLAI::ASSISTANT` defines the assistant message.
- The `{{ .Selection }}` inserts the current selection from the user.

For more information about the `call` functions, see the [CL(A)I documentation](https://github.com/BigJk/clai). 

## Whats the difference between `CL(A)I` and the `Text Generator Plugin`?

I didn't know about the awesome [Text Generator](https://github.com/nhaouari/obsidian-textgenerator-plugin) initially because `CL(A)I` started without Obsidian in mind, only after building it I realized that I wanted the functionality of it inside of Obsidian too. So to make it quick:
- `CL(A)I` is also a standalone CLI tool that can be used without Obsidian, while `Text Generator` is a plugin for Obsidian and tightly integrated with it.
- `CL(A)I` focuses more on the ``take random notes from folder``, ``take random lines from note``, ``insert note X here`` use cases to build a interesting base for the LLMs. I think `Text Generator` doesn't cover this in the same way.
- `CL(A)I` supports dynamic variables like `{{ .Input }}` and `{{ .AskForNote }}` that prompt for additional input, when running the workflow.
- `Text Generator` has a template hub where you can share your own templates, while `CL(A)I` doesn't
- `CL(A)I` has a different syntax based on go's [html/template](https://pkg.go.dev/html/template) 
- `CL(A)I` lets you define system, user and assistant messages however you want on per template basis. I think `Text Generator` doesn't let you do this.
- Both support a wide range of models
- `Text Generator` is around longer, has more diverse features and more mature than `CL(A)I`

## Found the project useful? :smiling_face_with_three_hearts:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/A0A763FPT)
