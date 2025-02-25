"use strict";

if (!window.console || !console.log)
    window.console = {
        "log": function (msg) { }
    };


if (window.CGV)
    for (var k in CGV)
        window[k] = CGV[k];


var wah = '',
    STG = null,
    NOAC = 'autocorrect="off" autocapitalize="off"',
    L, tt, treectl, thegrid, up2k, asmCrypto, hashwasm, vbar, marked,
    T0 = Date.now(),
    R = SR.slice(1),
    RS = R ? "/" + R : "",
    HALFMAX = 8192 * 8192 * 8192 * 8192,
    HTTPS = ('' + location).indexOf('https:') === 0,
    TOUCH = 'ontouchstart' in window,
    MOBILE = TOUCH,
    CHROME = !!window.chrome,
    VCHROME = CHROME ? 1 : 0,
    IE = /Trident\//.test(navigator.userAgent),
    FIREFOX = ('netscape' in window) && / rv:/.test(navigator.userAgent),
    IPHONE = TOUCH && /iPhone|iPad|iPod/i.test(navigator.userAgent),
    LINUX = /Linux/.test(navigator.userAgent),
    MACOS = /[^a-z]mac ?os/i.test(navigator.userAgent),
    WINDOWS = /Windows/.test(navigator.userAgent);

if (!window.WebAssembly || !WebAssembly.Memory)
    window.WebAssembly = false;

if (!window.Notification || !Notification.permission)
    window.Notification = false;

if (!window.FormData)
    window.FormData = false;

try {
    STG = window.localStorage;
    STG.STG;
}
catch (ex) {
    STG = null;
    if ((ex + '').indexOf('sandbox') < 0)
        console.log('no localStorage: ' + ex);
}

try {
    if (navigator.userAgentData.mobile)
        MOBILE = true;

    if (navigator.userAgentData.platform == 'Windows')
        WINDOWS = true;

    CHROME = navigator.userAgentData.brands.find(function (d) { return d.brand == 'Chromium' });
    if (CHROME)
        VCHROME = CHROME.version;
    else
        VCHROME = 0;

    CHROME = !!CHROME;
}
catch (ex) { }


var ebi = document.getElementById.bind(document),
    QS = document.querySelector.bind(document),
    QSA = document.querySelectorAll.bind(document),
    XHR = XMLHttpRequest;


function mknod(et, eid, html) {
    var ret = document.createElement(et);

    if (eid)
        ret.id = eid;

    if (html)
        ret.innerHTML = html;

    return ret;
}


function qsr(sel) {
    var el = QS(sel);
    if (el)
        el.parentNode.removeChild(el);

    return el;
}


