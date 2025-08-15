let player;
let videoId;
let startTime = 0;
let watchedVideos = [];
let continueWatching = [];
let progressInterval;
let currentTime = 0;
let duration = 0;

window.addEventListener('DOMContentLoaded', () => {
    if (window.EmbarkApp) {
        window.EmbarkApp.initializeTheme();
    } else {
        initializeTheme();
    }
    
    setupEventListeners();
    initializeVideo();
    renderCustomControls();
    
    const videoWrapper = document.getElementById('video-wrapper');
    if (videoWrapper) {
        videoWrapper.style.pointerEvents = '';
        videoWrapper.style.cursor = '';
    }
    
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer) {
        videoPlayer.style.pointerEvents = '';
        videoPlayer.style.cursor = '';
    }
    
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.onclick = (e) => {
            e.stopPropagation();
            if (window.player && typeof window.player.playVideo === 'function') {
                window.player.playVideo();
            }
        };
    }
    
    if (videoWrapper && !document.getElementById('video-blackout')) {
        const blackout = document.createElement('div');
        blackout.id = 'video-blackout';
        blackout.className = 'video-blackout';
        videoWrapper.appendChild(blackout);
    }
});

function onYouTubeIframeAPIReady() {
    if (videoId) {
        createPlayer();
    }
}

function initializeVideo() {
    const urlParams = new URLSearchParams(window.location.search);
    videoId = urlParams.get('vid');
    
    if (!videoId) {
        showNotification('No video specified', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    loadUserData();
    
    updateVideoTitle();
    
    if (window.YT && window.YT.Player) {
        createPlayer();
    }
    
    loadRelatedVideos();
}

function loadUserData() {
    if (window.EmbarkApp) {
        watchedVideos = window.EmbarkApp.getWatchedVideos();
        continueWatching = window.EmbarkApp.getContinueWatching();
    } else {
        watchedVideos = getWatchedVideos();
        continueWatching = getContinueWatching();
    }
}

async function updateVideoTitle() {
    const videoTitle = document.getElementById('video-title');
    const videoDuration = document.getElementById('video-duration');
    if (!videoId || !videoTitle) return;
    
    // Get API key from environment variables only
    const apiKey = (typeof window !== 'undefined' && window.ENV_YOUTUBE_API_KEY) 
        ? window.ENV_YOUTUBE_API_KEY 
        : null;
    
    if (apiKey) {
        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    videoTitle.textContent = data.items[0].snippet.title;
                    return;
                }
            }
        } catch (e) {}
    }

    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (response.ok) {
            const data = await response.json();
            videoTitle.textContent = data.title;
            return;
        }
    } catch (e) {}

    videoTitle.textContent = 'YouTube Video';
}

