<script context="module" lang="ts">
  import { persisted } from 'svelte-local-storage-store'
  import { get } from 'svelte/store'
  import type { Chat, Message, Prompt } from "./Types.svelte";

  export const chatsStorage = persisted("chats", [] as Chat[]);
  export const apiKeyStorage = persisted("apiKey", '' as string);
  export const apiHostStorage = persisted("apiHost", '' as string);
  export const promptStorage = persisted("prompts", [] as Prompt[]);


  /* Storage::Chats */
  export const addChat = (): number => {
    const chats = get(chatsStorage)

    // Find the max chatId
    const chatId = chats.reduce((maxId, chat) => Math.max(maxId, chat.id), 0) + 1

    // Add a new chat
    chats.push({
      id: chatId,
      name: `Chat ${chatId}`,
      messages: []
    })
    chatsStorage.set(chats)
    return chatId
  }

  export const clearChats = () => {
    chatsStorage.set([])
  }

  /* Storage::Chats::Messages */
  export const addMessage = (chatId: number, message: Message) => {
    const chats = get(chatsStorage)
    const chat = chats.find((chat) => chat.id === chatId) as Chat
    chat.messages.push(message)
    chatsStorage.set(chats)
  }

  export const editMessage = (chatId: number, index: number, newMessage: Message) => {
    const chats = get(chatsStorage)
    const chat = chats.find((chat) => chat.id === chatId) as Chat
    chat.messages[index] = newMessage
    chat.messages.splice(index + 1) // remove the rest of the messages
    chatsStorage.set(chats)
  }

  export const clearMessages = (chatId: number) => {
    const chats = get(chatsStorage)
    const chat = chats.find((chat) => chat.id === chatId) as Chat
    chat.messages = []
    chatsStorage.set(chats)
  }

  export const deleteChat = (chatId: number) => {
    const chats = get(chatsStorage);
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);
    chats.splice(chatIndex, 1);
    chatsStorage.set(chats);
  };


  /* Storage::Prompts */
  export const addNewPrompts = (newPrompts: Prompt[]) => {
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

  export const updatePrompt = (newPrompt: Prompt) => {
    promptStorage.update(prompts => prompts.map((prompt) => {
      if (prompt.cmd === newPrompt.cmd) {
        return newPrompt
      }
      return prompt
    }))
  }

  export const deletePrompt = (prompt:Prompt) => {
    const updatedPrompts = get(promptStorage).filter(p => p.act !== prompt.act)
    promptStorage.set(updatedPrompts)
  }

  export const clearPrompt = () => {
    promptStorage.set([])
  }

</script>
