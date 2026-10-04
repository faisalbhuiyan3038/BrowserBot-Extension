import{t as e}from"./browser-CguJnX0f.js";function t(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var n=t();function r(e){n=e}var i={exec:()=>null};function a(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(s.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var o=(()=>{try{return!0}catch{return!1}})(),s={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,`i`),blockquoteBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}>`)},c=/^(?:[ \t]*(?:\n|$))+/,l=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,u=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,d=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,f=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,p=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,m=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,h=a(m).replace(/bull/g,p).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),ee=a(m).replace(/bull/g,p).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),g=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,te=/^[^\n]+/,_=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,ne=a(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,_).replace(`title`,/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),re=a(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,p).getRegex(),v=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,y=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,ie=a(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,y).replace(`tag`,v).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),b=a(g).replace(`hr`,d).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,v).getRegex(),x={blockquote:a(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace(`paragraph`,b).getRegex(),code:l,def:ne,fences:u,heading:f,hr:d,html:ie,lheading:h,list:re,newline:c,paragraph:b,table:i,text:te},S=a(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,d).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,v).getRegex(),ae={...x,lheading:ee,table:S,paragraph:a(g).replace(`hr`,d).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,S).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,v).getRegex()},oe={...x,html:a(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace(`comment`,y).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:i,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:a(g).replace(`hr`,d).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,h).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},se=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,ce=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,C=/^( {2,}|\\)\n(?!\s*$)/,w=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,T=/[\p{P}\p{S}]/u,E=/[\s\p{P}\p{S}]/u,D=/[^\s\p{P}\p{S}]/u,le=a(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,E).getRegex(),O=/(?!~)[\p{P}\p{S}]/u,ue=/(?!~)[\s\p{P}\p{S}]/u,de=/(?:[^\s\p{P}\p{S}]|~)/u,fe=a(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,o?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),k=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,pe=a(k,`u`).replace(/punct/g,T).getRegex(),me=a(k,`u`).replace(/punct/g,O).getRegex(),A=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,he=a(A,`gu`).replace(/notPunctSpace/g,D).replace(/punctSpace/g,E).replace(/punct/g,T).getRegex(),ge=a(A,`gu`).replace(/notPunctSpace/g,de).replace(/punctSpace/g,ue).replace(/punct/g,O).getRegex(),_e=a(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,D).replace(/punctSpace/g,E).replace(/punct/g,T).getRegex(),ve=a(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,T).getRegex(),ye=a(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,D).replace(/punctSpace/g,E).replace(/punct/g,T).getRegex(),be=a(/\\(punct)/,`gu`).replace(/punct/g,T).getRegex(),xe=a(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Se=a(y).replace(`(?:-->|$)`,`-->`).getRegex(),j=a(`^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,Se).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),M=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,Ce=a(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace(`label`,M).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace(`title`,/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),N=a(/^!?\[(label)\]\[(ref)\]/).replace(`label`,M).replace(`ref`,_).getRegex(),P=a(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,_).getRegex(),we=a(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,N).replace(`nolink`,P).getRegex(),F=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,I={_backpedal:i,anyPunctuation:be,autolink:xe,blockSkip:fe,br:C,code:ce,del:i,delLDelim:i,delRDelim:i,emStrongLDelim:pe,emStrongRDelimAst:he,emStrongRDelimUnd:_e,escape:se,link:Ce,nolink:P,punctuation:le,reflink:N,reflinkSearch:we,tag:j,text:w,url:i},Te={...I,link:a(/^!?\[(label)\]\((.*?)\)/).replace(`label`,M).getRegex(),reflink:a(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,M).getRegex()},L={...I,emStrongRDelimAst:ge,emStrongLDelim:me,delLDelim:ve,delRDelim:ye,url:a(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`protocol`,F).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:a(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace(`protocol`,F).getRegex()},Ee={...L,br:a(C).replace(`{2,}`,`*`).getRegex(),text:a(L.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},R={normal:x,gfm:ae,pedantic:oe},z={normal:I,gfm:L,breaks:Ee,pedantic:Te},De={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},B=e=>De[e];function V(e,t){if(t){if(s.escapeTest.test(e))return e.replace(s.escapeReplace,B)}else if(s.escapeTestNoEncode.test(e))return e.replace(s.escapeReplaceNoEncode,B);return e}function H(e){try{e=encodeURI(e).replace(s.percentDecode,`%`)}catch{return null}return e}function U(e,t){let n=e.replace(s.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(s.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``);for(;r<n.length;r++)n[r]=n[r].trim().replace(s.slashPipe,`|`);return n}function W(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function Oe(e,t){if(e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}function ke(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function G(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`);r.state.inLink=!0;let c={type:e[0].charAt(0)===`!`?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:r.inlineTokens(s)};return r.state.inLink=!1,c}function Ae(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return r.length>=i.length?e.slice(i.length):e}).join(`
`)}var K=class{options;rules;lexer;constructor(e){this.options=e||n}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=t[0].replace(this.rules.other.codeRemoveIndent,``);return{type:`code`,raw:t[0],codeBlockStyle:`indented`,text:this.options.pedantic?e:W(e,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=Ae(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=W(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:W(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=W(t[0],`
`).split(`
`),n=``,r=``,i=[];for(;e.length>0;){let t=!1,a=[],o;for(o=0;o<e.length;o++)if(this.rules.other.blockquoteStart.test(e[o]))a.push(e[o]),t=!0;else if(!t)a.push(e[o]);else break;e=e.slice(o);let s=a.join(`
`),c=s.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,``);n=n?`${n}
${s}`:s,r=r?`${r}
${c}`:c;let l=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,i,!0),this.lexer.state.top=l,e.length===0)break;let u=i.at(-1);if(u?.type===`code`)break;if(u?.type===`blockquote`){let t=u,a=t.raw+`
`+e.join(`
`),o=this.blockquote(a);i[i.length-1]=o,n=n.substring(0,n.length-t.raw.length)+o.raw,r=r.substring(0,r.length-t.text.length)+o.text;break}else if(u?.type===`list`){let t=u,a=t.raw+`
`+e.join(`
`),o=this.list(a);i[i.length-1]=o,n=n.substring(0,n.length-u.raw.length)+o.raw,r=r.substring(0,r.length-t.raw.length)+o.raw,e=a.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:`blockquote`,raw:n,tokens:i,text:r}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),r=n.length>1,i={type:`list`,raw:``,ordered:r,start:r?+n.slice(0,-1):``,loose:!1,items:[]};n=r?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=r?n:`[*+-]`);let a=this.rules.other.listItemRegex(n),o=!1;for(;e;){let n=!1,r=``,s=``;if(!(t=a.exec(e))||this.rules.block.hr.test(e))break;r=t[0],e=e.substring(r.length);let c=ke(t[2].split(`
`,1)[0],t[1].length),l=e.split(`
`,1)[0],u=!c.trim(),d=0;if(this.options.pedantic?(d=2,s=c.trimStart()):u?d=t[1].length+1:(d=c.search(this.rules.other.nonSpaceChar),d=d>4?1:d,s=c.slice(d),d+=t[1].length),u&&this.rules.other.blankLine.test(l)&&(r+=l+`
`,e=e.substring(l.length+1),n=!0),!n){let t=this.rules.other.nextBulletRegex(d),n=this.rules.other.hrRegex(d),i=this.rules.other.fencesBeginRegex(d),a=this.rules.other.headingBeginRegex(d),o=this.rules.other.htmlBeginRegex(d),f=this.rules.other.blockquoteBeginRegex(d);for(;e;){let p=e.split(`
`,1)[0],m;if(l=p,this.options.pedantic?(l=l.replace(this.rules.other.listReplaceNesting,`  `),m=l):m=l.replace(this.rules.other.tabCharGlobal,`    `),i.test(l)||a.test(l)||o.test(l)||f.test(l)||t.test(l)||n.test(l))break;if(m.search(this.rules.other.nonSpaceChar)>=d||!l.trim())s+=`
`+m.slice(d);else{if(u||c.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||i.test(c)||a.test(c)||n.test(c))break;s+=`
`+l}u=!l.trim(),r+=p+`
`,e=e.substring(p.length+1),c=m.slice(d)}}i.loose||(o?i.loose=!0:this.rules.other.doubleBlankLine.test(r)&&(o=!0)),i.items.push({type:`list_item`,raw:r,task:!!this.options.gfm&&this.rules.other.listIsTask.test(s),loose:!1,text:s,tokens:[]}),i.raw+=r}let s=i.items.at(-1);if(s)s.raw=s.raw.trimEnd(),s.text=s.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let e of i.items){if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),e.task){if(e.text=e.text.replace(this.rules.other.listReplaceTask,``),e.tokens[0]?.type===`text`||e.tokens[0]?.type===`paragraph`){e.tokens[0].raw=e.tokens[0].raw.replace(this.rules.other.listReplaceTask,``),e.tokens[0].text=e.tokens[0].text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}}let t=this.rules.other.listTaskCheckbox.exec(e.raw);if(t){let n={type:`checkbox`,raw:t[0]+` `,checked:t[0]!==`[ ]`};e.checked=n.checked,i.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=n.raw+e.tokens[0].raw,e.tokens[0].text=n.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(n)):e.tokens.unshift({type:`paragraph`,raw:n.raw,text:n.raw,tokens:[n]}):e.tokens.unshift(n)}}if(!i.loose){let t=e.tokens.filter(e=>e.type===`space`);i.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}}if(i.loose)for(let e of i.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return i}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:`html`,block:!0,raw:t[0],pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let e=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal,` `),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:t[0],href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=U(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:t[0],header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(U(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:t[0],depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let e=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(e)){if(!this.rules.other.endAngleBracket.test(e))return;let t=W(e.slice(0,-1),`\\`);if((e.length-t.length)%2==0)return}else{let e=Oe(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let n=t[2],r=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(n);e&&(n=e[1],r=e[3])}else r=t[3]?t[3].slice(1,-1):``;return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(n=this.options.pedantic&&!this.rules.other.endAngleBracket.test(e)?n.slice(1):n.slice(1,-1)),G(t,{href:n&&n.replace(this.rules.inline.anyPunctuation,`$1`),title:r&&r.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let e=t[(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal,` `).toLowerCase()];if(!e){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return G(n,e,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[3])||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=0,c=r[0][0]===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,t=t.slice(-1*e.length+n);(r=c.exec(t))!=null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i)continue;if(a=[...i].length,r[3]||r[4]){o+=a;continue}else if((r[5]||r[6])&&n%3&&!((n+a)%3)){s+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o+s);let t=[...r[0]][0].length,c=e.slice(0,n+r.index+t+a);if(Math.min(n,a)%2){let e=c.slice(1,-1);return{type:`em`,raw:c,text:e,tokens:this.lexer.inlineTokens(e)}}let l=c.slice(2,-2);return{type:`strong`,raw:c,text:l,tokens:this.lexer.inlineTokens(l)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim;for(s.lastIndex=0,t=t.slice(-1*e.length+n);(r=s.exec(t))!=null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:t[0],escaped:e}}}},q=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||n,this.options.tokenizer=this.options.tokenizer||new K,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:s,block:R.normal,inline:z.normal};this.options.pedantic?(t.block=R.pedantic,t.inline=z.pedantic):this.options.gfm&&(t.block=R.gfm,this.options.breaks?t.inline=z.breaks:t.inline=z.gfm),this.tokenizer.rules=t}static get rules(){return{block:R,inline:z}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(s.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){for(this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(s.tabCharGlobal,`    `).replace(s.spaceLine,``));e;){let r;if(this.options.extensions?.block?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let n=t.at(-1);r.raw.length===1&&n!==void 0?n.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.text,this.inlineQueue.at(-1).src=n.text):t.push(r);continue}if(r=this.tokenizer.fences(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.raw,this.inlineQueue.at(-1).src=n.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title},t.push(r));continue}if(r=this.tokenizer.table(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(e)){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startBlock){let t=1/0,n=e.slice(1),r;this.options.extensions.startBlock.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(this.state.top&&(r=this.tokenizer.paragraph(i))){let a=t.at(-1);n&&a?.type===`paragraph`?(a.raw+=(a.raw.endsWith(`
`)?``:`
`)+r.raw,a.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(r),n=i.length!==e.length,e=e.substring(r.raw.length);continue}if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(r);continue}if(e){let t=`Infinite loop on byte: `+e.charCodeAt(0);if(this.options.silent){console.error(t);break}else throw Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=e,r=null;if(this.tokens.links){let e=Object.keys(this.tokens.links);if(e.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)e.includes(r[0].slice(r[0].lastIndexOf(`[`)+1,-1))&&(n=n.slice(0,r.index)+`[`+`a`.repeat(r[0].length-2)+`]`+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,r.index)+`++`+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let i;for(;(r=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)i=r[2]?r[2].length:0,n=n.slice(0,r.index+i)+`[`+`a`.repeat(r[0].length-i-2)+`]`+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let a=!1,o=``;for(;e;){a||(o=``),a=!1;let r;if(this.options.extensions?.inline?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.escape(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.tag(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.link(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(r.raw.length);let n=t.at(-1);r.type===`text`&&n?.type===`text`?(n.raw+=r.raw,n.text+=r.text):t.push(r);continue}if(r=this.tokenizer.emStrong(e,n,o)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.codespan(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.br(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.del(e,n,o)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.autolink(e)){e=e.substring(r.raw.length),t.push(r);continue}if(!this.state.inLink&&(r=this.tokenizer.url(e))){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(r=this.tokenizer.inlineText(i)){e=e.substring(r.raw.length),r.raw.slice(-1)!==`_`&&(o=r.raw.slice(-1)),a=!0;let n=t.at(-1);n?.type===`text`?(n.raw+=r.raw,n.text+=r.text):t.push(r);continue}if(e){let t=`Infinite loop on byte: `+e.charCodeAt(0);if(this.options.silent){console.error(t);break}else throw Error(t)}}return t}},J=class{options;parser;constructor(e){this.options=e||n}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(s.notSpaceStart)?.[0],i=e.replace(s.endingNewline,``)+`
`;return r?`<pre><code class="language-`+V(r)+`">`+(n?i:V(i,!0))+`</code></pre>
`:`<pre><code>`+(n?i:V(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return``}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,r=``;for(let t=0;t<e.items.length;t++){let n=e.items[t];r+=this.listitem(n)}let i=t?`ol`:`ul`,a=t&&n!==1?` start="`+n+`"`:``;return`<`+i+a+`>
`+r+`</`+i+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return`<input `+(e?`checked="" `:``)+`disabled="" type="checkbox"> `}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t=``,n=``;for(let t=0;t<e.header.length;t++)n+=this.tablecell(e.header[t]);t+=this.tablerow({text:n});let r=``;for(let t=0;t<e.rows.length;t++){let i=e.rows[t];n=``;for(let e=0;e<i.length;e++)n+=this.tablecell(i[e]);r+=this.tablerow({text:n})}return r&&=`<tbody>${r}</tbody>`,`<table>
<thead>
`+t+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?`th`:`td`;return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${V(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let r=this.parser.parseInline(n),i=H(e);if(i===null)return r;e=i;let a=`<a href="`+e+`"`;return t&&(a+=` title="`+V(t)+`"`),a+=`>`+r+`</a>`,a}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=H(e);if(i===null)return V(n);e=i;let a=`<img src="${e}" alt="${V(n)}"`;return t&&(a+=` title="${V(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:V(e.text)}},Y=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return``+e}image({text:e}){return``+e}br(){return``}checkbox({raw:e}){return e}},X=class e{options;renderer;textRenderer;constructor(e){this.options=e||n,this.options.renderer=this.options.renderer||new J,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Y}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n||``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e||``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},Z=class{options;block;constructor(e){this.options=e||n}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(){return this.block?q.lex:q.lexInline}provideParser(){return this.block?X.parse:X.parseInline}},Q=new class{defaults=t();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=X;Renderer=J;TextRenderer=Y;Lexer=q;Tokenizer=K;Hooks=Z;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(n=n.concat(t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)n=n.concat(this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)n=n.concat(this.walkTokens(e.tokens,t));break}case`list`:{let e=r;n=n.concat(this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);n=n.concat(this.walkTokens(i,t))}):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new J(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n||``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new K(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new Z;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];Z.passThroughHooks.has(n)?t[r]=e=>{if(this.defaults.async&&Z.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:t[r]=(...e)=>{if(this.defaults.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return q.lex(e,t??this.defaults)}parser(e,t){return X.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer():e?q.lex:q.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser():e?X.parse:X.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer():e?q.lex:q.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser():e?X.parse:X.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+V(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function $(e,t){return Q.parse(e,t)}$.options=$.setOptions=function(e){return Q.setOptions(e),$.defaults=Q.defaults,r($.defaults),$},$.getDefaults=t,$.defaults=n,$.use=function(...e){return Q.use(...e),$.defaults=Q.defaults,r($.defaults),$},$.walkTokens=function(e,t){return Q.walkTokens(e,t)},$.parseInline=Q.parseInline,$.Parser=X,$.parser=X.parse,$.Renderer=J,$.TextRenderer=Y,$.Lexer=q,$.lexer=q.lex,$.Tokenizer=K,$.Hooks=Z,$.parse=$,$.options,$.setOptions,$.use,$.walkTokens,$.parseInline,X.parse,q.lex;function je(){try{return`
      @font-face {
        font-family: 'Caveat';
        src: url('${e.runtime.getURL(`/fonts/Caveat/Caveat-VariableFont_wght.ttf`)}') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Nunito';
        src: url('${e.runtime.getURL(`/fonts/Nunito/Nunito-VariableFont_wght.ttf`)}') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Nunito';
        src: url('${e.runtime.getURL(`/fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf`)}') format('truetype');
        font-weight: 100 900;
        font-style: italic;
        font-display: swap;
      }
    `}catch{return``}}function Me(){return`
${je()}

* { box-sizing: border-box; margin: 0; padding: 0; }

:host, :root {
  /* Default: Light Warm Paper Theme */
  --hb: #fff;
  --hfg: #1c1c20;
  --hm: #62626b;
  --hcode: #f5f5f7;
  --hbd: #e2e2e6;
  --hl: #fff1a8;
  --hlb: #e8b800;
  --er: #c8372d;
  --rx: 999px;

  --pbg: #fffbf0;
  --blur: none;
  --fg: #2a2622;
  --mute: #645c52;
  --bd: #2a2622;
  --sub: #fff3d6;
  --ac: #e0482c;
  --acfg: #fff;
  --acs: #ffe3d8;
  --act: #b02f17;
  --ub: #ffd45e;
  --ubf: #2a2622;
  --ab: #fffbf0;
  --abd: #2a2622;
  --code: #f4ead2;
  --cb: #fffbf0;
  --r: 22px;
  --rb: 16px;
  --rc: 14px;
  --rs: 12px;
  --sh: 6px 6px 0 #2a2622;
  --sh-sm: 2px 2px 0 #2a2622;
  --font: 'Nunito', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --hfont: 'Caveat', cursive, sans-serif;
  --ln: rgba(70, 110, 190, 0.17);

  all: initial;
  font-family: var(--font);
  color: var(--fg);
}

[data-theme="dark"], :host([data-theme="dark"]) {
  --hb: #18181b;
  --hfg: #e6e6ea;
  --hm: #9d9da6;
  --hcode: #222226;
  --hbd: #34343a;
  --hl: #5a4a00;
  --er: #ff7a70;

  --pbg: #2a2723;
  --fg: #f4eee3;
  --mute: #bdb4a5;
  --bd: #d8cfbf;
  --sub: #37332d;
  --ac: #ff7f61;
  --acfg: #2a1208;
  --acs: #4a2c22;
  --act: #ffa68f;
  --ub: #e6b93c;
  --ubf: #241c05;
  --ab: #2a2723;
  --abd: #d8cfbf;
  --code: #37332d;
  --cb: #2a2723;
  --sh: 6px 6px 0 #0008;
  --sh-sm: 2px 2px 0 #0008;
  --ln: rgba(200, 220, 255, 0.07);
}

::selection {
  background: var(--hlb);
  color: #2a2622;
}

:focus-visible {
  outline: 2px dashed var(--ac);
  outline-offset: 2px;
}

#browserbot-ask-page-root {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483646;
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

/* ─── Panel Container ──────────────────────────────── */

.askpage-panel {
  position: fixed;
  top: 16px;
  right: 16px;
  bottom: 16px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: var(--pbg);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .07 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
  color: var(--fg);
  border: 2px solid var(--bd);
  border-radius: 22px 28px 18px 26px / 26px 18px 28px 20px;
  box-shadow: var(--sh);
  font: 14px/1.55 var(--font);
  animation: rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  overflow: hidden;
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
  z-index: 2147483646;
}

.askpage-panel.fullscreen {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  max-height: 100vh;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.askpage-panel.minimized {
  animation: slideOutPanel 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14px) rotate(0.6deg); }
  to   { opacity: 1; transform: translateY(0) rotate(0deg); }
}

@keyframes slideOutPanel {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(100%); opacity: 0; }
}

/* ─── Resize Handle ────────────────────────────────── */

.askpage-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
  transition: background 0.15s;
}

.askpage-resize-handle:hover,
.askpage-resize-handle.dragging {
  background: var(--ac);
  opacity: 0.6;
}

/* ─── Header ───────────────────────────────────────── */

.askpage-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1.5px solid var(--bd);
  background: var(--pbg);
  flex-shrink: 0;
}

.askpage-header::before {
  content: "";
  position: absolute;
  top: 4px;
  left: 50%;
  width: 34px;
  height: 6px;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--mute) 1.2px, transparent 1.7px) 0 0/8px 6px;
  opacity: 0.55;
  pointer-events: none;
}

.askpage-header-icon {
  width: 24px;
  height: 24px;
  color: var(--ac);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transform: rotate(-8deg);
  transition: transform 0.2s;
}

.askpage-header-icon svg {
  width: 22px;
  height: 22px;
}

.askpage-header-title {
  font: 700 26px/1 var(--hfont);
  color: var(--fg);
  flex: 1;
  letter-spacing: -0.01em;
}

.askpage-header-title b {
  font-weight: 700;
  text-decoration: underline wavy var(--ac) 1.5px;
  text-underline-offset: 5px;
}

.askpage-header-btn {
  background: var(--sub);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--mute);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-header-btn:hover {
  background: var(--acs);
  color: var(--act);
  transform: rotate(-6deg) scale(1.05);
  box-shadow: 2px 2px 0 var(--bd);
}

.askpage-header-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}

/* ─── Provider & Prompt Controls Row ───────────────── */

.askpage-controls {
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1.5px dashed var(--bd);
  background: var(--sub);
  flex-shrink: 0;
}

.askpage-select {
  flex: 1;
  padding: 6px 10px;
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--fg);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  appearance: auto;
  transition: all 0.15s;
}

.askpage-select:focus {
  outline: none;
  border-color: var(--ac);
  box-shadow: 0 0 0 2px var(--acs), 1.5px 1.5px 0 var(--bd);
}

.askpage-quick-prompt-select {
  max-width: 140px;
  min-width: 110px;
  flex: 0 0 auto !important;
}

/* ─── Chat Messages (Lined Paper Area) ─────────────── */

.askpage-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: repeating-linear-gradient(transparent 0 27px, var(--ln) 27px 28px);
  scrollbar-width: thin;
  scrollbar-color: var(--mute) transparent;
}

