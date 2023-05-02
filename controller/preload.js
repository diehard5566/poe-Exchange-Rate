const { ipcRenderer,shell } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const exchangeDataElement = document.getElementById('exchange-data1');
  const url = document.getElementById('official-link');

  function handleClick(event) {
    event.preventDefault();
    shell.openExternal(url.href);
  }

  ipcRenderer.on('exchangeData1', (event, data) => {
    console.log('🚀 -------------------------------------------------------🚀');
    console.log('🚀 ~ file: preload.js:13 ~ ipcRenderer.on ~ data:', data);
    console.log('🚀 -------------------------------------------------------🚀');
    exchangeDataElement.innerText = data;
  });

  ipcRenderer.on('official-link', (event, data) => {
    url.href = `https://web.poe.garena.tw/trade/exchange/熔火聯盟/${data}`;

    if (!url.hasAttribute('data-official-link-initialized')) {
      url.setAttribute('data-official-link-initialized', true);
      url.addEventListener('click', handleClick);
    }
  });

  ipcRenderer.send('getExchangeData');
});