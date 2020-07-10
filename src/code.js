(()=> {

  // figma.showUI(__html__, { width: 1, height: 1 })
  // figma.showUI(__html__, { visible: false })

  /**
   * init ui dialog
   */
  figma.showUI(__html__, { width: 280, height: 320 })


  figma.ui.onmessage = (msg) => {
    // console.log("code_on_msg:", msg)

    if (msg === 'close') figma.closePlugin()

    if (msg.type === 'read') {
      figma.clientStorage.getAsync(msg.key).then(data=> {
        msg.type = 'readed'
        msg.obj = JSON.parse(data)
        figma.ui.postMessage(msg)
      })
    }

    if (msg.type === 'write') {
      figma.clientStorage.setAsync(msg.key, JSON.stringify(msg.obj)).then(data=> {
        msg.type = 'writed'
        figma.ui.postMessage(msg)
      })
    }

    if (msg.type === 'commit') {
      let format = (msg.format || 'png').toLowerCase()
      Promise.all(figma.currentPage.children.map(node=> {
        const name = 'public/' + figma.root.name + '/' + node.name + '_' + node.id + '.' + format
        return node.exportAsync({format: format.toUpperCase()}).then(data=> {
          return { data, name }
        })
      })).then(data=> {
        figma.ui.postMessage({
          data,
          type: 'commit',
          path: 'public/' + figma.root.name, // figma page name as directory
        })
      })
    }
  }

})()
