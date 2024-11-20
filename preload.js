const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveLastAchievement: (achievementId) => ipcRenderer.invoke('save-last-achievement', achievementId)
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.electron.openExternal(link.href);
    });
  });
});
