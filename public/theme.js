// Runs before the page paints: the saved theme, or the system's.
(() => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch {}
  const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
})();
