// 语言包
const i18n = {
  zh: {
    title: '🌐 浏览记录监控',
    recordCount: '记录数',
    export: '📥 导出TXT',
    refresh: '🔄 刷新',
    clear: '🗑️ 清空',
    noRecords: '暂无浏览记录',
    exportSuccess: '导出成功!',
    noData: '暂无记录可导出',
    confirmClear: '确定要清空所有记录吗?',
    cleared: '已清空所有记录',
    exportTitle: '浏览记录导出',
    exportTime: '导出时间',
    recordNum: '记录',
    loading: '加载中...'
  },
  en: {
    title: '🌐 Browsing Monitor',
    recordCount: 'Records',
    export: '📥 Export TXT',
    refresh: '🔄 Refresh',
    clear: '🗑️ Clear',
    noRecords: 'No browsing records',
    exportSuccess: 'Export successful!',
    noData: 'No data to export',
    confirmClear: 'Are you sure to clear all records?',
    cleared: 'All records cleared',
    exportTitle: 'Browsing History Export',
    exportTime: 'Export Time',
    recordNum: 'Record',
    loading: 'Loading...'
  }
};

// 当前语言
let currentLang = 'zh';

// 加载保存的语言设置
chrome.storage.local.get(['language'], (result) => {
  if (result.language) {
    currentLang = result.language;
    updateLanguage();
  }
});

// 更新界面语言
function updateLanguage() {
  const texts = i18n[currentLang];
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (texts[key]) {
      el.textContent = texts[key];
    }
  });
  
  // 更新语言按钮状态
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  
  // 重新加载记录以更新语言
  loadRecords();
}

// 语言切换
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    chrome.storage.local.set({ language: currentLang });
    updateLanguage();
  });
});

// 加载并显示记录
function loadRecords() {
  const texts = i18n[currentLang];
  
  chrome.storage.local.get(['browsingHistory', 'currentIP'], (result) => {
    const history = result.browsingHistory || [];
    const ip = result.currentIP || texts.loading;
    
    // 显示IP
    document.getElementById('currentIP').textContent = ip;
    
    // 显示记录数
    document.getElementById('recordCount').textContent = history.length;
    
    // 显示记录列表
    const recordsList = document.getElementById('recordsList');
    
    if (history.length === 0) {
      recordsList.innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>${texts.noRecords}</p>
        </div>
      `;
      return;
    }
    
    // 倒序显示(最新的在前面)
    const reversedHistory = [...history].reverse();
    
    recordsList.innerHTML = reversedHistory.map(record => `
      <div class="record-item">
        <div class="record-url">${record.url}</div>
        <div class="record-meta">
          <div class="meta-item">
            🕒 ${record.time}
          </div>
          <div class="meta-item">
            📍 ${record.ip}
          </div>
        </div>
      </div>
    `).join('');
    
    // 控制台输出
    console.log('=== ' + (currentLang === 'zh' ? '浏览记录' : 'Browsing History') + ' ===');
    reversedHistory.forEach((record, index) => {
      console.log(`${index + 1}. URL: ${record.url}`);
      console.log(`   ${currentLang === 'zh' ? '时间' : 'Time'}: ${record.time}`);
      console.log(`   IP: ${record.ip}`);
      console.log('---');
    });
  });
}

// 导出为TXT
function exportToTXT() {
  const texts = i18n[currentLang];
  
  chrome.storage.local.get(['browsingHistory'], (result) => {
    const history = result.browsingHistory || [];
    
    if (history.length === 0) {
      alert(texts.noData);
      return;
    }
    
    let content = texts.exportTitle + '\n';
    content += texts.exportTime + ': ' + new Date().toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en-US') + '\n';
    content += '='.repeat(60) + '\n\n';
    
    history.forEach((record, index) => {
      content += `${texts.recordNum} ${index + 1}:\n`;
      content += `URL: ${record.url}\n`;
      content += `${currentLang === 'zh' ? '时间' : 'Time'}: ${record.time}\n`;
      content += `IP${currentLang === 'zh' ? '地址' : ''}: ${record.ip}\n`;
      content += '-'.repeat(60) + '\n\n';
    });
    
    // 创建下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentLang === 'zh' ? '浏览记录' : 'browsing_history'}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(texts.exportSuccess);
  });
}

// 清空记录
function clearRecords() {
  const texts = i18n[currentLang];
  
  if (confirm(texts.confirmClear)) {
    chrome.storage.local.set({ browsingHistory: [] }, () => {
      loadRecords();
      alert(texts.cleared);
    });
  }
}

// 事件监听
document.getElementById('exportBtn').addEventListener('click', exportToTXT);
document.getElementById('clearBtn').addEventListener('click', clearRecords);
document.getElementById('refreshBtn').addEventListener('click', loadRecords);

// 初始加载
loadRecords();