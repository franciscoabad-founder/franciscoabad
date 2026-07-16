const { app, BrowserWindow, Menu, Tray, nativeImage, shell } = require('electron');

const OS_URL = process.env.PANCHO_OS_URL || 'https://www.franciscoabad.com/os';

let mainWindow;
let tray;
let isQuitting = false;

function trayIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#0E1738"/>
      <rect x="6" y="6" width="52" height="52" rx="10" fill="#3B4ED9"/>
      <text x="32" y="41" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">OS</text>
    </svg>`;
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    title: 'Pancho OS',
    backgroundColor: '#071132',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadURL(OS_URL);

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  tray = new Tray(trayIcon());
  tray.setToolTip('Pancho OS');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Abrir Pancho OS', click: () => showWindow() },
    { label: 'Recargar', click: () => mainWindow?.reload() },
    { type: 'separator' },
    {
      label: 'Abrir en navegador',
      click: () => shell.openExternal(OS_URL)
    },
    {
      label: 'Iniciar con Windows',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked });
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]));
  tray.on('click', () => showWindow());
}

function showWindow() {
  if (!mainWindow) createWindow();
  mainWindow.show();
  mainWindow.focus();
}

// Instancia unica: si ya hay una corriendo (bandeja o taskbar), enfocar esa en
// lugar de abrir una ventana nueva. Se comporta como la PWA: un solo Pancho OS.
const tieneLock = app.requestSingleInstanceLock();
if (!tieneLock) {
  app.quit();
} else {
  app.on('second-instance', () => showWindow());

  app.whenReady().then(() => {
    createWindow();
    createTray();
  });

  app.on('activate', () => showWindow());
}

app.on('before-quit', () => {
  isQuitting = true;
});
