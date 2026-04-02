const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/readability-DPJkCc60.js","chunks/chunk-CXXdWJP5.js","chunks/html-to-text-DNXrm7Fp.js"])))=>i.map(i=>d[i]);
import{n as e}from"./chunk-CXXdWJP5.js";import{c as t,l as n,o as r,r as i,s as a,t as o}from"./jsx-runtime-BbzL0grH.js";var s=e(n(),1),c=e(t(),1);function l(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var u=l();function d(e){u=e}var f={exec:()=>null};function p(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(h.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var m=(()=>{try{return!0}catch{return!1}})(),h={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,`i`),blockquoteBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}>`)},g=/^(?:[ \t]*(?:\n|$))+/,_=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,ee=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,v=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,te=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,y=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,ne=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,b=p(ne).replace(/bull/g,y).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),re=p(ne).replace(/bull/g,y).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),x=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,ie=/^[^\n]+/,ae=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,oe=p(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,ae).replace(`title`,/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),se=p(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,y).getRegex(),S=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,ce=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,le=p(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,ce).replace(`tag`,S).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),ue=p(x).replace(`hr`,v).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,S).getRegex(),de={blockquote:p(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace(`paragraph`,ue).getRegex(),code:_,def:oe,fences:ee,heading:te,hr:v,html:le,lheading:b,list:se,newline:g,paragraph:ue,table:f,text:ie},C=p(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,v).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,S).getRegex(),fe={...de,lheading:re,table:C,paragraph:p(x).replace(`hr`,v).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,C).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,S).getRegex()},pe={...de,html:p(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace(`comment`,ce).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:f,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:p(x).replace(`hr`,v).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,b).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},w=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,me=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,he=/^( {2,}|\\)\n(?!\s*$)/,ge=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,T=/[\p{P}\p{S}]/u,E=/[\s\p{P}\p{S}]/u,D=/[^\s\p{P}\p{S}]/u,O=p(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,E).getRegex(),k=/(?!~)[\p{P}\p{S}]/u,A=/(?!~)[\s\p{P}\p{S}]/u,_e=/(?:[^\s\p{P}\p{S}]|~)/u,j=p(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,m?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),ve=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,ye=p(ve,`u`).replace(/punct/g,T).getRegex(),M=p(ve,`u`).replace(/punct/g,k).getRegex(),be=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,xe=p(be,`gu`).replace(/notPunctSpace/g,D).replace(/punctSpace/g,E).replace(/punct/g,T).getRegex(),Se=p(be,`gu`).replace(/notPunctSpace/g,_e).replace(/punctSpace/g,A).replace(/punct/g,k).getRegex(),Ce=p(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,D).replace(/punctSpace/g,E).replace(/punct/g,T).getRegex(),N=p(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,T).getRegex(),we=p(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,D).replace(/punctSpace/g,E).replace(/punct/g,T).getRegex(),Te=p(/\\(punct)/,`gu`).replace(/punct/g,T).getRegex(),P=p(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),F=p(ce).replace(`(?:-->|$)`,`-->`).getRegex(),I=p(`^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,F).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),L=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,R=p(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace(`label`,L).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace(`title`,/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),z=p(/^!?\[(label)\]\[(ref)\]/).replace(`label`,L).replace(`ref`,ae).getRegex(),B=p(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,ae).getRegex(),Ee=p(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,z).replace(`nolink`,B).getRegex(),De=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,V={_backpedal:f,anyPunctuation:Te,autolink:P,blockSkip:j,br:he,code:me,del:f,delLDelim:f,delRDelim:f,emStrongLDelim:ye,emStrongRDelimAst:xe,emStrongRDelimUnd:Ce,escape:w,link:R,nolink:B,punctuation:O,reflink:z,reflinkSearch:Ee,tag:I,text:ge,url:f},Oe={...V,link:p(/^!?\[(label)\]\((.*?)\)/).replace(`label`,L).getRegex(),reflink:p(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,L).getRegex()},ke={...V,emStrongRDelimAst:Se,emStrongLDelim:M,delLDelim:N,delRDelim:we,url:p(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`protocol`,De).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:p(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace(`protocol`,De).getRegex()},Ae={...ke,br:p(he).replace(`{2,}`,`*`).getRegex(),text:p(ke.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},H={normal:de,gfm:fe,pedantic:pe},U={normal:V,gfm:ke,breaks:Ae,pedantic:Oe},je={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},Me=e=>je[e];function W(e,t){if(t){if(h.escapeTest.test(e))return e.replace(h.escapeReplace,Me)}else if(h.escapeTestNoEncode.test(e))return e.replace(h.escapeReplaceNoEncode,Me);return e}function Ne(e){try{e=encodeURI(e).replace(h.percentDecode,`%`)}catch{return null}return e}function Pe(e,t){let n=e.replace(h.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(h.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``);for(;r<n.length;r++)n[r]=n[r].trim().replace(h.slashPipe,`|`);return n}function G(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function Fe(e,t){if(e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}function Ie(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function Le(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`);r.state.inLink=!0;let c={type:e[0].charAt(0)===`!`?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:r.inlineTokens(s)};return r.state.inLink=!1,c}function Re(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return r.length>=i.length?e.slice(i.length):e}).join(`
`)}var K=class{options;rules;lexer;constructor(e){this.options=e||u}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=t[0].replace(this.rules.other.codeRemoveIndent,``);return{type:`code`,raw:t[0],codeBlockStyle:`indented`,text:this.options.pedantic?e:G(e,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=Re(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=G(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:G(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=G(t[0],`
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
`);continue}}return{type:`blockquote`,raw:n,tokens:i,text:r}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),r=n.length>1,i={type:`list`,raw:``,ordered:r,start:r?+n.slice(0,-1):``,loose:!1,items:[]};n=r?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=r?n:`[*+-]`);let a=this.rules.other.listItemRegex(n),o=!1;for(;e;){let n=!1,r=``,s=``;if(!(t=a.exec(e))||this.rules.block.hr.test(e))break;r=t[0],e=e.substring(r.length);let c=Ie(t[2].split(`
`,1)[0],t[1].length),l=e.split(`
`,1)[0],u=!c.trim(),d=0;if(this.options.pedantic?(d=2,s=c.trimStart()):u?d=t[1].length+1:(d=c.search(this.rules.other.nonSpaceChar),d=d>4?1:d,s=c.slice(d),d+=t[1].length),u&&this.rules.other.blankLine.test(l)&&(r+=l+`
`,e=e.substring(l.length+1),n=!0),!n){let t=this.rules.other.nextBulletRegex(d),n=this.rules.other.hrRegex(d),i=this.rules.other.fencesBeginRegex(d),a=this.rules.other.headingBeginRegex(d),o=this.rules.other.htmlBeginRegex(d),f=this.rules.other.blockquoteBeginRegex(d);for(;e;){let p=e.split(`
`,1)[0],m;if(l=p,this.options.pedantic?(l=l.replace(this.rules.other.listReplaceNesting,`  `),m=l):m=l.replace(this.rules.other.tabCharGlobal,`    `),i.test(l)||a.test(l)||o.test(l)||f.test(l)||t.test(l)||n.test(l))break;if(m.search(this.rules.other.nonSpaceChar)>=d||!l.trim())s+=`
`+m.slice(d);else{if(u||c.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||i.test(c)||a.test(c)||n.test(c))break;s+=`
`+l}u=!l.trim(),r+=p+`
`,e=e.substring(p.length+1),c=m.slice(d)}}i.loose||(o?i.loose=!0:this.rules.other.doubleBlankLine.test(r)&&(o=!0)),i.items.push({type:`list_item`,raw:r,task:!!this.options.gfm&&this.rules.other.listIsTask.test(s),loose:!1,text:s,tokens:[]}),i.raw+=r}let s=i.items.at(-1);if(s)s.raw=s.raw.trimEnd(),s.text=s.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let e of i.items){if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),e.task){if(e.text=e.text.replace(this.rules.other.listReplaceTask,``),e.tokens[0]?.type===`text`||e.tokens[0]?.type===`paragraph`){e.tokens[0].raw=e.tokens[0].raw.replace(this.rules.other.listReplaceTask,``),e.tokens[0].text=e.tokens[0].text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}}let t=this.rules.other.listTaskCheckbox.exec(e.raw);if(t){let n={type:`checkbox`,raw:t[0]+` `,checked:t[0]!==`[ ]`};e.checked=n.checked,i.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=n.raw+e.tokens[0].raw,e.tokens[0].text=n.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(n)):e.tokens.unshift({type:`paragraph`,raw:n.raw,text:n.raw,tokens:[n]}):e.tokens.unshift(n)}}if(!i.loose){let t=e.tokens.filter(e=>e.type===`space`);i.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}}if(i.loose)for(let e of i.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return i}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:`html`,block:!0,raw:t[0],pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let e=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal,` `),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:t[0],href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=Pe(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:t[0],header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(Pe(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:t[0],depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let e=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(e)){if(!this.rules.other.endAngleBracket.test(e))return;let t=G(e.slice(0,-1),`\\`);if((e.length-t.length)%2==0)return}else{let e=Fe(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let n=t[2],r=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(n);e&&(n=e[1],r=e[3])}else r=t[3]?t[3].slice(1,-1):``;return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(n=this.options.pedantic&&!this.rules.other.endAngleBracket.test(e)?n.slice(1):n.slice(1,-1)),Le(t,{href:n&&n.replace(this.rules.inline.anyPunctuation,`$1`),title:r&&r.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let e=t[(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal,` `).toLowerCase()];if(!e){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return Le(n,e,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[3])||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=0,c=r[0][0]===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,t=t.slice(-1*e.length+n);(r=c.exec(t))!=null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i)continue;if(a=[...i].length,r[3]||r[4]){o+=a;continue}else if((r[5]||r[6])&&n%3&&!((n+a)%3)){s+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o+s);let t=[...r[0]][0].length,c=e.slice(0,n+r.index+t+a);if(Math.min(n,a)%2){let e=c.slice(1,-1);return{type:`em`,raw:c,text:e,tokens:this.lexer.inlineTokens(e)}}let l=c.slice(2,-2);return{type:`strong`,raw:c,text:l,tokens:this.lexer.inlineTokens(l)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim;for(s.lastIndex=0,t=t.slice(-1*e.length+n);(r=s.exec(t))!=null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:t[0],escaped:e}}}},q=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||u,this.options.tokenizer=this.options.tokenizer||new K,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:h,block:H.normal,inline:U.normal};this.options.pedantic?(t.block=H.pedantic,t.inline=U.pedantic):this.options.gfm&&(t.block=H.gfm,this.options.breaks?t.inline=U.breaks:t.inline=U.gfm),this.tokenizer.rules=t}static get rules(){return{block:H,inline:U}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(h.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){for(this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(h.tabCharGlobal,`    `).replace(h.spaceLine,``));e;){let r;if(this.options.extensions?.block?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let n=t.at(-1);r.raw.length===1&&n!==void 0?n.raw+=`
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
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(r);continue}if(e){let t=`Infinite loop on byte: `+e.charCodeAt(0);if(this.options.silent){console.error(t);break}else throw Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=e,r=null;if(this.tokens.links){let e=Object.keys(this.tokens.links);if(e.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)e.includes(r[0].slice(r[0].lastIndexOf(`[`)+1,-1))&&(n=n.slice(0,r.index)+`[`+`a`.repeat(r[0].length-2)+`]`+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,r.index)+`++`+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let i;for(;(r=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)i=r[2]?r[2].length:0,n=n.slice(0,r.index+i)+`[`+`a`.repeat(r[0].length-i-2)+`]`+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let a=!1,o=``;for(;e;){a||(o=``),a=!1;let r;if(this.options.extensions?.inline?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.escape(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.tag(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.link(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(r.raw.length);let n=t.at(-1);r.type===`text`&&n?.type===`text`?(n.raw+=r.raw,n.text+=r.text):t.push(r);continue}if(r=this.tokenizer.emStrong(e,n,o)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.codespan(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.br(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.del(e,n,o)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.autolink(e)){e=e.substring(r.raw.length),t.push(r);continue}if(!this.state.inLink&&(r=this.tokenizer.url(e))){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(r=this.tokenizer.inlineText(i)){e=e.substring(r.raw.length),r.raw.slice(-1)!==`_`&&(o=r.raw.slice(-1)),a=!0;let n=t.at(-1);n?.type===`text`?(n.raw+=r.raw,n.text+=r.text):t.push(r);continue}if(e){let t=`Infinite loop on byte: `+e.charCodeAt(0);if(this.options.silent){console.error(t);break}else throw Error(t)}}return t}},J=class{options;parser;constructor(e){this.options=e||u}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(h.notSpaceStart)?.[0],i=e.replace(h.endingNewline,``)+`
`;return r?`<pre><code class="language-`+W(r)+`">`+(n?i:W(i,!0))+`</code></pre>
`:`<pre><code>`+(n?i:W(i,!0))+`</code></pre>
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
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${W(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let r=this.parser.parseInline(n),i=Ne(e);if(i===null)return r;e=i;let a=`<a href="`+e+`"`;return t&&(a+=` title="`+W(t)+`"`),a+=`>`+r+`</a>`,a}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=Ne(e);if(i===null)return W(n);e=i;let a=`<img src="${e}" alt="${W(n)}"`;return t&&(a+=` title="${W(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:W(e.text)}},ze=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return``+e}image({text:e}){return``+e}br(){return``}checkbox({raw:e}){return e}},Y=class e{options;renderer;textRenderer;constructor(e){this.options=e||u,this.options.renderer=this.options.renderer||new J,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new ze}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n||``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e||``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},X=class{options;block;constructor(e){this.options=e||u}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(){return this.block?q.lex:q.lexInline}provideParser(){return this.block?Y.parse:Y.parseInline}},Z=new class{defaults=l();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Y;Renderer=J;TextRenderer=ze;Lexer=q;Tokenizer=K;Hooks=X;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(n=n.concat(t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)n=n.concat(this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)n=n.concat(this.walkTokens(e.tokens,t));break}case`list`:{let e=r;n=n.concat(this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);n=n.concat(this.walkTokens(i,t))}):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new J(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n||``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new K(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new X;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];X.passThroughHooks.has(n)?t[r]=e=>{if(this.defaults.async&&X.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:t[r]=(...e)=>{if(this.defaults.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return q.lex(e,t??this.defaults)}parser(e,t){return Y.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer():e?q.lex:q.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser():e?Y.parse:Y.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer():e?q.lex:q.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser():e?Y.parse:Y.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+W(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function Q(e,t){return Z.parse(e,t)}Q.options=Q.setOptions=function(e){return Z.setOptions(e),Q.defaults=Z.defaults,d(Q.defaults),Q},Q.getDefaults=l,Q.defaults=u,Q.use=function(...e){return Z.use(...e),Q.defaults=Z.defaults,d(Q.defaults),Q},Q.walkTokens=function(e,t){return Z.walkTokens(e,t)},Q.parseInline=Z.parseInline,Q.Parser=Y,Q.parser=Y.parse,Q.Renderer=J,Q.TextRenderer=ze,Q.Lexer=q,Q.lexer=q.lex,Q.Tokenizer=K,Q.Hooks=X,Q.parse=Q,Q.options,Q.setOptions,Q.use,Q.walkTokens,Q.parseInline,Y.parse,q.lex;var Be=`modulepreload`,Ve=function(e){return`/`+e},He={},Ue=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=Ve(t,n),t in He)return;He[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:Be,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},We={characterLimit:2e4,initialContentRatio:.4,chunkSize:300,minChunksPerSegment:3};async function Ge(e,t){console.log(`[BrowserBot] Starting page extraction using Algorithm ${e}`);let n=(t?.characterLimit||We.characterLimit)-(t?.promptLength||0)-50;switch(e){case 1:return Ke(n);case 2:return await Qe(n);case 3:return await dt();default:return Ke(n)}}function Ke(e){let t=qe(),n=Ze(t,{characterLimit:e});return{content:n,originalLength:t.length,truncatedLength:n.length,algorithm:1}}function qe(){let e=`nav, aside, header, footer, button, script, style, form, fieldset, legend`,t=[`h1`,`h2`,`h3`,`h4`,`h5`,`h6`,`p`,`li`,`td`,`article`,`section`,`div:not(:empty)`].map(t=>`${t}:not(${e}):not(${e} *)`).join(`, `),n=Array.from(document.querySelectorAll(t)),r=``;for(let i of n){if(i.offsetHeight===0||i.closest(e)||!i.textContent?.trim())continue;let n=i.parentElement;if(n&&(n.matches(t)||n.closest(t))&&n.closest(t)!==i)continue;let a=i.innerText.trim().replace(/<[^>]+>/g,``).trim();if(a)switch(i.tagName.toLowerCase()){case`h1`:r+=`# ${a}\n`;break;case`h2`:r+=`## ${a}\n`;break;case`h3`:r+=`### ${a}\n`;break;case`h4`:case`h5`:case`h6`:r+=`#### ${a}\n`;break;case`li`:r+=`• ${a}\n`;break;default:r+=`${a}\n`}}return r.replace(/\n{2,}/g,`
`).trim()}function Je(e,t){let n=[],r=0;for(;r<e.length;){if(r+t>=e.length){n.push(e.slice(r).trim());break}let i=e.slice(r,r+t),a=i.lastIndexOf(` `);i=i.slice(0,a),r+=a+1,n.push(i.trim())}return n}function Ye(e){return e.reduce((e,t)=>e+t.length,0)}function Xe(e,t){if(e<=0||t<=0)return[];let n=[],r=1/(t+1);for(let e=1;e<=t;e++)n.push(r*e);return n}function Ze(e,t){let n={...We,...t};if(e.length<=n.characterLimit)return e;let r=Je(e,n.chunkSize),i=[],a=0,o=Math.floor(n.characterLimit*n.initialContentRatio),s=0;for(;s<r.length&&a<o;){let e=r[s];if(a+e.length<=o)i.push(e),a+=e.length;else{let t=o-a;t>10&&(i.push(e.slice(0,t)),a+=t);break}s++}let c=r.slice(s);if(c.length>0){let e=Ye(c)/c.length,t=Math.floor((n.characterLimit-a)/(e*n.minChunksPerSegment)),r=Xe(c.length,t);for(let e of r){if(a>=n.characterLimit)break;let t=Math.floor(c.length*e),r=Math.min(n.minChunksPerSegment,c.length-t);for(let e=0;e<r;e++){let r=c[t+e],o=n.characterLimit-a;if(r.length<=o)i.push(r),a+=r.length;else if(o>10){i.push(r.slice(0,o)),a+=o;break}}}}return i.join(` `).replace(/[\n\r]+/g,` `).replace(/\s{2,}/g,` `).trim()}async function Qe(e){let t=$e(document.documentElement.outerHTML);t||=``;let n;if(location.href.includes(`youtube.com/watch`))try{let e=await et();e&&(n=e,t=`${n}\n\n---\n\n${t}`)}catch{}let r=Ze(t,{characterLimit:e});return{content:r,originalLength:t.length,truncatedLength:r.length,algorithm:2,youtubeTranscript:n}}function $e(e){if(!e)return null;let t=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i);if(!t||!t[1])return null;let n=t[1];n=n.replaceAll(/src="[^"]*"/g,``).replaceAll(/href="[^"]*"/g,``),n=n.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi,``).replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi,``);let r=document.createElement(`div`);r.innerHTML=n,r.querySelectorAll(`head, script, style, img, svg, nav, footer, header, aside, iframe, video, audio, canvas, map, object, embed, applet, frame, frameset, noframes, noembed, noscript, link, meta, base, title`).forEach(e=>e.remove()),r.querySelectorAll(`*`).forEach(e=>{e.textContent?.trim()||e.remove()}),r.querySelectorAll(`*`).forEach(e=>{Array.from(e.attributes).forEach(t=>e.removeAttribute(t.name))}),r.querySelectorAll(`h1, h2, h3, h4, h5, h6`).forEach(e=>{let t=parseInt(e.tagName[1]);e.textContent=`#`.repeat(t)+` `+e.textContent}),document.body.appendChild(r);let i=r.innerText||``;document.body.removeChild(r),i=i.replace(/ +/g,` `).replace(/\n+/g,`
`).trim();let a=i.split(`
`).map(e=>e.trim()).filter(Boolean),o=[],s=new Set;for(let e of a)s.has(e)||(s.add(e),o.push(e));return o.join(`
`)}async function et(){if(!location.href.includes(`youtube.com/watch`)&&!location.href.includes(`youtube.com/shorts/`))return null;try{let e=await ut(location.href);if(!e||!e.transcript||!e.transcript.length)return null;let t=`YouTube Transcript\nTitle: ${e.title}\nURL: ${e.url}\n\n`,n=e.transcript.map(e=>{let t=``,n=``;if(Array.isArray(e))t=e[0]||``,n=e[1]||``;else if(e.tStartMs!==void 0){let r=Math.floor(e.tStartMs/1e3);t=`${Math.floor(r/60)}:${(r%60).toString().padStart(2,`0`)}`,n=(e.segs||[]).map(e=>e.utf8).join(` `).replace(/\n/g,` `)}return{timestamp:t,text:n.trim()}}).filter(e=>e.text.length>0),r=``,i=n.map(e=>e.timestamp&&e.timestamp!==r?(r=e.timestamp,`\n(${e.timestamp}) ${e.text}`):` ${e.text}`);return t+=i.join(``).trim(),t.trim()}catch(e){return console.warn(`BrowserBot YT Extraction error:`,e),null}}function tt(e){let t=e.split(`:`).map(Number);return t.length===2?1e3*(60*t[0]+t[1]):t.length===3?1e3*(3600*t[0]+60*t[1]+t[2]):0}var nt=new Map;async function rt(e=``){try{let t=`yt-caption-potoken-${e}`,n=document.querySelector(`#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > button.ytp-subtitles-button.ytp-button`)||document.querySelector(`#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > div.ytp-right-controls-left > button.ytp-subtitles-button.ytp-button`);return n&&(n.addEventListener(`click`,async()=>{performance.clearResourceTimings();let e=null;for(let t=0;t<=500;t+=50){await new Promise(e=>setTimeout(e,50));let t=performance.getEntriesByType(`resource`).filter(e=>e.name.includes(`/api/timedtext?`)).pop();if(t&&(e=new URL(t.name).searchParams.get(`pot`),e))break}e&&nt.set(t,e)},{once:!0}),n.click(),n.click()),await new Promise(e=>setTimeout(e,350)),nt.get(t)||``}catch{return``}}async function it(){let e=[`button[aria-label="Show transcript"]`,`#button[aria-label="Show transcript"]`,`ytd-video-description-transcript-section-renderer #primary-button button`,`#primary-button > ytd-button-renderer > yt-button-shape > button`],t=null;for(let n of e)if(t=document.querySelector(n),t)break;if(!t)return null;t.click();let n=`#segments-container > ytd-transcript-segment-renderer`;if(!await new Promise(e=>{if(document.querySelector(n))return e(!0);let t=new MutationObserver(()=>{document.querySelector(n)&&(t.disconnect(),e(!0))});t.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{t.disconnect(),e(!1)},3e3)}))return null;await new Promise(e=>setTimeout(e,300));let r=document.querySelectorAll(n);if(!r.length)return null;let i=[];return r.forEach(e=>{let t=e.querySelector(`div.segment-timestamp`),n=e.querySelector(`yt-formatted-string`);if(t&&n){let e=n.textContent?.trim();e&&i.push({tStartMs:tt(t.textContent?.trim()||`0:00`),segs:[{utf8:e}]})}}),i.length>0?i:null}function at(e,t){if(e.length>0){let t=e[0];if(t?.transcriptSegmentRenderer)return e.map(ot);if(t?.segs||t?.tStartMs!==void 0)return e.filter(e=>e.segs).map(st)}return t===`regular`?e.map(ot):e.filter(e=>e.segs).map(st)}function ot(e){let t=e?.transcriptSegmentRenderer;return t?[t.startTimeText?.simpleText||``,t.snippet?.runs?.map(e=>e.text).join(` `)||``]:[``,``]}function st(e){return[(function(e){let t=Math.floor(e/1e3);return`${Math.floor(t/60)}:${(t%60).toString().padStart(2,`0`)}`})(e.tStartMs),(e.segs||[]).map(e=>e.utf8).join(` `).replace(/\n/g,` `)]}function ct(e,t){let n=[RegExp(`window\\["${t}"\\]\\s*=\\s*({[\\s\\S]+?})\\s*;`),RegExp(`var ${t}\\s*=\\s*({[\\s\\S]+?})\\s*;`),RegExp(`${t}\\s*=\\s*({[\\s\\S]+?})\\s*;`)];for(let t of n){let n=e.match(t);if(n&&n[1])try{return JSON.parse(n[1])}catch{}}throw Error(`${t} not found`)}async function lt(e,t,n,r){try{let e=null;if(r){try{e=ct(r,`ytInitialPlayerResponse`)?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0]?.baseUrl}catch{}if(!e){let t=r.match(/"baseUrl"\s*:\s*"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/);t&&(e=t[1].replace(/\\u0026/g,`&`))}}if(!e){let t=document.querySelectorAll(`script`);for(let n of t){let t=n.textContent||``;if(t.includes(`ytInitialPlayerResponse`)){let n=t.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|let|const|<\/script>)/s);if(n)try{let t=JSON.parse(n[1])?.captions?.playerCaptionsTracklistRenderer?.captionTracks;if(t?.[0]?.baseUrl){e=t[0].baseUrl;break}}catch{}}if(t.includes(`"baseUrl"`)&&t.includes(`timedtext`)){let n=t.match(/"baseUrl"\s*:\s*"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/);if(n){e=n[1].replace(/\\u0026/g,`&`);break}}}}if(!e){let t=await(await fetch(window.location.href,{credentials:`include`})).text();try{e=ct(t,`ytInitialPlayerResponse`)?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0]?.baseUrl}catch{}}if(e){let t=n?await rt(n):``,r=t?`${e}&fmt=json3&pot=${t}&c=WEB`:`${e}&fmt=json3`,i=await fetch(r,{credentials:`include`});if(i.ok){let e=await i.json();if(e.events?.length>0)return e.events}}}catch{}try{let e=await it();if(e&&e.length>0)return e}catch{}let i=e?.engagementPanels?.find(e=>e.engagementPanelSectionListRenderer?.content?.continuationItemRenderer?.continuationEndpoint?.getTranscriptEndpoint)?.engagementPanelSectionListRenderer?.content?.continuationItemRenderer?.continuationEndpoint?.getTranscriptEndpoint?.params;if(i){let t={context:{client:{hl:e?.topbar?.desktopTopbarRenderer?.searchbox?.fusionSearchboxRenderer?.config?.webSearchboxConfig?.requestLanguage||`en`,visitorData:e?.responseContext?.webResponseContextExtensionData?.ytConfigData?.visitorData||``,clientName:`WEB`,clientVersion:`2.`+Array.from({length:30},(e,t)=>{let n=new Date;return n.setDate(n.getDate()-t),n.toISOString().split(`T`)[0].replace(/-/g,``)})[Math.floor(Math.random()*30)]+`.00.00`},request:{useSsl:!0}},params:i};try{let e=await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t),credentials:`include`});if(e.ok){let t=(await e.json()).actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments||[];if(t.length>0)return t}}catch{}}throw Error(`No captions found.`)}async function ut(e){let t=/youtube\.com\/shorts\//.test(e),n=``;try{n=t?e.split(`/shorts/`)[1].split(/[/?#&]/)[0]:new URLSearchParams(new URL(e).search).get(`v`)||``}catch{n=new URLSearchParams(window.location.search).get(`v`)||``}if(!n)throw Error(`No video ID found`);let r=`Untitled Video`,i,a,o,s=await(await fetch(t?`https://www.youtube.com/watch?v=${n}`:e,{credentials:`include`})).text();try{i=ct(s,`ytInitialData`),o=`regular`,a=`ytInitialData`}catch{try{i=ct(s,`ytInitialPlayerResponse`),o=`shorts`,a=`ytInitialPlayerResponse`}catch{i=null,o=`regular`,a=``}}r=i?.videoDetails?.title||i?.playerOverlays?.playerOverlayRenderer?.videoDetails?.playerOverlayVideoDetailsRenderer?.title?.simpleText||`Untitled Video`;let c=await lt(i,a,n,s);if(!c||!c.length)throw Error(`No transcript available`);let l=at(c,o);return{title:r,transcript:l,url:e}}async function dt(){let{Readability:t,isProbablyReaderable:n}=await Ue(async()=>{let{Readability:t,isProbablyReaderable:n}=await import(`./readability-DPJkCc60.js`).then(t=>e(t.default,1));return{Readability:t,isProbablyReaderable:n}},__vite__mapDeps([0,1])),{convert:r}=await Ue(async()=>{let{convert:e}=await import(`./html-to-text-DNXrm7Fp.js`);return{convert:e}},__vite__mapDeps([2,1])),i=n(document),a=i?ht(t):null,o=mt(r,pt()),s=o;return i&&a?.content&&(s=`--- Article Content ---\n${mt(r,a.content)}\n\n--- Full Page Text ---\n${o}`),{content:s,originalLength:s.length,truncatedLength:s.length,algorithm:3}}function ft(e){e.querySelectorAll(`:scope > *`).forEach(e=>{let t=window.getComputedStyle(e);t.display===`none`||e.style.display===`none`||e.style.visibility===`hidden`||t.visibility===`hidden`?e.remove():ft(e)})}function pt(){let e=document.body.cloneNode(!0);return e.querySelectorAll(`script, noscript, link, style, template, [hidden], [aria-hidden="true"], svg, iframe, input, textarea, form`).forEach(e=>e.remove()),e.querySelectorAll(`*`).forEach(e=>{e.tagName!==`IMG`&&!e.textContent?.trim()&&e.remove()}),ft(e),e.innerHTML.replace(/<!--.*?-->/g,``)}function mt(e,t){return e(t,{wordwrap:null,selectors:[{selector:`a`,options:{baseUrl:window.location.origin,hideLinkHrefIfSameAsText:!0}},{selector:`img`,format:`skip`}]})}function ht(e){return new e(document.cloneNode(!0)).parse()}var $=o(),gt=`

IMPORTANT: Always format your responses using markdown. Use headings, bullet points, code blocks, bold, italic, and other markdown features to make your responses well-structured and readable.`;Q.setOptions({breaks:!0,gfm:!0});function _t({pageTitle:e,pageUrl:t,onClose:n,onRegisterShow:o,isFullScreen:c=!1}){let[l,u]=(0,s.useState)(!1),[d,f]=(0,s.useState)([]),[p,m]=(0,s.useState)(``),[h,g]=(0,s.useState)(!1),[_,ee]=(0,s.useState)(420),[v,te]=(0,s.useState)(!1),[y,ne]=(0,s.useState)(!1),[b,re]=(0,s.useState)(1),[x,ie]=(0,s.useState)(`openai`),[ae,oe]=(0,s.useState)([]),[se,S]=(0,s.useState)(``),[ce,le]=(0,s.useState)(``),[ue,de]=(0,s.useState)(``),[C,fe]=(0,s.useState)([]),[pe,w]=(0,s.useState)(``),[me,he]=(0,s.useState)(!1),[ge,T]=(0,s.useState)(!1),[E,D]=(0,s.useState)([]),[O,k]=(0,s.useState)(null),[A,_e]=(0,s.useState)(``),[j,ve]=(0,s.useState)([]),[ye,M]=(0,s.useState)(!1),[be,xe]=(0,s.useState)([]),[Se,Ce]=(0,s.useState)(``),[N,we]=(0,s.useState)([]),Te=(0,s.useRef)(null),P=(0,s.useRef)(null),F=(0,s.useRef)(null),I=(0,s.useRef)(``),L=(0,s.useRef)(``),R=(0,s.useRef)(!1),z=(0,s.useRef)(!1),B=(0,s.useRef)(null);(0,s.useEffect)(()=>{i.get().then(e=>{ie(e.activeProvider),oe(e.openaiProviders),S(e.activeOpenAIProviderId),le(e.ollamaModel),de(e.askPageSystemPrompt),fe(e.askPagePrompts),ee(e.askPagePanelWidth||420),te(e.askPagePersistChat||!1),re(e.pageExtractionAlgorithm||1),e.askPagePersistChat&&a.runtime.sendMessage({type:`LOAD_CHAT`}).then(e=>{e&&Array.isArray(e)&&e.length>0&&f(e)}).catch(()=>{})});let e=(e,t)=>{if(t===`local`&&e.appState?.newValue){let t=e.appState.newValue;ie(t.activeProvider),oe(t.openaiProviders),S(t.activeOpenAIProviderId),le(t.ollamaModel),de(t.askPageSystemPrompt),fe(t.askPagePrompts),ee(t.askPagePanelWidth||420),te(t.askPagePersistChat||!1),re(t.pageExtractionAlgorithm||1)}};return a.storage.onChanged.addListener(e),Ee(),()=>{a.storage.onChanged.removeListener(e)}},[]);let Ee=()=>{a.runtime.sendMessage({type:`LOAD_CONVERSATIONS`}).then(e=>{Array.isArray(e)&&D(e)}).catch(()=>{})};(0,s.useEffect)(()=>{v&&d.length>0&&a.runtime.sendMessage({type:`SAVE_CHAT`,messages:d}).catch(()=>{})},[d,v]),(0,s.useEffect)(()=>{d.length===0||h||(B.current&&clearTimeout(B.current),B.current=setTimeout(()=>{De()},1e3))},[d,h]);let De=async()=>{if(d.length===0)return;let n=d.find(e=>e.role===`user`)?.content.slice(0,80)||`New Chat`,i={id:O||r(),title:n,createdAt:O&&E.find(e=>e.id===O)?.createdAt||Date.now(),updatedAt:Date.now(),pageUrl:t,pageTitle:e,messages:d};O||k(i.id),a.runtime.sendMessage({type:`SAVE_CONVERSATION`,conversation:i}).catch(()=>{}),Ee()};(0,s.useEffect)(()=>{o&&o(()=>{u(!1)})},[o]);let V=(0,s.useRef)(``);(0,s.useEffect)(()=>{V.current||=crypto.randomUUID()},[]),(0,s.useEffect)(()=>{let e=e=>{if(!(e.sessionId&&e.sessionId!==V.current))if(e.type===`ASK_PAGE_CHAT_CHUNK`)I.current+=e.chunk,f(e=>{let t=[...e],n=t.length-1;return n>=0&&t[n].role===`assistant`&&(t[n]={...t[n],content:I.current}),t});else if(e.type===`ASK_PAGE_CHAT_THINKING`)L.current+=e.chunk,w(L.current),he(!0);else if(e.type===`ASK_PAGE_CHAT_DONE`){let e=L.current;e&&f(t=>{let n=[...t],r=n.length-1;return r>=0&&n[r].role===`assistant`&&(n[r]={...n[r],thinking:e}),n}),g(!1),he(!1),I.current=``,L.current=``,w(``)}else e.type===`ASK_PAGE_CHAT_ERROR`?(g(!1),I.current=``,L.current=``,w(``),f(t=>[...t,{role:`error`,content:e.error}])):e.type===`CHAT_UPDATED`&&v&&e.messages&&f(e.messages)};return a.runtime.onMessage.addListener(e),()=>a.runtime.onMessage.removeListener(e)},[v]);let Oe=(0,s.useCallback)(()=>{z.current||P.current&&(P.current.scrollTop=P.current.scrollHeight)},[]);(0,s.useEffect)(()=>{Oe()},[d,pe,Oe]);let ke=(0,s.useCallback)(()=>{let e=P.current;if(!e)return;let{scrollTop:t,scrollHeight:n,clientHeight:r}=e;z.current=!(n-t-Math.ceil(r)<80)},[]),Ae=(0,s.useCallback)(e=>{e.preventDefault(),R.current=!0;let t=e.clientX,n=_,r=e=>{if(!R.current)return;let r=t-e.clientX;ee(Math.max(320,Math.min(800,n+r)))},i=()=>{R.current=!1,document.removeEventListener(`mousemove`,r),document.removeEventListener(`mouseup`,i)};document.addEventListener(`mousemove`,r),document.addEventListener(`mouseup`,i,{once:!0})},[_]),H=(0,s.useRef)(null);(0,s.useEffect)(()=>{H.current&&clearTimeout(H.current),H.current=setTimeout(()=>{a.runtime.sendMessage({type:`SAVE_PANEL_WIDTH`,width:_})},300)},[_]);let U=async()=>{let n=p.trim();if(h||!n)return;z.current=!1;let r=ue.replaceAll(`{pageTitle}`,e).replaceAll(`{pageUrl}`,t).replaceAll(`{selectedText}`,window.getSelection()?.toString()||``);if(r.includes(`{pageContent}`)){let e=`(Could not extract page content)`;try{e=(await Ge(b)).content}catch{}r=r.replaceAll(`{pageContent}`,e)}let i=Le().map(e=>e.content).join(`

---

`);i?r.includes(`{tabContext}`)?r=r.replaceAll(`{tabContext}`,i):r+=`

Context from attached tabs:
`+i:r=r.replaceAll(`{tabContext}`,``),r+=gt;let o=[{role:`system`,content:r}],s=Le();s.length>0&&o.push({role:`system`,content:`Additional context from attached tabs:\n\n${s.map(e=>`--- Context from tab: ${e.title} (${e.url}) ---\n${e.content}`).join(`

`)}`});for(let e of d)e.role!==`error`&&o.push({role:e.role,content:e.content});o.push({role:`user`,content:n}),console.groupCollapsed(`BrowserBot: Sending AI Prompt`),console.log(`Provider:`,x),console.log(`Extraction Algorithm (1=Text, 2=Optimized, 3=Full):`,b),console.log(`Complete Prompt Messages:`,JSON.parse(JSON.stringify(o))),y&&(console.log(`Current Page Content Context Size:`,Re.length),console.log(`Current Page Content Snippet:`,Re.substring(0,500)+`...`)),console.groupEnd(),f(e=>[...e,{role:`user`,content:n},{role:`assistant`,content:``}]),m(``),g(!0),I.current=``,L.current=``,w(``),F.current&&(F.current.style.height=`auto`),a.runtime.sendMessage({type:`ASK_PAGE_CHAT`,messages:o,providerType:x,openaiProviderId:se,sessionId:V.current})},je=e=>{m(e.target.value);let t=e.target;t.style.height=`auto`,t.style.height=Math.min(t.scrollHeight,120)+`px`},Me=e=>{e.stopPropagation(),e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),U())},W=e=>e.stopPropagation(),Ne=e=>{if(!e)return;let t=C.find(t=>t.id===e);t&&(m(t.prompt),requestAnimationFrame(()=>{F.current&&(F.current.focus(),F.current.style.height=`auto`,F.current.style.height=Math.min(F.current.scrollHeight,120)+`px`)}))},Pe=async()=>{xe(await a.runtime.sendMessage({type:`GET_TAB_LIST`})||[]),we([]),Ce(``),M(!0)},G=async()=>{console.log(`BrowserBot: confirmTabSelection triggered`,{selectedPickerTabs:N,attachedTabs:j});for(let e of N){if(console.log(`BrowserBot: Processing tabId:`,e),j.some(t=>t.id===e)){console.log(`BrowserBot: Tab already attached, skipping`,e);continue}try{console.log(`BrowserBot: Sending GET_TAB_CONTENT for tabId`,e);let t=await a.runtime.sendMessage({type:`GET_TAB_CONTENT`,tabId:e});console.log(`BrowserBot: Received response for GET_TAB_CONTENT`,e,{result:t}),t&&ve(e=>{let n=[...e,{id:t.tabId,title:t.title,url:t.url,content:t.content}];return console.log(`BrowserBot: Updated attachedTabs state`,n),n})}catch(t){console.error(`BrowserBot: Error getting tab content for tabId`,e,t)}}console.log(`BrowserBot: Closing tab picker`),M(!1)},Fe=e=>{e===-1?ne(!1):ve(t=>t.filter(t=>t.id!==e))},Ie=()=>ne(e=>!e),Le=()=>{let n=[...j];return y&&n.unshift({id:-1,title:e,url:t,content:Re||`[Current Page: ${e}]\nURL: ${t}`}),n},[Re,K]=(0,s.useState)(``);(0,s.useEffect)(()=>{y?Ge(b).then(n=>{K(`[Current Page: ${e}]\nURL: ${t}\n\n${n.content}`)}).catch(()=>{K(`[Current Page: ${e}]\nURL: ${t}\n\n(Extraction failed)`)}):K(``)},[y,b,e,t]);let q=new Set(j.map(e=>e.id)),J=be.filter(e=>{if(q.has(e.id))return!1;let t=Se.toLowerCase();return!t||e.title.toLowerCase().includes(t)||e.url.toLowerCase().includes(t)}),ze=()=>{f([]),k(null),I.current=``,T(!1),v&&a.runtime.sendMessage({type:`CLEAR_CHAT`}).catch(()=>{})},Y=e=>{f(e.messages),k(e.id),T(!1)},X=async e=>{await a.runtime.sendMessage({type:`DELETE_CONVERSATION`,id:e}),D(t=>t.filter(t=>t.id!==e)),O===e&&ze()},Z=E.filter(e=>{if(!A)return!0;let t=A.toLowerCase();return e.title.toLowerCase().includes(t)||e.pageTitle.toLowerCase().includes(t)}),Be=()=>{f([]),k(null),I.current=``,v&&a.runtime.sendMessage({type:`CLEAR_CHAT`}).catch(()=>{})},Ve=e=>{if(!e)return``;try{let t=Q.parse(e);return t=t.replace(/<pre><code([^>]*)>/g,(e,t)=>`<div class="askpage-code-wrapper"><button class="askpage-copy-btn" onclick="(function(btn){var code=btn.parentElement.querySelector('code');navigator.clipboard.writeText(code.innerText).then(function(){btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy'},1500)});})(this)">Copy</button><pre><code${t}>`),t=t.replace(/<\/code><\/pre>/g,`</code></pre></div>`),t}catch{return e}},He=()=>{a.runtime.sendMessage({type:`ASK_PAGE_CHAT_ABORT`}),g(!1),I.current=``,L.current=``,w(``)},Ue=e=>{let t=new Date(e),n=Math.floor((new Date().getTime()-t.getTime())/(1e3*60*60*24));return n===0?`Today`:n===1?`Yesterday`:n<7?`${n}d ago`:t.toLocaleDateString()};return l?(0,$.jsx)(`button`,{className:`askpage-minimized-tab`,onClick:()=>u(!1),title:`Open Ask Page`,children:(0,$.jsx)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,$.jsx)(`path`,{d:`M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z`})})}):(0,$.jsxs)(`div`,{className:`askpage-panel ${c?`fullscreen`:``}`,style:c?{width:`100%`,height:`100%`,borderRadius:0,border:`none`,right:0,bottom:0}:{width:_},"data-panel-width":_,children:[!c&&(0,$.jsx)(`div`,{className:`askpage-resize-handle ${R.current?`dragging`:``}`,onMouseDown:Ae}),ge&&(0,$.jsxs)(`div`,{className:`askpage-history-sidebar`,children:[(0,$.jsxs)(`div`,{className:`askpage-history-header`,children:[(0,$.jsx)(`h4`,{children:`Chat History`}),(0,$.jsxs)(`div`,{style:{display:`flex`,gap:4},children:[(0,$.jsxs)(`button`,{className:`askpage-history-new`,onClick:ze,children:[(0,$.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,$.jsx)(`path`,{d:`M12 5v14M5 12h14`})}),`New`]}),(0,$.jsx)(`button`,{className:`askpage-history-close`,onClick:()=>T(!1),title:`Close`,children:(0,$.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,$.jsx)(`path`,{d:`M18 6L6 18M6 6l12 12`})})})]})]}),(0,$.jsx)(`input`,{className:`askpage-history-search`,placeholder:`Search conversations…`,value:A,onChange:e=>_e(e.target.value)}),(0,$.jsxs)(`div`,{className:`askpage-history-list`,children:[Z.map(e=>(0,$.jsxs)(`div`,{className:`askpage-history-item ${O===e.id?`active`:``}`,children:[(0,$.jsxs)(`button`,{className:`askpage-history-item-main`,onClick:()=>Y(e),children:[(0,$.jsx)(`div`,{className:`askpage-history-item-title`,children:e.title}),(0,$.jsxs)(`div`,{className:`askpage-history-item-meta`,children:[Ue(e.updatedAt),` · `,e.messages.filter(e=>e.role===`user`).length,` msgs`]})]}),(0,$.jsx)(`button`,{className:`askpage-history-item-delete`,onClick:t=>{t.stopPropagation(),X(e.id)},title:`Delete`,children:`×`})]},e.id)),Z.length===0&&(0,$.jsx)(`div`,{className:`askpage-history-empty`,children:A?`No matching conversations`:`No conversations yet`})]})]}),(0,$.jsxs)(`div`,{className:`askpage-header`,children:[(0,$.jsx)(`button`,{className:`askpage-header-btn askpage-history-btn ${ge?`active`:``}`,onClick:()=>{T(!ge),ge||Ee()},title:`Chat History`,children:(0,$.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,$.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,$.jsx)(`polyline`,{points:`12 6 12 12 16 14`})]})}),(0,$.jsx)(`div`,{className:`askpage-header-icon`,children:(0,$.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,$.jsx)(`path`,{d:`M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z`})})}),(0,$.jsx)(`span`,{className:`askpage-header-title`,children:`Ask Page`}),d.length>0&&(0,$.jsx)(`button`,{className:`askpage-header-btn`,onClick:Be,title:`New conversation`,children:(0,$.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,$.jsx)(`path`,{d:`M12 5v14M5 12h14`})})}),!c&&(0,$.jsx)(`button`,{className:`askpage-header-btn`,onClick:()=>a.runtime.sendMessage({type:`OPEN_CHAT_TAB`}).catch(()=>{}),title:`Open in new tab`,children:(0,$.jsxs)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,$.jsx)(`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`}),(0,$.jsx)(`polyline`,{points:`15 3 21 3 21 9`}),(0,$.jsx)(`line`,{x1:`10`,y1:`14`,x2:`21`,y2:`3`})]})}),!c&&(0,$.jsxs)($.Fragment,{children:[(0,$.jsx)(`button`,{className:`askpage-header-btn`,onClick:()=>u(!0),title:`Minimize`,children:(0,$.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,$.jsx)(`path`,{d:`M5 12h14`})})}),(0,$.jsx)(`button`,{className:`askpage-header-btn`,onClick:n,title:`Close`,children:(0,$.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,$.jsx)(`path`,{d:`M18 6L6 18M6 6l12 12`})})})]})]}),(0,$.jsxs)(`div`,{className:`askpage-controls`,children:[(0,$.jsxs)(`select`,{className:`askpage-select`,value:x===`openai`?`openai:${se}`:x,onChange:e=>{let t=e.target.value;t.startsWith(`openai:`)?(ie(`openai`),S(t.replace(`openai:`,``))):ie(t)},title:`AI Provider`,children:[ae.map(e=>(0,$.jsxs)(`option`,{value:`openai:${e.id}`,children:[e.name,` (`,e.model,`)`]},e.id)),(0,$.jsxs)(`option`,{value:`ollama`,children:[`Ollama (`,ce,`)`]}),(0,$.jsx)(`option`,{value:`chrome_ai`,children:`Chrome AI`})]}),C.length>0&&(0,$.jsxs)(`select`,{className:`askpage-select askpage-quick-prompt-select`,value:``,onChange:e=>Ne(e.target.value),title:`Quick Prompts`,children:[(0,$.jsx)(`option`,{value:``,disabled:!0,children:`Quick Prompts…`}),C.map(e=>(0,$.jsx)(`option`,{value:e.id,children:e.name},e.id))]})]}),d.length===0?(0,$.jsxs)(`div`,{className:`askpage-welcome`,children:[(0,$.jsx)(`div`,{className:`askpage-welcome-icon`,children:(0,$.jsx)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,$.jsx)(`path`,{d:`M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z`})})}),(0,$.jsx)(`h3`,{children:`Ask about this page`}),(0,$.jsx)(`p`,{children:`Ask questions, get summaries, or explore the content of the current page with AI.`}),C.length>0&&(0,$.jsx)(`div`,{className:`askpage-welcome-prompts`,children:C.slice(0,4).map(e=>(0,$.jsx)(`button`,{className:`askpage-welcome-prompt-btn`,onClick:()=>Ne(e.id),children:e.name},e.id))})]}):(0,$.jsxs)(`div`,{className:`askpage-messages`,ref:P,onScroll:ke,children:[d.map((e,t)=>{let n=t===d.length-1,r=h&&n&&e.role===`assistant`&&pe;return(0,$.jsxs)(`div`,{className:`askpage-msg-wrapper ${e.role}`,children:[e.role===`assistant`&&(e.thinking||r)&&(0,$.jsxs)(`details`,{className:`askpage-thinking-block`,open:r?me:void 0,children:[(0,$.jsxs)(`summary`,{className:`askpage-thinking-summary`,onClick:r?e=>{e.preventDefault(),he(!me)}:void 0,children:[(0,$.jsxs)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,className:r?`askpage-thinking-spinner`:``,children:[(0,$.jsx)(`path`,{d:`M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z`}),!r&&(0,$.jsx)(`path`,{d:`M12 16v-4M12 8h.01`})]}),r?`Thinking…`:`Thinking process`]}),(0,$.jsx)(`div`,{className:`askpage-thinking-content`,dangerouslySetInnerHTML:{__html:Ve(r?pe:e.thinking)}})]}),(0,$.jsx)(`div`,{className:`askpage-msg ${e.role}`,...e.role===`assistant`?{dangerouslySetInnerHTML:{__html:Ve(e.content)||`<span style="opacity:0.3">Thinking…</span>`}}:{},children:e.role===`assistant`?void 0:e.content})]},t)}),h&&!pe&&d[d.length-1]?.content===``&&(0,$.jsxs)(`div`,{className:`askpage-typing`,children:[(0,$.jsx)(`div`,{className:`askpage-typing-dot`}),(0,$.jsx)(`div`,{className:`askpage-typing-dot`}),(0,$.jsx)(`div`,{className:`askpage-typing-dot`})]}),(0,$.jsx)(`div`,{ref:Te})]}),(0,$.jsxs)(`div`,{className:`askpage-tabs-bar`,children:[(0,$.jsx)(`span`,{className:`askpage-tabs-label`,children:`Context`}),!c&&(0,$.jsxs)(`button`,{className:`askpage-current-tab-chip ${y?`active`:``}`,onClick:Ie,title:y?`Remove current page context`:`Add current page as context`,children:[(0,$.jsxs)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,$.jsx)(`path`,{d:`M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z`}),(0,$.jsx)(`polyline`,{points:`13 2 13 9 20 9`})]}),`This Page`,y&&(0,$.jsx)(`span`,{className:`askpage-tab-chip-check`,children:`✓`})]}),j.map(e=>(0,$.jsxs)(`div`,{className:`askpage-tab-chip`,children:[(0,$.jsx)(`span`,{className:`askpage-tab-chip-title`,children:e.title}),(0,$.jsx)(`button`,{className:`askpage-tab-chip-close`,onClick:()=>Fe(e.id),children:`×`})]},e.id)),(0,$.jsxs)(`button`,{className:`askpage-add-tab-btn`,onClick:Pe,children:[(0,$.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,$.jsx)(`path`,{d:`M12 5v14M5 12h14`})}),`Add Tab`]})]}),(0,$.jsxs)(`div`,{className:`askpage-input-area`,onKeyDown:W,onKeyUp:W,onKeyPress:W,children:[(0,$.jsx)(`textarea`,{ref:F,className:`askpage-input`,value:p,onChange:je,onKeyDown:Me,placeholder:c?`Type a message...`:`Ask about this page…`,rows:1,disabled:h}),h?(0,$.jsx)(`button`,{className:`askpage-send-btn`,onClick:He,title:`Stop`,children:(0,$.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,$.jsx)(`rect`,{x:`6`,y:`6`,width:`12`,height:`12`,rx:`2`})})}):(0,$.jsx)(`button`,{className:`askpage-send-btn`,onClick:U,disabled:!p.trim(),title:`Send`,children:(0,$.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,$.jsx)(`line`,{x1:`22`,y1:`2`,x2:`11`,y2:`13`}),(0,$.jsx)(`polygon`,{points:`22 2 15 22 11 13 2 9 22 2`})]})})]}),ye&&(0,$.jsx)(`div`,{className:`askpage-tab-picker-overlay`,onClick:()=>M(!1),children:(0,$.jsxs)(`div`,{className:`askpage-tab-picker`,onClick:e=>e.stopPropagation(),children:[(0,$.jsx)(`h4`,{children:`Add Tab Context`}),(0,$.jsx)(`input`,{className:`askpage-tab-picker-search`,placeholder:`Search tabs…`,value:Se,onChange:e=>Ce(e.target.value),autoFocus:!0}),(0,$.jsxs)(`div`,{className:`askpage-tab-picker-list`,children:[J.map(e=>(0,$.jsxs)(`button`,{className:`askpage-tab-picker-item ${N.includes(e.id)?`selected`:``}`,onClick:()=>{we(t=>t.includes(e.id)?t.filter(t=>t!==e.id):[...t,e.id])},children:[e.favIconUrl&&(0,$.jsx)(`img`,{className:`askpage-tab-picker-favicon`,src:e.favIconUrl,alt:``}),(0,$.jsxs)(`div`,{className:`askpage-tab-picker-info`,children:[(0,$.jsx)(`div`,{className:`askpage-tab-picker-title`,children:e.title}),(0,$.jsx)(`div`,{className:`askpage-tab-picker-url`,children:e.url})]})]},e.id)),J.length===0&&(0,$.jsx)(`div`,{style:{padding:`16px`,textAlign:`center`,color:`#6b7280`,fontSize:`13px`},children:`No tabs found`})]}),(0,$.jsxs)(`div`,{className:`askpage-tab-picker-actions`,children:[(0,$.jsx)(`button`,{className:`askpage-tab-picker-btn cancel`,onClick:()=>M(!1),children:`Cancel`}),(0,$.jsxs)(`button`,{className:`askpage-tab-picker-btn confirm`,onClick:G,disabled:N.length===0,children:[`Add `,N.length>0?`(${N.length})`:``]})]})]})})]})}function vt(){return`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:host {
  all: initial;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#browserbot-ask-page-root {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483646;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ─── Panel Container ──────────────────────────────── */

.askpage-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #13141a;
  color: #f3f4f6;
  border-left: 1px solid rgba(255,255,255,0.08);
  box-shadow: -8px 0 40px rgba(0,0,0,0.35);
  animation: slideInPanel 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.askpage-panel.minimized {
  animation: slideOutPanel 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideInPanel {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
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
  width: 5px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
  transition: background 0.15s;
}

.askpage-resize-handle:hover,
.askpage-resize-handle.dragging {
  background: rgba(167, 139, 250, 0.5);
}

/* ─── Header ───────────────────────────────────────── */

.askpage-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.askpage-header-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.askpage-header-icon svg {
  color: #fff;
}

.askpage-header-title {
  font-size: 14px;
  font-weight: 700;
  flex: 1;
}

.askpage-header-btn {
  background: rgba(255,255,255,0.06);
  border: none;
  color: #9ca3af;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.askpage-header-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #f3f4f6;
}

/* ─── Provider / Prompt Selector Row ───────────────── */

.askpage-controls {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.askpage-select {
  flex: 1;
  padding: 7px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s;
  appearance: auto;
}

.askpage-select:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-select option {
  background: #1c1e2a;
  color: #f3f4f6;
}

/* ─── Quick Prompt Select ──────────────────────── */

.askpage-quick-prompt-select {
  max-width: 140px;
  min-width: 110px;
  flex: 0 0 auto !important;
}

/* ─── Chat Messages ────────────────────────────────── */

.askpage-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-messages::-webkit-scrollbar {
  width: 5px;
}

.askpage-messages::-webkit-scrollbar-track {
  background: transparent;
}

.askpage-messages::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}

.askpage-msg-wrapper {
  display: flex;
  flex-direction: column;
}

.askpage-msg-wrapper.user {
  align-items: flex-end;
}

.askpage-msg-wrapper.assistant,
.askpage-msg-wrapper.error {
  align-items: flex-start;
}

.askpage-msg {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
  animation: fadeInMsg 0.2s ease;
}

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.askpage-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.askpage-msg.assistant {
  align-self: flex-start;
  background: rgba(255,255,255,0.06);
  color: #e5e7eb;
  border-bottom-left-radius: 4px;
}

.askpage-msg.error {
  align-self: flex-start;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* ─── Markdown Rendering ───────────────────────────── */

.askpage-msg.assistant h1,
.askpage-msg.assistant h2,
.askpage-msg.assistant h3,
.askpage-msg.assistant h4 {
  margin: 12px 0 6px;
  font-weight: 700;
  line-height: 1.3;
}

.askpage-msg.assistant h1 { font-size: 17px; }
.askpage-msg.assistant h2 { font-size: 15px; }
.askpage-msg.assistant h3 { font-size: 14px; }
.askpage-msg.assistant h4 { font-size: 13px; }

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

.askpage-msg.assistant ul,
.askpage-msg.assistant ol {
  margin: 6px 0;
  padding-left: 20px;
}

.askpage-msg.assistant li {
  margin: 3px 0;
}

.askpage-msg.assistant code {
  background: rgba(167, 139, 250, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}

.askpage-msg.assistant pre {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.askpage-msg.assistant pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 12px;
  line-height: 1.5;
}

.askpage-msg.assistant blockquote {
  border-left: 3px solid #a78bfa;
  padding-left: 12px;
  margin: 8px 0;
  color: #9ca3af;
}

.askpage-msg.assistant table {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
  font-size: 12px;
}

.askpage-msg.assistant th,
.askpage-msg.assistant td {
  border: 1px solid rgba(255,255,255,0.1);
  padding: 6px 10px;
  text-align: left;
}

.askpage-msg.assistant th {
  background: rgba(255,255,255,0.06);
  font-weight: 600;
}

.askpage-msg.assistant a {
  color: #a78bfa;
  text-decoration: underline;
}

.askpage-msg.assistant strong { font-weight: 700; }
.askpage-msg.assistant em { font-style: italic; }

.askpage-msg.assistant hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 12px 0;
}

/* ─── Typing Indicator ─────────────────────────────── */

.askpage-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  align-self: flex-start;
}

.askpage-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.askpage-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.askpage-typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ─── Tab Context Bar ──────────────────────────────── */

.askpage-tabs-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.askpage-tabs-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
  margin-right: 4px;
}

.askpage-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  font-size: 11px;
  color: #6ee7b7;
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
  color: #6ee7b7;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.askpage-tab-chip-close:hover {
  opacity: 1;
}

.askpage-add-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-add-tab-btn:hover {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
  color: #a78bfa;
}

/* ─── Tab Picker Modal ─────────────────────────────── */

.askpage-tab-picker-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.askpage-tab-picker {
  background: #1c1e2a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  width: calc(100% - 32px);
  max-width: 360px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.askpage-tab-picker h4 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.askpage-tab-picker-search {
  padding: 8px 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 13px;
  width: 100%;
}

.askpage-tab-picker-search:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-tab-picker-search::placeholder {
  color: #6b7280;
}

.askpage-tab-picker-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 260px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-tab-picker-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  color: #e5e7eb;
  text-align: left;
  width: 100%;
}

.askpage-tab-picker-item:hover {
  background: rgba(167, 139, 250, 0.08);
  border-color: rgba(167, 139, 250, 0.2);
}

.askpage-tab-picker-item.selected {
  background: rgba(167, 139, 250, 0.12);
  border-color: #a78bfa;
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
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-url {
  font-size: 10px;
  color: #6b7280;
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
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.15s;
}

.askpage-tab-picker-btn.cancel {
  background: rgba(255,255,255,0.06);
  color: #9ca3af;
}

.askpage-tab-picker-btn.cancel:hover {
  background: rgba(255,255,255,0.1);
}

.askpage-tab-picker-btn.confirm {
  background: #a78bfa;
  color: #fff;
}

.askpage-tab-picker-btn.confirm:hover {
  background: #c4b5fd;
}

/* ─── Input Area ───────────────────────────────────── */

.askpage-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.askpage-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.45;
  resize: none;
  max-height: 120px;
  scrollbar-width: thin;
  transition: border-color 0.15s;
}

.askpage-input:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-input::placeholder {
  color: #6b7280;
}

.askpage-send-btn {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.askpage-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(108, 92, 231, 0.35);
}

.askpage-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── Minimized Floating Tab ───────────────────────── */

.askpage-minimized-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 48px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  border: none;
  border-radius: 10px 0 0 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -4px 0 16px rgba(108, 92, 231, 0.3);
  z-index: 2147483646;
  animation: fadeInTab 0.3s ease;
  transition: all 0.15s;
}

.askpage-minimized-tab:hover {
  width: 48px;
  box-shadow: -6px 0 24px rgba(108, 92, 231, 0.5);
}

@keyframes fadeInTab {
  from { opacity: 0; transform: translateY(-50%) translateX(20px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
}

/* ─── Welcome Message ──────────────────────────────── */

.askpage-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  text-align: center;
  padding: 40px 20px;
}

.askpage-welcome-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(167, 139, 250, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
}

.askpage-welcome-icon svg {
  color: #a78bfa;
}

.askpage-welcome h3 {
  font-size: 16px;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0;
}

.askpage-welcome p {
  font-size: 13px;
  color: #6b7280;
  max-width: 260px;
  line-height: 1.5;
  margin: 0;
}

/* ─── Code Copy Button ─────────────────────────────── */

.askpage-code-wrapper {
  position: relative;
  margin: 8px 0;
}

.askpage-copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 5px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  z-index: 2;
}

.askpage-copy-btn:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.4);
  color: #a78bfa;
}

.askpage-code-wrapper pre {
  margin: 0 !important;
}

/* ─── Current Tab Chip ─────────────────────────────── */

.askpage-current-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.askpage-current-tab-chip:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a78bfa;
}

.askpage-current-tab-chip.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #a78bfa;
  color: #a78bfa;
}

.askpage-tab-chip-check {
  font-size: 11px;
  font-weight: 700;
}

/* ─── History Header Button ──────────────────── */

.askpage-history-btn {
  margin-right: 2px;
}

.askpage-history-btn.active {
  background: rgba(167, 139, 250, 0.2) !important;
  color: #a78bfa !important;
}

/* ─── History Sidebar Close Button ────────────── */

.askpage-history-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.askpage-history-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* ─── History Sidebar ────────────────────────── */

.askpage-history-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: #181a22;
  border-right: 1px solid rgba(255,255,255,0.08);
  z-index: 20;
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
  padding: 14px 12px 8px;
}

.askpage-history-header h4 {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  color: #f3f4f6;
}

.askpage-history-new {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 6px;
  color: #a78bfa;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-history-new:hover {
  background: rgba(167, 139, 250, 0.2);
}

.askpage-history-search {
  margin: 4px 12px 8px;
  padding: 7px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 12px;
}

.askpage-history-search:focus { outline: none; border-color: #a78bfa; }
.askpage-history-search::placeholder { color: #6b7280; }

.askpage-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-history-item {
  display: flex;
  align-items: stretch;
  border-radius: 8px;
  margin-bottom: 2px;
  transition: background 0.12s;
}

.askpage-history-item:hover {
  background: rgba(255,255,255,0.04);
}

.askpage-history-item.active {
  background: rgba(167, 139, 250, 0.1);
}

.askpage-history-item-main {
  flex: 1;
  padding: 8px 8px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: #e5e7eb;
  min-width: 0;
}

.askpage-history-item-title {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-history-item-meta {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
}

.askpage-history-item-delete {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0;
  transition: all 0.12s;
  display: flex;
  align-items: center;
}

.askpage-history-item:hover .askpage-history-item-delete {
  opacity: 0.6;
}

.askpage-history-item-delete:hover {
  opacity: 1 !important;
  color: #ef4444;
}

.askpage-history-empty {
  padding: 24px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

/* ─── Thinking Block ─────────────────────────── */

.askpage-thinking-block {
  align-self: flex-start;
  max-width: 90%;
  margin-bottom: 4px;
  border-radius: 10px;
  background: rgba(167, 139, 250, 0.06);
  border: 1px solid rgba(167, 139, 250, 0.12);
  overflow: hidden;
  animation: fadeInMsg 0.2s ease;
}

.askpage-thinking-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #a78bfa;
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.askpage-thinking-summary::-webkit-details-marker { display: none; }

.askpage-thinking-summary::before {
  content: '▶';
  font-size: 8px;
  transition: transform 0.15s;
}

details[open] > .askpage-thinking-summary::before {
  transform: rotate(90deg);
}

.askpage-thinking-content {
  padding: 8px 12px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  border-top: 1px solid rgba(167, 139, 250, 0.1);
  font-style: italic;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.askpage-thinking-content p { margin: 4px 0; }
.askpage-thinking-content code {
  background: rgba(167, 139, 250, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.askpage-thinking-spinner {
  animation: spin 1.5s linear infinite;
}

/* ─── Welcome Prompt Buttons ──────────────────── */

.askpage-welcome-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  justify-content: center;
}

.askpage-welcome-prompt-btn {
  padding: 6px 14px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 20px;
  color: #a78bfa;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-welcome-prompt-btn:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.4);
  transform: translateY(-1px);
}

/* ─── Floating Button ──────────────────────────────── */

#browserbot-floating-btn {
  position: fixed;
  right: 12px;
  bottom: 80px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2147483645;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, background 0.2s ease, box-shadow 0.2s ease;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

#browserbot-floating-btn:hover {
  transform: scale(1.1);
  background: rgba(99, 102, 241, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

#browserbot-floating-btn.dragging {
  transition: none;
  transform: scale(1.15);
  background: rgba(99, 102, 241, 0.55);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

#browserbot-floating-btn.hidden {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}

#browserbot-floating-btn svg {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
}
`}var yt=document.createElement(`style`);yt.textContent=vt().replace(/:host/g,`body`),document.head.appendChild(yt);var bt=document.getElementById(`root`);bt&&(document.body.style.margin=`0`,document.body.style.padding=`0`,document.body.style.width=`100vw`,document.body.style.height=`100vh`,document.body.style.overflow=`hidden`,document.body.style.background=`#13141a`,(0,c.createRoot)(bt).render((0,s.createElement)(_t,{pageTitle:document.title,pageUrl:location.href,onClose:()=>{window.close()},isFullScreen:!0})));