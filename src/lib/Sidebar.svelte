<script lang="ts">
  import { addChat, clearChats } from "./Storage.svelte";
  import type { Chat } from "./Types.svelte";

  export let activeChatId: number;
  export let sortedChats: Chat[];
  export let apiKey: string;
  export let view: string;
</script>

<aside class="menu">
  <p class="menu-label">Chats</p>
  <ul class="menu-list">
    {#if sortedChats.length === 0}
      <li><a href={"#"}>No chats yet...</a></li>
    {:else}
      <li>
        <ul>
          {#each sortedChats as chat}
            <li>
              <a
                href={"#"}
                class:is-disabled={!apiKey}
                class:is-active={activeChatId === chat.id}
                on:click|preventDefault={() => (activeChatId = chat.id)}
                >{chat.name || `Chat ${chat.id}`}</a
              >
            </li>
          {/each}
        </ul>
      </li>
    {/if}
  </ul>
  <p class="menu-label">Actions</p>
  <ul class="menu-list">
    <li>
      <a
        href={"#"}
        class="panel-block"
        class:is-disabled={!apiKey}
        class:is-active={!activeChatId}
        on:click|preventDefault={() => {
          activeChatId = null;
          view = "home";
        }}><span class="greyscale mr-2">🔑</span> API key</a
      >
    </li>
    <li>
      <a
        href={"#"}
        class="panel-block"
        class:is-disabled={!apiKey}
        on:click|preventDefault={() => {
          activeChatId = addChat();
          view = "chat";
        }}><span class="greyscale mr-2">➕</span> New chat</a
      >
    </li>
    <li>
      <a
        href={"#"}
        class="panel-block"
        class:is-disabled={!apiKey}
        on:click|preventDefault={() => {
          clearChats();
          activeChatId = null;
          view = "home";
        }}><span class="greyscale mr-2">🗑️</span> Clear chats</a
      >
    </li>
    <li>
      <a
        href={"#"}
        class="panel-block"
        class:is-disabled={!apiKey}
        on:click|preventDefault={() => {
          view = "prompt";
        }}><span class="greyscale mr-2">🤖</span> Prompts</a
      >
    </li>
  </ul>
</aside>
