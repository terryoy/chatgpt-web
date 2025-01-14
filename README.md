# ChatGPT-web
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Niek/chatgpt-web/pages.yml?style=flat-square)](https://github.com/Niek/chatgpt-web/actions/workflows/pages.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![GitHub](https://img.shields.io/github/license/Niek/chatgpt-web)](/LICENSE)
[![All Contributors](https://img.shields.io/github/all-contributors/Niek/chatgpt-web?color=ee8449&style=flat-square)](#contributors)

## **URL**: https://niek.github.io/chatgpt-web/

![Screenshot of ChatGPT-web](.github/screenshot.png)


ChatGPT-web is a simple one-page web interface to the OpenAI ChatGPT API. To use it, you need to register for [an OpenAI API key](https://platform.openai.com/account/api-keys) first. All messages are stored in your browser's local storage, so everything is **private**. You can also close the browser tab and come back later to continue the conversation.

## Features
* **Open source**: ChatGPT-web is open source ([GPL-3.0](/LICENSE)), so you can host it yourself and make changes as you want.
* **Private**: All chats and messages are stored in your browser's local storage, so everything is private.
* **Customizable**: You can customize the prompt, the temperature, and other model settings. Multiple models (including GTP-4) are supported.
* **Cheaper**: ChatGPT-web uses the commercial OpenAI API, so it's much cheaper than a ChatGPT Plus subscription.
* **Fast**: ChatGPT-web is a single-page web app, so it's [fast and responsive](https://pagespeed.web.dev/analysis/https-niek-github-io-chatgpt-web/8xv5uwrnes).
* **Mobile-friendly**: ChatGPT-web is mobile-friendly, so you can use it on your phone.
* **Voice input**: ChatGPT-web supports voice input, so you can talk to ChatGPT. It will also talk back to you.
* **Pre-selected prompts**: ChatGPT-web comes with a list of [pre-selected prompts](https://github.com/f/awesome-chatgpt-prompts), so you can get started quickly.
* **Export**: ChatGPT-web can export chats as a Markdown file, so you can share them with others.
* **Code**: ChatGPT-web recognizes and highlights code blocks and allows you to copy them with one click.
* **Desktop app**: ChatGPT-web can be bundled as a desktop app, so you can use it outside of the browser.

## Development

To run the development server, run

```bash
npm ci
npm run dev # or: npm run build
```

To update the [`awesome-chatgpt-prompts`](/src/awesome-chatgpt-prompts/) subtree, run :
```bash
git subtree pull --prefix src/awesome-chatgpt-prompts https://github.com/f/awesome-chatgpt-prompts.git main --squash
```

## Use with Docker compose

```bash
docker compose up -d
```

## Desktop app

You can also use ChatGPT-web as a desktop app. To do so, [install Rust first](https://www.rust-lang.org/tools/install). Then, simply run `npm run tauri dev` for the development version or `npm run tauri build` for the production version of the desktop app. The desktop app will be built in the `src-tauri/target` folder.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Michael-Tanzer"><img src="https://avatars.githubusercontent.com/u/23483071?v=4?s=100" width="100px;" alt="Michael Tanzer"/><br /><sub><b>Michael Tanzer</b></sub></a><br /><a href="#ideas-Michael-Tanzer" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Niek/chatgpt-web/commits?author=Michael-Tanzer" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/petergeneric"><img src="https://avatars.githubusercontent.com/u/870655?v=4?s=100" width="100px;" alt="Peter"/><br /><sub><b>Peter</b></sub></a><br /><a href="#ideas-petergeneric" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://danb.me"><img src="https://avatars.githubusercontent.com/u/8343178?v=4?s=100" width="100px;" alt="Dan Brown"/><br /><sub><b>Dan Brown</b></sub></a><br /><a href="#ideas-ssddanbrown" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Niek/chatgpt-web/commits?author=ssddanbrown" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/littlemoonstones"><img src="https://avatars.githubusercontent.com/u/32943414?v=4?s=100" width="100px;" alt="littlemoonstones"/><br /><sub><b>littlemoonstones</b></sub></a><br /><a href="https://github.com/Niek/chatgpt-web/commits?author=littlemoonstones" title="Code">💻</a> <a href="#ideas-littlemoonstones" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/maxrye1996"><img src="https://avatars.githubusercontent.com/u/28844671?v=4?s=100" width="100px;" alt="maxrye1996"/><br /><sub><b>maxrye1996</b></sub></a><br /><a href="https://github.com/Niek/chatgpt-web/issues?q=author%3Amaxrye1996" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Mikemansour"><img src="https://avatars.githubusercontent.com/u/50986937?v=4?s=100" width="100px;" alt="Mikemansour"/><br /><sub><b>Mikemansour</b></sub></a><br /><a href="#ideas-Mikemansour" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/abc91199"><img src="https://avatars.githubusercontent.com/u/16594734?v=4?s=100" width="100px;" alt="abc91199"/><br /><sub><b>abc91199</b></sub></a><br /><a href="#ideas-abc91199" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fuegovic"><img src="https://avatars.githubusercontent.com/u/32828263?v=4?s=100" width="100px;" alt="fuegovic"/><br /><sub><b>fuegovic</b></sub></a><br /><a href="#ideas-fuegovic" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.liuin.cn"><img src="https://avatars.githubusercontent.com/u/20949383?v=4?s=100" width="100px;" alt="Sixzeroo"/><br /><sub><b>Sixzeroo</b></sub></a><br /><a href="https://github.com/Niek/chatgpt-web/commits?author=Sixzeroo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://terryoy.github.io/"><img src="https://avatars.githubusercontent.com/u/1171589?v=4?s=100" width="100px;" alt="terryoy"/><br /><sub><b>terryoy</b></sub></a><br /><a href="#ideas-terryoy" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Niek/chatgpt-web/commits?author=terryoy" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/yang-lyu-902/"><img src="https://avatars.githubusercontent.com/u/15838074?v=4?s=100" width="100px;" alt="Yang Lyu"/><br /><sub><b>Yang Lyu</b></sub></a><br /><a href="https://github.com/Niek/chatgpt-web/issues?q=author%3Ayanglyu902" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ryanhex53"><img src="https://avatars.githubusercontent.com/u/360426?v=4?s=100" width="100px;" alt="ryanhex53"/><br /><sub><b>ryanhex53</b></sub></a><br /><a href="https://github.com/Niek/chatgpt-web/commits?author=ryanhex53" title="Code">💻</a> <a href="#design-ryanhex53" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shivan2418"><img src="https://avatars.githubusercontent.com/u/40603805?v=4?s=100" width="100px;" alt="Emil Elgaard"/><br /><sub><b>Emil Elgaard</b></sub></a><br /><a href="#ideas-shivan2418" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-shivan2418" title="Design">🎨</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

# Modifier Notes（by @terryoy)

---

- CSS framework: [Bulma CSS](https://bulma.io/documentation/)
- Added [Tauri](https://tauri.app/) for Desktop App support?
  - To install tauri dependencies, you also need to instsall Rust, Tauri-cli(Reference: [stackoverflow](https://stackoverflow.com/questions/75013520/when-i-install-and-run-tauri-on-mac-os-monterey-i-get-immediate-error/75580172#75580172)):

```shell
# install rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# install tauri-cli
cargo install tauri-cli
```
  - To run

```shell
# start dev app
npm run tauri dev

# build
npm run tauri build
```

- Branches:
  - main, my main branch
  - upstream/stage, keep up with upstream's main
  - merge/stream, do the merging job with my main and upstream's main

