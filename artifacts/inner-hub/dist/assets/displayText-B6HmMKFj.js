function t(r){const e=(r??"").trim();return e?/^[\s·.\-_—–―•]+$/u.test(e):!0}function n(r,e){return r&&(t(r)?"":r.replace(/\s*[--―]\s*/g," · ").trim())}export{n as c};
