# Chrome浏览器监控插件

## 功能说明
- ✅ 监控用户访问的网页URL
- ✅ 记录访问时间
- ✅ 获取用户IP地址
- ✅ 在弹窗中显示所有记录
- ✅ 导出记录到TXT文件
- ✅ 控制台输出详细信息

## 安装步骤

1. **创建项目文件夹**
   ```
   mkdir chrome-monitor-plugin
   cd chrome-monitor-plugin
   ```

2. **创建所需文件**
   - manifest.json
   - background.js
   - popup.html
   - popup.js
   - icon16.png, icon48.png, icon128.png (可以先用任意图标)

3. **加载到Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目文件夹

## 使用方法

1. 安装后插件会自动开始监控
2. 点击浏览器工具栏的插件图标
3. 查看浏览记录列表
4. 点击"导出TXT"下载记录
5. 按F12打开开发者工具查看控制台输出

## 注意事项

⚠️ **隐私声明**: 此插件会收集浏览历史和IP地址，请确保:
- 仅用于个人学习或合法用途
- 获得用户明确同意
- 遵守当地隐私法律法规

## 图标制作

可以使用在线工具快速制作图标:
- https://www.favicon-generator.org/
- 或使用任意PNG图片重命名即可