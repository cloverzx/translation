# First Extension For HBuilderX
开发文档参考：[https://hx.dcloud.net.cn](https://hx.dcloud.net.cn)

本示例使用步骤：
1. 打开本示例工程，点击工具栏的运行按钮，或者按下快捷键`Ctrl+r`，会打开一个新HBuilderX窗体，新窗体将加载这个插件
2. 在新窗体中打开一个文档，点右键，菜单底部会有一个新的菜单项`hello world`
3. 点击`hello world`，会弹出一个对话框
4. 在`extension.js`中可以修改插件的代码逻辑，在`package.json`中可以修改插件的配置
5. 修改这些代码或配置后，目前不支持热修改。需要点击工具栏的运行按钮，或者按下快捷键`Ctrl+r`，停止运行，然后再次重新运行。一般推荐连续按`Ctrl+r`