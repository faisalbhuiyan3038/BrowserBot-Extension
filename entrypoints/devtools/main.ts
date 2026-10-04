try {
  (browser.devtools.panels.create as any)(
    "AI Debugger",
    "", // no icon for now
    "devtools-panel.html",
    () => {
      console.log("AI Debugger panel created");
    }
  );
} catch (e) {
  console.error("Failed to create DevTools panel", e);
}