// error handler for mobile devices
function esc(txt) {
    return txt.replace(/[&"<>]/g, function (c) {
        return {
            '&': '&amp;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        }[c];
    });
}
function basenames(txt) {
    return (txt + '').replace(/https?:\/\/[^ \/]+\//g, '/').replace(/js\?_=[a-zA-Z]{4}/g, 'js');
}
if ((document.location + '').indexOf(',rej,') + 1)
    window.onunhandledrejection = function (e) {
        var err = e.reason;
        try {
            err += '\n' + e.reason.stack;
        }
        catch (e) { }
        err = basenames(err);
        console.log("REJ: " + err);
        try {
            toast.warn(30, err);
        }
        catch (e) { }
    };

try {
    console.hist = [];
    var CMAXHIST = 1000;
    var hook = function (t) {
        var orig = console[t].bind(console),
            cfun = function () {
                console.hist.push(Date.now() + ' ' + t + ': ' + Array.from(arguments).join(', '));
                if (console.hist.length > CMAXHIST)
                    console.hist = console.hist.slice(CMAXHIST / 2);

                orig.apply(console, arguments);
            };

        console['std' + t] = orig;
        console[t] = cfun;
    };
    hook('log');
    console.log('log-capture ok');
    hook('debug');
    hook('warn');
    hook('error');
}
catch (ex) {
    if (console.stdlog)
        console.log = console.stdlog;
    console.log('console capture failed', ex);
}
var crashed = false, ignexd = {}, evalex_fatal = false;
function vis_exh(msg, url, lineNo, columnNo, error) {
    var ekey = url + '\n' + lineNo + '\n' + msg;
    if (ignexd[ekey] || crashed)
        return;

    msg = String(msg);
    url = String(url);

    if (msg.indexOf('ResizeObserver') + 1)
        return;  // chrome issue 809574 (benign, from <video>)

    if (msg.indexOf('l2d.js') + 1)
        return;  // `t` undefined in tapEvent -> hitTestSimpleCustom

    if (!/\.js($|\?)/.exec(url))
        return;  // chrome debugger

    if (url.indexOf(' > eval') + 1 && !evalex_fatal)
        return;  // md timer

    if (IE && url.indexOf('prism.js') + 1)
        return;

    if (url.indexOf('easymde.js') + 1)
        return;  // clicking the preview pane

    if (url.indexOf('deps/marked.js') + 1 && !WebAssembly)
        return; // ff<52

    crashed = true;
    window.onerror = undefined;
    var html = [
        '<h1>you hit a bug!</h1>',
        '<p style="font-size:1.3em;margin:0;line-height:2em">try to <a href="#" onclick="localStorage.clear();location.reload();">reset copyparty settings</a> if you are stuck here, or <a href="#" onclick="ignex();">ignore this</a> / <a href="#" onclick="ignex(true);">ignore all</a> / <a href="?b=u">basic</a></p>',
        '<p style="color:#fff">please send me a screenshot arigathanks gozaimuch: <a href="<ghi>" target="_blank">new github issue</a></p>',
        '<p class="b">' + esc(url + ' @' + lineNo + ':' + columnNo), '<br />' + esc(msg).replace(/\n/g, '<br />') + '</p>',
        '<p><b>UA:</b> ' + esc(navigator.userAgent + '')
    ];

    try {
        var ua = '',
            ad = navigator.userAgentData,
            adb = ad.brands;

        for (var a = 0; a < adb.length; a++)
            if (!/Not.*A.*Brand/.exec(adb[a].brand))
                ua += adb[a].brand + '/' + adb[a].version + ', ';
        ua += ad.platform;

        html.push('<br /><b>UAD:</b> ' + esc(ua.slice(0, 100)));
    }
    catch (e) { }
    html.push('</p>');

    try {
        if (error) {
            var find = ['desc', 'stack', 'trace'];
            for (var a = 0; a < find.length; a++)
                if (String(error[find[a]]) !== 'undefined')
                    html.push('<p class="b"><b>' + find[a] + ':</b><br />' +
                        esc(String(error[find[a]])).replace(/\n/g, '<br />\n') + '</p>');
        }
        ignexd[ekey] = true;

        var ls = {},
            lsk = Object.keys(localStorage),
            nka = lsk.length,
            nk = Math.min(200, nka);

        for (var a = 0; a < nk; a++) {
            var k = lsk[a],
                v = localStorage.getItem(k);

            ls[k] = v.length > 256 ? v.slice(0, 32) + '[...' + v.length + 'b]' : v;
        }

        lsk = Object.keys(ls);
        lsk.sort();
        html.push('<p class="b"><b>' + nka + ':&nbsp;</b>');
        for (var a = 0; a < nk; a++)
            html.push(' <b>' + esc(lsk[a]) + '</b> <code>' + esc(ls[lsk[a]]) + '</code> ');

        html.push('</p>');
    }
    catch (e) { }

    if (console.hist.length) {
        html.push('<p class="b"><b>console:</b><ul><li>' + Date.now() + ' @</li>');
        for (var a = console.hist.length - 1, aa = Math.max(0, console.hist.length - 20); a >= aa; a--)
            html.push('<li>' + esc(console.hist[a]) + '</li>');
        html.push('</ul>')
    }

    try {
        var exbox = ebi('exbox');
        if (!exbox) {
            exbox = mknod('div', 'exbox');
            document.body.appendChild(exbox);

            var s = mknod('style');
            s.innerHTML = (
                '#exbox{background:#222;color:#ddd;font-family:sans-serif;font-size:0.8em;padding:0 1em 1em 1em;z-index:80386;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;overflow:auto;width:calc(100% - 2em)} ' +
                '#exbox,#exbox *{line-height:1.5em;overflow-wrap:break-word} ' +
                '#exbox code{color:#bf7;background:#222;padding:.1em;margin:.2em;font-size:1.1em;font-family:monospace,monospace} ' +
                '#exbox a{text-decoration:underline;color:#fc0;background:#222;border:none} ' +
                '#exbox h1{margin:.5em 1em 0 0;padding:0} ' +
                '#exbox p.b{border-top:1px solid #999;margin:1em 0 0 0;font-size:1em} ' +
                '#exbox ul, #exbox li {margin:0 0 0 .5em;padding:0} ' +
                '#exbox b{color:#fff}'
            );
            document.head.appendChild(s);
        }
        exbox.innerHTML = basenames(html.join('\n')).replace(/<ghi>/, 'https://github.com/9001/copyparty/issues/new?labels=bug&template=bug_report.md');
        exbox.style.display = 'block';
    }
    catch (e) {
        document.body.innerHTML = html.join('\n');
    }
}
function ignex(all) {
    var o = ebi('exbox');
    o.style.display = 'none';
    o.innerHTML = '';
    crashed = false;
    if (!all)
        window.onerror = vis_exh;
}
window.onerror = vis_exh;


function noop() { }


function ctrl(e) {
    return e && (e.ctrlKey || e.metaKey);
}


function anymod(e, shift_ok) {
    return e && (e.ctrlKey || e.altKey || e.metaKey || e.isComposing || (!shift_ok && e.shiftKey));
}


var dev_fbw = sread('dev_fbw');
function ev(e) {
    if (!e && window.event) {
        e = window.event;
        if (dev_fbw == 1) {
            toast.warn(10, 'hello from fallback code ;_;\ncheck console trace');
            console.error('using window.event');
        }
    }
    if (!e)
        return;

    if (e.preventDefault)
        e.preventDefault();

    if (e.stopPropagation)
        e.stopPropagation();

    if (e.stopImmediatePropagation)
        e.stopImmediatePropagation();

    e.returnValue = false;
    return e;
}


function noope(e) {
    try { ev(e); } catch (ex) { }
}


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith)
    String.prototype.endsWith = function (search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };

if (!String.prototype.startsWith)
    String.prototype.startsWith = function (s, i) {
        i = i > 0 ? i | 0 : 0;
        return this.substring(i, i + s.length) === s;
    };

if (!String.prototype.trimEnd)
    String.prototype.trimEnd = String.prototype.trimRight = function () {
        return this.replace(/[ \t\r\n]+$/, '');
    };

if (!Element.prototype.matches)
    Element.prototype.matches =
        Element.prototype.oMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function (s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
    };

if (!String.prototype.format)
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ?
                args[number] : match;
        });
    };

try {
    new URL('/a/', 'https://a.com/');
}
catch (ex) {
    console.log('ie11 shim URL()');
    window.URL = function (url, base) {
        if (url.indexOf('//') < 0)
            url = base + '/' + url.replace(/^\/?/, '');
        else if (url.indexOf('//') == 0)
            url = 'https:' + url;

        var x = url.split('?');
        return {
            "pathname": '/' + x[0].split('://')[1].replace(/[^/]+\//, ''),
            "search": x.length > 1 ? x[1] : ''
        };
    }
}

if (!window.Set)
    window.Set = function () {
        var r = this;
        r.size = 0;
        r.d = {};
        r.add = function (k) {
            if (!r.d[k]) {
                r.d[k] = 1;
                r.size++;
            }
        };
        r.has = function (k) {
            return r.d[k];
        };
    };

// https://stackoverflow.com/a/950146
function import_js(url, cb, ecb) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var script = mknod('script');
    script.type = 'text/javascript';
    script.src = url + '?_=' + (window.TS || 'a');
    script.onload = cb;
    script.onerror = ecb || function () {
        var m = 'Failed to load module:\n' + url;
        console.log(m);
        toast.err(0, m);
    };
    head.appendChild(script);
}


function unsmart(txt) {
    return !IPHONE ? txt : (txt.
        replace(/[\u2014]/g, "--").
        replace(/[\u2022]/g, "*").
        replace(/[\u2018\u2019]/g, "'").
        replace(/[\u201c\u201d]/g, '"'));
}


