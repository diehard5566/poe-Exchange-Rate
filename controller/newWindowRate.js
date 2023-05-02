const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('exchange-rate', (event, data) => {
        for (let i = 0; i < 9; i++) {
            const rate = Math.floor(data * (i + 1) / 10)
    
            const rateElement = document.getElementById(`exchange-rate-${i}`);
            rateElement.innerText = rate;
        }
    });
    // 接收從主進程傳遞過來的訊息
    // eslint-disable-next-line no-unused-vars
    ipcRenderer.on('openNewWindow', (event) => {
        const newWindow = window.open('./newWindowRate.html', 'newWindow', 'width=800,height=600');
        // 在新視窗載入後傳遞訊息
        newWindow.addEventListener('load', () => {
            ipcRenderer.sendTo(newWindow.webContents.id, 'getRateData');
        });
    });

    ipcRenderer.send('getRateData');
})



