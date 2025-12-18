// IP缓存
let cachedIP = '获取中...';
let lastIPUpdate = 0;
const IP_CACHE_TIME = 5 * 60 * 1000; // 5分钟缓存

// 多个备用IP获取接口
async function getUserIP() {
  const now = Date.now();
  
  // 如果缓存还有效,直接返回
  if (cachedIP !== '获取中...' && (now - lastIPUpdate) < IP_CACHE_TIME) {
    return cachedIP;
  }
  
  // 尝试多个API
  const apis = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
    'https://ipapi.co/ip/',
    'https://api.ip.sb/ip'
  ];
  
  for (const api of apis) {
    try {
      // 使用Promise.race实现超时
      const fetchPromise = fetch(api);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      let ip;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        ip = data.ip;
      } else {
        ip = (await response.text()).trim();
      }
      
      if (ip && /^[0-9.]+$/.test(ip)) {
        cachedIP = ip;
        lastIPUpdate = now;
        chrome.storage.local.set({ currentIP: ip });
        console.log('IP获取成功:', ip);
        return ip;
      }
    } catch (error) {
      console.log(`尝试 ${api} 失败:`, error.message);
      continue;
    }
  }
  
  // 所有API都失败,返回缓存
  console.log('所有IP接口失败,使用缓存:', cachedIP);
  return cachedIP !== '获取中...' ? cachedIP : '无法获取';
}

// 立即记录,IP异步更新
function recordVisit(url) {
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const record = {
    url: url,
    time: timestamp,
    ip: cachedIP,
    id: Date.now()
  };
  
  // 立即保存记录
  chrome.storage.local.get(['browsingHistory'], (result) => {
    const history = result.browsingHistory || [];
    history.push(record);
    
    if (history.length > 1000) {
      history.shift();
    }
    
    chrome.storage.local.set({ browsingHistory: history });
    console.log('记录已保存:', url);
  });
  
  // 后台更新IP
  if (cachedIP === '获取中...' || (Date.now() - lastIPUpdate) > IP_CACHE_TIME) {
    getUserIP();
  }
}

// 使用tabs.onUpdated监听
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (!tab.url.startsWith('chrome://') && 
        !tab.url.startsWith('chrome-extension://') &&
        !tab.url.startsWith('about:')) {
      recordVisit(tab.url);
    }
  }
});

// 初始化
console.log('插件已启动,开始获取IP...');
getUserIP();

// 定期更新IP
setInterval(() => {
  console.log('定期更新IP...');
  getUserIP();
}, IP_CACHE_TIME);