function namesan(txt, win, fslash) {
    if (win)
        txt = (txt.
            replace(/</g, "＜").
            replace(/>/g, "＞").
            replace(/:/g, "：").
            replace(/"/g, "＂").
            replace(/\\/g, "＼").
            replace(/\|/g, "｜").
            replace(/\?/g, "？").
            replace(/\*/g, "＊"));

    if (fslash)
        txt = txt.replace(/\//g, "／");

    return txt;
}


var crctab = (function () {
    var c, tab = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        tab[n] = c;
    }
    return tab;
})();


function crc32(str) {
    var crc = 0 ^ (-1);
    for (var i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ crctab[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return ((crc ^ (-1)) >>> 0).toString(16);
}


function clmod(el, cls, add) {
    if (!el)
        return false;

    if (el.classList) {
        var have = el.classList.contains(cls);
        if (add == 't')
            add = !have;

        if (!add == !have)
            return false;

        el.classList[add ? 'add' : 'remove'](cls);
        return true;
    }

    var re = new RegExp('\\s*\\b' + cls + '\\s*\\b', 'g'),
        n1 = el.className;

    if (add == 't')
        add = !re.test(n1);

    var n2 = n1.replace(re, ' ') + (add ? ' ' + cls : '');

    if (n1 == n2)
        return false;

    el.className = n2;
    return true;
}


function clgot(el, cls) {
    if (!el)
        return;

    if (el.classList)
        return el.classList.contains(cls);

    var lst = (el.className + '').split(/ /g);
    return has(lst, cls);
}


var ANIM = true;
try {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.onchange = function () {
        ANIM = !mq.matches;
    };
    ANIM = !mq.matches;
}
catch (ex) { }


function yscroll() {
    if (document.documentElement.scrollTop) {
        return (window.yscroll = function () {
            return document.documentElement.scrollTop;
        })();
    }
    if (window.pageYOffset) {
        return (window.yscroll = function () {
            return window.pageYOffset;
        })();
    }
    return 0;
}


function showsort(tab) {
    var v, vn, v1, v2, th = tab.tHead,
        sopts = jread('fsort', jcp(dsort));

    th && (th = th.rows[0]) && (th = th.cells);

    for (var a = sopts.length - 1; a >= 0; a--) {
        if (!sopts[a][0])
            continue;

        v2 = v1;
        v1 = sopts[a];
    }

    v = [v1, v2];
    vn = [v1 ? v1[0] : '', v2 ? v2[0] : ''];

    var ga = QSA('#ghead a[s]');
    for (var a = 0; a < ga.length; a++)
        ga[a].className = '';

    for (var a = 0; a < th.length; a++) {
        var n = vn.indexOf(th[a].getAttribute('name')),
            cl = n < 0 ? ' ' : ' s' + n + (v[n][1] > 0 ? ' ' : 'r ');

        th[a].className = th[a].className.replace(/ *s[01]r? */, ' ') + cl;
        if (n + 1) {
            ga = QS('#ghead a[s="' + vn[n] + '"]');
            if (ga)
                ga.className = cl;
        }
    }
}
function sortTable(table, col, cb) {
    var tb = table.tBodies[0],
        th = table.tHead.rows[0].cells,
        tr = Array.prototype.slice.call(tb.rows, 0),
        i, reverse = /s0[^r]/.exec(th[col].className + ' ') ? -1 : 1;

    var stype = th[col].getAttribute('sort');
    try {
        var nrules = [], rules = jread("fsort", []);
        rules.unshift([th[col].getAttribute('name'), reverse, stype || '']);
        for (var a = 0; a < rules.length; a++) {
            var add = true;
            for (var b = 0; b < a; b++)
                if (rules[a][0] == rules[b][0])
                    add = false;

            if (add)
                nrules.push(rules[a]);

            if (nrules.length >= 10)
                break;
        }
        jwrite("fsort", nrules);
        try { showsort(table); } catch (ex) { }
    }
    catch (ex) {
        console.log("failed to persist sort rules, resetting: " + ex);
        jwrite("fsort", null);
    }
    var vl = [];
    for (var a = 0; a < tr.length; a++) {
        var cell = tr[a].cells[col];
        if (!cell) {
            vl.push([null, a]);
            continue;
        }
        var v = cell.getAttribute('sortv') || cell.textContent.trim();
        if (stype == 'int') {
            v = parseInt(v.replace(/[, ]/g, '')) || 0;
        }
        vl.push([v, a]);
    }
    vl.sort(function (a, b) {
        a = a[0];
        b = b[0];
        if (a === null)
            return -1;
        if (b === null)
            return 1;

        if (stype == 'int') {
            return reverse * (a - b);
        }
        return reverse * (a.localeCompare(b));
    });
    if (sread('dir1st') !== '0') {
        var r1 = [], r2 = [];
        for (var i = 0; i < tr.length; i++) {
            var cell = tr[vl[i][1]].cells[1],
                href = cell.getAttribute('sortv') || cell.textContent.trim();

            (href.split('?')[0].slice(-1) == '/' ? r1 : r2).push(vl[i]);
        }
        vl = r1.concat(r2);
    }
    for (i = 0; i < tr.length; ++i) tb.appendChild(tr[vl[i][1]]);
    if (cb) cb();
}
function makeSortable(table, cb) {
    var th = table.tHead, i;
    th && (th = th.rows[0]) && (th = th.cells);
    if (th) i = th.length;
    else return; // if no `<thead>` then do nothing
    while (--i >= 0) (function (i) {
        th[i].onclick = function (e) {
            ev(e);
            sortTable(table, i, cb);
        };
    }(i));
}


function linksplit(rp, id) {
    var ret = [],
        apath = '/',
        q = null;

    if (rp && rp.indexOf('?') + 1) {
        q = rp.split('?', 2);
        rp = q[0];
        q = '?' + q[1];
    }

    if (rp && rp[0] == '/')
        rp = rp.slice(1);

    while (rp) {
        var link = rp;
        var ofs = rp.indexOf('/');
        if (ofs === -1) {
            rp = null;
        }
        else {
            link = rp.slice(0, ofs + 1);
            rp = rp.slice(ofs + 1);
        }
        var vlink = esc(uricom_dec(link));

        if (link.indexOf('/') !== -1)
            vlink = vlink.slice(0, -1);

        if (!rp) {
            if (q)
                link += q;

            if (id)
                link += '" id="' + id;
        }

        ret.push('<a href="' + apath + link + '">' + vlink + '</a>');
        apath += link;
    }
    return ret;
}


function vsplit(vp) {
    if (vp.endsWith('/'))
        vp = vp.slice(0, -1);

    var ofs = vp.lastIndexOf('/') + 1,
        base = vp.slice(0, ofs),
        fn = vp.slice(ofs);

    return [base, fn];
}


function vjoin(p1, p2) {
    if (!p1)
        p1 = '';

    if (!p2)
        p2 = '';

    if (p1.endsWith('/'))
        p1 = p1.slice(0, -1);

    if (p2.startsWith('/'))
        p2 = p2.slice(1);

    if (!p1)
        return p2;

    if (!p2)
        return p1;

    return p1 + '/' + p2;
}


function addq(url, q) {
    var uh = url.split('#', 1),
        u = uh[0],
        h = uh.length == 1 ? '' : '#' + uh[1];

    return u + (u.indexOf('?') < 0 ? '?' : '&') + (q === undefined ? '' : q) + h;
}


function uricom_enc(txt, do_fb_enc) {
    try {
        return encodeURIComponent(txt);
    }
    catch (ex) {
        console.log("uce-err [" + txt + "]");
        if (do_fb_enc)
            return esc(txt);

        return txt;
    }
}

function url_enc(txt) {
    var parts = txt.split('/'),
        ret = [];

    for (var a = 0; a < parts.length; a++)
        ret.push(uricom_enc(parts[a]));

    return ret.join('/');
}


function uricom_dec(txt) {
    try {
        return decodeURIComponent(txt);
    }
    catch (ex) {
        console.log("ucd-err [" + txt + "]");
        return txt;
    }
}


function uricom_sdec(txt) {
    try {
        return [decodeURIComponent(txt), true];
    }
    catch (ex) {
        console.log("ucd-err [" + txt + "]");
        return [txt, false];
    }
}


function uricom_adec(arr, li) {
    var ret = [];
    for (var a = 0; a < arr.length; a++) {
        var txt = uricom_dec(arr[a]);
        ret.push(li ? '<li>' + esc(txt) + '</li>' : txt);
    }

    return ret;
}


function get_evpath() {
    var ret = document.location.pathname;

    if (ret.indexOf('/') !== 0)
        ret = '/' + ret;

    if (ret.lastIndexOf('/') !== ret.length - 1)
        ret += '/';

    return ret;
}


function get_vpath() {
    return uricom_dec(get_evpath());
}


function noq_href(el) {
    return el.getAttribute('href').split('?')[0];
}


function unix2iso(ts) {
    return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, -5);
}


function s2ms(s) {
    s = Math.floor(s);
    var m = Math.floor(s / 60);
    return m + ":" + ("0" + (s - m * 60)).slice(-2);
}


var isNum = function (v) {
    var n = parseFloat(v);
    return !isNaN(v - n) && n === v;
};
if (window.Number && Number.isFinite)
    isNum = Number.isFinite;


function f2f(val, nd) {
    // 10.toFixed(1) returns 10.00 for certain values of 10
    val = (val * Math.pow(10, nd)).toFixed(0).split('.')[0];
    return nd ? (val.slice(0, -nd) || '0') + '.' + val.slice(-nd) : val;
}


function humansize(b, terse) {
    var i = 0, u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    while (b >= 1000 && i < u.length - 1) {
        b /= 1024;
        i += 1;
    }
    return (f2f(b, b >= 100 ? 0 : b >= 10 ? 1 : 2) +
        ' ' + (terse ? u[i].charAt(0) : u[i]));
}


function humantime(v) {
    if (v >= 60 * 60 * 24)
        return shumantime(v);

    try {
        return /.*(..:..:..).*/.exec(new Date(v * 1000).toUTCString())[1];
    }
    catch (ex) {
        return v;
    }
}


function shumantime(v, long) {
    if (v < 10)
        return f2f(v, 2) + 's';
    if (v < 60)
        return f2f(v, 1) + 's';

    v = parseInt(v);
    var st = [[60 * 60 * 24, 60 * 60, 'd'], [60 * 60, 60, 'h'], [60, 1, 'm']];

    for (var a = 0; a < st.length; a++) {
        var m1 = st[a][0],
            m2 = st[a][1],
            ch = st[a][2];

        if (v < m1)
            continue;

        var v1 = parseInt(v / m1),
            v2 = ('0' + parseInt((v % m1) / m2)).slice(-2);

        return v1 + ch + (v1 >= 10 || v2 == '00' ? '' : v2 + (
            long && a < st.length - 1 ? st[a + 1][2] : ''));
    }
}


function lhumantime(v) {
    var t = shumantime(v, 1),
        tp = t.replace(/([a-z])/g, " $1 ").split(/ /g).slice(0, -1);

    if (!L || tp.length < 2 || tp[1].indexOf('$') + 1)
        return t;

    var ret = '';
    for (var a = 0; a < tp.length; a += 2)
        ret += tp[a] + ' ' + L['ht_' + tp[a + 1]].replace(tp[a] == 1 ? /!.*/ : /!/, '') + L.ht_and;

    return ret.slice(0, -L.ht_and.length);
}


function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
}


function has(haystack, needle) {
    try { return haystack.includes(needle); } catch (ex) { }

    for (var a = 0; a < haystack.length; a++)
        if (haystack[a] == needle)
            return true;

    return false;
}


function apop(arr, v) {
    var ofs = arr.indexOf(v);
    if (ofs !== -1)
        arr.splice(ofs, 1);
}


function jcp(obj) {
    return JSON.parse(JSON.stringify(obj));
}


function sdrop(key) {
    try {
        STG.removeItem(key);
    }
    catch (ex) { }
}

function sread(key, al) {
    try {
        var ret = STG.getItem(key);
        return (!al || has(al, ret)) ? ret : null;
    }
    catch (e) {
        return null;
    }
}

function swrite(key, val) {
    try {
        if (val === undefined || val === null)
            STG.removeItem(key);
        else
            STG.setItem(key, val);
    }
    catch (e) { }
}

function jread(key, fb) {
    var str = sread(key);
    if (!str)
        return fb;

    try {
        // '' throws, null is ok, sasuga
        return JSON.parse(str);
    }
    catch (e) {
        return fb;
    }
}

function jwrite(key, val) {
    if (!val)
        swrite(key);
    else
        swrite(key, JSON.stringify(val));
}

function icfg_get(name, defval) {
    return parseInt(fcfg_get(name, defval));
}

function fcfg_get(name, defval) {
    var o = ebi(name),
        val = parseFloat(sread(name));

    if (!isNum(val))
        return parseFloat(o && o.value !== '' ? o.value : defval);

    if (o)
        o.value = val;

    return val;
}

function scfg_get(name, defval) {
    var o = ebi(name),
        val = sread(name);

    if (val === null)
        val = defval;

    if (o)
        o.value = val;

    return val;
}

function bcfg_get(name, defval) {
    var o = ebi(name);
    if (!o)
        return defval;

    var val = sread(name);
    if (val === null)
        val = defval;
    else
        val = (val == '1');

    bcfg_upd_ui(name, val);
    return val;
}

function bcfg_set(name, val) {
    swrite(name, val ? '1' : '0');
    bcfg_upd_ui(name, val);
    return val;
}

function bcfg_upd_ui(name, val) {
    var o = ebi(name);
    if (!o)
        return val;

    if (o.getAttribute('type') == 'checkbox')
        o.checked = val;
    else if (o) {
        clmod(o, 'on', val);
    }
    return val;
}

function bcfg_bind(obj, oname, cname, defval, cb, un_ev) {
    var v = bcfg_get(cname, defval),
        el = ebi(cname);

    obj[oname] = v;
    if (el)
        el.onclick = function (e) {
            if (un_ev !== false)
                ev(e);

            obj[oname] = bcfg_set(cname, !obj[oname]);
            if (cb)
                cb(obj[oname]);
        };

    return v;
}

function scfg_bind(obj, oname, cname, defval, cb) {
    var v = scfg_get(cname, defval),
        el = ebi(cname);

    obj[oname] = v;
    if (el)
        el.oninput = function (e) {
            swrite(cname, obj[oname] = this.value);
            if (cb)
                cb(obj[oname]);
        };

    return v;
}


function hist_push(url) {
    console.log("h-push " + url);
    try {
        history.pushState(url, url, url);
    }
    catch (ex) { }
}

function hist_replace(url) {
    console.log("h-repl " + url);
    try {
        history.replaceState(url, url, url);
    }
    catch (ex) { }  // ff "The operation is insecure." on rapid switches
}

function sethash(hv) {
    if (window.history && history.replaceState) {
        hist_replace(document.location.pathname + document.location.search + '#' + hv);
    }
    else {
        document.location.hash = hv;
    }
}


function dl_file(url) {
    console.log('DL [%s]', url);
    var o = mknod('a');
    o.setAttribute('href', url);
    o.setAttribute('download', '');
    o.click();
}


function cliptxt(txt, ok) {
    var fb = function () {
        console.log('clip-fb');
        var o = mknod('input');
        o.value = txt;
        document.body.appendChild(o);
        o.focus();
        o.select();
        document.execCommand("copy");
        document.body.removeChild(o);
        ok();
    };
    try {
        navigator.clipboard.writeText(txt).then(ok, fb);
    }
    catch (ex) { fb(); }
}


function Debounce(delay) {
    var r = this;
    r.delay = delay;
    r.timer = 0;
    r.t_hit = 0;
    r.t_run = 0;
    r.q = [];

    r.add = function (fun, run) {
        r.rm(fun);
        r.q.push(fun);

        if (run)
            fun();
    };

    r.rm = function (fun) {
        apop(r.q, fun);
    };

    r.run = function () {
        if (crashed)
            return;

        r.t_run = Date.now();

        var q = r.q.slice(0);
        for (var a = 0; a < q.length; a++)
            q[a]();
    };

    r.hit = function () {
        if (crashed)
            return;

        var now = Date.now(),
            td_hit = now - r.t_hit,
            td_run = now - r.t_run;

        if (td_run >= r.delay * 2)
            r.t_run = now;

        if (td_run >= r.delay && td_run <= r.delay * 2) {
            // r.delay is also deadline
            clearTimeout(r.timer);
            return r.run();
        }

        if (td_hit < r.delay / 5)
            return;

        clearTimeout(r.timer);
        r.timer = setTimeout(r.run, r.delay);
        r.t_hit = now;
    };
};

var onresize100 = new Debounce(100);
window.addEventListener('resize', onresize100.hit);


var timer = (function () {
    var r = {};
    r.q = [];
    r.last = 0;
    r.fs = 0;
    r.fc = 0;

    r.add = function (fun, run) {
        r.rm(fun);
        r.q.push(fun);

        if (run)
            fun();
    };

    r.rm = function (fun) {
        apop(r.q, fun);
    };

    var doevents = function () {
        if (crashed)
            return;

        if (Date.now() - r.last < 69)
            return;

        var q = r.q.slice(0);
        for (var a = 0; a < q.length; a++)
            q[a]();

        r.last = Date.now();
        //r.fc++; if (r.last - r.fs >= 2000) { console.log(r.last - r.fs, r.fc); r.fs = r.last; r.fc = 0; }
    }
    setInterval(doevents, 100);

    return r;
})();


var tt = (function () {
    var r = {
        "tt": mknod("div", 'tt'),
        "th": mknod("div", 'tth'),
        "en": true,
        "el": null,
        "skip": false,
        "lvis": 0
    };

    r.th.innerHTML = '?';
    document.body.appendChild(r.tt);
    document.body.appendChild(r.th);

    var prev = null;
    r.cshow = function () {
        if (this !== prev)
            r.show.call(this);

        prev = this;
    };

    var tev, vh;
    r.dshow = function (e) {
        clearTimeout(tev);
        if (!r.getmsg(this))
            return;

        if (Date.now() - r.lvis < 400)
            return r.show.call(this);

        tev = setTimeout(r.show.bind(this), 800);
        if (TOUCH)
            return;

        vh = window.innerHeight;
        this.addEventListener('mousemove', r.move);
        clmod(r.th, 'act', 1);
        r.move(e);
    };

    r.getmsg = function (el) {
        if (IPHONE && QS('body.bbox-open'))
            return;

        var cfg = sread('tooltips');
        if (cfg !== null && cfg != '1')
            return;

        return el.getAttribute('tt');
    };

    r.show = function () {
        clearTimeout(tev);
        if (r.skip) {
            r.skip = false;
            return;
        }
        var msg = r.getmsg(this);
        if (!msg)
            return;

        r.el = this;
        var pos = this.getBoundingClientRect(),
            dir = this.getAttribute('ttd') || '',
            margin = parseFloat(this.getAttribute('ttm') || 0),
            top = pos.top < window.innerHeight / 2,
            big = this.className.indexOf(' ttb') !== -1;

        if (dir.indexOf('u') + 1) top = false;
        if (dir.indexOf('d') + 1) top = true;

        clmod(r.th, 'act');
        clmod(r.tt, 'b', big);
        r.tt.style.left = '0';
        r.tt.style.top = '0';

        r.tt.innerHTML = msg.replace(/\$N/g, "<br />");
        r.el.addEventListener('mouseleave', r.hide);
        window.addEventListener('scroll', r.hide);
        clmod(r.tt, 'show', 1);

        var tw = r.tt.offsetWidth,
            x = pos.left + (pos.right - pos.left) / 2 - tw / 2;

        if (x + tw >= window.innerWidth - 24)
            x = window.innerWidth - tw - 24;

        if (x < 0)
            x = 12;

        r.tt.style.left = x + 'px';
        r.tt.style.top = top ? (margin + pos.bottom) + 'px' : 'auto';
        r.tt.style.bottom = top ? 'auto' : (margin + window.innerHeight - pos.top) + 'px';
    };

    r.hide = function (e) {
        //ev(e);  // eats checkbox-label clicks
        clearTimeout(tev);
        window.removeEventListener('scroll', r.hide);

        clmod(r.tt, 'b');
        clmod(r.th, 'act');
        if (clmod(r.tt, 'show'))
            r.lvis = Date.now();

        if (r.el)
            r.el.removeEventListener('mouseleave', r.hide);

        if (e && e.target)
            e.target.removeEventListener('mousemove', r.move);
    };

    r.move = function (e) {
        var sy = e.clientY + 128 > vh ? -1 : 1;
        r.th.style.left = (e.pageX + 12) + 'px';
        r.th.style.top = (e.pageY + 12 * sy) + 'px';
    };

    if (TOUCH) {
        var f1 = r.show,
            f2 = r.hide,
            q = [];

        // if an onclick-handler creates a new timer,
        // webkits delay the entire handler by up to 401ms,
        // win by using a shared timer instead

        timer.add(function () {
            while (q.length && Date.now() >= q[0][0])
                q.shift()[1]();
        });

        r.show = function () {
            q.push([Date.now() + 100, f1.bind(this)]);
        };
        r.hide = function () {
            q.push([Date.now() + 100, f2.bind(this)]);
        };
    }

    r.tt.onclick = r.hide;

    r.att = function (ctr) {
        var _cshow = r.en ? r.cshow : null,
            _dshow = r.en ? r.dshow : null,
            _hide = r.en ? r.hide : null,
            o = ctr.querySelectorAll('*[tt]');

        for (var a = o.length - 1; a >= 0; a--) {
            o[a].onfocus = _cshow;
            o[a].onblur = _hide;
            o[a].onmouseenter = _dshow;
            o[a].onmouseleave = _hide;
        }
        r.hide();
    }

    r.init = function () {
        bcfg_bind(r, 'en', 'tooltips', r.en, r.init);
        r.att(document);
    };

    return r;
})();


function lf2br(txt) {
    var html = '', hp = txt.split(/(?=<.?pre>)/i);
    for (var a = 0; a < hp.length; a++)
        html += hp[a].startsWith('<pre>') ? hp[a] :
            hp[a].replace(/<br ?.?>\n/g, '\n').replace(/\n<br ?.?>/g, '\n').replace(/\n/g, '<br />\n');

    return html;
}


function hunpre(txt) {
    return ('' + txt).replace(/^<pre>/, '');
}
function unpre(txt) {
    return esc(hunpre(txt));
}


var toast = (function () {
    var r = {},
        te = null,
        scrolling = false,
        obj = mknod('div', 'toast');

    document.body.appendChild(obj);
    r.visible = false;
    r.txt = null;
    r.tag = obj;  // filler value (null is scary)
    r.p_txt = '';
    r.p_sec = 0;
    r.p_t = 0;

    var scrollchk = function () {
        if (scrolling)
            return;

        var tb = ebi('toastb'),
            vis = tb.offsetHeight,
            all = tb.scrollHeight;

        if (8 + vis >= all)
            return;

        clmod(obj, 'scroll', 1);
        scrolling = true;
    }

    var unscroll = function () {
        timer.rm(scrollchk);
        clmod(obj, 'scroll');
        scrolling = false;
    }

    r.hide = function (e) {
        if (this === ebi('toastc'))
            ev(e);

        unscroll();
        clearTimeout(te);
        clmod(obj, 'vis');
        r.visible = false;
        r.tag = obj;
        if (!WebAssembly)
            te = setTimeout(function () {
                obj.className = 'hide';
            }, 500);
    };

    r.show = function (cl, sec, txt, tag) {
        txt = (txt + '').slice(0, 16384);

        var same = r.visible && txt == r.p_txt && r.p_sec == sec,
            delta = Date.now() - r.p_t;

        if (same && delta < 100)
            return;

        r.p_txt = txt;
        r.p_sec = sec;
        r.p_t = Date.now();

        clearTimeout(te);
        if (sec)
            te = setTimeout(r.hide, sec * 1000);

        if (same && delta < 1000)
            return;

        if (txt.indexOf('<body>') + 1)
            txt = txt.slice(0, txt.indexOf('<')) + ' [...]';

        obj.innerHTML = '<a href="#" id="toastc">x</a><div id="toastb">' + lf2br(txt) + '</div>';
        obj.className = cl;
        sec += obj.offsetWidth;
        obj.className += ' vis';
        ebi('toastc').onclick = r.hide;
        timer.add(scrollchk);
        r.visible = true;
        r.txt = txt;
        r.tag = tag;
    };

    r.ok = function (sec, txt, tag, cls) {
        r.show('ok ' + (cls || ''), sec, txt, tag);
    };
    r.inf = function (sec, txt, tag, cls) {
        r.show('inf ' + (cls || ''), sec, txt, tag);
    };
    r.warn = function (sec, txt, tag, cls) {
        r.show('warn ' + (cls || ''), sec, txt, tag);
    };
    r.err = function (sec, txt, tag, cls) {
        r.show('err ' + (cls || ''), sec, txt, tag);
    };

    return r;
})();


var modal = (function () {
    var r = {},
        q = [],
        o = null,
        cb_up = null,
        cb_ok = null,
        cb_ng = null,
        sel_0 = 0,
        sel_1 = 0,
        tok, tng, prim, sec, ok_cancel;

    r.load = function () {
        tok = (L && L.m_ok) || 'OK';
        tng = (L && L.m_ng) || 'Cancel';
        prim = '<a href="#" id="modal-ok">' + tok + '</a>';
        sec = '<a href="#" id="modal-ng">' + tng + '</a>';
        ok_cancel = WINDOWS ? prim + sec : sec + prim;
    };
    r.load();

    r.busy = false;
    r.nofocus = 0;

    r.show = function (html) {
        o = mknod('div', 'modal');
        o.innerHTML = '<table><tr><td><div id="modalc">' + html + '</div></td></tr></table>';
        document.body.appendChild(o);
        document.addEventListener('keydown', onkey);
        r.busy = true;

        var a = ebi('modal-ng');
        if (a)
            a.onclick = ng;

        a = ebi('modal-ok');
        a.addEventListener('blur', onblur);
        a.onclick = ok;

        var inp = ebi('modali');
        (inp || a).focus();
        if (inp)
            setTimeout(function () {
                inp.setSelectionRange(sel_0, sel_1, "forward");
            }, 0);

        document.addEventListener('focus', onfocus);
        document.addEventListener('selectionchange', onselch);
        timer.add(onfocus);
        if (cb_up)
            setTimeout(cb_up, 1);
    };

    r.hide = function () {
        timer.rm(onfocus);
        try {
            ebi('modal-ok').removeEventListener('blur', onblur);
        }
        catch (ex) { }
        document.removeEventListener('selectionchange', onselch);
        document.removeEventListener('focus', onfocus);
        document.removeEventListener('keydown', onkey);
        o.parentNode.removeChild(o);
        r.busy = false;
        setTimeout(next, 50);
    };
    var ok = function (e) {
        ev(e);
        var v = ebi('modali');
        v = v ? v.value : true;
        r.hide();
        if (cb_ok)
            cb_ok(v);
    }
    var ng = function (e) {
        ev(e);
        r.hide();
        if (cb_ng)
            cb_ng(null);
    }

    var onselch = function () {
        try {
            if (window.getSelection() + '')
                r.nofocus = 15;
        }
        catch (ex) { }
    };

    var onblur = function () {
        r.nofocus = 3;
    };

    var onfocus = function (e) {
        if (MOBILE)
            return;

        var ctr = ebi('modalc');
        if (!ctr || !ctr.contains || !document.activeElement || ctr.contains(document.activeElement))
            return;

        setTimeout(function () {
            if (--r.nofocus >= 0)
                return;

            if (ctr = ebi('modal-ok'))
                ctr.focus();
        }, 20);
        ev(e);
    };

    var onkey = function (e) {
        var k = (e.code || e.key) + '',
            eok = ebi('modal-ok'),
            eng = ebi('modal-ng'),
            ae = document.activeElement;

        if (k == 'Space' && ae && (ae === eok || ae === eng))
            k = 'Enter';

        if (k.endsWith('Enter')) {
            if (ae && ae == eng)
                return ng(e);

            return ok(e);
        }

        if ((k == 'ArrowLeft' || k == 'ArrowRight' || k == 'Left' || k == 'Right') && eng && (ae == eok || ae == eng))
            return (ae == eok ? eng : eok).focus() || ev(e);

        if (k == 'Escape' || k == 'Esc')
            return ng(e);
    }

    var next = function () {
        if (!r.busy && q.length)
            q.shift()();
    }

    r.alert = function (html, cb, fun) {
        q.push(function () {
            _alert(lf2br(html), cb, fun);
        });
        next();
    };
    var _alert = function (html, cb, fun) {
        cb_ok = cb_ng = cb;
        cb_up = fun;
        html += '<div id="modalb"><a href="#" id="modal-ok">OK</a></div>';
        r.show(html);
    }

    r.confirm = function (html, cok, cng, fun, btns) {
        q.push(function () {
            _confirm(lf2br(html), cok, cng, fun, btns);
        });
        next();
    }
    var _confirm = function (html, cok, cng, fun, btns) {
        cb_ok = cok;
        cb_ng = cng === undefined ? cok : cng;
        cb_up = fun;
        html += '<div id="modalb">' + (btns || ok_cancel) + '</div>';
        r.show(html);
    }

    r.prompt = function (html, v, cok, cng, fun, so0, so1) {
        q.push(function () {
            _prompt(lf2br(html), v, cok, cng, fun, so0, so1);
        });
        next();
    }
    var _prompt = function (html, v, cok, cng, fun, so0, so1) {
        cb_ok = cok;
        cb_ng = cng === undefined ? cok : null;
        cb_up = fun;
        sel_0 = so0 || 0;
        sel_1 = so1 === undefined ? v.length : so1;
        html += '<input id="modali" type="text" ' + NOAC + ' /><div id="modalb">' + ok_cancel + '</div>';
        r.show(html);

        ebi('modali').value = v || '';
    }

    return r;
})();


function winpopup(txt) {
    fetch(get_evpath(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: 'msg=' + uricom_enc(Date.now() + ', ' + txt)
    });
}


var last_repl = null;
function repl_load() {
    var ipre = ebi('repl_pre'),
        tb = ebi('modali');

    function getpres() {
        var o, ret = jread("repl_pre", []);
        if (!ret.length)
            ret = [
                'var v=Object.keys(localStorage); v.sort(); JSON.stringify(v)',
                "for (var a of QSA('#files a[id]')) a.setAttribute('download','')",
                'console.hist.slice(-50).join("\\n")'
            ];

        ipre.innerHTML = '<option value=""></option>';
        for (var a = 0; a < ret.length; a++) {
            o = mknod('option');
            o.setAttribute('value', ret[a]);
            o.textContent = ret[a];
            ipre.appendChild(o);
        }
        last_repl = ipre.value = (last_repl || (ret.length ? ret.slice(-1)[0] : ''));
        return ret;
    }
    ebi('repl_pdel').onclick = function (e) {
        var val = ipre.value,
            pres = getpres();

        apop(pres, val);
        jwrite('repl_pre', pres);
        getpres();
    };
    ebi('repl_pnew').onclick = function (e) {
        var val = tb.value,
            pres = getpres();

        apop(pres, ipre.value);
        pres.push(val);
        jwrite('repl_pre', pres);
        getpres();
        ipre.value = val;
    };
    ipre.oninput = ipre.onchange = function () {
        tb.value = last_repl = ipre.value;
    };
    tb.oninput = function () {
        last_repl = this.value;
    };
    getpres();
    tb.value = last_repl;
    setTimeout(function () {
        tb.setSelectionRange(0, tb.value.length, "forward");
    }, 10);
}
function repl(e) {
    ev(e);
    var html = [
        '<p>js repl (prefix with <code>,</code> to allow raise)</p>',
        '<p><select id="repl_pre"></select>',
        ' &nbsp; <button id="repl_pdel">❌ del</button>',
        ' &nbsp; <button id="repl_pnew">💾 SAVE</button></p>'
    ];

    modal.prompt(html.join(''), '', function (cmd) {
        if (!cmd)
            return toast.inf(3, 'eval aborted');

        cmd = unsmart(cmd);

        if (cmd.startsWith(',')) {
            evalex_fatal = true;
            return modal.alert(esc(eval(cmd.slice(1)) + ''));
        }

        try {
            modal.alert(esc(eval(cmd) + ''));
        }
        catch (ex) {
            modal.alert('<h6>exception</h6>' + esc(ex + ''));
        }
    }, undefined, repl_load);
}
if (ebi('repl'))
    ebi('repl').onclick = repl;


var md_plug = {};
var md_plug_err = function (ex, js) {
    if (ex)
        console.log(ex, js);
};
function load_md_plug(md_text, plug_type, defer) {
    if (defer)
        md_plug[plug_type] = null;

    if (plug_type == 'pre')
        try {
            md_text = md_thumbs(md_text);
        }
        catch (ex) {
            toast.warn(30, '' + ex);
        }

    if (!have_emp)
        return md_text;

    var find = '\n```copyparty_' + plug_type + '\n',
        md = '\n' + md_text.replace(/\r/g, '') + '\n',
        ofs = md.indexOf(find),
        ofs2 = md.indexOf('\n```', ofs + 1);

    if (ofs < 0 || ofs2 < 0)
        return md_text;

    var js = md.slice(ofs + find.length, ofs2 + 1);
    md = md.slice(0, ofs + 1) + md.slice(ofs2 + 4);
    md = md.replace(/$/g, '\r');

    if (defer) { // insert into sandbox
        md_plug[plug_type] = js;
        return md;
    }

    var old_plug = md_plug[plug_type];
    if (!old_plug || old_plug[1] != js) {
        js = 'const loc = new URL("' + location.href + '"), x = { ' + js + ' }; x;';
        try {
            var x = eval(js);
            if (x['ctor']) {
                x['ctor']();
                delete x['ctor'];
            }
        }
        catch (ex) {
            md_plug[plug_type] = null;
            md_plug_err(ex, js);
            return md;
        }
        md_plug[plug_type] = [x, js];
    }

    return md;
}
function md_thumbs(md) {
    if (!/(^|\n)<!-- th -->/.exec(md))
        return md;

    // `!th[flags](some.jpg)`
    // flags: nothing or "l" or "r"

    md = md.split(/!th\[/g);
    for (var a = 1; a < md.length; a++) {
        if (!/^[^\]!()]*\]\([^\][!()]+\)/.exec(md[a])) {
            md[a] = '!th[' + md[a];
            continue;
        }

        var o1 = md[a].indexOf(']('),
            o2 = md[a].indexOf(')', o1),
            alt = md[a].slice(0, o1),
            flags = alt.split(','),
            url = md[a].slice(o1 + 2, o2),
            float = has(flags, 'l') ? 'left' : has(flags, 'r') ? 'right' : '';

        if (!/[?&]cache/.exec(url))
            url = addq(url, 'cache=i');

        md[a] = '<a href="' + url + '" class="mdth mdth' + float.slice(0, 1) + '"><img src="' + url + '&th=w" alt="' + alt + '" /></a>' + md[a].slice(o2 + 1);
    }
    return md.join('');
}
function md_th_set() {
    var els = QSA('.mdth');
    for (var a = 0, aa = els.length; a < aa; a++)
        els[a].onclick = md_th_click;
}
function md_th_click(e) {
    ev(e);
    var url = this.getAttribute('href').split('?')[0];
    if (window.sb_md)
        window.parent.postMessage("imshow " + url, "*");
    else
        thegrid.imshow(url);
}


