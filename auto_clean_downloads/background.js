chrome.downloads.onChanged.addListener((delta) => {
  if (!delta.id) return;

  chrome.downloads.search({ id: delta.id }, (results) => {
    const item = results[0];
    if (!item) return;

    // 情况1：文件已不存在（被删除）
    if (item.exists === false) {
      chrome.downloads.erase({ id: item.id });
      console.log(`清理已不存在文件记录: ${item.filename}`);
      return;
    }

    // 情况2：下载状态为取消或失败
    if (item.state === 'interrupted' || item.state === 'cancelled') {
      chrome.downloads.erase({ id: item.id });
      console.log(`清理失败或取消的下载记录: ${item.filename}`);
      return;
    }
  });
});

// 启动或安装时清理一遍
chrome.runtime.onStartup.addListener(cleanDeletedDownloads);
chrome.runtime.onInstalled.addListener(cleanDeletedDownloads);

function cleanDeletedDownloads() {
  chrome.downloads.search({}, (results) => {
    for (const item of results) {
      if (item.exists === false || item.state === 'interrupted' || item.state === 'cancelled') {
        chrome.downloads.erase({ id: item.id });
        console.log(`启动清理：${item.filename}`);
      }
    }
  });
}
