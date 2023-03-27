<script context="module" lang="ts">
  import { get } from "svelte/store";
  import {
    addNewPrompts,
    deletePrompt,
    promptStorage,
    updatePrompt,
  } from "./Storage.svelte";
  import type { Prompt } from "./Types.svelte";

  // Function: Table Pagination
  // 首先定义需要渲染的数据
  let searchText = "";
  let prompts = get(promptStorage);
  let tableData: Prompt[] = prompts;
  updateFilterAndPagination();

  const PAGE_SIZE = 10;
  let currentPage = 1;
  let startIndex = 0;
  let endIndex = PAGE_SIZE - 1;

  // 处理分页页码变化的逻辑
  function handlePageChange(page) {
    currentPage = page;
    startIndex = (currentPage - 1) * PAGE_SIZE;
    endIndex = startIndex + PAGE_SIZE - 1;
  }

  // 搜索过滤表格数据
  function handleSearch(event) {
    const searchText = event.target.value.toLowerCase();
  }

  function updateFilterAndPagination() {
    tableData = prompts.filter((item) => {
      const name = item.act.toLowerCase();
      return name.includes(searchText);
    });
  }

  // 处理单元格编辑
  function handleCellEdit(event, id, column) {
    const { value } = event.target;
    const index = tableData.findIndex((item) => item.cmd === id);
    tableData[index][column] = value;
  }

  // Function: Prompt Edit

  let promptEditModal: HTMLElement;
  let editForm = {
    isNew: true,
    prompt: null,
  };

  const showPromptEditModal = () => {
    promptEditModal.classList.add("is-active");
  };

  const closePromptEditModal = () => {
    promptEditModal.classList.remove("is-active");
  };

  // new single prompt
  const addPromptClick = () => {
    editForm = {
      isNew: true,
      prompt: {
        cmd: "",
        act: "",
        prompt: "",
        enabled: true,
      },
    };
    showPromptEditModal();
  };

  const editPromptClick = (prompt) => {
    editForm = {
      isNew: false,
      prompt,
    };
    showPromptEditModal();
  };

  const deletePromptClick = (prompt) => {
    deletePrompt(prompt);
  };

  const _validatePromptForm = () => {
    return true;
  };

  const savePromptEditModal = (e) => {
    if (!_validatePromptForm()) {
      // show validation error
      return;
    }

    if (editForm.isNew) {
      addNewPrompts([editForm.prompt]);
    } else {
      updatePrompt(editForm.prompt);
    }

    console.log("save successfully");
  };

  // import prompts from a file
  let fileInput: HTMLInputElement;
  const handleFileSelected = (e) => {
    const fileList = e.target.files;
    const reader = new FileReader();

    reader.onload = function (event) {
      const jsonData = JSON.parse(event.target.result.toString());
      console.log("result:", event.target.result);
      console.log("jsonData:", jsonData);
    };

    reader.readAsText(fileList[0]);
  };
  const importPromptFromJson = () => {
    fileInput.click();
  };
</script>

<article class="message">
  <div class="message-header"><p>List of Prompts</p></div>
  <div class="message-body" />
</article>
<section class="content">
  <!-- 搜索框 -->
  <div class="columns">
    <div class="column is-half">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="input-prompt-search"> Search: </label>
        </div>
        <div class="field-body control">
          <input
            id="input-prompt-search"
            type="text"
            on:keyup={handleSearch}
            class="input"
            placeholder="按姓名搜索"
          />
        </div>
      </div>
    </div>
    <div class="column is-half">
      <div class="buttons is-right">
        <input
          type="file"
          style="display:none"
          id="file-input"
          bind:this={fileInput}
          on:change={handleFileSelected}
        />
        <button class="button" on:click|preventDefault={addPromptClick}
          >Add</button
        >
        <button
          class="button is-primary"
          on:click|preventDefault={importPromptFromJson}
          >Import from JSON</button
        >
      </div>
    </div>
  </div>

  <!-- 表格 -->
  <div class="table-container">
    <table class="table is-fullwidth">
      <thead>
        <tr class="table-header">
          <th>Cmd</th>
          <th>Status</th>
          <th>Act</th>
          <th>Prompt</th>
        </tr>
      </thead>
      <tbody>
        {#if tableData.length > 0}
          {#each tableData.slice(startIndex, endIndex + 1) as item}
            <tr class="table-row">
              <td class="table-cell">{item.cmd}</td>
              <td class="table-cell">{item.enabled ? true : false} </td>
              <td class="table-cell">{item.act}</td>
              <td class="table-cell">{item.prompt}</td>
              <td class="table-cell">
                <button on:click={() => editPromptClick(item)}>📝</button>
                <button on:click={() => deletePromptClick(item)}>⛔</button>
              </td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td colspan="4">No prompt entries.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- 分页 -->
  <nav class="pagination">
    {#if tableData.length > PAGE_SIZE}
      {#if currentPage > 1}
        <button
          on:click={() => handlePageChange(currentPage - 1)}
          class="pagination-prev-next"
        >
          Prev
        </button>
      {/if}
      {#each Array.from({ length: Math.ceil(tableData.length / PAGE_SIZE) }, (_, i) => i + 1) as page}
        {#if page === currentPage}
          <button class="pagination-current">{page}</button>
        {:else if page >= currentPage - 3 && page <= currentPage + 3}
          <button
            on:click={() => handlePageChange(page)}
            class="pagination-other">{page}</button
          >
        {/if}
      {/each}
      {#if currentPage < Math.ceil(tableData.length / PAGE_SIZE)}
        <button
          on:click={() => handlePageChange(currentPage + 1)}
          class="pagination-prev-next"
        >
          Next
        </button>
      {/if}
    {/if}
  </nav>
</section>

<!-- add or edit dialog -->
<div class="modal" bind:this={promptEditModal}>
  <div class="modal-background" on:click={closePromptEditModal} />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Prompt</p>
    </header>
    <section class="modal-card-body" />
  </div>
  <footer class="modal-card-foot">
    <button
      class="button is-sucess"
      aria-label="save"
      on:click={savePromptEditModal}>Save</button
    >
    <button class="button" aria-label="cancel" on:click={closePromptEditModal}
      >Cancel</button
    >
  </footer>
</div>
