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

Once the plugin is installed, you can use the command `Run Workflow` to run a workflow. This will let you select the workflow and input the data that should be passed to the workflow and hit ENTER. **The result will be inserted into the current cursor position.**

You can also use the command `Run Workflow (Dry)` to insert the content that would be send to the API into the current cursor position without actually running the workflow. This is useful for testing / debugging the workflow.

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

{{ .Input }}
```

Now you can run the workflow by pressing the `Run Workflow` command and selecting `NewMonster`.

Let's break down what the workflow does:

- The `# CLAI::SYSTEM` defines the system prompt for this workflow.
- The following `# CLAI::USER` defines a user message:
  - The `{{ call .File "./setting.md" }}` inserts the content of the `setting.md` file.
  - The `{{ call .SampleFiles "./monsters/" 3 false }}` inserts 3 random files from the `monsters` folder used as examples. The `false` indicates that the file names should not be included.
- The `# CLAI::ASSISTANT` defines the assistant message.
- The `{{ .Input }}` inserts the input from the user, which the plugin will let you input.

For more information about the `call` functions, see the [CL(A)I documentation](https://github.com/BigJk/clai). 