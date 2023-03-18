import Home from "./lib/Home.svelte";
import Chat from "./lib/Chat.svelte";
import NewChat from "./lib/NewChat.svelte";
import Prompt from "./lib/Prompt.svelte";

export default {
  "/": Home,

  "/chat/new": NewChat,
  "/chat/:chatId": Chat,

  "/prompt": Prompt,

  "*": Home,
};