.askpage-messages::-webkit-scrollbar {
  width: 5px;
}

.askpage-messages::-webkit-scrollbar-track {
  background: transparent;
}

.askpage-messages::-webkit-scrollbar-thumb {
  background: var(--mute);
  border-radius: 4px;
}

.askpage-msg-wrapper {
  display: flex;
  flex-direction: column;
  animation: pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
}

.askpage-msg-wrapper.user {
  align-items: flex-end;
}

.askpage-msg-wrapper.assistant,
.askpage-msg-wrapper.error {
  align-items: flex-start;
}

@keyframes pop {
  from { opacity: 0; transform: translateY(8px) rotate(-1deg); }
  to   { opacity: 1; transform: translateY(0) rotate(0deg); }
}

.askpage-msg {
  max-width: 86%;
  padding: 9px 12px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
  position: relative;
}

.askpage-msg.user {
  align-self: flex-end;
  background: var(--ub);
  color: var(--ubf);
  border: 1.5px solid var(--bd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  border-bottom-right-radius: 3px;
  transform: rotate(0.5deg);
  box-shadow: 2px 2px 0 var(--bd);
}

.askpage-msg.assistant {
  align-self: flex-start;
  background: var(--ab);
  color: var(--fg);
  border: 1.5px solid var(--abd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  border-bottom-left-radius: 3px;
  box-shadow: 3px 3px 0 color-mix(in srgb, var(--bd) 20%, transparent);
}

.askpage-msg.error {
  align-self: flex-start;
  background: var(--pbg);
  color: var(--fg);
  border: 2px solid var(--er);
  border-radius: 14px 18px 12px 16px;
  box-shadow: 2px 2px 0 var(--er);
}

/* ─── Markdown Content Formatting ──────────────────── */

.askpage-msg.assistant h1,
.askpage-msg.assistant h2,
.askpage-msg.assistant h3,
.askpage-msg.assistant h4 {
  margin: 10px 0 4px;
  font-family: var(--hfont);
  font-weight: 700;
  line-height: 1.2;
}

.askpage-msg.assistant h1 { font-size: 24px; }
.askpage-msg.assistant h2 { font-size: 20px; }
.askpage-msg.assistant h3 { font-size: 18px; }
.askpage-msg.assistant h4 { font-size: 16px; }

.askpage-msg.assistant h1:first-child,
.askpage-msg.assistant h2:first-child,
.askpage-msg.assistant h3:first-child {
  margin-top: 0;
}

.askpage-msg.assistant p {
  margin: 6px 0;
}

.askpage-msg.assistant p:first-child { margin-top: 0; }
.askpage-msg.assistant p:last-child { margin-bottom: 0; }

.askpage-msg.assistant ul {
  list-style: none;
  padding-left: 2px;
  margin: 6px 0;
}

.askpage-msg.assistant ul li {
  position: relative;
  padding-left: 18px;
  margin: 3px 0;
}

.askpage-msg.assistant ul li::before {
  content: "";
  position: absolute;
  left: 3px;
  top: 0.6em;
  width: 7px;
  height: 7px;
  background: var(--ac);
  border-radius: 50% 40% 55% 45%;
}

.askpage-msg.assistant ol {
  margin: 6px 0;
  padding-left: 20px;
}

.askpage-msg.assistant ol li::marker {
  font: 700 19px var(--hfont);
  color: var(--act);
}

.askpage-msg.assistant code {
  font: 12px ui-monospace, Menlo, Consolas, monospace;
  background: var(--code);
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--bd) 20%, transparent);
}

