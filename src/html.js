const supportsCustomElements = 'customElements' in window;

if (!supportsCustomElements) {
  document.body.innerHTML = "please upgrade your browser..."
}


class BaseElement extends HTMLElement {

  constructor() {
    super();
    this.template = ``; // overwrite for each custom element
    // console.log(this.tagName);
  }

  set tpl(tpl) {
    this.render(tpl)
    return this
  }

  render(htmlstring) {
    if (!this.template && !htmlstring) return this;
    let tpl = document.createElement('template');
    tpl.innerHTML = htmlstring || this.template;

    this.attachShadow({mode:'open'})
      .appendChild(tpl.content.cloneNode(true));
    return this;
  }

  shadowQuery(qs) {
    return this.shadowRoot.querySelector(qs);
  }

  _ev_target(ev) {
    return ev.startsWith('G-') ? window : this;
  }

  emit(event, detail) {
    this._ev_target(event).dispatchEvent(new CustomEvent(event, { detail }));
    return this;
  }

  on(event, callback) {
    this._ev_target(event).addEventListener(event, callback);
    return this;
  }
}


window.customElements.define('m-root', class extends BaseElement {

  connectedCallback() {
    this.render(`
      <style>
        :host {
          display: block;
          margin: 0 8px;
        }
      </style>
      <m-summary></m-summary>
      <m-config></m-config>
      <m-footer></m-footer>`)
  }

});

window.customElements.define('m-summary', class extends BaseElement {

  connectedCallback() {
    this.tpl = `<style>
      :host p { color #666; font-size:12px; }
      </style>
      <p>release to gitlab pages. url depended by repo_name</p>`;
  }
});


window.customElements.define('m-config', class extends BaseElement {

  static get observedAttributes() {
    return ['cfg'];
  }

  get token_url() {
    return (this.cfg.repo_url || 'https://gitlab.domain.com') + '/profile/personal_access_tokens'
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.cfg = JSON.parse(this.getAttribute('cfg'));
    Object.keys(this.cfg).forEach((k)=> {
      this.shadowQuery(`form [name=${k}]`).value = this.cfg[k]
    })
    this.shadowQuery('#token_url').href = this.token_url
  }

  connectedCallback() {
    this.cfg = this.cfg || {}
    const w = '230px';
    this.tpl = `<style>
      :host p { color #666; font-size:12px; }
      :host input {
        width: ${w};
        outline: none;
        border: 0 none;
        border-bottom: 1px solid #ccc;
        font-size: 12px;
      }
      :host textarea {
        display: block;
        width: ${w};
        margin: 10px 0;
        outline: none;
        font-size: 12px;
        border: 1px solid #ccc;
        height: 100px;
        resize: none;
      }
      :host button {
        width: ${w};
        background: lightblue;
        padding: 5px;
        border: 0 none;
      }
      </style>
      <form>
        <p><input name="repo_url" type="text" placeholder="gitlab url | eg. https://gitlab.domain.com" value="${this.cfg.repo_url || ''}" /></p>
        <p><input name="repo_name" type="text" placeholder="repo name | eg. mig2-tangram/design" /></p>
        <p>
          <input name="repo_token" type="password" placeholder="gitlab token" />
          <small><a id="token_url" target="_blank" href="${this.token_url}">generate token</a><small>
        </p>

        <select name="format">
          <option value="png">png</option>
          <option value="jpg">jpg</option>
          <option value="svg">svg</option>
        </select>
        <textarea name="commit_message" placeholder="changelog"></textarea>
        <button type="submit">submit</button>
      </form>`;
    const form = this.shadowQuery('form')
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      this.emit('G-submit', data)
    });
  }

});
