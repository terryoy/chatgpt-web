<script lang="ts">
  import { get } from "svelte/store";
  import awesomePrompts from '../awesome-chatgpt-prompts/prompts.csv'
  import {
    addNewPrompts,
    clearPrompt,
    deletePrompt,
    promptStorage,
    updatePrompt,
  } from "./Storage.svelte";
  import type { Prompt } from "./Types.svelte";

  // Function: Table Pagination
  // 首先定义需要渲染的数据
  let currentPageData:Prompt[] = []
  let tableData: Prompt[] = []

  const PAGE_SIZE = 10;
  let currentPage = 1;
  let totalPageCount = 1;
  let startIndex = 0;
  let endIndex = PAGE_SIZE - 1;

  $: totalPageCount
  $: currentPage
  $: tableData = get(promptStorage);
  $: currentPageData = tableData.slice(startIndex, endIndex+1)

  updateFilterAndPagination();

  // 处理分页页码变化的逻辑
  function handlePageChange(page) {
    currentPage = page;
    updateFilterAndPagination()
  }

  // 搜索过滤表格数据
  function handleSearch(event) {
    const searchText = event.target.value.toLowerCase();
    console.log('search:', searchText)
    updateFilterAndPagination(searchText)
  }

  function updateFilterAndPagination(searchText="") {
    tableData = get(promptStorage).filter((item) => {
      const name = item.act.toLowerCase();
      return name.includes(searchText);
    });
    // 重新算页面数
    totalPageCount = Math.ceil(tableData.length / PAGE_SIZE)
    if (totalPageCount < currentPage) {
      currentPage = totalPageCount
    } else if (currentPage === 0) {
      currentPage = 1
    }
    // 重新算当前页面内容
    startIndex = (currentPage - 1) * PAGE_SIZE;
    endIndex = startIndex + PAGE_SIZE - 1;
    currentPageData = tableData.slice(startIndex, endIndex+1)
    console.log('tableData:', tableData.length, `page: ${currentPage} / ${totalPageCount}`, "pageSize:", PAGE_SIZE);

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
        cmd: p.act.replace(/[^a-z]/gi, ''),
        act: p.act,
        prompt: p.prompt,
        enabled: true
      }
    })
    addNewPrompts(basePrompts)
    updateFilterAndPagination()
  }

  const clearExistingPrompts = () => {
    clearPrompt()
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


<style>
  .pagination-list {
    margin: 0
  }
</style>



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
          >Load</button>
        <button class="button" on:click|preventDefault={clearExistingPrompts}
          >Clear</button
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
              <td class="table-cell"><span class="tag">/{item.cmd}</span></td>
              <td class="table-cell">{item.enabled ? '✅' : '❌'} </td>
              <td class="table-cell">{item.act}</td>
              <td class="table-cell">{item.prompt}</td>
              <td class="table-cell">
                <div class="buttons">
                  <a href={'#'} on:click|preventDefault={() => editPromptClick(item)}>📝</a> &nbsp;&nbsp;
                  <a href={'#'} on:click|preventDefault={() => deletePromptClick(item)}>⛔</a>
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
  <nav class="pagination" aria-label="pagination">
    {#if totalPageCount > 1}
      {#if currentPage > 1}
        <a href={'#'}
          on:click|preventDefault={() => handlePageChange(currentPage - 1)}
          class="pagination-previous"
        >
          Previous
        </a>
      {/if}
      {#if currentPage < totalPageCount}
        <a href={'#'}
          on:click|preventDefault={() => handlePageChange(currentPage + 1)}
          class="pagination-next"
        >
          Next
      </a>
      {/if}
      <ul class="pagination-list">
        {#each Array.from({ length: totalPageCount }, (_, i) => i + 1) as page}
          {#if page === currentPage}
            <li>
              <a href={'#'} class="pagination-link is-current" aria-label="Page {page}" on:click|preventDefault={() => {}}>{page}</a>
            </li>
          {:else if page >= currentPage - 2 && page <= currentPage + 2}
            <li>
              <a href={'#'} class="pagination-link" aria-label="Goto page {page}" 
              on:click|preventDefault={() => handlePageChange(page)}>{page}</a>
            </li>
          {/if}
        {/each}
      </ul>
    {/if}  
  </nav>
</section>

<!-- add or edit dialog -->
<div class="modal" bind:this={promptEditModal}>
  <div class="modal-background" on:click|preventDefault={closePromptEditModal} />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Prompt</p>
    </header>
    <section class="modal-card-body" />

    <footer class="modal-card-foot">
      <button
        class="button is-sucess"
        aria-label="save"
        on:click|preventDefault={savePromptEditModal}>Save</button
      >
      <button class="button" aria-label="cancel" on:click|preventDefault={closePromptEditModal}
        >Cancel</button
      >
    </footer>
  </div>
</div>