.askpage-msg.assistant pre {
  background: var(--code);
  border: 1.5px dashed var(--bd);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 8px 0;
  overflow-x: auto;
  position: relative;
}

.askpage-msg.assistant pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  line-height: 1.5;
}

.askpage-msg.assistant blockquote {
  border: none;
  font: 600 20px/1.2 var(--hfont);
  font-style: normal;
  color: var(--fg);
  padding: 2px 8px 2px 24px;
  margin: 8px 0;
  position: relative;
}

.askpage-msg.assistant blockquote::before {
  content: "\\201C";
  position: absolute;
  left: 2px;
  top: -8px;
  font: 700 46px/1 var(--hfont);
  color: var(--ac);
}

.askpage-msg.assistant table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12.5px;
  margin: 8px 0;
}

.askpage-msg.assistant th,
.askpage-msg.assistant td {
  padding: 5px 8px;
  border-bottom: 1.5px dashed var(--bd);
  text-align: left;
}

.askpage-msg.assistant th {
  font: 700 18px/1 var(--hfont);
  color: var(--act);
}

.askpage-msg.assistant a {
  color: var(--act);
  text-decoration: underline;
}

.askpage-msg.assistant hr {
  border: none;
  border-top: 1.5px dashed var(--bd);
  margin: 10px 0;
}

