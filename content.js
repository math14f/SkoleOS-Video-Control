let timeout;

function unwrapVideo(el) {
    if (!el) return null;
    if (el.tagName === 'VIDEO') return el;
    return (el.tagName === 'HLS-VIDEO' && el.shadowRoot) ? el.shadowRoot.querySelector('video') : el;
}

function toggleFullscreen(el) {
    let wrapper = el.closest('.video-js, .bmpui-ui-uicontainer, media-controller, .news-broadcast-video, #movie_player') || el.parentElement;
    const target = wrapper || unwrapVideo(el);

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (target.requestFullscreen) target.requestFullscreen();
        else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        else if (target.webkitEnterFullscreen) target.webkitEnterFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
}

function toggleSubtitles(video, btnUI) {
    if (window.location.host.includes('youtube.com')) {
        const ytCCBtn = document.querySelector('.ytp-subtitles-button');
        if (ytCCBtn) {
            ytCCBtn.click();
            setTimeout(() => {
                const isShowing = ytCCBtn.getAttribute('aria-pressed') === 'true';
                if (btnUI) btnUI.style.color = isShowing ? '#00f2fe' : 'rgba(255,255,255,0.7)';
            }, 100);
        }
        return;
    }
    const realVideo = unwrapVideo(video);
    if (!realVideo || !realVideo.textTracks || realVideo.textTracks.length === 0) return;
    const track = realVideo.textTracks[0];
    track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
    if (btnUI) btnUI.style.color = track.mode === 'showing' ? '#00f2fe' : 'rgba(255,255,255,0.7)';
}

function hideCursorAndUI() {
    document.body.style.cursor = 'none';
    const player = document.getElementById('skoleos-player');
    const settings = document.getElementById('skoleos-settings-menu');
    if (player) player.classList.add('skoleos-hidden');
    if (settings) settings.style.display = 'none';
}

function showCursorAndUI() {
    document.body.style.cursor = 'default';
    const player = document.getElementById('skoleos-player');
    if (player) player.classList.remove('skoleos-hidden');
    clearTimeout(timeout);
    timeout = setTimeout(hideCursorAndUI, 3000);
}

['mousemove', 'mousedown'].forEach(evt => document.addEventListener(evt, showCursorAndUI));

document.addEventListener('keydown', function(event) {
    showCursorAndUI();
    const active = document.activeElement;
    if (['INPUT', 'TEXTAREA'].includes(active.tagName) || active.isContentEditable) return;

    const containerElement = document.querySelector('video, hls-video');
    if (!containerElement) return;

    const realVideo = unwrapVideo(containerElement);
    if (!realVideo) return;

    const key = event.key.toLowerCase();
    const isYouTube = window.location.host.includes('youtube.com');

    if (event.code === 'Space' && !isYouTube) {
        event.preventDefault(); event.stopImmediatePropagation();
        realVideo.paused ? realVideo.play() : realVideo.pause();
    } else if (key === 'f' && !isYouTube) {
        event.preventDefault(); event.stopImmediatePropagation();
        toggleFullscreen(containerElement);
    } else if (key === 'c') {
        event.preventDefault(); event.stopImmediatePropagation();
        toggleSubtitles(realVideo, document.getElementById('skoleos-subtitles'));
    } else if (key === 'm' && !isYouTube) {
        event.preventDefault(); event.stopImmediatePropagation();
        realVideo.muted = !realVideo.muted;
        const muteBtn = document.getElementById('skoleos-mute');
        if (muteBtn) muteBtn.innerText = realVideo.muted || realVideo.volume === 0 ? '🔇' : '🔊';
    }
}, true);

function formatTime(s) {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    let sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" + sec : sec);
}

