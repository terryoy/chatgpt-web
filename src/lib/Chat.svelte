<script lang="ts">
  //import { fetchEventSource } from "@microsoft/fetch-event-source";
  import {
    apiKeyStorage,
    apiHostStorage,
    chatsStorage,
    addMessage,
    clearMessages,
    promptStorage
  } from './Storage.svelte'

  import {
    type Request,
    type Response,
    type Message,
    type Settings,
    type ResponseModels,
    type SettingsSelect,type Chat,
    supportedModels
  } from "./Types.svelte";
  import Prompts from './Prompts.svelte'
  import Messages from './Messages.svelte'
  import Code from "./Code.svelte";
  import { exportAsMarkdown } from "./Export.svelte";
  import { afterUpdate, onMount } from 'svelte'
  import { replace } from 'svelte-spa-router'

  // This makes it possible to override the OpenAI API base URL in the .env file
  export const apiBase = import.meta.env.VITE_API_BASE || "https://api.openai.com";
  export const getApiHost = () => $apiHostStorage || apiBase;

  export let params = { chatId: undefined || '' };
  let chatId: number = parseInt(params.chatId);

  let updating: boolean = false;
  let input: HTMLTextAreaElement;
  let settings: HTMLDivElement;
  let shouldShowSettings = false;
  let chatNameSettings: HTMLFormElement;
  let shouldShowChatNameSettings = false;
  let recognition: any = null;
  let recording = false;
  let showPromptList = false;
  let promptList = true;

  const modelSetting: Settings & SettingsSelect = {
    key: 'model',
    name: 'Model',
    default: 'gpt-3.5-turbo',
    title: 'The model to use - GPT-3.5 is cheaper, but GPT-4 is more powerful.',
    options: supportedModels,
    type: 'select'
  }

  let settingsMap: Settings[] = [
    modelSetting,
    {
      key: 'temperature',
      name: 'Sampling Temperature',
      default: 1,
      title: 'What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.\n' +
              '\n' +
              'We generally recommend altering this or top_p but not both.',
      min: 0,
      max: 2,
      step: 0.1,
      type: 'number'
    },
    {
      key: 'top_p',
      name: 'Nucleus Sampling',
      default: 1,
      title: 'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.\n' +
              '\n' +
              'We generally recommend altering this or temperature but not both',
      min: 0,
      max: 1,
      step: 0.1,
      type: 'number'
    },
    {
      key: 'n',
      name: 'Number of Messages',
      default: 1,
      title: 'How many chat completion choices to generate for each input message.',
      min: 1,
      max: 10,
      step: 1,
      type: 'number'
    },
    {
      key: 'max_tokens',
      name: 'Max Tokens',
      title: 'The maximum number of tokens to generate in the completion.\n' +
              '\n' +
              'The token count of your prompt plus max_tokens cannot exceed the model\'s context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).\n',
      default: 0,
      min: 0,
      max: 32768,
      step: 1024,
      type: 'number'
    },
    {
      key: 'presence_penalty',
      name: 'Presence Penalty',
      default: 0,
      title: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.',
      min: -2,
      max: 2,
      step: 0.2,
      type: 'number'
    },
    {
      key: 'frequency_penalty',
      name: 'Frequency Penalty',
      default: 0,
      title: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
      min: -2,
      max: 2,
      step: 0.2,
      type: 'number'
    }
  ]

  $: chat = $chatsStorage.find((chat) => chat.id === chatId) as Chat
  $: prompts = $promptStorage

  onMount(async () => {
    // Pre-select the last used model
    if (chat.messages.length > 0) {
      modelSetting.default = chat.messages[chat.messages.length - 1].model || modelSetting.default
      settingsMap = settingsMap
    }

    // Focus the input on mount
    input.focus()

    // Try to detect speech recognition support
    if ('SpeechRecognition' in window) {
      // @ts-ignore
      recognition = new window.SpeechRecognition()
    } else if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      recognition = new window.webkitSpeechRecognition() // eslint-disable-line new-cap
    }

    if (recognition) {
      recognition.interimResults = false
      recognition.onstart = () => {
        recording = true
      }
      recognition.onresult = (event) => {
        // Stop speech recognition, submit the form and remove the pulse
        const last = event.results.length - 1
        const text = event.results[last][0].transcript
        input.value = text
        recognition.stop()
        recording = false
        submitForm(true)
      }
    } else {
      console.log('Speech recognition not supported')
    }
  })

  // Scroll to the bottom of the chat on update
  afterUpdate(() => {
    // Scroll to the bottom of the page after any updates to the messages array
    document.querySelector('#content')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    input.focus()
  })


  // Send API request
  const sendRequest = async (messages: Message[]): Promise<Response> => {
    // Show updating bar
    updating = true

    let response: Response
    try {
      const request: Request = {
        // Submit only the role and content of the messages, provide the previous messages as well for context
        messages: messages
          .map((message): Message => {
            const { role, content } = message
            return { role, content }
          })
          // Skip error messages
          .filter((message) => message.role !== 'error'),

        // Provide the settings by mapping the settingsMap to key/value pairs
        ...settingsMap.reduce((acc, setting) => {
          const value = (settings.querySelector(`#settings-${setting.key}`) as HTMLInputElement).value
          if (value) {
            acc[setting.key] = setting.type === 'number' ? parseFloat(value) : value
          }
          return acc
        }, {})
      }

      // Not working yet: a way to get the response as a stream
      /*
      request.stream = true
      await fetchEventSource(apiBase + '/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization:
          `Bearer ${$apiKeyStorage}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        onmessage (ev) {
          const data = JSON.parse(ev.data)
          console.log(data)
        },
        onerror (err) {
          throw err
        }
      })
      */

      response = await (
        await fetch(`${getApiHost()}/v1/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${$apiKeyStorage}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        })
      ).json()
    } catch (e) {
      response = { error: { message: e.message } } as Response
    }

    // Hide updating bar
    updating = false

    return response
  }

  const resizeInput = () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  }

  const submitForm = async (
    recorded: boolean = false,
    retry: boolean = false
  ): Promise<void> => {
    // Compose the input message
    if (!retry) {
      const inputMessage: Message = { role: "user", content: input.value };
      addMessage(chatId, inputMessage);
    }

    // Clear the input value
    input.value = ''
    input.blur()

    // Resize back to single line height
    input.style.height = 'auto'

    const response = await sendRequest(chat.messages)

    if (response.error) {
      // TODO: Add request retry logic
      addMessage(chatId, {
        role: 'error',
        content: `Error: ${response.error.message}`
      })
    } else {
      response.choices.forEach((choice) => {
        // Store usage and model in the message
        choice.message.usage = response.usage
        choice.message.model = response.model
  
        // Remove whitespace around the message that the OpenAI API sometimes returns
        choice.message.content = choice.message.content.trim()
        addMessage(chatId, choice.message)
        // Use TTS to read the response, if query was recorded
        if (recorded && 'SpeechSynthesisUtterance' in window) {
          const utterance = new SpeechSynthesisUtterance(choice.message.content)
          window.speechSynthesis.speak(utterance)
        }
      })
    }
  }

  const suggestName = async (): Promise<void> => {
    const suggestMessage: Message = {
      role: 'user',
      content: "Can you give me a 5 word summary of this conversation's topic?"
    }
    addMessage(chatId, suggestMessage)

    const response = await sendRequest(chat.messages)

    if (response.error) {
      addMessage(chatId, {
        role: 'error',
        content: `Error: ${response.error.message}`
      })
    } else {
      response.choices.forEach((choice) => {
        choice.message.usage = response.usage
        addMessage(chatId, choice.message)
        chat.name = choice.message.content
        chatsStorage.set($chatsStorage)
      })
    }
  }

  const deleteChat = () => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      replace('/').then(() => {
        chatsStorage.update((chats) => chats.filter((chat) => chat.id !== chatId))
      })
    }
  }

  const showChatNameSettings = () => {
    chatNameSettings.classList.add('is-active');
    (chatNameSettings.querySelector('#settings-chat-name') as HTMLInputElement).focus()
  }

  const saveChatNameSettings = () => {
    const newChatName = (chatNameSettings.querySelector('#settings-chat-name') as HTMLInputElement).value
    // save if changed
    if (newChatName && newChatName !== chat.name) {
      chat.name = newChatName
      chatsStorage.set($chatsStorage)
    }
    closeChatNameSettings()
  }

  const closeChatNameSettings = () => {
    chatNameSettings.classList.remove('is-active')
  }

  const showSettings = async () => {
    settings.classList.add('is-active')

    // Load available models from OpenAI
    const allModels = (await (
      await fetch(apiBase + '/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${$apiKeyStorage}`,
          'Content-Type': 'application/json'
        }
      })
    ).json()) as ResponseModels
    const filteredModels = supportedModels.filter((model) => allModels.data.find((m) => m.id === model))

    // Update the models in the settings
    modelSetting.options = filteredModels
    settingsMap = settingsMap
  }

  const closeSettings = () => {
    settings.classList.remove("is-active");
  };

  const clearSettings = () => {
    settingsMap.forEach((setting) => {
      const input = settings.querySelector(`#settings-${setting.key}`) as HTMLInputElement
      input.value = ''
    })
  }

  const recordToggle = () => {
    // Check if already recording - if so, stop - else start
    if (recording) {
      recognition?.stop()
      recording = false
    } else {
      recognition?.start()
    }
  };

  // -- Function block: Insert Prompt
  let promptAssist = {
    prompts: [],
    searchKey: ''
  }
  $: promptList = promptAssist.prompts;
  $: promptSearchKey = promptAssist.searchKey
  const testPromptSearch = () => {
    const searchKey = input.value;
    if (/\/[0-9a-zA-Z\-]*$/.test(searchKey)) {
      showPromptList = true;
      const promptSearchKey = searchKey.substring(1);
      console.log("prompt search:", promptSearchKey);
      promptAssist.searchKey = promptSearchKey
      promptAssist.prompts = searchKey ? 
        prompts.filter((p) => 
          p.cmd.indexOf(promptSearchKey) == 0 || p.act.indexOf(promptSearchKey) >= 0) 
        : prompts;
    } else {
      showPromptList = false;
      promptAssist = prompts
    }
  };

  const navigatePromptSearch = (e) => {
    if (!showPromptList) {
      return;
    }

    switch (e.key) {
      case "Up": {
        console.log("up");
        break;
      }
      case "Down": {
        console.log("down");
        break;
      }
    }
  };

  const setPrompt = (prompt) => {
    // Set the prompt
    input.value = prompt;
    resizeInput()
    showPromptList = false

    // Submit the form
    // submitForm();
  };
