const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('exchangeData1', (event, data) => {
    const exchangeDataElement = document.getElementById('exchange-data1');
    exchangeDataElement.innerText = data;
  });

  ipcRenderer.send('getExchangeData');
});
