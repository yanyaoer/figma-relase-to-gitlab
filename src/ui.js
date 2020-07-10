import Gitlab from "./gitlab";
import "./html";


class App {

  constructor() {
    this.repo_cfg = {}
    this.root = document.querySelector("#app")

  }

  emit(args) {
    parent.postMessage({ pluginMessage: args}, '*')
  }

  config() {
    this.emit({ type: 'read', key: 'gitlab'})
    return this
  }

  close() {
    this.emit('close')
  }

  init() {
    // recive msg from figma
    window.onmessage = (ev) => {
      const msg = ev.data.pluginMessage;
      const handler = 'on_msg_' + msg.type;
      if (handler in this) {
        this[handler](msg)
      } else {
        console.error(`${handler} not defined:`, msg);
      }
    }

    // recive msg from html
    window.addEventListener('G-submit', ({detail})=> {
      this.commit = detail

      const { repo_url, repo_name, repo_token, format, commit_message} = detail
      if (!repo_url || !repo_name || !repo_token) {
        return alert('Required repo_url, repo_name, repo_token')
      }
      let dirty = 0;
      ['repo_url', 'repo_name', 'repo_token'].forEach(k=> {
        if (detail[k] !== this.repo_cfg[k]) {
          this.repo_cfg[k] = detail[k]
          dirty = 1
        }
      })

      this.repo = new Gitlab(this.repo_cfg)

      if (dirty) {
        // console.log(this.repo_cfg)
        this.emit({ type: 'write', key: 'gitlab', obj: this.repo_cfg })
      }

      this.emit({ type: 'commit', format: this.commit.format })

    })

    return this
  }

  render(cfg) {
    let app = this.root.querySelector('m-root')
    if (!app) {
      app = document.createElement('m-root')
      this.root.appendChild(app)
    }
    if (cfg) app.shadowQuery('m-config').setAttribute('cfg', JSON.stringify(cfg))
  }

  on_msg_commit(msg) {
    msg.commit = this.commit || {}
    return this.repo.make_commit(msg)
      // .then(d=> { console.log(d); return d })
      .catch(e=> console.error("Error:", e))
      .then(d=> this.close())
  }

  on_msg_readed(msg) {
    if (msg.key === 'gitlab' && msg.obj && Object.keys(msg.obj).length) {
      this.repo_cfg = msg.obj
      // console.log(this.repo_cfg)

      this.render(msg.obj)
    } else {
      this.render()
    }
  }

  on_msg_writed(msg) {
    console.log(msg)
  }

}

new App().init().config()