/* Citation Badge */
.askpage-msg .c {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  margin: 0 2px;
  border: 1.5px solid var(--act);
  border-radius: 50%;
  background: var(--acs);
  color: var(--act);
  font: 700 14px var(--hfont);
  vertical-align: 1px;
  text-decoration: none;
  transition: 0.15s;
}

.askpage-msg .c:hover {
  background: var(--ac);
  color: var(--acfg);
}

/* ─── Animated Thinking Indicator (Squiggly wave) ─── */

.askpage-typing {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  align-self: flex-start;
  color: var(--mute);
  font: 600 19px/1 var(--hfont);
}

.askpage-typing-wave {
  width: 56px;
  height: 16px;
  stroke: var(--ac);
  stroke-width: 2.2;
  fill: none;
}

.askpage-typing-wave path {
  stroke-dasharray: 1;
  animation: waveDr 1.4s ease-in-out infinite;
}

@keyframes waveDr {
  0%   { stroke-dashoffset: 1; }
  50%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -1; }
}

/* ─── Thinking Block ─────────────────────────── */

.askpage-thinking-block {
  align-self: flex-start;
  max-width: 90%;
  margin-bottom: 4px;
  border-radius: var(--rs);
  background: var(--sub);
  border: 1.5px dashed var(--bd);
  overflow: hidden;
  box-shadow: 1.5px 1.5px 0 var(--bd);
}

