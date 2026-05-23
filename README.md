# BrowserBot Extension

BrowserBot is an AI-powered browser extension that helps you **automate tab management**, **organize bookmarks**, and **interact with web pages using AI**. It supports **OpenAI API**, **Ollama**, and **built-in Chrome AI** for intelligent automation.

---

## **Features**

### **1. Tab Automation**
- Group tabs into logical categories using AI.
- Use predefined or custom prompts to organize tabs.
- Trigger tab grouping via the popup or keyboard shortcuts.

### **2. Bookmark Organization**
- Organize bookmarks into folders using AI.
- Customize prompts for bookmark categorization.

### **3. AI-Powered Interactions**
- **Ask Page**: Summarize, explain, or extract key information from the current webpage.
- **Ask Tabs**: Analyze and categorize open tabs.
- **Ask DevTools**: Debug web pages using AI.
- Persist chat history for context.

### **4. UI Components**
- **Popup**: Trigger via the extension icon or `Ctrl+Shift+B` (`Command+Shift+B` on Mac).
- **Options Page**: Configure AI providers, prompts, and settings.
- **Floating Button**: Toggle the "Ask Page" panel on any webpage.
- **Ask Page Panel**: A sidebar for interacting with the current webpage using AI.
- **Tab Context Bar**: Displays the current tab and allows adding related tabs to the context.

### **5. Keyboard Shortcuts**
- `Ctrl+Shift+B` (`Command+Shift+B` on Mac): Open the BrowserBot popup.
- `Ctrl+Shift+A` (`Command+Shift+A` on Mac): Toggle the "Ask Page" panel.

### **6. AI Providers**
- **OpenAI API**: Requires an API key.
- **Ollama**: Local AI model (e.g., `llama3`).
- **Built-in Chrome AI**: Uses Chrome's native AI capabilities.

---

## **Setup and Installation**

### **Prerequisites**
- A modern browser (Chrome or Firefox).
- Node.js and npm/yarn (for building from source).
- API key for **OpenAI API** (if used).

### **Installation Steps**
1. **Clone the Repository** (if building from source):
   ```bash
   git clone <repository-url>
   cd BrowserBot-Extension
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Build the Extension**:
   ```bash
   npm run build
   # or
   yarn build
   ```
   - Outputs files to the `.output/` directory.

4. **Load the Extension in the Browser**:
   - **Chrome**:
     1. Open `chrome://extensions/`.
     2. Enable **Developer mode**.
     3. Click **Load unpacked** and select `.output/chrome-mv3`.
   - **Firefox**:
     1. Open `about:debugging#/runtime/this-firefox`.
     2. Click **Load Temporary Add-on** and select `.output/firefox-mv2/manifest.json`.

5. **Configure AI Providers**:
   - Open the **Options Page** via the extension popup.
   - Select an AI provider (OpenAI API, Ollama, or Chrome AI).
   - Enter the **OpenAI API key** if using OpenAI.

---

## **Usage Instructions**

### **Triggering Features**
- **Popup**: Click the extension icon or press `Ctrl+Shift+B` (`Command+Shift+B` on Mac).
- **Ask Page**: Press `Ctrl+Shift+A` (`Command+Shift+A` on Mac) or click the floating button on a webpage.
- **Tab Grouping**: Use the popup to trigger AI-based tab grouping.
- **Bookmark Organization**: Access via the popup or options page.

### **UI Navigation**
1. **Popup**:
   - Displays options for **tab grouping**, **bookmark organization**, and **settings**.
   - Select an AI provider and prompt to organize tabs or bookmarks.

2. **Ask Page Panel**:
   - A sidebar that appears on web pages.
   - Use the input field to ask questions or request summaries.
   - Select from predefined prompts (e.g., "Summarize", "Explain Simply").
   - View chat history and manage conversations.

3. **Options Page**:
   - Configure AI providers, prompts, and extension settings.
   - Customize keyboard shortcuts and UI preferences.

### **Customizing Prompts**
- **Tab Grouping Prompts**: Modify or add prompts in the **Options Page**.
- **Ask Page Prompts**: Add or edit prompts for interacting with web pages.
- **Bookmark Prompts**: Customize prompts for organizing bookmarks.

---

## **Additional Notes**

### **Dependencies**
- **React**: For building UI components.
- **WXT**: Framework for cross-browser extensions.
- **Marked**: Markdown parser for rendering AI responses.

### **Limitations**
- **OpenAI API**: Requires an API key and may incur costs.
- **Ollama**: Requires local setup and hardware resources.
- **Chrome AI**: Limited to Chrome browsers with built-in AI support.

### **Privacy and Security**
- The extension requests permissions to access **tabs**, **bookmarks**, and **web page content**.
- AI interactions may send webpage content to external providers (e.g., OpenAI API).
- Keep API keys secure and avoid exposing them in public repositories.