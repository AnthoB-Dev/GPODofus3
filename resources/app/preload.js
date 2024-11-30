document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.electron.openExternal(link.href);
    });
  });
});