function buildSkoleOSPlayer(containerElement) {
    if (document.getElementById('skoleos-player')) return;
    const realVideo = unwrapVideo(containerElement);
    if (!realVideo) return;

    const isYouTube = window.location.host.includes('youtube.com');
    containerElement.controls = false;
    realVideo.controls = false;

    const mediaController = containerElement.closest('media-controller');
    if (mediaController) {
        Array.from(mediaController.children).forEach(child => {
            if (!['VIDEO', 'HLS-VIDEO'].includes(child.tagName)) {
                child.style.cssText = 'display:none; opacity:0; pointer-events:none;';
            }
        });
    }

    const wrapper = containerElement.parentNode;
    if (window.getComputedStyle(wrapper).position === 'static') {
        wrapper.style.setProperty('position', 'relative', 'important');
    }

    const playerUI = document.createElement('div');
    playerUI.id = 'skoleos-player';
    playerUI.innerHTML = `
        <div class="skoleos-volume-container">
            <button id="skoleos-mute" class="skoleos-btn">🔊</button>
            <input type="range" id="skoleos-vol-slider" min="0" max="1" step="0.05" value="1">
        </div>
        <button id="skoleos-rewind" class="skoleos-btn">⏪</button>
        <button id="skoleos-playbtn" class="skoleos-btn">⏸</button>
        <button id="skoleos-forward" class="skoleos-btn">⏩</button>
        <span id="skoleos-time-current" class="skoleos-time">0:00</span>
        <div id="skoleos-progress-container"><div id="skoleos-progress"><div id="skoleos-progress-filled"></div></div></div>
        <span id="skoleos-time-left" class="skoleos-time">-0:00</span>
        <button id="skoleos-subtitles" class="skoleos-btn">💬</button>
        <button id="skoleos-settings" class="skoleos-btn">⚙️</button>
        <button id="skoleos-fullscreen" class="skoleos-btn">⛶</button>
        <div id="skoleos-settings-menu">
            <button class="skoleos-speed-btn" data-speed="0.75">0.75x</button>
            <button class="skoleos-speed-btn active" data-speed="1.0">1x</button>
            <button class="skoleos-speed-btn" data-speed="1.25">1.25x</button>
            <button class="skoleos-speed-btn" data-speed="1.5">1.50x</button>
        </div>
    `;

    wrapper.insertBefore(playerUI, containerElement.nextSibling);
    ['click', 'mousedown', 'dblclick'].forEach(evt => playerUI.addEventListener(evt, e => e.stopPropagation()));

    const playBtn = document.getElementById('skoleos-playbtn');
    realVideo.addEventListener('play', () => playBtn.innerText = '⏸');
    realVideo.addEventListener('pause', () => playBtn.innerText = '▶');
    playBtn.addEventListener('click', (e) => { e.stopPropagation(); realVideo.paused ? realVideo.play() : realVideo.pause(); });

    document.getElementById('skoleos-rewind').addEventListener('click', (e) => { e.stopPropagation(); realVideo.currentTime -= 10; });
    document.getElementById('skoleos-forward').addEventListener('click', (e) => { e.stopPropagation(); realVideo.currentTime += 10; });
    document.getElementById('skoleos-fullscreen').addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(containerElement); });
    document.getElementById('skoleos-subtitles').addEventListener('click', (e) => { e.stopPropagation(); toggleSubtitles(realVideo, e.target); });

    const muteBtn = document.getElementById('skoleos-mute');
    const volSlider = document.getElementById('skoleos-vol-slider');

    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        realVideo.muted = !realVideo.muted;
        muteBtn.innerText = realVideo.muted || realVideo.volume === 0 ? '🔇' : '🔊';
        volSlider.value = realVideo.muted ? 0 : realVideo.volume;
    });

    volSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        realVideo.volume = e.target.value;
        realVideo.muted = e.target.value === '0';
        muteBtn.innerText = realVideo.muted ? '🔇' : '🔊';
    });

    const settingsMenu = document.getElementById('skoleos-settings-menu');
    document.getElementById('skoleos-settings').addEventListener('click', (e) => {
        e.stopPropagation();
        if (isYouTube) {
            const ytSettingsBtn = document.querySelector('.ytp-settings-button');
            if (ytSettingsBtn) ytSettingsBtn.click();
        } else {
            settingsMenu.style.display = settingsMenu.style.display === 'flex' ? 'none' : 'flex';
        }
    });

    document.querySelectorAll('.skoleos-speed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            realVideo.playbackRate = parseFloat(e.target.dataset.speed);
            document.querySelectorAll('.skoleos-speed-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            settingsMenu.style.display = 'none';
        });
    });

    const progressContainer = document.getElementById('skoleos-progress-container');
    progressContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = progressContainer.getBoundingClientRect();
        if (Number.isFinite(realVideo.duration)) {
            realVideo.currentTime = ((e.clientX - rect.left) / rect.width) * realVideo.duration;
        }
    });

    const videoKey = 'skoleos-save-' + window.location.href.split('&')[0];
    realVideo.addEventListener('timeupdate', () => {
        const timeCurrentEl = document.getElementById('skoleos-time-current');
        const timeLeftEl = document.getElementById('skoleos-time-left');
        const progressFilledEl = document.getElementById('skoleos-progress-filled');

        if (!timeCurrentEl) return;
        timeCurrentEl.innerText = formatTime(realVideo.currentTime);

        if (Number.isFinite(realVideo.duration) && realVideo.duration > 0) {
            timeLeftEl.innerText = "-" + formatTime(realVideo.duration - realVideo.currentTime);
            progressFilledEl.style.width = ((realVideo.currentTime / realVideo.duration) * 100) + '%';
        }
        if (!isYouTube && realVideo.currentTime > 5 && realVideo.duration > 30) {
            localStorage.setItem(videoKey, realVideo.currentTime);
        }
    });

    if (!isYouTube) {
        const savedTime = parseFloat(localStorage.getItem(videoKey));
        if (savedTime && savedTime > 10 && !containerElement.dataset.asked) {
            containerElement.dataset.asked = "true";
            setTimeout(() => realVideo.pause(), 100);
            const modal = document.createElement('div');
            modal.id = 'skoleos-resume-modal';
            modal.innerHTML = `
                <h2>Velkommen tilbage!</h2>
                <p>Du nåede til <b>${formatTime(savedTime)}</b>.</p>
                <button id="btn-resume" class="skoleos-modal-btn">Fortsæt</button>
                <button id="btn-restart" class="skoleos-modal-btn" style="background:rgba(255,255,255,0.1)">Forfra</button>
            `;
            wrapper.appendChild(modal);
            ['click', 'mousedown'].forEach(evt => modal.addEventListener(evt, e => e.stopPropagation()));

            document.getElementById('btn-resume').addEventListener('click', (e) => {
                e.stopPropagation(); realVideo.currentTime = savedTime; modal.remove(); realVideo.play();
            });
            document.getElementById('btn-restart').addEventListener('click', (e) => {
                e.stopPropagation(); realVideo.currentTime = 0; localStorage.removeItem(videoKey); modal.remove(); realVideo.play();
            });
        }
    }
}

