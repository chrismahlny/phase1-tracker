import { readFileSync, writeFileSync, mkdirSync } from "fs";
import babel from "@babel/core";

const HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#14181D">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Phase 1 Tracker</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<style>html,body{margin:0;padding:0;background:#14181D;} input{-webkit-appearance:none;} *{box-sizing:border-box;}</style>
</head>
<body>
<div id="root"><div style="color:#8B97A3;font-family:system-ui;text-align:center;padding-top:40vh;font-size:15px">Loading tracker&hellip;</div></div>
<script>
setTimeout(function(){
  var r=document.getElementById('root');
  if(r && r.textContent.indexOf('Loading tracker')!==-1){
    r.innerHTML='<div style="color:#E8ECEF;font-family:system-ui;text-align:center;padding-top:38vh;font-size:15px;padding-left:24px;padding-right:24px">Couldn\\'t load — check your connection and reopen.<br><span style="color:#8B97A3;font-size:13px">Your saved data is unaffected.</span></div>';
  }
},8000);
</script>
<script id="app">
`;
const TAIL = `
</script>
</body>
</html>
`;

const src = readFileSync("src/phase1-workout-app.jsx", "utf8")
  .replace(/^import React.*$/m, "const { useState, useEffect, useRef, useCallback } = React;")
  .replace(/^export default function Root/m, "function Root");
const body = src + '\nReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Root));\n';

const compiled = babel.transformSync(body, {
  presets: [["@babel/preset-react", { runtime: "classic", development: false }]],
  comments: false, compact: false,
}).code;

// environment-ledger rule #3: literal \uXXXX escapes in JSX SOURCE render as text — fail the build
// (compiled string literals legitimately contain \u escapes; only the source matters)
if (/\\u[0-9a-fA-F]{4}/.test(src)) throw new Error("BUILD FAIL: literal unicode escapes in src JSX");

mkdirSync("dist", { recursive: true });
const artifact = HEAD + compiled + TAIL;
writeFileSync("dist/phase1-tracker.html", artifact);

const manifest = Buffer.from(JSON.stringify({
  name: "Phase 1 Tracker", short_name: "Phase1", display: "standalone",
  start_url: ".", background_color: "#14181D", theme_color: "#14181D",
})).toString("base64");
writeFileSync("dist/index.html", artifact.replace(
  "<title>Phase 1 Tracker</title>",
  `<title>Phase 1 Tracker</title>\n<link rel="manifest" href="data:application/manifest+json;base64,${manifest}">`
));
console.log("built: dist/phase1-tracker.html (artifact) + dist/index.html (standalone)");
