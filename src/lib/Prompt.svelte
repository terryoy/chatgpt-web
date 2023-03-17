<script context="module" lang="ts">
  import { get } from "svelte/store";
  import { onMount } from "svelte";
  import { promptStorage } from "./Storage.svelte";
  import type { Prompt } from "./Types.svelte";

  // Function: Data operation
  const savePrompts = (newPrompts: Prompt[]) => {
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

  // Function: Table Pagination

  // 首先定义需要渲染的数据
  let tableData: Prompt[] = [
    { cmd: "1", act: "Tom", prompt: "22" },
    { cmd: "2", act: "Jerry", prompt: "24" },
    { cmd: "3", act: "Tony", prompt: "28" },
    { cmd: "4", act: "Mike", prompt: "26" },
    { cmd: "5", act: "John", prompt: "30" },
    { cmd: "6", act: "Lily", prompt: "22" },
    { cmd: "7", act: "Amy", prompt: "25" },
    { cmd: "8", act: "Bob", prompt: "23" },
    { cmd: "9", act: "Alice", prompt: "27" },
    { cmd: "10", act: "Jack", prompt: "29" },
  ];

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
    tableData = tableData.filter((item) => {
      const name = item.act.toLowerCase();
      return name.includes(searchText);
    });
    currentPage = 1;
    startIndex = 0;
    endIndex = PAGE_SIZE - 1;
  }

  // 处理单元格编辑
  function handleCellEdit(event, id, column) {
    const { value } = event.target;
    const index = tableData.findIndex((item) => item.cmd === id);
    tableData[index][column] = value;
  }

  // 初始化页面的逻辑
  // onMount(() => {
  //   handlePageChange(1);
  // });
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
          <label class="label"> Search: </label>
        </div>
        <div class="field-body control">
          <input
            type="text"
            on:keyup={handleSearch}
            class="input"
            placeholder="按姓名搜索"
          />
        </div>
      </div>
    </div>
    <div class="column is-half">
      <div class="buttons">
        <button class="button is-text" on:click|preventDefault={() => {}}
          >📥 Import</button
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
        {#each tableData.slice(startIndex, endIndex + 1) as item}
          <tr class="table-row">
            <td class="table-cell">{item.cmd}</td>
            <td class="table-cell">{item.enabled ? true : false} </td>
            <td class="table-cell">
              <input
                type="text"
                value={item.act}
                on:keyup={(e) => handleCellEdit(e, item.cmd, "act")}
                class="input"
              />
            </td>
            <td class="table-cell">
              <textarea
                value={item.prompt}
                on:keyup={(e) => handleCellEdit(e, item.cmd, "prompt")}
                class="input"
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- 分页 -->
  <nav class="pagination">
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
        <button on:click={() => handlePageChange(page)} class="pagination-other"
          >{page}</button
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
  </nav>
</section>