</script>

<nav class="level chat-header">
  <div class="level-left">
    <div class="level-item">
      <p class="subtitle is-5">
        {chat.name || `Chat ${chat.id}`}
        <a href={'#'} class="greyscale ml-2 is-hidden has-text-weight-bold editbutton" title="Rename chat" on:click|preventDefault={showChatNameSettings}>✏️</a>
        <a href={'#'} class="greyscale ml-2 is-hidden has-text-weight-bold editbutton" title="Suggest a chat name" on:click|preventDefault={suggestName}>💡</a>
        <a href={"#"} class="greyscale ml-2 is-hidden has-text-weight-bold editbutton" title="Export this chat" on:click|preventDefault={() => { exportAsMarkdown(chat.id); }} > 📥 </a>
        <a href={'#'} class="greyscale ml-2 is-hidden has-text-weight-bold editbutton" title="Delete this chat" on:click|preventDefault={deleteChat}>🗑️</a>
      </p>
    </div>
  </div>

  <div class="level-right">
    <p class="level-item">
      <button class="button is-warning" on:click={() => { clearMessages(chatId) }}><span class="greyscale mr-2">🗑️</span> Clear messages</button>
    </p>
  </div>
</nav>

<Messages bind:input messages={chat.messages} defaultModel={modelSetting.default} />

