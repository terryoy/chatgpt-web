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

  $: promptStorage
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
    prompt: {} as Prompt,
  };

  $: editForm

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

  const _validatePromptForm = () => {
    const originAct = editForm.prompt.act

    // fill values
    editForm.prompt.cmd = (promptEditModal.querySelector('#settings-prompt-cmd') as HTMLInputElement).value
    editForm.prompt.act = (promptEditModal.querySelector('#settings-prompt-act') as HTMLInputElement).value
    editForm.prompt.prompt = (promptEditModal.querySelector('#settings-prompt-prompt') as HTMLTextAreaElement).value
    editForm.prompt.enabled = (promptEditModal.querySelector('#settings-prompt-enabled') as HTMLInputElement).value === "true"

    const foundDuplicated = get(promptStorage).find((existing) => {
      return existing.act !== originAct && (existing.cmd === editForm.prompt.cmd || 
        existing.act === editForm.prompt.act ||
        existing.prompt === editForm.prompt.prompt)
    })

    if (foundDuplicated) {
      console.error("Has found existing record with same content.")
      return false;
    }

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

    updateFilterAndPagination()
    closePromptEditModal()
    console.log("save successfully");
  };

  // Function: Prompt Delete
  let promptDeleteModal:HTMLDivElement;

  const showPromptDeleteConfirm = (prompt) => {
    editForm = {
      isNew: false,
      prompt
    }
    showPromptDeleteModal()
  }

  const showPromptDeleteModal = () => {
    promptDeleteModal.classList.add("is-active");
  }

  const closePromptDeleteModal = () => {
    promptDeleteModal.classList.remove("is-active");
  }

  const deletePromptClick = () => {
    console.log('delete prompt:', editForm.prompt)
    deletePrompt(editForm.prompt);
    updateFilterAndPagination()
    closePromptDeleteModal()
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
                  <a href={'#'} on:click|preventDefault={() => showPromptDeleteConfirm(item)}>⛔</a>
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
          on:click|preventDefault={() => handlePageChange(1)}
          class="pagination-previous"
        >
          First
        </a>
      {/if}
      {#if currentPage < totalPageCount}
        <a href={'#'}
          on:click|preventDefault={() => handlePageChange(totalPageCount)}
          class="pagination-next"
        >
          Last
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


<!-- delete prompt confirm -->
<div class="modal" bind:this={promptDeleteModal}>
  <div class="modal-background"></div>
  <div class="modal-card">
    <section class="modal-card-head">
      <div class="modal-card-title">Are you sure to delete this prompt?</div>
    </section>
    <section class="modal-card-body">
      <ul style="list-style:disc; margin-left: 2em">
        <li><b>Cmd</b>: /{editForm.prompt.cmd}</li>
        <li><b>Act</b>: {editForm.prompt.act}</li>
        <li><b>Prompt</b>: {editForm.prompt.prompt}</li>
        <li><b>Status</b>: {editForm.prompt.enabled ? "Enabled" : "Disabled"}</li>
      </ul>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-success" on:click={deletePromptClick}>OK</button>
      <button class="button" on:click={closePromptDeleteModal}>Cancel</button>
    </footer>
  </div>
</div>

<!-- add or edit dialog -->
<form class="modal" bind:this={promptEditModal} on:submit={savePromptEditModal}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="modal-background" on:click|preventDefault={closePromptEditModal} />
  <div class="modal-card">
    <header class="modal-card-head">
      {#if editForm.isNew }
      <p class="modal-card-title">Add a New Prompt</p>  
      {:else}
      <p class="modal-card-title">Edit Prompt - {editForm.prompt.act}</p>  
      {/if}
    </header>
    <section class="modal-card-body">
      <div class="field">
        <label class="label" for="settings-prompt-cmd">Cmd:</label>
        <div class="control">
          <input class="input" type="text" id="settings-prompt-cmd" value={editForm.prompt.cmd} />
        </div>
      </div>

      <div class="field">
        <label class="label" for="settings-prompt-act">Act:</label>
        <div class="control">
          <input class="input" type="text" id="settings-prompt-act" value={editForm.prompt.act} />
        </div>
      </div>

      <div class="field">
        <label class="label" for="settings-prompt-prompt">Prompt</label>
        <div class="control">
          <textarea class="textarea" id="settings-prompt-prompt" placeholder="Textarea">{editForm.prompt.prompt}</textarea>
        </div>
      </div>

      <div class="field">
        <label class="label" for="settings-prompt-enabled">Enabled:</label>
        <div class="control">
          <input class="input" type="text" id="settings-prompt-enabled" value={editForm.prompt.enabled} />
        </div>
      </div>


    </section>

    <footer class="modal-card-foot">
      <input type="submit" class="button is-info" value="Save"/>
      <button class="button" on:click|preventDefault={closePromptEditModal}>Cancel</button>
    </footer>
  </div>
</form>
<!-- end -->
