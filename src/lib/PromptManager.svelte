<script lang="ts">
  import { get } from "svelte/store";
  import awesomePrompts from '../awesome-chatgpt-prompts/prompts.csv'
  import {
    addNewPrompts,
    deletePrompt,
    promptStorage,
    updatePrompt,
  } from "./Storage.svelte";
  import type { Prompt } from "./Types.svelte";

  // Function: Table Pagination
  // 首先定义需要渲染的数据
  let currentPageData:Prompt[] = []
  let tableData: Prompt[] = []

  let prompts = get(promptStorage);

  const PAGE_SIZE = 10;
  let currentPage = 1;
  let startIndex = 0;
  let endIndex = PAGE_SIZE - 1;

  $: tableData = prompts;
  $: currentPageData = tableData.slice(startIndex, endIndex+1)

  updateFilterAndPagination();

  // 处理分页页码变化的逻辑
  function handlePageChange(page) {
    currentPage = page;
    startIndex = (currentPage - 1) * PAGE_SIZE;
    endIndex = startIndex + PAGE_SIZE - 1;
  }

  // 搜索过滤表格数据
  function handleSearch(event) {
    const searchText = event.target.value.toLowerCase();
    console.log('search:', searchText)
    updateFilterAndPagination(searchText)
  }

  function updateFilterAndPagination(searchText="") {
    tableData = prompts.filter((item) => {
      const name = item.act.toLowerCase();
      return name.includes(searchText);
    });
    currentPageData = tableData.slice(startIndex, endIndex+1)
    console.log('tableData:', tableData)
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

  // import base prompts 
  const loadBasePrompts = () => {
    const basePrompts:Prompt[] = awesomePrompts.map((p) => {
      return {
        cmd: p.act,
        act: p.act,
        prompt: p.prompt,
        enabled: true
      }
    })
    addNewPrompts(basePrompts)
    updateFilterAndPagination()
  }

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
  <div class="message-body"><h1>List of Prompts</h1></div>
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
        <button class="button" on:click|preventDefault={loadBasePrompts}
          >Load</button
        >
        <!-- <button
          class="button is-primary"
          on:click|preventDefault={importPromptFromJson}
          >Import from JSON</button
        > -->
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if tableData.length > 0}
          {#each currentPageData as item}
            <tr class="table-row">
              <td class="table-cell">{item.cmd}</td>
              <td class="table-cell">{item.enabled ? '✅' : '❌'} </td>
              <td class="table-cell">{item.act}</td>
              <td class="table-cell">{item.prompt}</td>
              <td class="table-cell">
                <div class="buttons">
                  <a on:click={() => editPromptClick(item)}>📝</a> &nbsp;&nbsp;
                  <a on:click={() => deletePromptClick(item)}>⛔</a>
                </div>
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
  <nav class="pagination" role="navigation" aria-label="pagination">
    <a class="pagination-next">Next page</a>
    {#if tableData.length > PAGE_SIZE}
      {#if currentPage > 1}
        <a
          on:click={() => handlePageChange(currentPage - 1)}
          class="pagination-previous"
        >
          Previous
        </a>
      {#if currentPage < Math.ceil(tableData.length / PAGE_SIZE)}
        <a
          on:click={() => handlePageChange(currentPage + 1)}
          class="pagination-next"
        >
          Next
      </a>
      {/if}
      <ul class="pagination-list">
        {#each Array.from({ length: Math.ceil(tableData.length / PAGE_SIZE) }, (_, i) => i + 1) as page}
          {#if page === currentPage}
            <button class="pagination-current">{page}</button>
          {:else if page >= currentPage - 3 && page <= currentPage + 3}
            <li>
              <a class="pagination-link" aria-label="Goto page {page}" 
              on:click={() => handlePageChange(page)}>{page}</a>
            </li>
          {/if}
        {/each}
      </ul>
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
</div>
