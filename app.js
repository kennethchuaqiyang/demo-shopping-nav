// Shopping Nav - demo app for testing a page-discovery/crawl mode against
// pages reachable via different navigation mechanisms (same-tab redirect,
// new tab, new window) rather than a plain list of known URLs. Plain JS,
// no framework, data-testid on every interactive element - same build
// style as this project's other demo sites (demo-login-portal,
// demo-shuttle-pop-up, demo-signin-popup, demo-todo-list).

const COUNTS_KEY_PREFIX = "shoppingNav_";
const COUNT_KEYS = ["redirectCount", "newTabCount", "newWindowCount"];

function getCount(countKey) {
  return parseInt(localStorage.getItem(COUNTS_KEY_PREFIX + countKey) || "0", 10);
}

function incrementCount(countKey) {
  const next = getCount(countKey) + 1;
  localStorage.setItem(COUNTS_KEY_PREFIX + countKey, String(next));
  return next;
}

// ---------- Home page (index.html): the three tabs ----------

const tabRedirect = document.getElementById("tabRedirect");
const tabNewTab = document.getElementById("tabNewTab");
const tabNewWindow = document.getElementById("tabNewWindow");

if (tabRedirect) {
  tabRedirect.addEventListener("click", () => {
    // Counted on click (before navigation), not on the destination page's
    // load - so the count reflects "how many times this tab was opened"
    // literally, even if something about the destination page failed.
    incrementCount("redirectCount");
    // Same-tab redirect - the whole current tab navigates away.
    window.location.href = "product-redirect.html";
  });
}

if (tabNewTab) {
  tabNewTab.addEventListener("click", () => {
    incrementCount("newTabCount");
    // No width/height/left/top - every evergreen browser opens this as a
    // new TAB, not a new window, when called from a direct click handler.
    window.open("product-newtab.html", "_blank", "noopener");
  });
}

if (tabNewWindow) {
  tabNewWindow.addEventListener("click", () => {
    incrementCount("newWindowCount");
    // Explicit size/position forces a real separate OS window in Chrome/
    // Firefox/Edge instead of a tab - this is what the page-discovery/
    // crawl-mode backlog item needs to prove it can find a page behind
    // EITHER kind of window.open(), not just a tab.
    window.open(
      "product-newwindow.html",
      "shoppingNavNewWindow",
      "width=480,height=600,left=200,top=150,noopener"
    );
  });
}

// ---------- Counter page (counter.html) ----------

const redirectCountEl = document.getElementById("redirectCount");
const newTabCountEl = document.getElementById("newTabCount");
const newWindowCountEl = document.getElementById("newWindowCount");
const resetButton = document.getElementById("resetCounters");

function renderCounts() {
  if (!redirectCountEl) return; // not on this page
  redirectCountEl.textContent = getCount("redirectCount");
  newTabCountEl.textContent = getCount("newTabCount");
  newWindowCountEl.textContent = getCount("newWindowCount");
}

if (redirectCountEl) {
  renderCounts();
  // Fires when ANOTHER tab/window of this same origin writes to
  // localStorage (e.g. a click on the home page in a different tab) -
  // lets this counter page update live while left open, with no manual
  // refresh. Does NOT fire for a write made from this same page/tab,
  // which is why resetButton below calls renderCounts() itself too.
  window.addEventListener("storage", renderCounts);
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    COUNT_KEYS.forEach((k) => localStorage.removeItem(COUNTS_KEY_PREFIX + k));
    renderCounts();
  });
}
