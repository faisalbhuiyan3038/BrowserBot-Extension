var background=(function(){function e(e){return e==null||typeof e==`function`?{main:e}:e}var t=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,n={id:`builtin-default`,name:`Default`,prompt:`You are an AI assistant helping categorize browser tabs.
Here are the open tabs:

{tabList}

Group these {tabCount} tabs into logical categories.`},r=[n,{id:`builtin-smart`,name:`Smart Grouper`,prompt:`As an AI assistant, analyze and organize these {tabCount} browser tabs into meaningful groups. Here are open tabs: 
{tabList}

Follow these specific guidelines:
1. Create intuitive groups that reflect how users naturally organize their work and activities
2. Use short, clear category names (1-2 words) that instantly convey the purpose
3. Consider tab relationships based on:
   - Common domains or platforms
   - Related topics or projects
   - Similar purposes (research, shopping, etc.)
   - Temporal context (current tasks vs reference material)
4. Rules:
- Create 3-8 groups based on tab count and content similarity
- not to make too many groups
- Use short, clear category names (1-2 words, try just 1 word)
- Keep groups focused and cohesive
- Each tab must be assigned to exactly one group
- Group related items even if from different domains`},{id:`builtin-context`,name:`Context-Aware`,prompt:`Analyze the provided list of tab data and assign a concise category (1-2 words, Title Case) for EACH tab.

Existing Categories:
{existingGroups}
---
Instructions for Assignment:
1.  **Prioritize Existing:** For each tab below, determine if it clearly belongs to one of the 'Existing Categories'. Base this primarily on the URL/Domain, then Title/Description. If it fits, you MUST use the EXACT category name provided in the 'Existing Categories' list. DO NOT create a minor variation (e.g., if 'Project Docs' exists, use that, don't create 'Project Documentation').
2.  **Assign New Category (If Necessary):** Only if a tab DOES NOT fit an existing category, assign the best NEW concise category (1-2 words, Title Case).
4.  **Format:** 1-2 words, Title Case.
---
Input Tab Data:
{tabList}`}],i={id:`askpage-default`,name:`Default`,prompt:`You are a helpful AI assistant. The user is viewing a webpage and wants to ask questions about it.

Page Title: {pageTitle}
Page URL: {pageUrl}

Answer the user's questions clearly and concisely. Use markdown formatting when helpful.`},a=[i,{id:`askpage-summarize`,name:`Summarize`,prompt:`You are a skilled summarizer. Analyze the provided page content and give a clear, structured summary.

Page: {pageTitle}
URL: {pageUrl}

Content:
{pageContent}

Provide a comprehensive summary using markdown formatting with headings, bullet points, and key takeaways.`},{id:`askpage-qa`,name:`Q&A Expert`,prompt:`You are an expert Q&A assistant. The user is reading a webpage and needs detailed answers.

Page: {pageTitle}
URL: {pageUrl}

Content:
{pageContent}

Answer questions with precision. Quote relevant parts of the content when applicable. Use markdown for formatting.`},{id:`askpage-explain`,name:`Explain Simply`,prompt:`You are an expert at making complex topics simple. The user is reading a webpage and wants simplified explanations.

Page: {pageTitle}
URL: {pageUrl}

Content:
{pageContent}

Explain concepts from this page in simple, easy-to-understand language. Use analogies and examples where helpful.`}],o={activeProvider:`openai`,activeOpenAIProviderId:`default`,ollamaEndpoint:`http://localhost:11434`,ollamaModel:`llama3`,openaiProviders:[{id:`default`,name:`OpenAI`,endpoint:`https://api.openai.com/v1`,apiKey:``,model:`gpt-4o`,reasoning:!1}],tabGroupPrompts:r.map(e=>({...e})),activeTabGroupPromptId:`builtin-default`,askPagePrompts:a.map(e=>({...e})),activeAskPagePromptId:`askpage-default`,askPagePanelWidth:420,askPagePersistChat:!1},s={get:async()=>{let e=await t.storage.local.get(`appState`);if(!e.appState)return{...o};let r={...o,...e.appState};return(!r.tabGroupPrompts||r.tabGroupPrompts.length===0)&&(r.tabGroupPrompts=[{...n}],r.activeTabGroupPromptId=n.id),(!r.askPagePrompts||r.askPagePrompts.length===0)&&(r.askPagePrompts=[{...i}],r.activeAskPagePromptId=i.id),r},set:async e=>{let n=await s.get();await t.storage.local.set({appState:{...n,...e}})},getActiveOpenAIProvider:async()=>{let e=await s.get();return e.openaiProviders.find(t=>t.id===e.activeOpenAIProviderId)},getActiveTabGroupPrompt:async()=>{let e=await s.get();return e.tabGroupPrompts.find(t=>t.id===e.activeTabGroupPromptId)??e.tabGroupPrompts[0]??n},getActiveAskPagePrompt:async()=>{let e=await s.get();return e.askPagePrompts.find(t=>t.id===e.activeAskPagePromptId)??e.askPagePrompts[0]??i}};async function c(e,t){let n=await s.get(),r=t.providerType??n.activeProvider;if(r===`chrome_ai`)return l(e,t);if(r===`ollama`)return u(e,n,t);if(r===`openai`){let r=t.openaiProviderId??n.activeOpenAIProviderId,i=n.openaiProviders.find(e=>e.id===r);if(!i)throw Error(`No active OpenAI provider configured. Please check Settings.`);return d(e,i,t)}throw Error(`Unknown provider type: ${r}`)}async function l(e,t){let n=globalThis.ai;if(!n?.languageModel)throw Error(`Chrome AI Prompt API is not available. Enable it in chrome://flags.`);let{available:r}=await n.languageModel.capabilities();if(r!==`readily`)throw Error(`Chrome AI model is not readily available.`);let i=e.filter(e=>e.role===`system`).map(e=>e.content).join(`
`),a=e.filter(e=>e.role!==`system`).map(e=>`${e.role===`user`?`User`:`Assistant`}: ${e.content}`).join(`

`),o=i?`${i}\n\n${a}\n\nAssistant:`:`${a}\n\nAssistant:`,s=await n.languageModel.create();try{let e=await s.promptStreaming(o),n=``,r=0;for await(let i of e){if(t.signal?.aborted)break;let e=typeof i==`string`?i.slice(r):``;r=typeof i==`string`?i.length:r,e&&(n+=e,t.onChunk(e))}return n}finally{s.destroy()}}async function u(e,t,n){let r=t.ollamaEndpoint.replace(/\/+$/,``),i=await fetch(`${r}/api/chat`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({model:t.ollamaModel,messages:e.map(e=>({role:e.role,content:e.content})),stream:!0}),signal:n.signal});if(!i.ok){let e=await i.text().catch(()=>``);throw Error(`Ollama error ${i.status}: ${e||i.statusText}`)}let a=i.body?.getReader();if(!a)throw Error(`No response body from Ollama`);let o=new TextDecoder,s=``;for(;;){let{done:e,value:t}=await a.read();if(e)break;if(n.signal?.aborted){a.cancel();break}let r=o.decode(t,{stream:!0}).split(`
`).filter(e=>e.trim());for(let e of r)try{let t=JSON.parse(e).message?.content||``;t&&(s+=t,n.onChunk(t))}catch{}}return s}async function d(e,t,n){let r=t.endpoint.replace(/\/+$/,``);r.endsWith(`/chat/completions`)||(r+=`/chat/completions`);let i={"Content-Type":`application/json`};t.apiKey&&(i.Authorization=`Bearer ${t.apiKey}`);let a={model:t.model,messages:e.map(e=>({role:e.role,content:e.content})),stream:!0};t.reasoning&&(a.reasoning={enabled:!0});let o=await fetch(r,{method:`POST`,headers:i,body:JSON.stringify(a),signal:n.signal});if(!o.ok){let e=await o.text().catch(()=>``);throw Error(`${t.name} error ${o.status}: ${e||o.statusText}`)}let s=o.body?.getReader();if(!s)throw Error(`No response body`);let c=new TextDecoder,l=``,u=``;for(;;){let{done:e,value:t}=await s.read();if(e)break;if(n.signal?.aborted){s.cancel();break}u+=c.decode(t,{stream:!0});let r=u.split(`
`);u=r.pop()||``;for(let e of r){let t=e.trim();if(!t||!t.startsWith(`data: `))continue;let r=t.slice(6);if(r!==`[DONE]`)try{let e=JSON.parse(r).choices?.[0]?.delta?.content||``;e&&(l+=e,n.onChunk(e))}catch{}}}return l}var f=e(()=>{console.log(`BrowserBot background ready`,{id:t.runtime.id}),t.runtime.onMessage.addListener((t,a,o)=>t.type===`TOGGLE_ASK_PAGE`?(e(t),!1):t.type===`ASK_PAGE_CHAT`?(n(t,a),!1):t.type===`GET_TAB_LIST`?(r().then(o),!0):t.type===`GET_TAB_CONTENT`?(i(t.tabId).then(o),!0):(t.type===`SAVE_PANEL_WIDTH`&&s.set({askPagePanelWidth:t.width}),!1));async function e(e){let[n]=await t.tabs.query({active:!0,currentWindow:!0});if(n?.id)try{await t.tabs.sendMessage(n.id,{type:`TOGGLE_ASK_PAGE`,pageTitle:n.title||``,pageUrl:n.url||``})}catch{console.warn(`Could not send TOGGLE_ASK_PAGE to tab`,n.id)}}async function n(e,n){let r=n.tab?.id;if(!r)return;let i=e.messages,a=e.providerType,o=e.openaiProviderId,s=new AbortController,l=(e,t)=>{e.type===`ASK_PAGE_CHAT_ABORT`&&t.tab?.id===r&&s.abort()};t.runtime.onMessage.addListener(l);try{await c(i,{providerType:a,openaiProviderId:o,signal:s.signal,onChunk:e=>{t.tabs.sendMessage(r,{type:`ASK_PAGE_CHAT_CHUNK`,chunk:e}).catch(()=>{})}}),await t.tabs.sendMessage(r,{type:`ASK_PAGE_CHAT_DONE`}).catch(()=>{})}catch(e){e.name!==`AbortError`&&await t.tabs.sendMessage(r,{type:`ASK_PAGE_CHAT_ERROR`,error:e.message||`Unknown error`}).catch(()=>{})}finally{t.runtime.onMessage.removeListener(l)}}async function r(){return(await t.tabs.query({currentWindow:!0})).filter(e=>e.id!=null&&e.url&&!e.url.startsWith(`chrome://`)&&!e.url.startsWith(`chrome-extension://`)).map(e=>({id:e.id,title:e.title||``,url:e.url||``,favIconUrl:e.favIconUrl||``}))}async function i(e){try{let n=await t.tabs.get(e);return{tabId:e,title:n.title||``,url:n.url||``,content:`[Tab: ${n.title}]\nURL: ${n.url}\n\n(Full content extraction not yet implemented)`}}catch(t){return{tabId:e,title:`Unknown`,url:``,content:`(Could not extract content: ${t.message})`}}}}),p=class{constructor(e){if(e===`<all_urls>`)this.isAllUrls=!0,this.protocolMatches=[...p.PROTOCOLS],this.hostnameMatch=`*`,this.pathnameMatch=`*`;else{let t=/(.*):\/\/(.*?)(\/.*)/.exec(e);if(t==null)throw new h(e,`Incorrect format`);let[n,r,i,a]=t;g(e,r),_(e,i),this.protocolMatches=r===`*`?[`http`,`https`]:[r],this.hostnameMatch=i,this.pathnameMatch=a}}includes(e){if(this.isAllUrls)return!0;let t=typeof e==`string`?new URL(e):e instanceof Location?new URL(e.href):e;return!!this.protocolMatches.find(e=>{if(e===`http`)return this.isHttpMatch(t);if(e===`https`)return this.isHttpsMatch(t);if(e===`file`)return this.isFileMatch(t);if(e===`ftp`)return this.isFtpMatch(t);if(e===`urn`)return this.isUrnMatch(t)})}isHttpMatch(e){return e.protocol===`http:`&&this.isHostPathMatch(e)}isHttpsMatch(e){return e.protocol===`https:`&&this.isHostPathMatch(e)}isHostPathMatch(e){if(!this.hostnameMatch||!this.pathnameMatch)return!1;let t=[this.convertPatternToRegex(this.hostnameMatch),this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./,``))],n=this.convertPatternToRegex(this.pathnameMatch);return!!t.find(t=>t.test(e.hostname))&&n.test(e.pathname)}isFileMatch(e){throw Error(`Not implemented: file:// pattern matching. Open a PR to add support`)}isFtpMatch(e){throw Error(`Not implemented: ftp:// pattern matching. Open a PR to add support`)}isUrnMatch(e){throw Error(`Not implemented: urn:// pattern matching. Open a PR to add support`)}convertPatternToRegex(e){let t=this.escapeForRegex(e).replace(/\\\*/g,`.*`);return RegExp(`^${t}$`)}escapeForRegex(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}},m=p;m.PROTOCOLS=[`http`,`https`,`file`,`ftp`,`urn`];var h=class extends Error{constructor(e,t){super(`Invalid match pattern "${e}": ${t}`)}};function g(e,t){if(!m.PROTOCOLS.includes(t)&&t!==`*`)throw new h(e,`${t} not a valid protocol (${m.PROTOCOLS.join(`, `)})`)}function _(e,t){if(t.includes(`:`))throw new h(e,`Hostname cannot include a port`);if(t.includes(`*`)&&t.length>1&&!t.startsWith(`*.`))throw new h(e,`If using a wildcard (*), it must go at the start of the hostname`)}var v={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)},y;try{y=f.main(),y instanceof Promise&&console.warn(`The background's main() function return a promise, but it must be synchronous`)}catch(e){throw v.error(`The background crashed on startup!`),e}return y})();