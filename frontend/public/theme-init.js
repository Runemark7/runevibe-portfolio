(function () {
  try {
    var stored = localStorage.getItem("rv-theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("pf-v6-theme-dark");
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    var theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", dark ? "#101412" : "#f3efe6");
  } catch (e) {}
})();