var svg_decl = '<?xml version="1.0" encoding="UTF-8"?>\n';


var favico = (function () {
    var r = {};
    r.en = true;
    r.tag = null;

    var gx = function (txt) {
        return (svg_decl +
            '<svg version="1.1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">\n' +
            (r.bg ? '<rect width="100%" height="100%" rx="16" fill="#' + r.bg + '" />\n' : '') +
            '<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"' +
            ' font-family="sans-serif" font-weight="bold" font-size="64px"' +
            ' fill="#' + r.fg + '">' + txt + '</text></svg>'
        );
    }

    r.upd = function (txt, svg) {
        if (!r.txt)
            return;

        var b64;
        try {
            b64 = btoa(svg ? svg_decl + svg : gx(r.txt));
        }
        catch (e1) {
            try {
                b64 = btoa(gx(encodeURIComponent(r.txt).replace(/%([0-9A-F]{2})/g,
                    function x(m, v) { return String.fromCharCode('0x' + v); })));
            }
            catch (e2) {
                try {
                    b64 = btoa(gx(unescape(encodeURIComponent(r.txt))));
                }
                catch (e3) {
                    return;
                }
            }
        }

        if (!r.tag) {
            r.tag = mknod('link');
            r.tag.rel = 'icon';
            document.head.appendChild(r.tag);
        }
        r.tag.href = 'data:image/svg+xml;base64,' + b64;
    };

    r.init = function () {
        clearTimeout(r.to);
        var dv = (window.dfavico || '').trim().split(/ +/),
            fg = dv.length < 2 ? 'fc5' : dv[1].toLowerCase() == 'none' ? '' : dv[1],
            bg = dv.length < 3 ? '222' : dv[2].toLowerCase() == 'none' ? '' : dv[2];

        scfg_bind(r, 'txt', 'icot', dv[0], r.upd);
        scfg_bind(r, 'fg', 'icof', fg, r.upd);
        scfg_bind(r, 'bg', 'icob', bg, r.upd);
        r.upd();
    };

    r.to = setTimeout(r.init, 100);
    return r;
})();


