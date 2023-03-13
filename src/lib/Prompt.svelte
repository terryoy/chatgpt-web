<script context="module" lang="ts">
  import { get } from "svelte/store";
  import { promptStorage } from "./Storage.svelte";
  import type { Prompt } from "./Types.svelte";

  export const importPrompts = (newPrompts: Prompt[]) => {
    const prompts = get(promptStorage);
    const appendPrompts = newPrompts
      .filter((newPrompt) => {
        const prompt = prompts.find((prompt) => prompt.cmd === newPrompt.cmd);
        return prompt === undefined;
      })
      .forEach((newPrompt) => {
        prompts.push(newPrompt);
      });

    promptStorage.set(prompts);
  };
</script>