.askpage-thinking-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font: 700 18px/1 var(--hfont);
  color: var(--act);
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.askpage-thinking-summary::-webkit-details-marker { display: none; }

.askpage-thinking-summary::before {
  content: '▶';
  font-size: 9px;
  transition: transform 0.15s;
}

details[open] > .askpage-thinking-summary::before {
  transform: rotate(90deg);
}

.askpage-thinking-content {
  padding: 8px 12px;
  font-size: 12.5px;
  color: var(--mute);
  line-height: 1.5;
  border-top: 1.5px dashed var(--bd);
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* ─── Tab Context Bar ──────────────────────────────── */

.askpage-tabs-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-top: 1.5px solid var(--bd);
  background: var(--sub);
  flex-wrap: wrap;
  flex-shrink: 0;
}

/* Tape strip on context bar */
.askpage-tabs-bar::after {
  content: "";
  position: absolute;
  top: -8px;
  right: 18px;
  width: 44px;
  height: 14px;
  background: color-mix(in srgb, var(--hlb) 55%, transparent);
  transform: rotate(-4deg);
  pointer-events: none;
}

.askpage-tabs-label {
  font: 700 17px/1 var(--hfont);
  color: var(--mute);
  margin-right: 4px;
}

.askpage-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: var(--pbg);
  border: 1.5px dashed var(--bd);
  border-radius: var(--rx);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg);
  max-width: 160px;
}

