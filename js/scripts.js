document.addEventListener('DOMContentLoaded', () => {
    // Highlight active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Add copy button to code blocks
    const preElements = document.querySelectorAll('pre');
    preElements.forEach(pre => {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.position = 'absolute';
        copyBtn.style.top = '10px';
        copyBtn.style.right = '10px';
        copyBtn.style.background = 'var(--border-color)';
        copyBtn.style.color = 'var(--text-main)';
        copyBtn.style.border = 'none';
        copyBtn.style.padding = '4px 8px';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.fontSize = '0.8rem';
        copyBtn.style.opacity = '0';
        copyBtn.style.transition = 'opacity 0.2s';

        pre.style.position = 'relative';
        pre.appendChild(copyBtn);

        pre.addEventListener('mouseenter', () => copyBtn.style.opacity = '1');
        pre.addEventListener('mouseleave', () => copyBtn.style.opacity = '0');

        copyBtn.addEventListener('click', () => {
            const code = pre.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });
        });
    });

    // Module Data
    const moduleData = {
        cps: {
            title: 'CPS Tracker',
            description: 'Instantly tracks and displays your left and right clicks per second. Extremely lightweight and perfectly synchronized with your inputs.',
            file: 'cps-demo.mp4',
            type: 'video'
        },
        fps: {
            title: 'FPS Counter',
            description: 'Keeps an eye on your actual frames per second performance in real-time. Unobtrusive and updates dynamically.',
            file: 'fps-demo.mp4',
            type: 'video'
        },
        ping: {
            title: 'Ping Display',
            description: 'Shows your current network latency to the server you are connected to. Helps diagnose lag instantly.',
            file: 'ping-demo.png',
            type: 'image'
        },
        combo: {
            title: 'Combo Counter',
            description: 'Automatically starts a streak count every time you hit an entity without taking damage. Resets accurately on combat interaction.',
            file: 'combo-demo.mp4',
            type: 'video'
        },
        armor: {
            title: 'Armor HUD',
            description: 'Renders your currently equipped armor and holding items directly on the screen with their exact durability remaining.',
            file: 'armor-demo.mp4',
            type: 'video'
        },
        reach: {
            title: 'Reach Display',
            description: 'Measures the exact distance in blocks of your last successful melee attack against an entity down to the decimal point.',
            file: 'reach-demo.mp4',
            type: 'video'
        },
        keystrokes: {
            title: 'Keystrokes Display',
            description: 'A beautiful visual representation of the keys you are actively pushing (W,A,S,D, LMB, RMB, Jump, Sneak). Highly customizable via the designer.',
            file: 'keystrokes-demo.mp4',
            type: 'video'
        }
    };

    // Modal Logic
    const modal = document.getElementById('module-modal');
    const cards = document.querySelectorAll('.module-card');
    const closeBtn = document.querySelector('.modal-close');

    if (modal && cards) {
        const titleEl = document.getElementById('modal-title');
        const descEl = document.getElementById('modal-description');
        const mediaContainer = document.getElementById('modal-media-container');

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const moduleId = card.getAttribute('data-module');
                const data = moduleData[moduleId];

                if (data) {
                    titleEl.textContent = data.title;
                    descEl.textContent = data.description;

                    mediaContainer.innerHTML = ''; // Clear previous
                    if (data.type === 'video') {
                        mediaContainer.innerHTML = `
                            <video autoplay loop muted playsinline style="width: 100%; height: auto; max-height: 60vh; object-fit: contain;">
                                <source src="assets/${data.file}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        `;
                        // Force modern browsers to load and play the newly injected video
                        const videoEl = mediaContainer.querySelector('video');
                        if (videoEl) {
                            videoEl.load();
                            videoEl.play().catch(e => console.log("Video autoplay prevented:", e));
                        }
                    } else if (data.type === 'image') {
                        mediaContainer.innerHTML = `
                            <img src="assets/${data.file}" alt="${data.title} Demo">
                        `;
                    }

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                }
            });
        });

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Delay clearing the media to allow animation to finish
            setTimeout(() => {
                mediaContainer.innerHTML = '';
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(); // Click outside 
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    }

    // Live Downloads Tracking removed as per user request.

    // GitHub'dan En Son Sürümü Çekme
    const dynamicVersionSpan = document.getElementById('dynamic-version');
    if (dynamicVersionSpan) {
        fetch('https://api.github.com/repos/Eymistaken/Eymistaken-s-HUD/releases/latest')
            .then(response => {
                if (!response.ok) throw new Error('GitHub API hatası');
                return response.json();
            })
            .then(data => {
                if (data && data.tag_name) {
                    // "v1.0.9-1" gibi olan etiketi doğrudan koda yazdırıyoruz
                    dynamicVersionSpan.textContent = data.tag_name;
                }
            })
            .catch(error => {
                console.error('Sürüm bilgisi çekilemedi:', error);
                // Hata olursa varsayılan sürüm ekranda kalmaya devam eder
            });
    }
});
