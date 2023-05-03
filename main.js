/* global __dirname */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const process = require('process');
const { divine } = require('./controller/currencyExchange');
const searchJsonReady = require('./src/divinePrice.json');
//方便開發使用
require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

ipcMain.setMaxListeners(50);

ipcMain.on('app-reload', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.reloadIgnoringCache();
  }
});

const mapExchangeData = new Map()

let win;

function createWindow(exchangeData) {
  win = new BrowserWindow({
    width: 180,
    height: 80,
    x: 0,
    y: 0,
    frame: false,
    backgroundColor: '#80000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname,'controller', 'preload.js')
    }
  })

    // 美化視窗外觀
  win.setOpacity(0.85);
  win.setIgnoreMouseEvents(false, { forward: true });
  win.setVisibleOnAllWorkspaces(true);
  win.setAlwaysOnTop(true, 'floating')

  win.loadFile('./src/index.html')

  setInterval(async () => {
    const exchange = await divine(searchJsonReady)
    const formatExchange =  exchange[0].slice(0, 3).map(val => `${val}c`).join(',');

    mapExchangeData.set('rate', exchange[0][1])

    win.webContents.send('exchangeData1', formatExchange);
  }, 180000);

  ipcMain.on('getExchangeData', (event) => {
    event.sender.send('exchangeData1', exchangeData.formatExchange);
    event.sender.send('official-link', exchangeData.URL);
  });

  win.on('closed', () => {
    app.quit();
  });
}

 // 創建一個 async 函數用於抓取資料和定時更新資料
async function updateExchangeData() {
  try {
    const exchange = await divine(searchJsonReady);
    const formatExchange =  exchange[0].slice(0, 3).map(val => `${val}c`).join(',');
    const URL = exchange[1];

    mapExchangeData.set('rate', exchange[0][1])

    return {
      formatExchange,
      URL
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

let newWin;

function createNewWinForRate(rates) {
  const getWinBounds = () => {
    const {x, y, width, height} = win.getBounds();
    const xPosition = x + width + 10;
    const yPosition = y + (height - 220) / 2; 
    return {xPosition, yPosition};
  };

  const winBounds = getWinBounds();
  
  newWin= new BrowserWindow({
    parent: win,
    show: true,
    width: 130,
    height: 220,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#80000000',
    x: winBounds.xPosition,
    y: winBounds.yPosition,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname,'controller', 'newWindowRate.js')
    }
  });

  newWin.setOpacity(0.85);
  newWin.setIgnoreMouseEvents(false, { forward: true });
  newWin.setVisibleOnAllWorkspaces(true);

  newWin.webContents.on('did-finish-load', () => {
    newWin.show();
  });

  newWin.loadFile('./src/newWindowRate.html');

  ipcMain.on('getRateData', (event) => {
    event.sender.send('exchange-rate', rates);
  });

   // 修正 closeNewWindow 事件註冊函數
  newWin.on('closed', () => {
    newWin = null;
  });

  ipcMain.on('closeNewWindow', () => {
    if (newWin) {
      newWin.close();
    }
  });
}

app.whenReady().then(async () => {
  const exchangeData = await updateExchangeData();
  createWindow(exchangeData);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 副視窗
// eslint-disable-next-line no-unused-vars
ipcMain.on('openNewWindow', async (event) => {
  const rates = mapExchangeData.get('rate');
  createNewWinForRate(rates);
});