.askpage-tab-chip-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-chip-close {
  background: none;
  border: none;
  color: var(--mute);
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
  transition: color 0.15s;
}

.askpage-tab-chip-close:hover {
  color: var(--er);
}

.askpage-current-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--pbg);
  border: 1.5px dashed var(--bd);
  border-radius: var(--rx);
  color: var(--fg);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.askpage-current-tab-chip:hover {
  background: var(--acs);
  border-color: var(--ac);
  color: var(--act);
}

.askpage-current-tab-chip.active {
  background: var(--acs);
  border: 1.5px solid var(--ac);
  color: var(--act);
}

.askpage-tab-chip-check {
  font-weight: 700;
  color: var(--act);
}

.askpage-add-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--pbg);
  border: 1.5px dashed var(--bd);
  border-radius: var(--rx);
  color: var(--mute);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-add-tab-btn:hover {
  background: var(--acs);
  border-color: var(--ac);
  color: var(--act);
}

/* ─── Input Area ───────────────────────────────────── */

.askpage-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 14px 14px;
  background: var(--pbg);
  flex-shrink: 0;
}

.askpage-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--cb);
  border: 1.5px solid var(--bd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  padding: 8px 10px;
  box-shadow: 2px 2px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-input-wrapper:focus-within {
  border-color: var(--ac);
  box-shadow: 0 0 0 3px var(--acs), 2px 2px 0 var(--bd);
}

.askpage-input {
  width: 100%;
  border: none;
  background: none;
  resize: none;
  outline: none;
  font: inherit;
  font-size: 13.5px;
  color: var(--fg);
  line-height: 1.45;
  max-height: 110px;
  scrollbar-width: thin;
}

.askpage-input::placeholder {
  font: 600 19px var(--hfont);
  color: var(--mute);
}

.askpage-send-btn {
  width: 34px;
  height: 34px;
  background: var(--ac);
  border: 1.5px solid var(--bd);
  border-radius: 12px 9px 12px 9px;
  color: var(--acfg);
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 2px 2px 0 var(--bd);
  flex-shrink: 0;
  transition: all 0.15s;
}

.askpage-send-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 3px 3px 0 var(--bd);
}

