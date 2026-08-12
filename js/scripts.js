/* =========================================================
   Eymistaken's HUD — site behaviour

   Each init* function is independent and no-ops when the
   elements it needs are not on the page.
   ========================================================= */

(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -----------------------------------------------------
       Mobile navigation
       ----------------------------------------------------- */
    function initNav() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var panel  = document.getElementById('nav-panel');
        if (!toggle || !panel) return;

        function setOpen(open) {
            toggle.setAttribute('aria-expanded', String(open));
            panel.classList.toggle('is-open', open);
        }

        toggle.addEventListener('click', function () {
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });

        panel.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                toggle.focus();
            }
        });

        // The panel is a mobile affordance; widening past the breakpoint
        // hides it in CSS, so drop the open state with it.
        window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
            if (e.matches) setOpen(false);
        });
    }

    /* -----------------------------------------------------
       Table of contents — scroll spy + sliding indicator
       ----------------------------------------------------- */
    function initToc() {
        var toc = document.querySelector('[data-toc]');
        if (!toc) return;

        var bar   = toc.querySelector('.toc__bar');
        var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
        if (!links.length) return;

        var sections = links.map(function (link) {
            return document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
        });

        var active = null;
        var frame  = null;

        function apply(id) {
            if (id === active) return;
            active = id;

            links.forEach(function (link, i) {
                var isCurrent = sections[i] && sections[i].id === id;
                if (isCurrent) {
                    link.setAttribute('aria-current', 'true');
                    if (bar) {
                        bar.style.top    = link.offsetTop + 'px';
                        bar.style.height = link.offsetHeight + 'px';
                    }
                    // Keep the active chip in view on the horizontal rail.
                    if (toc.scrollWidth > toc.clientWidth) {
                        var left = link.offsetLeft - (toc.clientWidth - link.offsetWidth) / 2;
                        toc.scrollTo({ left: left, behavior: reducedMotion ? 'auto' : 'smooth' });
                    }
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        function sync() {
            if (frame) return;
            frame = requestAnimationFrame(function () {
                frame = null;

                var current = sections[0];
                sections.forEach(function (section) {
                    if (section && section.getBoundingClientRect().top <= 140) current = section;
                });

                // The last section is often too short to ever reach the
                // trigger line, so pin to it once the page bottoms out.
                if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
                    current = sections[sections.length - 1];
                }

                if (current) apply(current.id);
            });
        }

        window.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', function () {
            active = null; // offsets moved — force a re-measure
            sync();
        });
        sync();
    }

    /* -----------------------------------------------------
       Code highlighting

       Deliberately shallow: comments, strings, annotations,
       keywords and numbers. No type or member colouring —
       the point is to make structure skimmable, not to turn
       the page into a rainbow.
       ----------------------------------------------------- */
    function initHighlight() {
        var TOKEN = new RegExp([
            '(\\/\\/[^\\n]*)',                              // 1 line comment
            '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')', // 2 string
            '(@[A-Za-z]\\w*)',                              // 3 annotation
            '\\b(public|private|protected|class|interface|implements|extends|' +
              'new|return|void|static|final|import|package|if|else|for|while|' +
              'boolean|int|float|double|long|char|this|super|null|true|false)\\b', // 4 keyword
            '\\b(0[xX][0-9A-Fa-f]+|\\d+)\\b'                // 5 number
        ].join('|'), 'g');

        var CLASS = { 1: 'cm', 2: 'str', 3: 'cm', 4: 'kw', 5: 'num' };

        function highlight(textNode) {
            var text = textNode.nodeValue;
            TOKEN.lastIndex = 0;
            if (!TOKEN.test(text)) return;
            TOKEN.lastIndex = 0;

            var frag = document.createDocumentFragment();
            var last = 0;
            var m;

            while ((m = TOKEN.exec(text)) !== null) {
                if (m.index > last) {
                    frag.appendChild(document.createTextNode(text.slice(last, m.index)));
                }
                var group = 0;
                for (var i = 1; i <= 5; i++) { if (m[i] !== undefined) { group = i; break; } }

                var span = document.createElement('span');
                span.className = CLASS[group];
                span.textContent = m[0];
                frag.appendChild(span);
                last = m.index + m[0].length;
            }
            if (last < text.length) {
                frag.appendChild(document.createTextNode(text.slice(last)));
            }
            textNode.parentNode.replaceChild(frag, textNode);
        }

        document.querySelectorAll('.codeblock pre code').forEach(function (code) {
            // Walk a static list: highlight() swaps nodes out as it goes, and
            // only direct text children are touched, so existing elements
            // (such as the release link in the Gradle snippet) survive.
            var nodes = [];
            for (var n = code.firstChild; n; n = n.nextSibling) {
                if (n.nodeType === 3) nodes.push(n);
            }
            nodes.forEach(highlight);
        });
    }

    /* -----------------------------------------------------
       Copy buttons on code blocks
       ----------------------------------------------------- */
    function initCopy() {
        document.querySelectorAll('.codeblock .copy-btn').forEach(function (btn) {
            var block = btn.closest('.codeblock');
            var pre   = block && block.querySelector('pre');
            if (!pre) return;

            function flash(ok) {
                clearTimeout(btn._timer);
                btn.classList.toggle('is-done', ok);
                btn.classList.toggle('is-failed', !ok);
                btn._timer = setTimeout(function () {
                    btn.classList.remove('is-done', 'is-failed');
                }, 1600);
            }

            // execCommand still covers file:// and older WebViews, where
            // the async clipboard API is unavailable or rejects outright.
            function legacyCopy(text) {
                try {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
                    document.body.appendChild(ta);
                    ta.select();
                    var ok = document.execCommand('copy');
                    document.body.removeChild(ta);
                    flash(ok);
                } catch (err) {
                    flash(false);
                }
            }

            btn.addEventListener('click', function () {
                var text = pre.innerText;
                if (!navigator.clipboard || !navigator.clipboard.writeText) {
                    legacyCopy(text);
                    return;
                }
                navigator.clipboard.writeText(text).then(function () {
                    flash(true);
                }).catch(function () {
                    legacyCopy(text);
                });
            });
        });
    }

    /* -----------------------------------------------------
       Demo clips

       The seven demos total roughly 265 MB, so nothing is
       fetched until it is close to the viewport, and phones,
       data-saver and reduced-motion get an explicit play
       button instead of autoplay.
       ----------------------------------------------------- */
    function initMedia() {
        var figures = Array.prototype.slice.call(document.querySelectorAll('.media[data-media]'));
        if (!figures.length) return;

        var conn     = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var saveData = !!(conn && conn.saveData);

        // Clips load and play on their own everywhere. The only two opt-outs
        // are explicit visitor settings: Data Saver, and reduced motion (a
        // looping clip is motion the visitor asked not to be given).
        var autoplay = !saveData && !reducedMotion;

        var playing = null;

        function load(video) {
            if (video.dataset.src) {
                var figure = video.closest('.media');
                if (figure) figure.classList.add('is-loading');
                video.preload = 'auto';
                video.src = video.dataset.src;
                delete video.dataset.src;
            }
        }

        function play(figure, video) {
            load(video);
            if (playing && playing !== video) playing.pause();
            playing = video;
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    // Autoplay refused — fall back to the manual control.
                    figure.classList.remove('is-playing');
                });
            }
        }

        figures.forEach(function (figure) {
            var video = figure.querySelector('video');
            var btn   = figure.querySelector('.media__play');

            if (!video) return; // still image demo — plain lazy <img>

            var label = figure.querySelector('.media__label');
            var title = label ? label.textContent.replace(/^Loading\s+/i, '') : 'demo';

            // Frames are running: drop the overlay.
            video.addEventListener('playing', function () {
                figure.classList.remove('is-loading');
                figure.classList.add('is-ready', 'is-playing');
            });

            // Ran dry mid-clip on a slow line: bring the spinner back rather
            // than sitting on a frozen frame with no explanation.
            video.addEventListener('waiting', function () {
                figure.classList.add('is-loading');
                if (label) label.textContent = 'Buffering ' + title;
            });

            video.addEventListener('error', function () {
                // Say so plainly instead of spinning forever.
                video.style.display = 'none';
                figure.classList.remove('is-loading', 'is-ready', 'is-playing');
                figure.classList.add('is-failed');
                if (label) label.textContent = title + ' unavailable';
                if (btn) btn.hidden = true;
            });

            if (btn) {
                btn.hidden = autoplay;
                btn.addEventListener('click', function () {
                    video.controls = true; // give them a way to stop it again
                    play(figure, video);
                });
            }
        });

        // Start fetching this far outside the viewport, so a clip has a head
        // start on a slow line and is usually running by the time it is read.
        var PRELOAD_MARGIN = 800;

        // How many pixels of this element are actually on screen.
        function visibleArea(el) {
            var r  = el.getBoundingClientRect();
            var vh = window.innerHeight || document.documentElement.clientHeight;
            var vw = window.innerWidth  || document.documentElement.clientWidth;
            var h  = Math.min(r.bottom, vh) - Math.max(r.top, 0);
            var w  = Math.min(r.right, vw) - Math.max(r.left, 0);
            if (h <= 0 || w <= 0) return 0;
            return h * w;
        }

        function nearViewport(el) {
            var r  = el.getBoundingClientRect();
            var vh = window.innerHeight || document.documentElement.clientHeight;
            return r.bottom > -PRELOAD_MARGIN && r.top < vh + PRELOAD_MARGIN;
        }

        // Exactly one clip runs at a time: the one occupying the most screen.
        // Comparing visible area rather than each element's own intersection
        // ratio is what stops a short neighbour from winning over the clip
        // the reader is actually looking at.
        function selectActive() {
            var best = null, bestArea = 0;

            figures.forEach(function (figure) {
                var area = visibleArea(figure);

                if (autoplay && nearViewport(figure)) load(figure.querySelector('video'));

                if (area > bestArea) { bestArea = area; best = figure; }
            });

            // Ignore a winner that is only just peeking into view.
            if (best) {
                var rect = best.getBoundingClientRect();
                var full = rect.width * rect.height;
                if (full > 0 && bestArea / full < 0.35) best = null;
            }

            figures.forEach(function (figure) {
                var video = figure.querySelector('video');
                if (!video) return;

                if (figure === best) {
                    if (autoplay) play(figure, video);
                    return;
                }

                // A clip the reader started by hand keeps running until it
                // leaves the viewport outright.
                if (video.controls && visibleArea(figure) > 0) return;

                video.pause();
                if (playing === video) playing = null;
                if (!video.controls) figure.classList.remove('is-playing');
            });
        }

        var frame = null;
        function schedule() {
            if (frame) return;
            frame = requestAnimationFrame(function () {
                frame = null;
                selectActive();
            });
        }

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        selectActive();
    }

    /* -----------------------------------------------------
       Interactive HUD preview (home hero)
       ----------------------------------------------------- */
    function initHudPreview() {
        var hud = document.getElementById('hud-preview');
        if (!hud) return;

        var cpsEl   = hud.querySelector('[data-cps]');
        var comboEl = hud.querySelector('[data-combo]');
        var keys    = {};

        hud.querySelectorAll('[data-key]').forEach(function (el) {
            var name = el.dataset.key;
            (keys[name] = keys[name] || []).push(el);
        });

        var left = [], right = [], combo = 0, comboTimer = null, visible = true;

        function setKey(name, on) {
            (keys[name] || []).forEach(function (el) {
                el.classList.toggle('is-on', on);
            });
        }

        function comboColour(c) {
            if (c === 0) return 'var(--fg-muted)';
            if (c <= 4)  return '#e0c877';
            if (c <= 8)  return '#e09a5a';
            return '#e07a6a';
        }

        function syncCombo() {
            if (!comboEl) return;
            comboEl.textContent = combo + ' combo';
            comboEl.style.color = comboColour(combo);
        }

        function trim() {
            var now = Date.now();
            left  = left.filter(function (t)  { return now - t < 1000; });
            right = right.filter(function (t) { return now - t < 1000; });
            if (cpsEl) cpsEl.textContent = left.length + ' | ' + right.length;
        }
        setInterval(trim, 140);

        function registerClick(button) {
            var now = Date.now();
            if (button === 2) {
                right.push(now);
                setKey('RMB', true);
            } else {
                left.push(now);
                setKey('LMB', true);
                combo++;
                syncCombo();
                clearTimeout(comboTimer);
                comboTimer = setTimeout(function () { combo = 0; syncCombo(); }, 2600);
            }
            trim();
        }

        hud.addEventListener('pointerdown', function (e) {
            if (e.target.closest('[data-touch-key]')) return; // handled below
            registerClick(e.button);
        });

        function releaseMouse(e) {
            if (e.button === 2) setKey('RMB', false);
            else setKey('LMB', false);
        }
        hud.addEventListener('pointerup', releaseMouse);
        hud.addEventListener('pointercancel', releaseMouse);
        window.addEventListener('pointerup', releaseMouse);

        // Scoped to the preview only — the rest of the page keeps its
        // native context menu.
        hud.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        // Touch pad: no keyboard, no mouse buttons.
        hud.querySelectorAll('[data-touch-key]').forEach(function (btn) {
            var name = btn.dataset.touchKey;

            btn.addEventListener('pointerdown', function (e) {
                e.stopPropagation();
                btn.classList.add('is-on');
                if (name === 'LMB') registerClick(0);
                else if (name === 'RMB') registerClick(2);
                else setKey(name, true);
            });

            function up() {
                btn.classList.remove('is-on');
                setKey(name, false);
            }
            btn.addEventListener('pointerup', up);
            btn.addEventListener('pointerleave', up);
            btn.addEventListener('pointercancel', up);
        });

        var codes = { KeyW: 'W', KeyA: 'A', KeyS: 'S', KeyD: 'D', Space: 'SPACE' };

        function isTyping() {
            var el = document.activeElement;
            return el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
        }

        window.addEventListener('keydown', function (e) {
            var name = codes[e.code];
            if (!name || !visible || isTyping()) return;

            // Space only counts while the preview itself holds focus, so
            // page scrolling is never hijacked from under the reader.
            if (e.code === 'Space') {
                if (!hud.contains(document.activeElement)) return;
                e.preventDefault();
            }
            setKey(name, true);
        });

        window.addEventListener('keyup', function (e) {
            var name = codes[e.code];
            if (name) setKey(name, false);
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                if (!visible) Object.keys(keys).forEach(function (k) { setKey(k, false); });
            }, { threshold: 0 }).observe(hud);
        }

        syncCombo();
    }

    /* -----------------------------------------------------
       Latest release version
       ----------------------------------------------------- */
    function initVersion() {
        var targets = document.querySelectorAll('[data-version]');
        if (!targets.length) return;

        fetch('https://api.github.com/repos/Eymistaken/Eymistaken-s-HUD/releases/latest')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !data.tag_name) return;
                targets.forEach(function (el) {
                    // JitPack strips the leading "v" from a tag, so a Gradle
                    // coordinate has to read 1.1.1-6 — asking for v1.1.1-6 does
                    // not resolve, it just hangs while JitPack tries to build a
                    // ref that has no artifact. Places where the version is only
                    // a label, like a download button, keep the "v".
                    el.textContent = el.hasAttribute('data-strip-v')
                        ? data.tag_name.replace(/^v/i, '')
                        : data.tag_name;
                });
            })
            .catch(function () { /* the hardcoded fallback stays in the markup */ });
    }

    function boot() {
        initNav();
        initToc();
        initHighlight();
        initCopy();
        initMedia();
        initHudPreview();
        initVersion();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
