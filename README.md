# figma-release

figma 发布插件：将当前页面的所有模块渲染成图片并提交到 gitlab，并生成预览

https://www.figma.com/community/plugin/860386841010018793/figma-release-to-gitlab


[+] 支持导出 svg/png/jpg 格式

[+] 生成对应 web 预览页面

[-] 通知: 通过 pipeline hook 构建完成时触发，不在本项目提供


## 发布到 gitlab pages

可以将 .gitlab-ci.yml 放入对应单独的素材仓库和本项目分离