setInterval(() => {
    const path = window.location.pathname;
    if (window.location.host.includes('dr.dk') && (path === '/drtv/' || path === '/drtv')) return;

    let allVideos = Array.from(document.querySelectorAll('video, hls-video'));
    if (window.location.host.includes('youtube.com')) {
        allVideos = allVideos.filter(v => v.closest('#movie_player') && !v.closest('#inline-player-renderer'));
    }
    if (allVideos.length === 0) return;

    const mainVideo = allVideos.reduce((acc, cur) => (cur.offsetWidth * cur.offsetHeight > acc.offsetWidth * acc.offsetHeight) ? cur : acc);
    if (mainVideo.offsetWidth < 400) return;

    const existingPlayer = document.getElementById('skoleos-player');
    if (existingPlayer && existingPlayer.previousSibling !== mainVideo) existingPlayer.remove();

    if (mainVideo.parentNode && !document.getElementById('skoleos-player')) {
        if ((mainVideo.tagName === 'VIDEO' && (mainVideo.readyState >= 1 || mainVideo.networkState === 2)) ||
            (mainVideo.tagName === 'HLS-VIDEO' && mainVideo.shadowRoot)) {
            buildSkoleOSPlayer(mainVideo);
        }
    }
}, 500);

setInterval(() => {
    if (!window.location.host.includes('youtube.com')) return;
    try {
        const skipTxt = document.querySelector('.ytp-skip-ad-button__text');
        if (skipTxt) { skipTxt.click(); if(skipTxt.parentElement) skipTxt.parentElement.click(); }

        document.querySelectorAll('.ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-overlay-close-button').forEach(b => b.click());

        const player = document.querySelector('#movie_player');
        if (player && player.classList.contains('ad-showing')) {
            const v = document.querySelector('video');
            if (v && v.duration < 40) { v.muted = true; v.playbackRate = 16; v.currentTime = v.duration; }
        }
    } catch (e) {}
}, 50);