.askpage-send-btn:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.askpage-send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

/* ─── Welcome Message ──────────────────────────────── */

.askpage-welcome {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 8px;
  gap: 10px;
}

.askpage-welcome-icon {
  width: 38px;
  height: 38px;
  color: var(--ac);
  transform: rotate(-8deg);
}

.askpage-welcome-icon svg {
  width: 36px;
  height: 36px;
}

.askpage-welcome h3 {
  font: 700 34px/1 var(--hfont);
  color: var(--fg);
  transform: rotate(-1deg);
}

.askpage-welcome h3::after {
  content: "\\2726";
  color: var(--ac);
  font-size: 0.55em;
  margin-left: 6px;
  vertical-align: top;
}

.askpage-welcome p {
  color: var(--mute);
  font-size: 13.5px;
  line-height: 1.5;
}

.askpage-welcome-pick {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  font: 700 22px/1 var(--hfont);
  color: var(--act);
  transform: rotate(-3deg);
  margin: 10px 0 2px 4px;
}

.askpage-welcome-pick svg {
  width: 34px;
  height: 26px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.askpage-welcome-prompts {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

.askpage-welcome-prompt-btn {
  text-align: left;
  padding: 9px 12px;
  border: 1.5px solid var(--bd);
  border-radius: 14px 10px 16px 10px / 10px 16px 10px 14px;
  background: var(--pbg);
  box-shadow: 2px 2px 0 var(--bd);
  font: 700 20px/1.1 var(--hfont);
  color: var(--fg);
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
}

.askpage-welcome-prompt-btn:nth-child(odd) {
  transform: rotate(-0.8deg);
}

.askpage-welcome-prompt-btn:nth-child(even) {
  transform: rotate(0.8deg);
}

.askpage-welcome-prompt-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--bd);
  background: var(--acs);
  color: var(--act);
  border-color: var(--ac);
}

.askpage-welcome-prompt-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

/* ─── Code Copy Button ─────────────────────────────── */

.askpage-code-wrapper {
  position: relative;
  margin: 8px 0;
}

.askpage-copy-btn {
  position: absolute;
  top: 4px;
  right: 6px;
  font: 700 17px/1 var(--hfont);
  color: var(--act);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--bd);
  background: var(--sub);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
  z-index: 2;
}

.askpage-code-wrapper:hover .askpage-copy-btn,
.askpage-copy-btn:focus-visible {
  opacity: 1;
}

.askpage-copy-btn:hover {
  background: var(--acs);
}

/* ─── History Sidebar ────────────────────────── */

.askpage-history-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 270px;
  background: var(--sub);
  border-right: 2px solid var(--bd);
  box-shadow: 4px 0 0 var(--bd);
  z-index: 25;
  display: flex;
  flex-direction: column;
  animation: slideInHistory 0.2s ease;
}

