export default class Gitlab {

  constructor(cfg) {
    this.host = cfg.repo_url
    this.token = cfg.repo_token
    this.pid = encodeURIComponent(cfg.repo_name)
    this.base = `${this.host}/api/v4/projects/${this.pid}`
  }

  request(url, opt) {
    return fetch(`${this.base}${url}`, {
      headers: {
        "PRIVATE-TOKEN": this.token,
        "Content-Type": "application/json"
      },
      ...opt,
    }).then(d=> d.json())
  }

  list(path='', per_page=50) { //TODO all file
    return this.request(`/repository/tree?path=${path}&per_page=${
      per_page}&recursive=true`, {method: 'GET'})
      // .then(d=> { console.log(d); return d})
  }

  commit() {
    return this.request(`/repository/branches/master`, {method: 'GET'})
  }

  make_commit(msg) {
    const dt = new Date();
    console.log(msg)

    const branch = `figma-update-${
    dt.getFullYear().toString().padStart(4, '0')}${
    (dt.getMonth()+1).toString().padStart(2, '0')}${
    dt.getDate().toString().padStart(2, '0')}${
    dt.getHours().toString().padStart(2, '0')}${
    dt.getMinutes().toString().padStart(2, '0')}${
    dt.getSeconds().toString().padStart(2, '0')}`

    const body = {
      branch: 'master',
      start_branch: 'master',
      commit_message: msg.commit.commit_message || "for release: " + branch,
    }

    return this.list(msg.path).then(d=> d.reduce((a, b)=>{
      let {path} = b
      return {...a, [path]: 1}
    }, {})).then(tree=> {
      body.actions = this._actions(tree, msg)
      return this.request(`/repository/commits`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    })
      // .catch(e=> console.error("Error:", e))
  }

  _actions(tree, msg) {
    return Array(msg.data.length).fill(null).map((_, i)=> {
      let target = msg.data[i]
      // console.log(target)
      return {
        action: (target.name in tree) ? 'update' : 'create',
        file_path: target.name,
        encoding: 'base64',
        content: btoa(target.data.reduce((a, b)=> {
            return a + String.fromCharCode(b);
          }, '')),
      }
    })

  }

}
