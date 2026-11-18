/* =========================================================
   Eymistaken's HUD — site behavior

   Each init* function is independent and no-ops when the
   elements it needs are not on the page.
   ========================================================= */

(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var here = location.pathname.split('/').pop() || 'index.html';

    /* -----------------------------------------------------
       Old links into the guides

       The Full Guide and the API Guide used to be one page
       each, and changelogs and store pages link into them by
       section. Each guide's first page kept the old URL, so
       an old #section that now lives on a page of its own is
       sent there. A hash that still exists here is left alone.
       ----------------------------------------------------- */
    var MOVED = {
        'full-guide.html': {
            'surfaces': 'full-guide-surfaces.html',
            'only-here': 'full-guide-surfaces.html#only-here',
            'placement': 'full-guide-placement.html',
            'stacking': 'full-guide-placement.html#stacking',
            'editor': 'full-guide-editor.html',
            'editor-gestures': 'full-guide-editor.html#editor-gestures',
            'align': 'full-guide-editor.html#align',
            'global-menu': 'full-guide-editor.html#global-menu',
            'settings-screen': 'full-guide-settings-screen.html',
            'settings-parts': 'full-guide-settings-screen.html#settings-parts',
            'settings-buttons': 'full-guide-settings-screen.html#settings-buttons',
            'cps': 'full-guide-cps.html',
            'ping': 'full-guide-ping.html',
            'fps': 'full-guide-fps.html',
            'combo': 'full-guide-combo.html',
            'combo-behavior': 'full-guide-combo.html#behavior',
            'combo-style': 'full-guide-combo.html#style',
            'heatmap-tiers': 'full-guide-combo.html#tiers',
            'combo-animation': 'full-guide-combo.html#animation',
            'combo-background': 'full-guide-combo.html#background',
            'combo-hits': 'full-guide-combo.html#counts',
            'combo-ends': 'full-guide-combo.html#ends',
            'combo-received': 'full-guide-combo.html#against',
            'combo-impact': 'full-guide-combo.html#land',
            'combo-best': 'full-guide-combo.html#best',
            'combo-line': 'full-guide-combo.html#line',
            'combo-heatmap': 'full-guide-combo.html#tiers',
            'combo-format': 'full-guide-combo.html#format',
            'combo-preview': 'full-guide-combo.html#preview',
            'reach': 'full-guide-reach.html',
            'armor': 'full-guide-armor.html',
            'armor-effects': 'full-guide-armor.html#armor-effects',
            'armor-slots': 'full-guide-armor.html#armor-slots',
            'keystrokes': 'full-guide-keystrokes.html',
            'designs': 'full-guide-designs.html',
            'design-rules': 'full-guide-designs.html#design-rules',
            'animation': 'full-guide-animation.html',
            'motions': 'full-guide-animation.html#motions',
            'fills': 'full-guide-animation.html#fills',
            'directions': 'full-guide-animation.html#directions',
            'designer': 'full-guide-designer.html',
            'designer-toolbar': 'full-guide-designer.html#designer-toolbar',
            'designer-rail': 'full-guide-designer.html#designer-rail',
            'designer-inspector': 'full-guide-designer.html#designer-inspector',
            'designer-shortcuts': 'full-guide-designer.html#designer-shortcuts',
            'appearance': 'full-guide-appearance.html',
            'hud-font': 'full-guide-appearance.html#hud-font',
            'text-outline': 'full-guide-appearance.html#text-outline',
            'menu-scale': 'full-guide-appearance.html#menu-scale',
            'presets': 'full-guide-presets.html',
            'saved-configs': 'full-guide-presets.html#saved-configs',
            'server-configs': 'full-guide-presets.html#server-configs',
            'share-codes': 'full-guide-share-codes.html',
            'two-code-types': 'full-guide-share-codes.html#two-code-types',
            'keystrokes-code-contents': 'full-guide-share-codes.html#keystrokes-code-contents',
            'code-limits': 'full-guide-share-codes.html#code-limits',
            'resets': 'full-guide-resets.html',
            'gotchas': 'full-guide-gotchas.html'
        },
        'api-guide.html': {
            'architecture': 'api-guide-architecture.html',
            'dependency': 'api-guide.html#dep',
            'implementing-module': 'api-guide-creating-a-module.html',
            'sub-elements': 'api-guide-sub-elements.html',
            'editor-integration': 'api-guide-editor-integration.html',
            'context-menu': 'api-guide-context-menu.html',
            'settings-screen': 'api-guide-settings-screen.html',
            'preview': 'api-guide-live-preview.html',
            'plugin-state': 'api-guide-plugin-state.html',
            'events': 'api-guide-events.html',
            'registering': 'api-guide.html#register'
        }
    };

    function followMovedAnchor() {
        var table = MOVED[here];
        var id = decodeURIComponent(location.hash.slice(1));
        if (!table || !id || document.getElementById(id)) return;
        var to = table[id];
        if (!to) return;
        if (to.charAt(0) === '#' || to.indexOf(here + '#') === 0) {
            var target = to.slice(to.indexOf('#'));
            history.replaceState(null, '', target);
            var el = document.getElementById(target.slice(1));
            if (el) el.scrollIntoView();
            return;
        }
        location.replace(to);
    }

    /* -----------------------------------------------------
       Header

       On a desktop the header stays pinned to the top of the
       window, and CSS does all of it. Below 900 px it is too
       tall to keep on screen, so it slides away while you
       read down the page and comes back the moment you
       scroll up. Moves smaller than a few pixels are ignored,
       so a resting thumb does not make it flicker. A jump to
       a section counts as reading on: it hides the header
       rather than landing the section under it.
       ----------------------------------------------------- */
    function initHeader() {
        var header = document.querySelector('.site-header');
        if (!header) return;
        var narrow = window.matchMedia('(max-width: 899px)');
        var TOLERANCE = 6;
        var lastY = window.scrollY;
        var jumpUntil = 0;
        var frame = null;

        function setHidden(hidden) {
            header.classList.toggle('is-hidden', hidden);
        }

        function update() {
            frame = null;
            // Rubber-band scrolling past either end is not a direction.
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var y = Math.max(0, Math.min(window.scrollY, max));
            var delta = y - lastY;
            if (!narrow.matches || y <= header.offsetHeight) {
                setHidden(false);
            } else if (Date.now() < jumpUntil) {
                setHidden(true);
            } else if (Math.abs(delta) < TOLERANCE) {
                return;
            } else {
                setHidden(delta > 0 && !header.contains(document.activeElement));
            }
            lastY = y;
        }

        function schedule() {
            if (!frame) frame = requestAnimationFrame(update);
        }

        function jumped() {
            jumpUntil = Date.now() + 400;
            schedule();
        }

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        if (narrow.addEventListener) narrow.addEventListener('change', schedule);
        else if (narrow.addListener) narrow.addListener(schedule);

        // Tabbing into the header brings it back, at once rather than
        // sliding: focus scrolls an element it cannot see into view, and
        // halfway through the slide the header is still out of sight, so
        // the page would jump to its top.
        header.addEventListener('focusin', function () {
            if (!header.classList.contains('is-hidden')) return;
            header.classList.add('is-instant');
            setHidden(false);
            void header.offsetHeight;
            header.classList.remove('is-instant');
        });

        // Links to a section of this page: the click runs before the
        // browser scrolls, so the jump that follows is caught.
        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[href*="#"]');
            if (a && a.hash && a.origin === location.origin && a.pathname === location.pathname) jumped();
        });
        window.addEventListener('hashchange', jumped);

        // Arriving on a section from another page.
        if (location.hash) jumped();
    }

    /* -----------------------------------------------------
       Guide contents on a phone

       Below 900 px the sidebar folds behind one button. The
       list ships open and only closes once this has run, so
       nothing is out of reach without script.
       ----------------------------------------------------- */
    function initSideToggle() {
        var toggle = document.querySelector('[data-side-toggle]');
        var panel = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
        if (!toggle || !panel) return;

        function setOpen(open) {
            toggle.setAttribute('aria-expanded', String(open));
            panel.classList.toggle('is-open', open);
        }

        toggle.addEventListener('click', function () {
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });

        // Following a link inside this page should not leave the list
        // hanging open over the section it jumped to.
        panel.addEventListener('click', function (e) {
            var a = e.target.closest('a');
            if (a && a.getAttribute('href').charAt(0) === '#') setOpen(false);
        });

        panel.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                toggle.focus();
            }
        });
    }

    /* -----------------------------------------------------
       Where you are on the page

       Marks the entry for the section being read, in the
       on-this-page rail and in the User Guide's own list.
       ----------------------------------------------------- */
    function initSpy() {
        document.querySelectorAll('[data-spy]').forEach(function (list) {
            var links = Array.prototype.slice.call(list.querySelectorAll('a[href^="#"]'));
            if (!links.length) return;

            var targets = links.map(function (link) {
                return document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
            });

            var scroller = list.closest('.guide__sticky');
            var active = null;
            var frame = null;
            var EDGE = 16;

            function apply(index) {
                if (index === active) return;
                active = index;
                links.forEach(function (link, i) {
                    if (i === index) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });

                // The sticky column scrolls on its own once its list is taller
                // than the window; keep the marked entry inside it.
                var link = links[index];
                if (scroller && link && scroller.scrollHeight > scroller.clientHeight) {
                    var lr = link.getBoundingClientRect();
                    var br = scroller.getBoundingClientRect();
                    var delta = 0;
                    if (lr.top < br.top + EDGE) delta = lr.top - br.top - EDGE;
                    else if (lr.bottom > br.bottom - EDGE) delta = lr.bottom - br.bottom + EDGE;
                    if (delta) scroller.scrollTop += delta;
                }
            }

            function sync() {
                if (frame) return;
                frame = requestAnimationFrame(function () {
                    frame = null;
                    var current = 0;
                    targets.forEach(function (target, i) {
                        if (target && target.getBoundingClientRect().top <= 140) current = i;
                    });
                    // The last section is often too short to reach the line,
                    // so take it once the page bottoms out.
                    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
                        current = targets.length - 1;
                    }
                    apply(current);
                });
            }

            window.addEventListener('scroll', sync, { passive: true });
            window.addEventListener('resize', function () { active = null; sync(); });
            sync();
        });
    }

    /* -----------------------------------------------------
       Copy buttons and build-script tabs
       ----------------------------------------------------- */
    function announce(text) {
        var live = document.getElementById('live-status');
        if (!live) return;
        live.textContent = '';
        setTimeout(function () { live.textContent = text; }, 30);
    }

    function initCopy() {
        document.querySelectorAll('.code__copy').forEach(function (btn) {
            var block = btn.closest('.code');
            if (!block) return;
            var label = btn.querySelector('.code__copy-label');

            function flash(ok) {
                clearTimeout(btn._timer);
                btn.classList.toggle('is-done', ok);
                if (label) label.textContent = ok ? 'Copied' : 'Copy failed';
                announce(ok ? 'Copied to the clipboard' : 'Could not copy');
                btn._timer = setTimeout(function () {
                    btn.classList.remove('is-done');
                    if (label) label.textContent = 'Copy';
                }, 1600);
            }

            // execCommand still covers file:// and older WebViews, where the
            // async clipboard API is unavailable or refuses outright.
            function legacyCopy(text) {
                try {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.top = '0';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    var ok = document.execCommand('copy');
                    document.body.removeChild(ta);
                    btn.focus();
                    flash(ok);
                } catch (err) {
                    flash(false);
                }
            }

            btn.addEventListener('click', function () {
                var panel = block.querySelector('[role="tabpanel"]:not([hidden])') || block;
                var pre = panel.querySelector('pre');
                if (!pre) return;
                var text = pre.textContent;
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

    function initTabs() {
        document.querySelectorAll('.code [role="tablist"]').forEach(function (list) {
            var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
            var block = list.closest('.code');
            var copy = block.querySelector('.code__copy');

            function select(tab, focus) {
                tabs.forEach(function (t) {
                    var on = t === tab;
                    t.setAttribute('aria-selected', String(on));
                    t.tabIndex = on ? 0 : -1;
                    var panel = document.getElementById(t.getAttribute('aria-controls'));
                    if (panel) panel.hidden = !on;
                });
                if (copy) copy.setAttribute('aria-label', 'Copy ' + tab.textContent.trim());
                if (focus) tab.focus();
            }

            tabs.forEach(function (tab, i) {
                tab.addEventListener('click', function () { select(tab, false); });
                tab.addEventListener('keydown', function (e) {
                    var next = null;
                    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
                    else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
                    else if (e.key === 'Home') next = tabs[0];
                    else if (e.key === 'End') next = tabs[tabs.length - 1];
                    if (next) {
                        e.preventDefault();
                        select(next, true);
                    }
                });
            });
        });
    }

    /* -----------------------------------------------------
       Clips

       Nothing is fetched until a clip is on screen: the
       still in front of it is the exact frame it is cropped
       to, so there is never an empty box to cover. Every clip
       with at least a third of itself in the window plays,
       and it pauses when it scrolls away.

       Under reduced motion or Data Saver nothing plays by
       itself. The still stays up and the clip plays when it
       is clicked. Every clip can be paused by clicking it.
       ----------------------------------------------------- */
    function initMedia() {
        var frames = Array.prototype.slice.call(document.querySelectorAll('[data-clip]'));
        if (!frames.length) return;

        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var saveData = !!(conn && conn.saveData);
        var autoplay = !saveData && !reducedMotion;
        var MAX_RETRIES = 3;

        function load(video) {
            if (video.dataset.src) {
                video.preload = 'auto';
                video.src = video.dataset.src;
                delete video.dataset.src;
            }
        }

        function visibleArea(el) {
            var r = el.getBoundingClientRect();
            var vh = window.innerHeight || document.documentElement.clientHeight;
            var vw = window.innerWidth || document.documentElement.clientWidth;
            var h = Math.min(r.bottom, vh) - Math.max(r.top, 0);
            var w = Math.min(r.right, vw) - Math.max(r.left, 0);
            return h > 0 && w > 0 ? h * w : 0;
        }

        function play(frame) {
            var video = frame._video;
            load(video);
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    // Refused (no gesture, or a stalled load). The still stays
                    // up, and a click is a fresh chance.
                    frame._state.refused = true;
                });
            }
        }

        frames.forEach(function (frame) {
            var video = frame.querySelector('video');
            var button = frame.querySelector('.media__toggle');
            var name = frame.getAttribute('data-clip') || 'clip';
            if (!video || !button) return;

            var state = { userPaused: false, userPlaying: false, failed: false, attempts: 0, refused: false };
            var source = video.dataset.src || '';
            frame._video = video;
            frame._state = state;

            function label() {
                button.setAttribute('aria-label', (video.paused ? 'Play the ' : 'Pause the ') + name + ' clip');
            }

            label();
            button.hidden = false;

            video.addEventListener('playing', function () {
                frame.classList.add('is-playing');
                label();
            });
            video.addEventListener('pause', label);

            video.addEventListener('error', function () {
                // A dropped request on a slow line is not a missing file. Try
                // again a few times with a clean URL before giving up, and keep
                // the still up meanwhile.
                frame.classList.remove('is-playing');
                if (source && state.attempts < MAX_RETRIES) {
                    state.attempts++;
                    setTimeout(function () {
                        video.src = source + (source.indexOf('?') === -1 ? '?' : '&') + 'retry=' + state.attempts;
                        video.load();
                        if (state.userPlaying || (autoplay && !state.userPaused)) play(frame);
                    }, 1200 * state.attempts);
                    return;
                }
                state.failed = true;
                label();
            });

            button.addEventListener('click', function () {
                if (!video.paused) {
                    state.userPaused = true;
                    state.userPlaying = false;
                    video.pause();
                } else {
                    state.userPaused = false;
                    state.userPlaying = true;
                    state.failed = false;
                    play(frame);
                }
            });
        });

        function select() {
            frames.forEach(function (frame) {
                var state = frame._state;
                if (!state) return;
                var video = frame._video;
                var area = visibleArea(frame);
                var r = frame.getBoundingClientRect();
                // A clip only just peeking in does not count as being looked at.
                var seen = area > 0 && area / (r.width * r.height) >= 0.35;

                // A clip started by hand keeps going until it leaves the window.
                if (state.userPlaying) {
                    if (area > 0) return;
                    state.userPlaying = false;
                }
                if (seen) {
                    if (autoplay && !state.userPaused && !state.failed && video.paused) play(frame);
                } else if (!video.paused) {
                    video.pause();
                }
            });
        }

        var frameRequest = null;
        function schedule() {
            if (frameRequest) return;
            frameRequest = requestAnimationFrame(function () {
                frameRequest = null;
                select();
            });
        }

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                frames.forEach(function (frame) { if (frame._video) frame._video.pause(); });
            } else {
                schedule();
            }
        });
        select();
    }

    /* -----------------------------------------------------
       Guide search

       Indexes every page of the guides this box searches:
       the User Guide and the Full Guide from theirs, the API
       Guide from its own. The page you are on comes from the
       live DOM. The rest are fetched once, the first time you
       touch the box, and parsed with DOMParser.

       Nothing is hand-maintained: there is no build step
       here, and a list of pages kept by hand would go stale
       the first time one was added. The page list is read
       from each guide's own sidebar instead, so a new page
       is searchable the moment it is linked there. If a
       fetch fails (opened over file://, say), whatever was
       indexed still searches.
       ----------------------------------------------------- */
    function initSearch() {
        var root = document.querySelector('[data-search]');
        if (!root) return;

        var input = root.querySelector('.search__input');
        var panel = root.querySelector('.search__panel');
        if (!input || !panel) return;

        var SCOPES = {
            player: [
                { file: 'user-guide.html', label: 'User Guide' },
                { file: 'full-guide.html', label: 'Full Guide' }
            ],
            api: [
                { file: 'api-guide.html', label: 'API Guide' }
            ]
        };
        var entries = SCOPES[root.getAttribute('data-search')] || SCOPES.player;
        var MAX_HITS = 8;
        var CONCURRENT = 4;

        var records = [];
        var seen = {};      // file -> true once queued
        var queue = [];
        var inFlight = 0;
        var started = false;
        var active = -1;
        var hits = [];

        root.removeAttribute('hidden');

        function norm(s) {
            return (s || '').replace(/\s+/g, ' ').trim();
        }

        /* textContent runs adjacent cells together, so block boundaries get
           a space first. innerText would do it, but it needs a rendered tree
           and the other pages are parsed detached. */
        var BLOCKS = 'p, li, dt, dd, td, th, tr, div, h1, h2, h3, h4, figcaption';
        function textOf(el, drop) {
            var clone = el.cloneNode(true);
            if (drop) {
                var lead = clone.querySelectorAll(drop);
                for (var j = 0; j < lead.length; j++) lead[j].remove();
            }
            var blocks = clone.querySelectorAll(BLOCKS);
            for (var i = 0; i < blocks.length; i++) {
                blocks[i].appendChild(document.createTextNode(' '));
            }
            return norm(clone.textContent);
        }

        /* Text belonging to one sub-heading: everything up to the next one. */
        function textAfter(heading) {
            var out = '';
            var node = heading.nextElementSibling;
            while (node && !/^H[23]$/.test(node.tagName)) {
                out += textOf(node) + ' ';
                node = node.nextElementSibling;
            }
            return norm(out);
        }

        function guideFor(file, doc) {
            var label = doc.querySelector('[data-guide-label]');
            if (label) return label.getAttribute('data-guide-label');
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].file === file) return entries[i].label;
            }
            return '';
        }

        function indexDoc(doc, file) {
            var main = doc.querySelector('.guide__main');
            if (!main) return;
            var guide = guideFor(file, doc);
            var h1 = main.querySelector('h1');
            var pageTitle = h1 ? norm(h1.textContent) : file;
            var single = main.hasAttribute('data-single');

            if (!single) {
                records.push({
                    file: file, guide: guide, hash: '', title: pageTitle, crumb: '',
                    keywords: main.getAttribute('data-keywords') || '',
                    text: textOf(main, 'h1, .page-eyebrow, .pager'),
                    top: true
                });
            }

            var sections = main.querySelectorAll('.doc-section');
            Array.prototype.forEach.call(sections, function (section) {
                var h2 = section.querySelector('h2[id]');
                if (!h2) return;
                var title = norm(h2.textContent);
                records.push({
                    file: file, guide: guide, hash: h2.id, title: title,
                    crumb: single ? '' : pageTitle,
                    keywords: section.getAttribute('data-keywords') || '',
                    text: textOf(section, 'h2, .step-label'),
                    top: single
                });

                /* Sub-headings carry no keywords of their own: inheriting the
                   section's would score all of them identically and bury
                   everything else. They match on their own title and text. */
                var subs = section.querySelectorAll('h3[id]');
                Array.prototype.forEach.call(subs, function (sub) {
                    records.push({
                        file: file, guide: guide, hash: sub.id, title: norm(sub.textContent),
                        crumb: single ? title : pageTitle,
                        keywords: '',
                        text: textAfter(sub),
                        top: false
                    });
                });
            });
        }

        function pagesListedIn(doc) {
            var out = [];
            doc.querySelectorAll('[data-page]').forEach(function (a) {
                out.push(a.getAttribute('href').split('#')[0]);
            });
            return out;
        }

        function enqueue(file) {
            if (!file || seen[file]) return;
            seen[file] = true;
            queue.push(file);
        }

        function pump() {
            while (inFlight < CONCURRENT && queue.length) {
                fetchPage(queue.shift());
            }
        }

        function fetchPage(file) {
            inFlight++;
            fetch(file)
                .then(function (res) {
                    if (!res.ok) throw new Error(res.status);
                    return res.text();
                })
                .then(function (html) {
                    var doc = new DOMParser().parseFromString(html, 'text/html');
                    indexDoc(doc, file);
                    pagesListedIn(doc).forEach(enqueue);
                    if (input.value) render(input.value);
                })
                .catch(function () {
                    /* Whatever we already have still searches. */
                })
                .then(function () {
                    inFlight--;
                    pump();
                });
        }

        function start() {
            if (started) return;
            started = true;
            entries.forEach(function (entry) { enqueue(entry.file); });
            pump();
        }

        var WORDCHAR = /[a-z0-9]/;

        /* A whole word beats a substring, or searching "board" ranks "Mouse
           and keyboard" above the Board setting. Returns 2 for a word hit, 1
           for a substring, 0 for nothing. */
        function match(hay, w) {
            var i = hay.indexOf(w);
            if (i < 0) return 0;
            while (i > -1) {
                var before = i === 0 ? ' ' : hay.charAt(i - 1);
                var after = i + w.length >= hay.length ? ' ' : hay.charAt(i + w.length);
                if (!WORDCHAR.test(before) && !WORDCHAR.test(after)) return 2;
                i = hay.indexOf(w, i + 1);
            }
            return 1;
        }

        function score(record, words, whole) {
            var title = record.title.toLowerCase();
            var keys = record.keywords.toLowerCase();
            var text = record.text.toLowerCase();
            var total = record.top ? 5 : 0;

            for (var i = 0; i < words.length; i++) {
                var w = words[i];
                var inTitle = match(title, w);
                var inKeys = match(keys, w);
                var inText = match(text, w);

                if (inTitle === 2) total += title.indexOf(w) === 0 ? 90 : 70;
                else if (inTitle === 1) total += 25;

                if (inKeys === 2) total += 30;
                else if (inKeys === 1) total += 10;

                if (inText === 2) total += 12;
                else if (inText === 1) total += 3;

                /* Every word has to turn up somewhere, or "reach timeout"
                   would match every section that says "timeout". */
                if (!inTitle && !inKeys && !inText) return 0;
            }

            /* The query as one phrase. In data-keywords that means the author
               wrote down this exact search, which is the strongest signal
               there is. */
            var titlePhrase = match(title, whole);
            var keysPhrase = match(keys, whole);

            if (title === whole) total += 140;
            else if (titlePhrase === 2) total += 90;
            else if (titlePhrase === 1) total += 15;

            if (keysPhrase === 2) total += 120;
            else if (keysPhrase === 1) total += 20;

            return total;
        }

        function search(query) {
            var whole = query.toLowerCase().trim();
            var words = whole.split(/\s+/).filter(function (w) { return w.length > 1; });
            if (!words.length) return [];

            var scored = [];
            var dedupe = {};
            records.forEach(function (record) {
                var key = record.file + '#' + record.hash;
                if (dedupe[key]) return;
                dedupe[key] = true;
                var s = score(record, words, whole);
                if (s > 0) scored.push({ record: record, score: s, word: words[0] });
            });

            scored.sort(function (a, b) { return b.score - a.score; });
            return scored.slice(0, MAX_HITS);
        }

        /* Built as text nodes and one <mark>; nothing fetched ever reaches
           innerHTML. */
        function snippet(record, word) {
            var text = record.text;
            var at = record.title.toLowerCase().indexOf(word) > -1
                ? -1
                : text.toLowerCase().indexOf(word);
            var frag = document.createDocumentFragment();

            if (at < 0) {
                frag.appendChild(document.createTextNode(text.slice(0, 140) + (text.length > 140 ? '…' : '')));
                return frag;
            }

            var from = Math.max(0, at - 60);
            var to = Math.min(text.length, at + word.length + 80);
            var lead = (from > 0 ? '…' : '') + text.slice(from, at);
            var tail = text.slice(at + word.length, to) + (to < text.length ? '…' : '');

            var mark = document.createElement('mark');
            mark.textContent = text.slice(at, at + word.length);

            frag.appendChild(document.createTextNode(lead));
            frag.appendChild(mark);
            frag.appendChild(document.createTextNode(tail));
            return frag;
        }

        function buildHit(result, i) {
            var record = result.record;
            var a = document.createElement('a');
            a.className = 'search__hit';
            a.id = 'search-hit-' + i;
            a.setAttribute('role', 'option');
            a.setAttribute('aria-selected', 'false');
            a.href = (record.file === here ? '' : record.file) + (record.hash ? '#' + record.hash : '');
            if (!a.getAttribute('href')) a.href = record.file;

            var top = document.createElement('span');
            top.className = 'search__hit-top';

            var title = document.createElement('span');
            title.className = 'search__hit-title';
            title.textContent = record.title;
            top.appendChild(title);

            var where = document.createElement('span');
            where.className = 'search__hit-where';
            where.textContent = record.crumb ? record.crumb + ', ' + record.guide : record.guide;
            top.appendChild(where);

            var body = document.createElement('span');
            body.className = 'search__hit-snippet';
            body.appendChild(snippet(record, result.word));

            a.appendChild(top);
            a.appendChild(body);
            return a;
        }

        /* The results hang off a sticky, scrolling sidebar that would clip
           them, so they are placed against the window instead. */
        function place() {
            if (panel.hidden) return;
            var r = input.getBoundingClientRect();
            var vw = document.documentElement.clientWidth;
            var gap = 16;
            var width = Math.min(440, vw - 2 * gap);
            var left = Math.min(r.left, vw - gap - width);
            panel.style.position = 'fixed';
            panel.style.left = Math.max(gap, left) + 'px';
            panel.style.top = (r.bottom + 6) + 'px';
            panel.style.width = width + 'px';
            panel.style.maxHeight = Math.max(160, window.innerHeight - r.bottom - 24) + 'px';
        }

        function setActive(i) {
            if (hits[active]) {
                hits[active].classList.remove('is-active');
                hits[active].setAttribute('aria-selected', 'false');
            }
            active = i;
            if (hits[active]) {
                hits[active].classList.add('is-active');
                hits[active].setAttribute('aria-selected', 'true');
                input.setAttribute('aria-activedescendant', hits[active].id);
                hits[active].scrollIntoView({ block: 'nearest' });
            } else {
                input.removeAttribute('aria-activedescendant');
            }
        }

        function close() {
            panel.hidden = true;
            panel.textContent = '';
            input.setAttribute('aria-expanded', 'false');
            input.removeAttribute('aria-activedescendant');
            hits = [];
            active = -1;
        }

        function render(query) {
            if (!query.trim()) {
                close();
                return;
            }

            var results = search(query);
            panel.textContent = '';
            hits = [];
            active = -1;
            input.removeAttribute('aria-activedescendant');

            if (!results.length) {
                var empty = document.createElement('p');
                empty.className = 'search__empty';
                empty.textContent = 'Nothing matched “' + query.trim() + '”.';
                panel.appendChild(empty);
            } else {
                results.forEach(function (result, i) {
                    var hit = buildHit(result, i);
                    hits.push(hit);
                    panel.appendChild(hit);
                });
            }

            panel.hidden = false;
            input.setAttribute('aria-expanded', 'true');
            place();
        }

        /* Three triggers for one lazy fetch, because a focus event is not
           guaranteed to arrive: pointerdown starts it as the pointer lands
           on the box, and input is the backstop for keyboard and paste. */
        root.addEventListener('pointerdown', start);
        input.addEventListener('focus', start);
        input.addEventListener('input', function () {
            start();
            render(input.value);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                if (!hits.length) return;
                e.preventDefault();
                var next = active + (e.key === 'ArrowDown' ? 1 : -1);
                if (next < 0) next = hits.length - 1;
                if (next >= hits.length) next = 0;
                setActive(next);
            } else if (e.key === 'Enter') {
                if (hits[active]) {
                    e.preventDefault();
                    hits[active].click();
                } else if (hits.length) {
                    e.preventDefault();
                    hits[0].click();
                }
            } else if (e.key === 'Escape') {
                if (!panel.hidden) close();
                else if (input.value) input.value = '';
            }
        });

        /* Tabbing out of the box leaves the results behind. */
        root.addEventListener('focusout', function (e) {
            if (!root.contains(e.relatedTarget)) close();
        });

        /* Following a hit on this page leaves the panel hanging over the
           section it just scrolled to. */
        panel.addEventListener('click', function () { close(); });

        document.addEventListener('click', function (e) {
            if (!root.contains(e.target)) close();
        });

        window.addEventListener('scroll', place, { passive: true });
        window.addEventListener('resize', place);
        var side = root.closest('.guide__sticky');
        if (side) side.addEventListener('scroll', place, { passive: true });

        /* "/" focuses the box from anywhere in a guide. */
        document.addEventListener('keydown', function (e) {
            if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
            var el = document.activeElement;
            if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
            if (el && el.isContentEditable) return;
            e.preventDefault();
            input.focus();
            input.select();
            var r = input.getBoundingClientRect();
            if (r.top < 0 || r.bottom > window.innerHeight) {
                input.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
            }
        });

        /* This page is indexed now, and so is every page its sidebar lists
           as queued for when the box is first touched. */
        seen[here] = true;
        indexDoc(document, here);
        pagesListedIn(document).forEach(enqueue);
    }

    function boot() {
        followMovedAnchor();
        window.addEventListener('hashchange', followMovedAnchor);
        initHeader();
        initSideToggle();
        initSpy();
        initCopy();
        initTabs();
        initMedia();
        initSearch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
