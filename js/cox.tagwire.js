/*!
 *  TagWire 1.0.3 - coxcore.com
 *
 *  This library helps you on the data binds between Javascript object and HTML tags.
 *
 *  @author  Park U-yeong / cox.ascript
 *  @email   ascript0@gmail.com
 *  @update  2015.09.08 (since 2012.09)
 *  @license MIT
 */

(function(){
"use strict";

// module
var cox = window.cox || (window.cox = {});
// end of module


// module
cox.ready = function(fnc) {

    var eventType,
        listener;

    if (typeof fnc !== 'function') {
        return;
    }

    eventType = 'readystatechange';

    if (document.readyState === 'complete') {
        fnc();
        return;
    }

    if (document.addEventListener) {
        listener = function() {
            document.removeEventListener(eventType, listener, false);
            fnc();
        };

        document.addEventListener(eventType, listener, false);
    } else if (document.attachEvent) {
        eventType = 'on' + eventType;

        listener = function() {
            document.detachEvent(eventType, listener);
            fnc();
        };

        document.attachEvent(eventType, listener);
    }

};
// end of module


// module
cox.css = function(css) {

    var head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.setAttribute('type', 'text/css');

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);

};
// end of module


// module
cox.TagWire = (function() {


    // private property
    var G = 'global',
        H = '_',
        T = '-',
        A = {
            // head
            tmp : 'template',
            rev : 'reverse',
            td : 'topdown',
            bu : 'bottomup',
            tidx : 'tidx',
            idx : 'idx',
            idn : 'i',
            fix : 'fix',
            arr : 'array',
            itm : 'item',
            nw : 'new',
            od : 'old',
            rndr : 'render',
            blk : 'block',
            cpt : 'capture',
            cln : 'clone',
            hidn : 'hidden',

            obda : 'objdata',
            itda : 'itemdata',
            lida : 'listdata'
        },
        TA = {
            // tail
            list : 'list',
            ityp : 'itemtype',
            asc : 'async',
            itm : 'item'
        },
        V = {
            // script type
            sct : 'text/tw-template', // list template
            scc : 'text/tw-capture', // capture element

            // check
            catp : 'data|aria', // hyphen attribute
            skip : '\\d+(?=' + T + ')', // skip tail

            // temp head
            cls : 'c_', // find regex
            resf : 's_', // skip tail regex
            rep : 'r_', // replace value regex
            ree : 'e_', // event regex

            // temp vars
            hid : '_tw_'
        },
        EV = {
            all : '',
            ready : 'ready',
            finish : 'finish',
            complete : 'complete'
        },
        RE = {
            fe : /^\s+/,
            ityp : new RegExp('\\S*' + T + TA.ityp),
            hyp : new RegExp('^(?:' + V.catp + ')-\\S+'),
            fls : /^\s*(?:false|0|null|undefined|)\s*$/,
            rbl : /^_/,
            tail : new RegExp(T + '+[^\\' + T + ']+', 'g'),
            fix : new RegExp(H + A.fix + '(\\d+)'),
            amp : /&amp;/g,
            lt : /&lt;/g,
            gt : /&gt;/g
        };

    var instance,
        fn,
        plugins = {},
        tail = {},
        rx = {},
        rxl = 0;

    var _nitmCls = function(el) {
            setCls(el, A.nw, false);
            setCls(el, A.od, true);
        },
        _addTails = function(f, s) {
            tail[s] = f;
            return f;
        },
        _rmvTails = function(f, s) {
            delete tail[s];
            return f;
        },
        _afterShow = function(el) {
            setCls(el, A.hidn, false);
        },
        _rmvHidn = function(el) {
            if (hasCls(el, A.hidn)) {
                _afterShow(el);
            }

            each(findEl(el, A.hidn), _afterShow);
        };

    var check = document.createElement('span'),
        isTC = check.textContent === '',
        isSG = T !== '-',
        findAll,
        hasClass,
        setClass,
        hasCls,
        setCls,
        findEl,
        childEl,
        lastEl,
        attrList,
        checkEl;


    oeach(EV, function(v) {
        EV.all += (EV.all ? '|' : '') + v;
    });

    oeach(TA, function(v) {
        V.skip += (V.skip ? '|' : '') + v;
    });

    RE.ev = new RegExp(H + '([^\\' + T + ']+)' + T + '(?:' + EV.all + ')');


    /* CROSS BROWSING >> */
    (function() {

        var fsn;

        if (check.classList) {

            hasClass = function(t, c, b) {
                if (b) {
                    return t.className.indexOf(c) !== -1;
                } else {
                    return t.classList && t.classList.contains(c);
                }
            };

            setClass = function(t, c, b) {
                if (b) {
                    t.classList.add(c);
                } else {
                    t.classList.remove(c);
                }
            };

        } else {

            hasClass = function(t, c, b) {
                var reg;

                if (b) {
                    return t.className.indexOf(c) !== -1;
                } else {
                    reg = rx[c] || rxReg(c, new RegExp('(?:^|\\s)' + c + '(?:\\s|$)'));

                    return reg.test(t.className);
                }
            };

            setClass = function(t, c, b) {
                var cn = t.className,
                    reg;

                if (!b) {
                    reg = rx[c] || rxReg(c, new RegExp('(?:^|\\s+)' + c + '(?=\\s|$)'));

                    t.className = cn.replace(reg, '').replace(RE.fe, '');
                } else {
                    if (!hasCls(t, c)) {
                        t.className = !cn ? c : cn + ' ' + c;
                    }
                }
            };
        }


        hasCls = function(t, c, b) {
            return hasClass(t, H + c, b);
        };

        setCls = function(t, c, b) {
            setClass(t, H + c, b);
        };


        if (document.querySelectorAll) {

            findAll = function(t, c) {
                return t.querySelectorAll('.' + c);
            };

            findEl = function(t, s, b) {
                var sel;

                if (!s.indexOf('text/')) {
                    sel = 'script[type="' + s + '"]';
                } else {
                    sel = b ? '[class*=' + H + s + ']' : '.' + H + s;
                }

                return t.querySelectorAll(sel);
            };


            fsn = 0;

            childEl = function(t, s, b) {
                var eid = !t.id,
                    sel,
                    tar;

                if (eid) {
                    fsn = fsn ? ++fsn : 1;
                    t.id = V.hid + fsn;
                }

                if (!s.indexOf('text/')) {
                    sel = '#' + t.id + '>script[type="' + s + '"]';
                } else {
                    sel = b ? '#' + t.id + '>[class*=' + H + s + ']' : '#' + t.id + '>.' + H + s;
                }

                tar = t.querySelectorAll(sel);

                if (eid) {
                    t.id = '';
                    fsn--;
                }

                return tar;
            };

            lastEl = function(t, s, b) {
                var a = childEl(t, s, b),
                    l = a.length;

                return l ? a[l - 1] : null;
            };

            attrList = function(t) {
                return t.attributes;
            };

        } else {

            findAll = function(t, c) {
                var a = [],
                    ta = t.getElementsByTagName('*');

                each(ta, function(el) {
                    if (hasClass(el, c)) {
                        a.push(el);
                    }
                });

                return a;
            };

            findEl = function(t, s, b) {
                var a = [],
                    bs = !s.indexOf('text/'),
                    ta = t.getElementsByTagName(bs ? 'script' : '*'),
                    f;

                if (bs) {
                    f = function(el) {
                        if (el.type === s){
                            a.push(el);
                        }
                    };
                } else {
                    f = function(el) {
                        if (hasCls(el, s, b)) {
                            a.push(el);
                        }
                    };
                }

                each(ta, f);

                return a;
            };

            childEl = function(t, s, b) {
                var a = [],
                    f;

                if (!s.indexOf('text/')) {
                    f = function(el) {
                        if (el.type === s) {
                            a.push(el);
                        }
                    };
                } else {
                    f = function(el) {
                        if (hasCls(el, s, b)) {
                            a.push(el);
                        }
                    };
                }

                each(t.children, f);

                return a;
            };

            lastEl = function(t, s, b) {
                var a = t.children,
                    l = a.length;

                if (l) {
                    var i,
                        el;

                    for (i = l-1; i >= 0; i--) {
                        el = a[i];
                        if (hasCls(el, s, b)) {
                            return el;
                        }
                    }
                }

                return null;
            };

            RE.attl = /(?: )([^\s]+?)=(?:([\'\"]).*?\2|[^ ]+)/g;

            attrList = function(t) {
                var b = [],
                    s = t.cloneNode().outerHTML;

                s.replace(RE.attl, function(o, s) {
                    var ab = t.getAttributeNode(s).nodeValue;

                    if (typeof ab !== 'object') {
                        b.push(s);
                    }

                    return o;
                });

                return b;
            };
        }


        if (typeof HTMLElement === 'object') {

            checkEl = function(t) {
                return t instanceof HTMLElement;
            };

        } else {

            checkEl = function(t) {
                return !!t.nodeName;
            };

        }

    })();
    /* << CROSS BROWSING */


    // private function
    function afterShow(t) {
        if (!t) {
            return;
        }

        each(t, _rmvHidn);
    }

    function rendering(t, v, c, d) {
        var a = [];

        d.opt.evfns = [];

        if (d.ready) {
            d.ready({
                target : t,
                data : v,
                name : c,
                type : EV.ready
            });
        }

        // render inner tail
        render(t, v, c, a, d);

        // render custom tail
        each(a, function(ro) {
            try {
                ro.f(ro.t, ro.v, ro.c);
            } catch(e) {
                errorTail(e.message, ro.s);
            }
        });

        // finish
        each(d.opt.evfns, function(ro) {
            applyEvent(ro.t, ro.v, ro.c, d, EV.finish);
        });

        if (d.finish) {
            d.finish({
                target : t,
                data : v,
                name : c,
                type : EV.finish
            });
        }

        // complete
        if (!d.asyncNum) {
            setTimeout(function() {
                each(d.evcmp, function(ro) {
                    applyEvent(ro.t, ro.v, ro.c, d, EV.complete);
                });

                if (d.complete) {
                    d.complete(d.event);
                }
            }, 1);
        }
    }

    function asyncRendering(t, v, c, d) {
        d.asyncNum++;
        setTimeout(function() {
            d.opt = {
                async : true
            };
            d.asyncNum--;
            rendering(t, v, c, d);
        }, 1);
    }

    function render(t, o, c, ct, dt) {
        var f,
            iso,
            acls,
            isAsc;

        if (dt.skipReg && dt.skipReg.test(c)) {
            return;
        }

        if (o instanceof Array) {
            f = parseArr;
            iso = true;
        } else if (o !== null && typeof o === 'object') {
            f = parseObj;
            iso = true;
        } else {
            f = applyValue;
            iso = false;
        }

        acls = c + T + TA.asc;
        isAsc = dt.opt.async;
        dt.opt.async = null;

        each(t, function(el) {
            if (!hasCls(el, A.blk)) {
                if (iso && !isAsc && hasCls(el, acls)) {
                    asyncRendering(el, o, c, dt);
                } else {
                    f(el, o, c, ct, dt);
                }
            }
        });
    }

    function parseArr(t, a, c, ct, dt) {
        var cl,
            l,
            f,
            fe;

        if (!hasCls(t, c)) {
            each(findEl(t, c), function(tc) {
                render(tc, a, c, ct, dt);
            });

            return;
        }

        cl = c + T + TA.list;
        l = a.length;

        f = function(ta) {
            if (applyEvent(ta, a, c, dt, EV.ready) !== false) {
                applyValue(ta, l, c, ct, dt); // set array length

                if (hasCls(ta, cl)) {
                    fe(ta);
                }

                each(findEl(ta, cl), fe);

                if (hasCls(ta, A.arr)) {
                    setArr(ta, a, c, ct, dt);
                }
            }

            applyFinish(ta, a, c, dt);
        };

        fe = function(el) {
            setList(el, a, c, ct, dt);
        };

        each(t, f);
    }

    function setArr(t, a, c, ct, dt) {
        var i,
            len = a.length;

        for (i = 0; i < len; i++) {
            applyValue(t, a[i], c + T + i, ct, dt);
        }
    }

    function setList(t, a, c, ct, dt) {
        var sc = childEl(t, V.sct);

        if (sc.length) {
            setItem(t, sc, a, c, ct, dt);
        }

        applyValue(t, a, A.lida, ct, dt, true); // set array data
    }

    function setItem(t, sc, a, c, ct, dt) {

        var len = a.length - 1,
            rev = hasCls(t, A.rev),
            ist = hasCls(t, A.td),
            isb = hasCls(t, A.bu),
            typ = ist ? A.td : (isb ? A.bu : null),
            pe = isb ? sc[sc.length - 1] : lastEl(t, A.itm),
            lfn = function(tmp) {
                var vn = tmp._tw_varsName,
                    idx,
                    tv,
                    tag;

                if (otl === undefined) {
                    otl = tmp._tw_tlen;
                }

                if (v) {
                    tv = (typeof tmp._tw_itemType === 'boolean') ? Boolean(v[vn]) : v[vn];
                } else {
                    tv = null;
                }

                if (isEmpty(vn) || !v.hasOwnProperty(vn) || tmp._tw_itemType === tv) {
                    tag = cloneNode(tmp._tw_template);
                    idx = tn + gi * way + 1;

                    applyValue(tag, gi, A.idn, ct, dt); // set item index
                    applyValue(tag, idx, A.idx, ct, dt); // set item sequence
                    applyValue(tag, otl + idx, A.tidx, ct, dt); // set item unique sequence

                    if (applyEvent(tag, v, c, dt, EV.ready) !== false) {
                        render(tag, v, A.itm, ct, dt); // render item data
                        applyValue(tag, v, A.itda, ct, dt, true); // set item data

                        if (!tag._remove) {
                            t.insertBefore(tag, pe);
                            tmp._tw_tlen++;
                        }
                    }

                    applyFinish(tag, v, c, dt);
                }
            };

        var way,
            tn,
            otl,
            v,
            gi;

        c = c + T + TA.itm;

        if (!pe) {
            pe = sc[sc.length - 1];
        }

        pe = pe.nextSibling;

        if (isb) {
            way = -1;
            tn = len;
        } else {
            way = 1;
            tn = 0;
        }

        each(childEl(t, A.nw), _nitmCls);

        for (gi = 0; gi <= len; gi++) {
            v = a[rev ? len - gi : gi];

            each(sc, lfn);
        }

        if (!typ) {
            each(findEl(t, A.od), function(el) {
                t.removeChild(el);
            });
        }

        t.className.replace(RE.fix, function(o, n) {
            var itm = childEl(t, A.itm),
                ln = itm.length;

            n = Number(n);

            if (n < ln) {
                each(itm, function(el, i) {
                    if (isb) {
                        if (i >= n) {
                            t.removeChild(el);
                        }
                    } else {
                        if (i < ln - n) {
                            t.removeChild(el);
                        }
                    }
                });
            }

            return o;
        });
    }

    function parseObj(t, o, c, ct, dt) {
        var itm = c === A.itm,
            vo,
            te,
            s;

        if (c === G) {
            t = document.body;
        }

        if (itm || applyEvent(t, o, c, dt, EV.ready) !== false) {
            for (s in o) {
                if (o.hasOwnProperty(s) && s !== G) {
                    vo = o[s];

                    if (typeOf(vo) === 'object') {
                        te = t;
                        if (hasCls(te, s) || (te = findEl(t, s)).length) {
                            render(te, vo, s, ct, dt);
                        }
                    } else {
                        render(t, vo, s, ct, dt);
                    }
                }
            }
        }

        if (!itm) {
            applyFinish(t, o, c, dt);
        }

        if (hasCls(t, A.obda, true)) {
            applyValue(t, o, A.obda, ct, dt, true); // set object
        }

        vo = o.global;

        if (vo) {
            if (applyEvent(document.body, vo, G, dt, EV.ready) !== false) {
                render(document.body, vo, G, ct, dt); // render global object
            }

            applyFinish(document.body, vo, G, dt);
        }
    }

    function applyValue(t, v, c, ct, dt, slf) {
        var te = t,
            f = function(s, fs) {
                if (RE.hyp.test(fs) || isSG) {
                    fcall(te, v, c, fs, ct, dt);
                } else {
                    (T + fs).replace(RE.tail, ff);
                }

                return s;
            },
            ff = function(fss) {
                fcall(te, v, c, fss.substr(1), ct, dt);
                return '';
            };

        if (hasCls(t, c + T, true)) {
            t.className.replace(reValue(c), f);
        }

        if (!slf) {
            each(findEl(t, c + T, true), function(el) {
                te = el;
                te.className.replace(reValue(c), f);
            });
        }
    }

    function reValue(c) {
        return rx[V.resf + c] || rxReg(
                V.resf + c,
                new RegExp('(?:^|\\s)' + H + c + T + '(?!' + V.skip + '|' + EV.all + ')(\\S+)', 'g')
            );
    }

    function applyEvent(t, v, c, dt, ev, slf) {
        var bln = null,
            te = t,
            f = function(s, fs) {
                if (bln !== false) {
                    if (RE.hyp.test(fs) || isSG) {
                        bln = fcall(te, v, c, fs, null, dt);
                    } else {
                        (T + fs).replace(RE.tail, ff);
                    }
                }

                return s;
            },
            ff = function(fss) {
                if (fcall(te, v, c, fss.substr(1), null, dt) === false) {
                    bln = false;
                }

                return '';
            };

        c = c + T + ev;

        if (hasCls(t, c + T, true)) {
            t.className.replace(reEvent(c), f);
        }

        if (!slf) {
            each(findEl(t, c + T, true), function(el) {
                te = el;
                te.className.replace(reEvent(c), f);
            });
        }
        return bln;
    }

    function reEvent(c) {
        return rx[V.ree + c] || rxReg(
                V.ree + c,
                new RegExp('(?:^|\\s)' + H + c + T + '(?!' + V.skip + ')(\\S+)', 'g')
            );
    }

    function applyFinish(t, v, c, dt) {
        dt.opt.evfns.push({
            t : t,
            v : v,
            c : c
        });

        dt.evcmp.push({
            t : t,
            v : v,
            c : c
        });
    }

    function fcall(t, v, c, s, ct, dt) {
        var f = fn[s],
            tf = tail[s];

        if (f) {
            try {
                return tf ? tf(t, v, c) : f(t, v, c, dt);
            } catch(e) {
                errorTail(e.message, s);
            }
        } else if (tf) {
            if (!ct) {
                try {
                    return tf(t, v, c);
                } catch(e) {
                    errorTail(e.message, s);
                }
            } else {
                ct.push({
                    t : t,
                    v : v,
                    c : c,
                    s : s,
                    f : tf
                });
            }
        } else {
            setAttr(t, v, s);
        }
    }

    function initTmp(t) {
        if (!t) {
            t = document.body;
        }

        each(findEl(t, A.cpt), initCapture);
        each(findEl(t, A.tmp), initTemplate);
    }

    function initTemplate(t) {
        var scr = document.createElement('script'),
            cls = t.className,
            tcls;

        setCls(t, A.tmp, false);
        setCls(t, A.od, false);
        setCls(t, A.itm, true);
        setCls(t, A.nw, true);

        scr.setAttribute('type', V.sct);

        if (cls) {
            tcls = RE.ityp.exec(cls);

            if (tcls) {
                scr._tw_itemType = t.getAttribute('data-' + TA.ityp);

                if (scr._tw_itemType === 'true') {
                    scr._tw_itemType = true;
                } else if (scr._tw_itemType === 'false') {
                    scr._tw_itemType = false;
                }

                scr._tw_varsName = tcls[0].replace(T + TA.ityp, '').substr(1);
            }
        }

        scr._tw_tlen = 0;
        scr._tw_template = t;
        t._tw_targetScr = scr;
        t.parentNode.replaceChild(scr, t);
    }

    function initCapture(t) {
        var scr,
            tc;

        setCls(t, A.cln, true);
        setCls(t, A.cpt, false);

        tc = cloneNode(t);
        tc.style.display = '';

        scr = t.previousSibling;

        if (!scr || scr.type !== V.scc) {
            scr = document.createElement('script');
            scr.setAttribute('type', V.scc);
            t.parentNode.insertBefore(scr, t);
        }

        scr._tw_template = tc;
    }

    function cloneNode(t) {
        var tc = t.cloneNode(true),
            tca = tc.getElementsByTagName('script');

        var tag,
            scr;

        each(t.getElementsByTagName('script'), function(sc, i) {
            tag = sc._tw_template;

            if (tag) {
                scr = tca[i];
                scr._tw_template = tag;

                if (sc._tw_itemType !== undefined) {
                    scr._tw_itemType = sc._tw_itemType;
                }

                if (sc._tw_varsName !== undefined) {
                    scr._tw_varsName = sc._tw_varsName;
                }

                if (sc._tw_tlen !== undefined) {
                    scr._tw_tlen = 0;
                }
            }
        });

        return tc;
    }

    function setAttr(t, v, s) {
        if (!isEmpty(v)) {
            var fs = s.replace(RE.rbl, ''),
                rb = s !== fs;

            if (typeof t[fs] === 'boolean') {
                t[fs] = rb ? !getBln(v) : getBln(v);
            } else if (t[fs] !== undefined || t.getAttribute(fs) !== null || RE.hyp.test(fs)) {
                t.setAttribute(fs, v);
            }
        }
    }

    function each(a, f) {
        var i,
            l;

        if (a && f) {
            if (a.length === undefined || a.getAttribute) {
                return f(a);
            } else {
                for (i = 0, l = a.length; i < l; i++) {
                    if (f(a[i], i) === false) {
                        return false;
                    }
                }
            }
        }
    }

    function oeach(o, f) {
        var s;

        if (o && f) {
            for (s in o) {
                if (o.hasOwnProperty(s) && f(o[s], s) === false) {
                    return false;
                }
            }
        }
    }

    function typeOf(o) {
        if (o === null) {
            return 'null';
        }

        return o instanceof Array ? 'array' : typeof o;
    }

    function getBln(v) {
        switch (typeOf(v)) {
            case 'array' :
                return Boolean(v.length);
            case 'object' :
                return Boolean(v);
            default :
                return !RE.fls.test(v);
        }
    }

    function isEmpty(v) {
        return v === null || v === undefined;
    }

    function clog() {
        var console = window.console;
        if (console && console.log) {
            if (typeof console.log.apply === 'function') {
                console.log.apply(console, arguments);
            } else {
                console.log(arrJoin(arguments));
            }
        }
    }

    function cerror() {
        var console = window.console;
        if (console && typeof console.error === 'function') {
            console.error.apply(console, arguments);
        } else {
            clog(arrJoin(arguments));
        }
    }

    function errorTail(m, s) {
        cerror('[TagWire.tail.' + s + ']  ' + m + '.');
        throw(new Error('TagWire rendering was aborted because of [TagWire.tail.' + s + '] error.'));
    }

    function arrJoin(a, p) {
        var s = '';

        p = p || ' ';

        each(a, function(v) {
            s += (!s ? '' : p) + v;
        });

        return s;
    }

    function rxReg(name, reg) {
        return ++rxl && (rx[name] = reg);
    }


    // TagWire Instance
    instance = {

        // public property
        tail: tail,


        // public function
        render: function(t, o, c) {
            var otp,
                vo,
                asc,
                op,
                os,
                oo;

            initTmp();

            if (rxl > 500) {
                rxl = 0;
                rx = {};
            }

            otp = typeOf(o) === 'object';

            if (!t || t.length === 0 || (!c && (!o || !otp))) {
                return;
            }

            asc = false;
            op = {
                opt: {},
                evcmp: []
            };

            switch (typeOf(c)) {
                case 'boolean' :
                    asc = c;
                    c = A.rndr;
                    break;

                case 'undefined' || 'null' || 'number' :
                    c = A.rndr;
                    break;

                case 'object' :
                    asc = Boolean(c.async);

                    if (otp && c.select) {
                        oo = o;
                        o = {};

                        each(c.select.split(' '), function (s) {
                            os = oo[s];

                            if (os !== undefined) {
                                o[s] = os;
                            }
                        });
                    }

                    if (c.skip) {
                        op.skipReg = new RegExp(c.skip.replace(/ +/g, '|'));
                    }

                    op.complete = c.complete;
                    op.ready = c.ready;
                    op.finish = c.finish;
                    c = c.varsName || A.rndr;
                    break;

                default :
            }

            if (c === G) {
                t = document.body;
            }

            if (!otp || c !== A.rndr) {
                vo = {};
                vo[c] = o;
            } else {
                vo = o;
            }

            op.asyncNum = 0;
            op.event = {
                target: t,
                data: vo,
                name: c,
                type: EV.complete
            };

            if (asc) {
                asyncRendering(t, vo, A.rndr, op);
            } else {
                rendering(t, vo, A.rndr, op);
            }

            afterShow(t);

            return o;
        },

        callTail: function(fs, t, v, c) {
            each(t, function (el) {
                fcall(el, v, c, fs);
            });
        },

        innerTail: function(s, f, b) {
            if (!b && typeof fn[s] === 'function') {
                throw(new Error('[TagWire.innerTail] "' + s + '" is already in use.'));
            } else {
                fn[s] = f;
            }
        },

        addTails: function(o) {
            oeach(o, _addTails);
        },

        removeTails: function(o) {
            oeach(o, _rmvTails);
        },

        initTemplate: function(t) {
            each(t, initTmp);
        },

        cloneNode: function(t) {
            var tc = null;

            each(t, function(el) {
                tc = cloneNode(el);
                return false;
            });

            return tc;
        },

        plugin: function(name, fnc) {
            var type = typeof fnc;

            if (!name && name !== 'string') {
                return false;
            }

            if (type === 'boolean' && fnc) {
                plugins[name] = true;
                return true;
            }

            if (type === 'function') {
                plugins[name] = fnc;
                return false;
            } else {
                fnc = plugins[name];
                return fnc === true || typeof fnc === 'function' && fnc();
            }
        },

        checkBoolean: getBln,
        each: each,
        oeach: oeach,
        typeOf: typeOf,
        isEmpty: isEmpty,
        log: clog,
        error: cerror

    };



    // private tail
    fn = {

        attr: function(t, v, c) {
            var s,
                r,
                pv;

            if (typeof c !== 'string' || isEmpty(v)) {
                return;
            }

            s = '#' + c + '#';
            r = rx[V.rep + c] || rxReg(V.rep + c, new RegExp(s, 'g'));

            each(attrList(t), function(p) {
                p = p.name || p;
                pv = t.getAttribute(p);

                if (typeof pv === 'string' && pv.indexOf(s) !== -1) {
                    t.setAttribute(p, pv.replace(r, v));
                }
            });
        },

        insert: function(t, v, c) {
            var s,
                r,
                tv,
                sv;

            if (typeof c !== 'string' || isEmpty(v)) {
                return;
            }

            s = '#' + c + '#';
            r = rx[V.rep + c] || rxReg(V.rep + c, new RegExp(s, 'g'));

            check.innerHTML = v;
            sv = check.innerHTML.
                replace(RE.amp, '&').
                replace(RE.lt, '<').
                replace(RE.gt, '>');
            check.innerHTML = '';

            each(t.childNodes, function (el) {
                if (el.nodeName === '#text') {
                    tv = el.nodeValue;

                    if (tv.indexOf(s) !== -1) {
                        el.nodeValue = tv.replace(r, sv);
                    }
                }
            });
        },


        replace: function(t, v, c) {
            var s,
                r;

            if (typeof c !== 'string' || isEmpty(v)) {
                return;
            }

            s = '#' + c + '#';
            r = rx[V.rep + c] || rxReg(V.rep + c, new RegExp(s, 'g'));

            t.innerHTML = t.innerHTML.replace(r, v);
        },


        text: isTC ?
            function(t, v) {
                if (!isEmpty(v)) {
                    t.textContent = v;
                }
            }:
            function(t, v) {
                if (!isEmpty(v)) {
                    t.innerText = v;
                }
            },


        html: function (t, v) {
            if (!isEmpty(v)) {
                t.innerHTML = v;
            }
        },


        val: function(t, v) {
            if (!isEmpty(v)) {
                t.value = v;
            }
        },


        data: function(t, v, c) {
            if (typeof c === 'string' && !isEmpty(v)) {
                t.setAttribute('data-' + c, v);
            }
        },


        dt: function(t, v, c) {
            if (typeof c === 'string' && !isEmpty(v)) {
                if (!t.attrData) {
                    t.attrData = {};
                }

                t.attrData[c] = v;
            }
        },


        show: function(t, v) {
            t.style.display = getBln(v) ? '' : 'none';
        },


        hide: function(t, v) {
            fn.show(t, !getBln(v));
        },


        keep: function(t, v) {
            if (!getBln(v)) {
                if (t.parentNode) {
                    t.parentNode.removeChild(t);
                } else {
                    t.innerHTML = '';
                    t._remove = true;
                }
            }
        },


        remove: function(t, v) {
            fn.keep(t, !getBln(v));
        },


        setClass: function(t, v, c) {
            setClass(t, c, getBln(v));
        },


        _setClass: function(t, v, c) {
            setClass(t, c, !getBln(v));
        },


        addClass: function(t, v) {
            if(typeof v === 'string') {
                setClass(t, v, true);
            }
        },


        removeClass: function(t, v) {
            if(typeof v === 'string') {
                setClass(t, v, false);
            }
        },


        restore: function(t, v) {
            var scr = t.previousSibling;

            if (scr && scr.type === V.scc && getBln(v)) {
                t.parentNode.replaceChild(cloneNode(scr._tw_template), t);
            }
        },


        _restore: function(t, v) {
            fn.restore(t, !getBln(v));
        },


        restoreAttr: function(t, v) {
            var scr = t.previousSibling,
                tag;

            if (scr && scr.type === V.scc && getBln(v)) {
                tag = scr._tw_template;

                each(attrList(tag), function(p) {
                    p = p.name;
                    t.setAttribute(p, tag.getAttribute(p));
                });
            }
        },


        _restoreAttr: function(t, v) {
            fn.restoreAttr(t, !getBln(v));
        },


        restoreText: function(t, v) {
            var scr = t.previousSibling,
                arr,
                id;

            if (scr && scr.type === V.scc && getBln(v)) {
                arr = [];
                id = 0;

                each(t.childNodes, function(el) {
                    if (el.nodeName === '#text') {
                        arr.push(el);
                    }
                });

                each(scr._tw_template.childNodes, function (el) {
                    if (el.nodeName === '#text') {
                        arr[id++].nodeValue = el.nodeValue;
                    }
                });
            }
        },


        _restoreText: function(t, v) {
            fn.restoreText(t, !getBln(v));
        },


        restoreHtml: function(t, v) {
            var scr = t.previousSibling;

            if (scr && scr.type === V.scc && getBln(v)) {
                t.innerHTML = scr._tw_template.innerHTML;
            }
        },


        _restoreHtml: function(t, v) {
            fn.restoreHtml(t, !getBln(v));
        },


        restoreChild: function(t, v) {
            var tag,
                chk,
                bln = getBln(v);

            each(childEl(t, V.scc), function(sc) {
                tag = sc.nextSibling;
                chk = !tag || !hasCls(tag, A.cln);

                if (chk && bln) {
                    sc.parentNode.insertBefore(cloneNode(sc._tw_template), sc.nextSibling);
                }
            });
        },


        _restoreChild: function(t, v) {
            fn.restoreChild(t, !getBln(v));
        },


        render: function(t, v) {
            instance.render(t, v);
            return false;
        },


        log: function(t, v, c) {
            clog('[TagWire:' + H + c + T + 'log]', '\n - target :', t, '\n - value :' , v);
        }


    };


    // init
    (function() {
        var style = [
            '  /* CSS for TagWire */  ',
                '.' + H + A.tmp + ',',
                '.' + H + A.cpt + ',',
                '.' + H + A.hidn,
            '{display:none;}  '
        ].join('');

        cox.css(style);
        cox.ready(initTmp);

        window.TagWire = window.TagWire || instance;
    })();


    return instance;


})();
// end of module


// module
(function plugin() {

    var TagWire = window.TagWire;
    var $ = window.jQuery;


    if (!TagWire) {
        return;
    }

    if (!$) {
        TagWire.plugin('jQuery', plugin);
        return false;
    } else {
        TagWire.plugin('jQuery', true);
    }


    // override tagwire tail
    TagWire.innerTail('data', function(t, v, c) {
        $(t).data(c, v);
    }, true);


    // tagwire plugin
    $.fn.tagwire = function(v, o) {
        TagWire.render(this, v, o);
        return this;
    };


    // extra plugins
    addPlugin('render', $.fn.tagwire);

    addPlugin('callTail', function(fn, v, c) {
        TagWire.callTail(this, fn, v, c);
        return this;
    });

    addPlugin('initTemplate', function() {
        TagWire.initTemplate(this);
        return this;
    });

    addPlugin('copyNode', function() {
        return $(TagWire.cloneNode(this));
    });

    addPlugin('loadAndRender', function(u, o) {
        var $this = this,
            ax,
            fn,
            efn;

        ax = {
            dataType : 'json',
            success : function(v) {
                if (typeof fn === 'function') {
                    fn(v);
                }

                TagWire.render($this, v, o);
            },
            error : function(e) {
                if (typeof efn === 'function') {
                    efn(e);
                }

                TagWire.error(
                    '[TagWire:loadAndRender]  JSON Parse Error : "' + ax.url + '"\n\n',
                    e.responseText
                );
            }
        };

        if (typeof u === 'string') {
            ax.url = u;
        } else {
            fn = u.success;
            efn = u.error;
            ax = $.extend({}, u, ax);
        }

        $.ajax(ax);

        return this;
    });


    function addPlugin(name, fnc) {
        var jfn = $.fn;

        if (jfn[name] === undefined) {
            jfn[name] = fnc;
        }
    }

    return true;

})();
// end of module


})();
