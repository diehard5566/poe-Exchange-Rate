const { app, BrowserWindow, ipcMain, webContents } = require('electron');
const path = require('path');
const { divine } = require('./controller/currencyExchange');
const searchJsonReady = require('./src/divinePrice.json');

// 主視窗
async function createWindow() {
  let formatExchange;

  const exchange =  await divine(searchJsonReady);
  formatExchange =  exchange[0].map(e => parseInt(e) + 'c').join(',');

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()

  setInterval(async () => {
    const exchange = await divine(searchJsonReady);
    formatExchange = exchange[0].map(e => parseInt(e) + 'c').join(',');

    win.webContents.send('exchangeData1', formatExchange);
  }, 30000);

  ipcMain.on('getExchangeData', (event) => {
    event.sender.send('exchangeData1', formatExchange);
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 副視窗
ipcMain.on('openNewWindow', async (event) => {
  const exchange =  await divine(searchJsonReady);
  const rates = exchange[0][1]

  const newWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'newWindowRate.js')
    }
  })

  newWin.loadFile('newWindowRate.html')
  newWin.webContents.openDevTools()

  ipcMain.on('getRateData', (event) => {
    event.sender.send('exchange-rate', rates);
  })
})