@keyframes slideInHistory {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

.askpage-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
  border-bottom: 1.5px solid var(--bd);
}

.askpage-history-header h4 {
  font: 700 22px/1 var(--hfont);
  color: var(--fg);
}

.askpage-history-new {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--ac);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--acfg);
  font: 700 17px/1 var(--hfont);
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-history-new:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.askpage-history-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--rs);
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  color: var(--mute);
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-history-close:hover {
  background: var(--acs);
  color: var(--er);
}

.askpage-history-search {
  margin: 8px 12px;
  padding: 6px 10px;
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--fg);
  font-family: var(--font);
  font-size: 12px;
}

.askpage-history-search:focus {
  outline: none;
  border-color: var(--ac);
}

.askpage-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
  scrollbar-width: thin;
}

.askpage-history-item {
  display: flex;
  align-items: stretch;
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  background: var(--pbg);
  margin-bottom: 6px;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.12s;
}

.askpage-history-item:hover {
  background: var(--acs);
  border-color: var(--ac);
}

.askpage-history-item.active {
  background: var(--ub);
  border-color: var(--bd);
}

.askpage-history-item-main {
  flex: 1;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: var(--fg);
  min-width: 0;
}

.askpage-history-item-title {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-history-item-meta {
  font-size: 10px;
  color: var(--mute);
  margin-top: 2px;
}

.askpage-history-item-delete {
  background: none;
  border: none;
  color: var(--mute);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0.4;
  transition: all 0.12s;
}

.askpage-history-item:hover .askpage-history-item-delete {
  opacity: 0.9;
}

.askpage-history-item-delete:hover {
  color: var(--er) !important;
}

.askpage-history-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--mute);
  font: 600 18px var(--hfont);
}

/* ─── Tab Picker Modal ─────────────────────────────── */

.askpage-tab-picker-overlay {
  position: absolute;
  inset: 0;
  background: rgba(42, 38, 34, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.askpage-tab-picker {
  background: var(--pbg);
  border: 2px solid var(--bd);
  border-radius: var(--r);
  box-shadow: var(--sh);
  padding: 16px;
  width: calc(100% - 32px);
  max-width: 360px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.askpage-tab-picker h4 {
  font: 700 24px/1 var(--hfont);
  color: var(--fg);
}

.askpage-tab-picker-search {
  padding: 7px 10px;
  background: var(--sub);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--fg);
  font-family: var(--font);
  font-size: 13px;
  width: 100%;
}

.askpage-tab-picker-search:focus {
  outline: none;
  border-color: var(--ac);
}

.askpage-tab-picker-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 240px;
  scrollbar-width: thin;
}

.askpage-tab-picker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  cursor: pointer;
  font-family: inherit;
  color: var(--fg);
  text-align: left;
  width: 100%;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.12s;
}

.askpage-tab-picker-item:hover {
  background: var(--acs);
  border-color: var(--ac);
  transform: translateY(-1px);
}

.askpage-tab-picker-item.selected {
  background: var(--ub);
  border-color: var(--bd);
}

.askpage-tab-picker-favicon {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.askpage-tab-picker-info {
  flex: 1;
  overflow: hidden;
}

.askpage-tab-picker-title {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-url {
  font-size: 10px;
  color: var(--mute);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.askpage-tab-picker-btn {
  padding: 6px 14px;
  border-radius: var(--rs);
  font: 700 18px/1 var(--hfont);
  cursor: pointer;
  border: 1.5px solid var(--bd);
  box-shadow: 2px 2px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-tab-picker-btn.cancel {
  background: var(--sub);
  color: var(--mute);
}

.askpage-tab-picker-btn.confirm {
  background: var(--ac);
  color: var(--acfg);
}

.askpage-tab-picker-btn.confirm:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* ─── Floating Button ──────────────────────────────── */

#browserbot-floating-btn {
  position: fixed;
  right: 14px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  border-radius: 14px 10px 14px 10px / 10px 14px 10px 14px;
  background: var(--ac);
  border: 2px solid var(--bd);
  box-shadow: 3px 3px 0 var(--bd);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2147483645;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, filter 0.15s;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

#browserbot-floating-btn:hover {
  transform: scale(1.08) rotate(-4deg);
  box-shadow: 4px 4px 0 var(--bd);
  filter: brightness(1.08);
}

#browserbot-floating-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 var(--bd);
}

#browserbot-floating-btn.dragging {
  transition: none;
  transform: scale(1.15);
  box-shadow: 5px 5px 0 var(--bd);
}

#browserbot-floating-btn.hidden {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}

#browserbot-floating-btn svg {
  width: 20px;
  height: 20px;
  color: var(--acfg);
  pointer-events: none;
}

/* Minimized Side Tab */
.askpage-minimized-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 42px;
  height: 48px;
  background: var(--ac);
  border: 2px solid var(--bd);
  border-right: none;
  border-radius: 14px 0 0 14px;
  color: var(--acfg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -3px 3px 0 var(--bd);
  z-index: 2147483646;
  transition: all 0.15s;
}

.askpage-minimized-tab:hover {
  width: 48px;
  background: var(--acs);
  color: var(--act);
}
`}export{$ as n,Me as t};