function createPlayer() {
    const videoLoading = document.getElementById('video-loading');
    
    player = new YT.Player('video-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'mute': 1,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'controls': 0, // Hide YouTube controls for custom experience
            'disablekb': 1,
            'fs': 0,
            'iv_load_policy': 3
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {

    const videoLoading = document.getElementById('video-loading');
    if (videoLoading) {
        videoLoading.style.display = 'none';
    }

    if (player && typeof player.playVideo === 'function') {
        player.mute();
        player.playVideo();
        showMuteNotification();
    }
    showBlackout();
    

    const continueData = continueWatching.find(v => v.videoId === videoId);
    if (continueData && continueData.progress > 0.1) { // Only if more than 10% watched
        duration = player.getDuration();
        const seekTime = duration * continueData.progress;
        player.seekTo(seekTime);
        
        if (window.EmbarkApp) {
            window.EmbarkApp.showNotification(`Resumed from ${Math.round(continueData.progress * 100)}%`, 'info');
        }
    }
    
    startTime = Date.now();
    setupProgressTracking();
    

    duration = player.getDuration();
    updateTimeDisplay();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        markVideoAsWatched();
        removeFromContinueWatching();
        if (window.EmbarkApp) {
            window.EmbarkApp.showNotification('Video completed!', 'success');
        }
        showBlackout();
    } else if (event.data === YT.PlayerState.PLAYING) {
        startProgressTracking();
        hideBlackoutAfterDelay();
    } else if (event.data === YT.PlayerState.PAUSED) {
        stopProgressTracking();

        const blackout = document.getElementById('video-blackout');
        if (blackout) {
            blackout.classList.remove('hide');
            blackout.style.transition = 'none';
        }
        showCardNotification('Video paused. Press space to play.', 2000);
    }
}

function onPlayerError(event) {
    const videoLoading = document.getElementById('video-loading');
    if (videoLoading) {
        videoLoading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Error loading video. Please try again.</p>
        `;
    }
    
    if (window.EmbarkApp) {
        window.EmbarkApp.showNotification('Error loading video', 'error');
    }
}

function setupProgressTracking() {

    progressInterval = setInterval(() => {
        if (player && player.getCurrentTime && player.getDuration) {
            try {
                currentTime = player.getCurrentTime();
                duration = player.getDuration();
                const progress = currentTime / duration;
                
                updateProgressBar(progress);
                updateTimeDisplay();
                

                if (progress > 0.1 && progress < 0.95) {
                    updateContinueWatching(progress);
                }
            } catch (e) {

            }
        }
    }, 1000);
    

    window.addEventListener('beforeunload', () => {
        if (player && player.getCurrentTime && player.getDuration) {
            try {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                const progress = currentTime / duration;
                
                if (progress > 0.1) {
                    if (progress > 0.8) {
                        markVideoAsWatched();
                        removeFromContinueWatching();
                    } else {
                        updateContinueWatching(progress);
                    }
                }
            } catch (e) {

            }
        }
    });
}

function startProgressTracking() {
    if (!progressInterval) {
        setupProgressTracking();
    }
}

function stopProgressTracking() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgressBar(progress) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress * 100}%`;
    }
}

function updateTimeDisplay() {
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');
    
    if (currentTimeElement) {
        currentTimeElement.textContent = formatTime(currentTime);
    }
    
    if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function markVideoAsWatched() {
    if (!watchedVideos.includes(videoId)) {
        watchedVideos.push(videoId);
        saveWatchedVideos(watchedVideos);
    }
}

function updateContinueWatching(progress) {

    continueWatching = continueWatching.filter(v => v.videoId !== videoId);
    

    const videoTitle = document.getElementById('video-title')?.textContent || `Video ${videoId}`;
    const videoData = {
        videoId: videoId,
        progress: progress,
        title: videoTitle,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        timestamp: Date.now()
    };
    
    continueWatching.push(videoData);
    

    continueWatching.sort((a, b) => b.timestamp - a.timestamp);
    continueWatching = continueWatching.slice(0, 5);
    
    saveContinueWatching(continueWatching);
}

function removeFromContinueWatching() {
    continueWatching = continueWatching.filter(v => v.videoId !== videoId);
    saveContinueWatching(continueWatching);
}

function setupEventListeners() {

    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (window.EmbarkApp) {
                window.EmbarkApp.toggleTheme();
            } else {
                toggleTheme();
            }
        });
    }
    

    const openYouTube = document.getElementById('open-youtube');
    if (openYouTube) {
        openYouTube.addEventListener('click', () => {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        });
    }
    

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            if (player && duration > 0) {
                const rect = progressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const progress = clickX / rect.width;
                const seekTime = duration * progress;
                
                player.seekTo(seekTime);
                updateProgressBar(progress);
            }
        });
    }
}

async function loadRelatedVideos() {
    const relatedVideos = document.getElementById('related-videos');
    if (!relatedVideos) return;
    

    const relatedVideoIds = [
        'dQw4w9WgXcQ', 'jNQXAC9IVRw', 'y6120QOlsfU', 'kJQP7kiw5Fk',
        'L_jWHffIx5E', 'fJ9rUzIMcZQ', 'QB7ACr7pUuE', 'djV11Xbc914'
    ];
    
    const shuffledIds = relatedVideoIds.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    relatedVideos.innerHTML = '';
    
    shuffledIds.forEach(async (id, index) => {
        const videoData = await getVideoData(id);
        const card = createRelatedVideoCard(videoData, id);
        card.style.animationDelay = `${index * 0.1}s`;
        relatedVideos.appendChild(card);
    });
}

