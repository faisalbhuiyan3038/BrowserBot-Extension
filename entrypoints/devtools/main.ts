try {
  browser.devtools.panels.create(
    "AI Debugger",
    "", // no icon for now
    "devtools-panel.html"
  ).then(() => {
    console.log("AI Debugger panel created");
  });
} catch (e) {
  console.error("Failed to create DevTools panel", e);
}