function cprop(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}


function bchrome() {
    var v, o = QS('meta[name=theme-color]');
    if (!o)
        return;

    try {
        v = cprop('--bg-u3');
    }
    catch (ex) { }
    o.setAttribute('content', v ? v : document.documentElement.className.indexOf('y') + 1 ? '#eee' : '#333');
}
bchrome();

var cf_cha_t = 0;
function xhrchk(xhr, prefix, e404, lvl, tag) {
    if (xhr.status < 400 && xhr.status >= 200)
        return true;

    if (tag === undefined)
        tag = prefix;

    var errtxt = ((xhr.response && xhr.response.err) || xhr.responseText) || '',
        suf = '',
        fun = toast[lvl || 'err'],
        is_cf = /[Cc]loud[f]lare|>Just a mo[m]ent|#cf-b[u]bbles|Chec[k]ing your br[o]wser|\/chall[e]nge-platform|"chall[e]nge-error|nable Ja[v]aScript and cook/.test(errtxt);

    if (errtxt.startsWith('<pre>'))
        suf = '\n\nerror-details: «' + unpre(errtxt).split('\n')[0].trim() + '»';
    else
        errtxt = esc(errtxt).slice(0, 32768);

    if (xhr.status == 403 && !is_cf)
        return toast.err(0, prefix + (L && L.xhr403 || "403: access denied\n\ntry pressing F5, maybe you got logged out") + suf, tag);

    if (xhr.status == 404)
        return toast.err(0, prefix + e404 + suf, tag);

    if (!xhr.status && !errtxt)
        return toast.err(0, prefix + L.xhr0);

    if (is_cf && (xhr.status == 403 || xhr.status == 503)) {
        var now = Date.now(), td = now - cf_cha_t;
        if (td < 15000)
            return;

        cf_cha_t = now;
        errtxt = 'Clou' + wah + 'dflare protection kicked in\n\n<strong>trying to fix it...</strong>';
        fun = toast.warn;

        qsr('#cf_frame');
        var fr = mknod('iframe', 'cf_frame');
        fr.src = SR + '/?cf_challenge';
        document.body.appendChild(fr);
    }

    return fun(0, prefix + xhr.status + ": " + errtxt, tag);
}
