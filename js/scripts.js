document.addEventListener('DOMContentLoaded', () => {

    // ── Active Nav Link ──────────────────────────────────────
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a[data-page]').forEach(link => {
        if (link.dataset.page === page) link.classList.add('nav-active');
    });

    // ── Copy Buttons on <pre> blocks ─────────────────────────
    document.querySelectorAll('pre').forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'COPY';
        pre.style.position = 'relative';
        pre.appendChild(btn);
        btn.addEventListener('click', () => {
            const code = pre.querySelector('code');
            if (!code) return;
            navigator.clipboard.writeText(code.innerText).then(() => {
                btn.textContent = 'COPIED';
                setTimeout(() => (btn.textContent = 'COPY'), 2000);
            });
        });
    });

    // ── Module Modal — handled inline in user-guide.html ─────

    // ── Dynamic version badge (api-guide) ────────────────────
    const versionEl = document.getElementById('dynamic-version');
    if (versionEl) {
        fetch('https://api.github.com/repos/Eymistaken/Eymistaken-s-HUD/releases/latest')
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.tag_name) versionEl.textContent = d.tag_name; })
            .catch(() => {});
    }
});