function createRelatedVideoCard(videoData, videoId) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    card.innerHTML = `
        <div class="thumbnail">
            <img src="${videoData.thumbnail}" alt="${videoData.title}" loading="lazy">
            <div class="play-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
            <div class="duration-badge">${videoData.duration}</div>
        </div>
        <div class="info">
            <div class="title">${videoData.title}</div>
            <div class="meta">
                <span>Video</span>
                <span>•</span>
                <span>${videoData.views}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `video.html?vid=${videoId}`;
    });
    
    return card;
}

async function getVideoData(videoId) {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    const titles = [
        'Advanced React Patterns',
        'JavaScript Performance Tips',
        'CSS Animation Masterclass',
        'Node.js Best Practices',
        'Web Security Fundamentals',
        'Database Optimization',
        'API Design Principles',
        'Frontend Testing Strategies'
    ];
    
    const views = ['2.1K views', '8.5K views', '15K views', '32K views'];
    const durations = ['10:15', '14:22', '8:45', '16:30'];
    
    return {
        title: titles[Math.floor(Math.random() * titles.length)],
        thumbnail: thumbnailUrl,
        duration: durations[Math.floor(Math.random() * durations.length)],
        views: views[Math.floor(Math.random() * views.length)]
    };
}

function showNotification(message, type = 'info') {
    if (window.EmbarkApp) {
        window.EmbarkApp.showNotification(message, type);
        return;
    }
    

    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: #3b82f6;
        color: white;
        border-radius: 12px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}


function getWatchedVideos() {
    const cookies = document.cookie.split(';');
    const watchedCookie = cookies.find(cookie => cookie.trim().startsWith('embark-watched='));
    
    if (watchedCookie) {
        const watchedData = watchedCookie.split('=')[1];
        try {
            return JSON.parse(decodeURIComponent(watchedData));
        } catch (e) {
            return [];
        }
    }
    
    return [];
}

function saveWatchedVideos(videoIds) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    
    document.cookie = `embark-watched=${encodeURIComponent(JSON.stringify(videoIds))}; expires=${expires.toUTCString()}; path=/`;
}

function getContinueWatching() {
    try {
        const stored = localStorage.getItem('embark-continue-watching');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveContinueWatching(videos) {
    localStorage.setItem('embark-continue-watching', JSON.stringify(videos));
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('embark-theme') || 'dark';
    document.body.className = savedTheme + '-theme video-page';
    document.body.style.transition = 'background 0.5s, color 0.5s';
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.transition = 'background 0.5s, color 0.5s';
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.className = newTheme + '-theme video-page';
    document.body.style.transition = 'background 0.5s, color 0.5s';
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.transition = 'background 0.5s, color 0.5s';
    localStorage.setItem('embark-theme', newTheme);
}

function renderCustomControls() {
    const controls = document.getElementById('custom-controls');
    if (!controls) return;
    const isMobile = window.innerWidth <= 768; // Changed from 480 to 768 to include tablets
    if (isMobile) {
      controls.innerHTML = `
        <div class="cc-mobile-row cc-mobile-row1">
          <button id="play-pause" title="Play/Pause" class="cc-mobile-btn">
            <svg id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg id="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
          </button>
        </div>
        <div class="cc-mobile-row cc-mobile-row2">
          <span class="time" id="current-time-ctrl">0:00</span>
          <div class="seek-bar" id="seek-bar">
            <div class="seek-fill" id="seek-fill"></div>
          </div>
          <span class="time" id="total-time-ctrl">0:00</span>
        </div>
        <div class="cc-mobile-row cc-mobile-row3">
          <button id="mute-unmute" title="Mute/Unmute" class="cc-mobile-btn">
            <svg id="volume-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 10v4h4l5 5V5l-5 5H3z"/></svg>
            <svg id="mute-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z"/><path d="M19 12c0 2.76-2.24 5-5 5v-2c1.66 0 3-1.34 3-3s-1.34-3-3-3V7c2.76 0 5 2.24 5 5z"/><path d="M1 1l22 22" stroke="#ef4444" stroke-width="2"/></svg>
          </button>
          <div class="volume-bar" id="volume-bar">
            <div class="volume-fill" id="volume-fill"></div>
          </div>
          <select id="speed-select" title="Playback Speed" class="cc-mobile-select">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
          <button id="fullscreen-btn" title="Fullscreen" class="cc-mobile-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6V2H2v8h2V4zm16 0v6h2V2h-8v2h6zm0 16h-6v2h8v-8h-2v6zM4 20v-6H2v8h8v-2H4z"></path></svg>
          </button>
        </div>
      `;
    } else {
      controls.innerHTML = `
        <button id="play-pause" title="Play/Pause">
          <svg id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg id="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
        </button>
        <span class="time" id="current-time-ctrl">0:00</span>
        <div class="seek-bar" id="seek-bar">
          <div class="seek-fill" id="seek-fill"></div>
        </div>
        <span class="time" id="total-time-ctrl">0:00</span>
        <button id="mute-unmute" title="Mute/Unmute">
          <svg id="volume-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 10v4h4l5 5V5l-5 5H3z"/></svg>
          <svg id="mute-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z"/><path d="M19 12c0 2.76-2.24 5-5 5v-2c1.66 0 3-1.34 3-3s-1.34-3-3-3V7c2.76 0 5 2.24 5 5z"/><path d="M1 1l22 22" stroke="#ef4444" stroke-width="2"/></svg>
        </button>
        <div class="volume-bar" id="volume-bar">
          <div class="volume-fill" id="volume-fill"></div>
        </div>
        <select id="speed-select" title="Playback Speed">
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1" selected>1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
        <button id="fullscreen-btn" title="Fullscreen">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6V2H2v8h2V4zm16 0v6h2V2h-8v2h6zm0 16h-6v2h8v-8h-2v6zM4 20v-6H2v8h8v-2H4z"></path></svg>
        </button>
      `;
    }
    setupCustomControls();
}

function setupCustomControls() {
    const playPause = document.getElementById('play-pause');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const muteUnmute = document.getElementById('mute-unmute');
    const volumeIcon = document.getElementById('volume-icon');
    const muteIcon = document.getElementById('mute-icon');
    const seekBar = document.getElementById('seek-bar');
    const seekFill = document.getElementById('seek-fill');
    const currentTimeCtrl = document.getElementById('current-time-ctrl');
    const totalTimeCtrl = document.getElementById('total-time-ctrl');
    const volumeBar = document.getElementById('volume-bar');
    const volumeFill = document.getElementById('volume-fill');
    const speedSelect = document.getElementById('speed-select');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    let isDragging = false;
    let isVolumeDragging = false;


    playPause.onclick = () => {
        if (!player) return;
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    setInterval(() => {
        if (!player) return;
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = '';
        } else {
            playIcon.style.display = '';
            pauseIcon.style.display = 'none';
        }
    }, 300);


    seekBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSeek(e);
    });
    seekBar.addEventListener('mousemove', (e) => {
        if (isDragging) updateSeek(e);
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
    function updateSeek(e) {
        if (!player || !duration) return;
        const rect = seekBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        seekFill.style.width = `${percent * 100}%`;
        if (isDragging) {
            player.seekTo(duration * percent, true);
        }
    }

    setInterval(() => {
        if (!player || isDragging) return;
        const cur = player.getCurrentTime();
        const dur = player.getDuration();
        seekFill.style.width = dur ? `${(cur / dur) * 100}%` : '0%';
        currentTimeCtrl.textContent = formatTime(cur);
        totalTimeCtrl.textContent = formatTime(dur);
    }, 300);


    volumeBar.addEventListener('mousedown', (e) => {
        isVolumeDragging = true;
        updateVolume(e);
    });
    volumeBar.addEventListener('mousemove', (e) => {
        if (isVolumeDragging) updateVolume(e);
    });
    document.addEventListener('mouseup', () => { isVolumeDragging = false; });
    function updateVolume(e) {
        if (!player) return;
        const rect = volumeBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        volumeFill.style.width = `${percent * 100}%`;
        player.setVolume(percent * 100);
        if (percent === 0) {
            player.mute();
            volumeIcon.style.display = 'none';
            muteIcon.style.display = '';
        } else {
            player.unMute();
            volumeIcon.style.display = '';
            muteIcon.style.display = 'none';
        }
    }

    setInterval(() => {
        if (!player) return;
        if (player.isMuted() || player.getVolume() === 0) {
            volumeIcon.style.display = 'none';
            muteIcon.style.display = '';
        } else {
            volumeIcon.style.display = '';
            muteIcon.style.display = 'none';
        }
        volumeFill.style.width = `${player.getVolume()}%`;
    }, 500);
    muteUnmute.onclick = () => {
        if (!player) return;
        if (player.isMuted() || player.getVolume() === 0) {
            player.unMute();
            player.setVolume(100);
            showUnmuteNotification();
        } else {
            player.mute();
            showMuteNotification();
        }
    };


    speedSelect.onchange = () => {
        if (!player) return;
        player.setPlaybackRate(Number(speedSelect.value));
    };


    fullscreenBtn.onclick = () => {
        const wrapper = document.getElementById('video-wrapper');
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
}

function showBlackout() {
    const blackout = document.getElementById('video-blackout');
    if (blackout) {
        blackout.classList.remove('hide');
        blackout.style.transition = 'none';
    }
}

function hideBlackoutAfterDelay() {
    const blackout = document.getElementById('video-blackout');
    if (blackout) {
        blackout.style.transition = '';
        setTimeout(() => {
            blackout.classList.add('hide');
        }, 3000);
    }
}

function showMuteNotification() {
    const muteDiv = document.getElementById('mute-notification');
    if (!muteDiv) return;
    muteDiv.textContent = 'Video is muted. Press M to unmute.';
    muteDiv.style.display = '';
    muteDiv.classList.remove('hide');
    setTimeout(() => {
        muteDiv.classList.add('hide');
        setTimeout(() => { muteDiv.style.display = 'none'; }, 300);
    }, 2500);
}

function showUnmuteNotification() {
    const muteDiv = document.getElementById('mute-notification');
    if (!muteDiv) return;
    muteDiv.textContent = 'Video is unmuted.';
    muteDiv.style.display = '';
    muteDiv.classList.remove('hide');
    setTimeout(() => {
        muteDiv.classList.add('hide');
        setTimeout(() => { muteDiv.style.display = 'none'; }, 300);
    }, 2000);
}

function showCardNotification(message, duration = 2000) {
    const muteDiv = document.getElementById('mute-notification');
    if (!muteDiv) return;
    muteDiv.textContent = message;
    muteDiv.style.display = '';
    muteDiv.classList.remove('hide');
    setTimeout(() => {
        muteDiv.classList.add('hide');
        setTimeout(() => { muteDiv.style.display = 'none'; }, 300);
    }, duration);
}

window.addEventListener('keydown', function(e) {

    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
    if (!player) return;
    switch (e.code) {
        case 'Space':
        case 'Spacebar': // for older browsers
            e.preventDefault();
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (typeof player.getCurrentTime === 'function') {
                player.seekTo(player.getCurrentTime() + 10, true);
                showCardNotification('Skipped +10s', 1200);
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (typeof player.getCurrentTime === 'function') {
                player.seekTo(Math.max(0, player.getCurrentTime() - 10), true);
                showCardNotification('Skipped -10s', 1200);
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (typeof player.getVolume === 'function' && typeof player.setVolume === 'function') {
                let vol = player.getVolume();
                let newVol = Math.min(100, vol + 10);
                player.setVolume(newVol);
                showCardNotification('Volume: ' + newVol + '%', 1200);
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (typeof player.getVolume === 'function' && typeof player.setVolume === 'function') {
                let vol = player.getVolume();
                let newVol = Math.max(0, vol - 10);
                player.setVolume(newVol);
                showCardNotification('Volume: ' + newVol + '%', 1200);
            }
            break;
        case 'KeyM':
            e.preventDefault();
            if (player.isMuted() || player.getVolume() === 0) {
                player.unMute();
                player.setVolume(100);
                showUnmuteNotification();
            } else {
                player.mute();
                showMuteNotification();
            }
            break;
    }
});


window.addEventListener('resize', () => {
  if (document.getElementById('custom-controls')) {
    renderCustomControls();
  }
});