{#if updating}
  <article class="message is-success assistant-message">
    <div class="message-body content">
      <span class="is-loading" />
    </div>
  </article>
{/if}

{#if chat.messages.length === 0}
  <Prompts bind:input />
{/if}

<form class="field has-addons has-addons-right is-align-items-flex-end" on:submit|preventDefault={() => submitForm()}>
  <p class="control is-expanded">
    <textarea
      class="input is-info is-focused chat-input"
      placeholder="Type your message here...Ctrl+Enter or Meta+Enter to Send"
      rows="1"
      on:keydown={(e) => {
        // Only send if Enter is pressed, not Shift+Enter
        const isMetaOrCtrl = e.metaKey || e.ctrlKey;
        if (e.key === "Enter" && isMetaOrCtrl) {
          submitForm();
          e.preventDefault();
        } else {
          navigatePromptSearch(e)
        }
      }}
      on:input={(e) => {
        // Resize the textarea to fit the content - auto is important to reset the height after deleting content
        resizeInput()
        testPromptSearch();
      }}
      bind:this={input}
    />
    {#if showPromptList && promptList}
      <div class="notification code-hints">
        {#each promptList as prompt}
          <div class="hint-item" 
            on:click={() => setPrompt(prompt.prompt)} 
            on:keydown={(e) => e.key == 'Enter' && setPrompt(prompt.prompt)}>
            {prompt.act}
          </div>
        {/each}
      </div>
    {/if}
  </p>
  <p class="control" class:is-hidden={!recognition}>
    <button
      class="button"
      class:is-pulse={recording}
      on:click|preventDefault={recordToggle}
      ><span class="greyscale">🎤</span></button
    >
  </p>
  <p class="control">
    <button class="button" on:click|preventDefault={showSettings}
      ><span class="greyscale">⚙️</span></button
    >
  </p>
  <p class="control">
    <button class="button is-info" type="submit">Send</button>
  </p>
</form>

<svelte:window
  on:keydown={(event) => {
    if (event.key === 'Escape') {
      closeSettings()
      closeChatNameSettings()
    }
  }}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal" bind:this={settings}>
  <div class="modal-background" on:click={closeSettings} />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Settings</p>
    </header>
    <section class="modal-card-body">
      {#each settingsMap as setting}
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label" for="settings-{setting.key}">{setting.name}</label>
          </div>
          <div class="field-body">
            <div class="field">
              {#if setting.type === 'number'}
                <input
                  class="input"
                  inputmode="decimal"
                  type={setting.type}
                  title="{setting.title}"
                  id="settings-{setting.key}"
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  placeholder={String(setting.default)}
                />
              {:else if setting.type === 'select'}
                <div class="select">
                  <select id="settings-{setting.key}" title="{setting.title}">
                    {#each setting.options as option}
                      <option value={option} selected={option === setting.default}>{option}</option>
                    {/each}
                  </select>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </section>

    <footer class="modal-card-foot">
      <button class="button is-info" on:click={closeSettings}
        >Close settings</button
      >
      <button class="button" on:click={clearSettings}>Clear settings</button>
    </footer>
  </div>
</div>

<!-- rename modal -->
<form class="modal" bind:this={chatNameSettings} on:submit={saveChatNameSettings}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="modal-background" on:click={closeChatNameSettings} />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Enter a new name for this chat</p>
    </header>
    <section class="modal-card-body">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="settings-chat-name">New name:</label>
        </div>
        <div class="field-body">
          <div class="field">
            <input
              class="input"
              type="text"
              id="settings-chat-name"
              value={chat.name}
            />
          </div>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      <input type="submit" class="button is-info" value="Save" />
      <button class="button" on:click={closeChatNameSettings}>Cancel</button>
    </footer>
  </div>
</form>
<!-- end -->
