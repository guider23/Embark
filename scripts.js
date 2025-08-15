// Get configuration from config.js
const getConfig = () => window.EmbarkConfig || {
    supabase: {
        url: 'https://dlveprsuwfbqqshlvgig.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdmVwcnN1d2ZicXFzaGx2Z2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTE5NTksImV4cCI6MjA2NTk4Nzk1OX0.p6uFAH3mXgr18JwVXetO2oiAnYa8Gu6YVHj4_uTulJQ'
    },
    youtube: {
        apiKey: 'AIzaSyCYk-HJnkIzjp42on-u1MCVA_wgKDfv_fA'
    }
};

const config = getConfig();
const SUPABASE_URL = config.supabase.url;
const SUPABASE_ANON_KEY = config.supabase.anonKey;
const YOUTUBE_API_KEY = config.youtube.apiKey;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allFeedData = [];
let watchedVideos = getWatchedVideos();
let continueWatching = getContinueWatching();
let currentOriginalUrl = '';

const ARTICLE_IMAGES = [
    'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181540/pexels-photo-1181540.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181562/pexels-photo-1181562.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181580/pexels-photo-1181580.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181619/pexels-photo-1181619.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590045/pexels-photo-590045.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590515/pexels-photo-590515.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181248/pexels-photo-1181248.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181304/pexels-photo-1181304.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181325/pexels-photo-1181325.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181368/pexels-photo-1181368.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181403/pexels-photo-1181403.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181475/pexels-photo-1181475.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181480/pexels-photo-1181480.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181544/pexels-photo-1181544.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181548/pexels-photo-1181548.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181570/pexels-photo-1181570.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181590/pexels-photo-1181590.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181625/pexels-photo-1181625.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181694/pexels-photo-1181694.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181723/pexels-photo-1181723.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/1181781/pexels-photo-1181781.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590018/pexels-photo-590018.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590027/pexels-photo-590027.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590043/pexels-photo-590043.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590047/pexels-photo-590047.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590495/pexels-photo-590495.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    'https://images.pexels.com/photos/590517/pexels-photo-590517.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
];

const loadingScreen = document.getElementById('loading-screen');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const notificationsButton = document.getElementById('notifications-button');
const dmButton = document.getElementById('dm-button');
const videosGrid = document.getElementById('videos-grid');
const articlesGrid = document.getElementById('articles-grid');
const continueWatchingSection = document.getElementById('continue-watching');
const continueWatchingContent = document.getElementById('continue-watching-content');
const clearContinueButton = document.getElementById('clear-continue');
const refreshVideosButton = document.getElementById('refresh-videos');
const refreshArticlesButton = document.getElementById('refresh-articles');
const videoCountElement = document.getElementById('video-count');
const articleCountElement = document.getElementById('article-count');
const articleModal = document.getElementById('article-modal');
const closeModal = document.getElementById('close-modal');
const openOriginal = document.getElementById('open-original');
const articleIframe = document.getElementById('article-iframe');
const modalTitle = document.getElementById('modal-title');
const iframeLoading = document.getElementById('iframe-loading');

const urgentQuestSection = document.getElementById('urgent-quest');
const urgentQuestTimer = document.getElementById('urgent-quest-timer');
const urgentQuestContent = document.getElementById('urgent-quest-content');

const URGENT_QUEST_COOKIE = 'embark-urgent-quest';
const URGENT_QUEST_HOURS = 12;

function getUrgentQuestFromCookie() {
    const cookies = document.cookie.split(';');
    const questCookie = cookies.find(cookie => cookie.trim().startsWith(URGENT_QUEST_COOKIE + '='));
    if (questCookie) {
        try {
            return JSON.parse(decodeURIComponent(questCookie.split('=')[1]));
        } catch (e) {
            return null;
        }
    }
    return null;
}

function setUrgentQuestCookie(quest) {
    const expires = new Date(quest.deadline).toUTCString();
    document.cookie = `${URGENT_QUEST_COOKIE}=${encodeURIComponent(JSON.stringify(quest))}; expires=${expires}; path=/`;
}

function getNextNoonTimestamp() {
    const now = new Date();
    const nextNoon = new Date(now);
    nextNoon.setHours(12, 0, 0, 0);
    if (now >= nextNoon) {
        nextNoon.setDate(nextNoon.getDate() + 1);
    }
    return nextNoon.getTime();
}

function createNewUrgentQuest() {
    const deadline = getNextNoonTimestamp();
    return {
        title: 'Learn this to earn perks',
        deadline: deadline
    };
}

let urgentQuest = getUrgentQuestFromCookie();
if (!urgentQuest || urgentQuest.deadline < Date.now()) {
    urgentQuest = createNewUrgentQuest();
    setUrgentQuestCookie(urgentQuest);
}

document.addEventListener('DOMContentLoaded', async () => {
    initializeTheme();
    setupEventListeners();
    await loadFeedData();
    displayContent();
    hideLoadingScreen();
    setupUrgentQuestAccept();
    if (!window.gsap) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        script.onload = setupFullscreenArticle;
        document.head.appendChild(script);
    } else {
        setupFullscreenArticle();
    }
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('embark-theme') || 'dark';
    document.body.className = savedTheme + '-theme';
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    
    document.body.className = newTheme + '-theme';
    localStorage.setItem('embark-theme', newTheme);
}

function setupEventListeners() {
    searchInput?.addEventListener('click', () => {
        showNotification('Search feature coming soon!', 'info');
    });
    
    themeToggle?.addEventListener('click', toggleTheme);
    
    notificationsButton?.addEventListener('click', () => {
        showNotification('No new notifications', 'info');
    });
    
    dmButton?.addEventListener('click', () => {
        showNotification('Direct messages coming soon!', 'info');
    });
    
    clearContinueButton?.addEventListener('click', clearContinueWatching);
    refreshVideosButton?.addEventListener('click', refreshVideos);
    refreshArticlesButton?.addEventListener('click', refreshArticles);
    
    closeModal?.addEventListener('click', closeArticleModal);
    openOriginal?.addEventListener('click', () => {
        if (currentOriginalUrl) {
            window.open(currentOriginalUrl, '_blank');
        }
    });
    
    articleModal?.addEventListener('click', (e) => {
        if (e.target === articleModal) {
            closeArticleModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !articleModal?.classList.contains('hidden')) {
            closeArticleModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
            document.cookie.split(';').forEach(function(c) {
                document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
            });
            showNotification('All cookies cleared!', 'success');
        }
    });
}

async function loadFeedData() {
    try {
        const { data, error } = await supabase
            .from('feed')
            .select('*');
        
        if (error) {
            throw error;
        }
        
        allFeedData = data || [];
    } catch (error) {
        allFeedData = [
            {
                id: 1,
                yt_link: 'https://www.youtube.com/watch?v=MVWzn5EIdIY',
                medium_link: 'https://medium.com/@dipanshu10/paying-for-software-3065d4fb0d92'
            },
            {
                id: 2,
                yt_link: 'https://www.youtube.com/watch?v=2cUQWhSrOK0',
                medium_link: 'https://medium.com/lets-code-future/top-10-open-source-web-development-tools-in-2023-d8c2f9c58d3c'
            }
        ];
        showNotification('Using demo data - check console for details', 'warning');
    }
}

function displayContent() {
    displayContinueWatching();
    showUrgentQuest();
    displayVideos();
    displayArticles();
    updateStats();
}

function displayContinueWatching() {
    if (continueWatching.length === 0) {
        continueWatchingSection?.classList.add('hidden');
        return;
    }
    
    continueWatchingSection?.classList.remove('hidden');
    if (continueWatchingContent) {
        continueWatchingContent.innerHTML = '';
        
        continueWatching.forEach((video, index) => {
            const card = createContinueWatchingCard(video);
            card.style.animationDelay = `${index * 0.1}s`;
            continueWatchingContent.appendChild(card);
        });
    }
}

function createContinueWatchingCard(video) {
    const card = document.createElement('div');
    card.className = 'continue-card';
    
    const progressPercent = Math.round(video.progress * 100);
    
    card.innerHTML = `
        <div class="thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" onerror="this.src='https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'">
            <div class="progress-overlay">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        <div class="info">
            <div class="title">${video.title}</div>
            <div class="progress-text">${progressPercent}% watched</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `video.html?vid=${video.videoId}`;
    });
    
    return card;
}

function displayVideos() {
    const continueIds = continueWatching.map(v => v.videoId);
    const availableVideos = allFeedData.filter(item => {
        const vid = extractVideoId(item.yt_link);
        return item.yt_link && !watchedVideos.includes(vid) && !continueIds.includes(vid);
    });
    const selectedVideos = shuffleArray(availableVideos).slice(0, 6);
    
    if (videosGrid) {
        videosGrid.innerHTML = '';
        (async () => {
            for (let [index, item] of selectedVideos.entries()) {
                const videoId = extractVideoId(item.yt_link);
                if (videoId) {
                    const videoData = await getVideoData(videoId);
                    const card = createVideoCard(videoData, videoId);
                    card.style.animationDelay = `${index * 0.1}s`;
                    videosGrid.appendChild(card);
                }
            }
            const remainingSlots = 6 - selectedVideos.length;
            for (let i = 0; i < remainingSlots; i++) {
                const skeleton = document.createElement('div');
                skeleton.className = 'video-skeleton';
                videosGrid.appendChild(skeleton);
            }
            updateStats();
        })();
    }
}

function displayArticles() {
    const availableArticles = allFeedData.filter(item => item.medium_link);
    const selectedArticles = shuffleArray(availableArticles).slice(0, 4);
    
    if (articlesGrid) {
        articlesGrid.innerHTML = '';
        (async () => {
            for (let [index, item] of selectedArticles.entries()) {
                const articleData = await getArticleData(item.medium_link, index);
                const card = createArticleCard(articleData, item.medium_link);
                card.style.animationDelay = `${index * 0.1}s`;
                articlesGrid.appendChild(card);
            }
            const remainingSlots = 4 - selectedArticles.length;
            for (let i = 0; i < remainingSlots; i++) {
                const skeleton = document.createElement('div');
                skeleton.className = 'article-skeleton';
                articlesGrid.appendChild(skeleton);
            }
            updateStats();
        })();
    }
}

function createVideoCard(videoData, videoId) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    card.innerHTML = `
        <div class="thumbnail">
            <img src="${videoData.thumbnail}" alt="${videoData.title}" loading="lazy" onerror="this.src='https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'">
            <div class="play-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
            <div class="duration-badge">${videoData.duration || '10:32'}</div>
        </div>
        <div class="info">
            <div class="title">${videoData.title}</div>
            <div class="meta">
                <span>Video</span>
                <span>•</span>
                <span>${videoData.views || 'New'}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `video.html?vid=${videoId}`;
    });
    
    return card;
}

function createArticleCard(articleData, mediumLink) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    card.innerHTML = `
        <div class="thumbnail">
            <img src="${articleData.image}" alt="${articleData.title}" loading="lazy" onerror="this.src='https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'">
            <div class="category-badge">${articleData.category}</div>
        </div>
        <div class="info">
            <div class="title">${articleData.title}</div>
            <div class="excerpt">${articleData.excerpt}</div>
            <div class="meta">
                ${articleData.author ? `<span>${articleData.author}</span>` : ''}
                ${articleData.readTime ? `<div class="read-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    ${articleData.readTime}
                </div>` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        openArticleModal(articleData.title, mediumLink);
    });
    
    return card;
}

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function getVideoData(videoId) {
    if (YOUTUBE_API_KEY) {
        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    const item = data.items[0];
                    const isoDuration = item.contentDetails.duration;
                    const duration = parseYouTubeDuration(isoDuration);
                    return {
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                        duration: duration,
                        views: item.statistics.viewCount ? `${Number(item.statistics.viewCount).toLocaleString()} views` : ''
                    };
                }
            }
        } catch (e) {
        }
    }
    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (!response.ok) throw new Error('oEmbed fetch failed');
        const data = await response.json();
        return {
            title: data.title,
            thumbnail: data.thumbnail_url,
            duration: '',
            views: ''
        };
    } catch (e) {
        return {
            title: 'YouTube Video',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: '',
            views: ''
        };
    }
}

function parseYouTubeDuration(iso) {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
}

async function getArticleData(mediumLink, index) {
    try {
        const oembedUrl = `https://medium.com/oembed?url=${encodeURIComponent(mediumLink)}`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
            const data = await response.json();
            return {
                title: data.title || 'Featured Article',
                excerpt: '',
                image: ARTICLE_IMAGES[index % ARTICLE_IMAGES.length],
                category: 'Article',
                author: '',
                readTime: ''
            };
        }
    } catch (e) {
    }
    const urlParts = mediumLink.split('/');
    let slug = urlParts[urlParts.length - 1] || 'article';
    slug = slug.replace(/-[a-f0-9]{6,}$/i, '');
    slug = slug.replace(/[a-f0-9]{6,}$/i, '');
    let title = slug.replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .slice(0, 60);
    const titleEnhancements = [
        'The Complete Guide to',
        'Understanding',
        'Mastering',
        'Building Better',
        'Advanced Techniques for',
        'A Deep Dive into',
        'Best Practices for',
        'The Future of'
    ];
    if (title.length < 30) {
        const enhancement = titleEnhancements[Math.floor(Math.random() * titleEnhancements.length)];
        title = `${enhancement} ${title}`;
    }
    const excerpts = [
        'Discover the latest trends and techniques that are shaping the future of web development. Learn from industry experts and apply these insights to your projects.',
        'A comprehensive guide covering everything you need to know about modern development practices, tools, and methodologies used by top companies.',
        'Explore advanced concepts and practical examples that will help you build better applications and improve your development workflow.',
        'Learn how to implement best practices and avoid common pitfalls in your development journey. Includes real-world examples and case studies.',
        'Deep dive into the technical aspects and architectural decisions that make applications scalable, maintainable, and performant.'
    ];
    const categories = ['Tech', 'Development', 'Design', 'Programming', 'Web Dev', 'Software'];
    const imageIndex = index % ARTICLE_IMAGES.length;
    return {
        title: title || 'Featured Article',
        excerpt: excerpts[Math.floor(Math.random() * excerpts.length)],
        image: ARTICLE_IMAGES[imageIndex],
        category: categories[Math.floor(Math.random() * categories.length)],
        author: '',
        readTime: ''
    };
}

function openArticleModal(title, mediumLink) {
    currentOriginalUrl = mediumLink;
    modalTitle.textContent = title;
    iframeLoading.style.display = 'flex';
    const loadingText = iframeLoading.querySelector('p');
    if (loadingText) loadingText.textContent = 'Loading premium article...';
    articleIframe.style.display = 'none';
    articleIframe.src = 'about:blank';
    setTimeout(() => {
        const archiveUrl = `https://archive.is/${mediumLink}`;
        articleIframe.src = archiveUrl;
    }, 50);
    articleModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    articleIframe.onload = () => {
        iframeLoading.style.display = 'none';
        articleIframe.style.display = 'block';
    };
}

function closeArticleModal() {
    articleModal.classList.add('hidden');
    articleIframe.src = '';
    currentOriginalUrl = '';
    document.body.style.overflow = '';
}

function clearContinueWatching() {
    continueWatching = [];
    saveContinueWatching(continueWatching);
    displayContinueWatching();
    showNotification('Continue watching cleared', 'success');
}

async function refreshVideos() {
    showNotification('Refreshing videos...', 'info');
    videosGrid.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'video-skeleton';
        videosGrid.appendChild(skeleton);
    }
    
    setTimeout(() => {
        displayVideos();
        updateStats();
        showNotification('Videos refreshed!', 'success');
    }, 1000);
}

async function refreshArticles() {
    showNotification('Refreshing articles...', 'info');
    articlesGrid.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'article-skeleton';
        articlesGrid.appendChild(skeleton);
    }
    
    setTimeout(() => {
        displayArticles();
        updateStats();
        showNotification('Articles refreshed!', 'success');
    }, 1000);
}

function updateStats() {
    const videoCount = videosGrid
        ? videosGrid.querySelectorAll('.video-card').length
        : 0;
    const articleCount = articlesGrid
        ? articlesGrid.querySelectorAll('.article-card').length
        : 0;
    
    if (videoCountElement) {
        animateNumber(videoCountElement, videoCount);
    }
    if (articleCountElement) {
        animateNumber(articleCountElement, articleCount);
    }
}

function animateNumber(element, target) {
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
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

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function hideLoadingScreen() {
    setTimeout(() => {
        loadingScreen?.classList.add('hidden');
    }, 1500);
}

function showNotification(message, type = 'info') {
    let stack = document.querySelector('.notification-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.className = 'notification-stack';
        document.body.appendChild(stack);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Get icon for notification type
    const icons = {
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
    };

    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.click()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    // Enhanced styling
    Object.assign(notification.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '16px',
        color: 'white',
        fontWeight: '500',
        fontSize: '14px',
        minWidth: '320px',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
        background: {
            info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            error: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)'
        }[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        transform: 'translateX(100%) scale(0.8)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        zIndex: '10001',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer'
    });

    // Style the icon container
    const iconElement = notification.querySelector('.notification-icon');
    Object.assign(iconElement.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        flexShrink: '0'
    });

    // Style the content
    const contentElement = notification.querySelector('.notification-content');
    Object.assign(contentElement.style, {
        flex: '1',
        lineHeight: '1.4'
    });

    // Style the close button
    const closeElement = notification.querySelector('.notification-close');
    Object.assign(closeElement.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: '0'
    });

    // Add hover effects
    closeElement.addEventListener('mouseenter', () => {
        closeElement.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        closeElement.style.transform = 'scale(1.1)';
    });
    
    closeElement.addEventListener('mouseleave', () => {
        closeElement.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        closeElement.style.transform = 'scale(1)';
    });

    stack.appendChild(notification);

    // Click to dismiss
    notification.addEventListener('click', () => {
        dismissNotification(notification, stack);
    });

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
    }, 100);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
        dismissNotification(notification, stack);
    }, 4000);
}

function dismissNotification(notification, stack) {
    if (!notification || !notification.parentNode) return;
    
    notification.style.transform = 'translateX(100%) scale(0.8)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
        if (stack.childElementCount === 0 && stack.parentNode) stack.parentNode.removeChild(stack);
    }, 400);
}

function setupFullscreenArticle() {
    const fullscreenBtn = document.getElementById('fullscreen-article');
    const modal = document.getElementById('article-modal');
    const modalContainer = modal?.querySelector('.modal-container');
    let isFullscreen = false;
    if (fullscreenBtn && modalContainer) {
        fullscreenBtn.onclick = () => {
            if (!window.gsap) return;
            if (!isFullscreen) {
                modalContainer.classList.add('fullscreen');
                gsap.fromTo(modalContainer, {
                    scale: 0.95,
                    opacity: 0.7
                }, {
                    duration: 0.5,
                    scale: 1,
                    opacity: 1,
                    ease: 'power2.inOut',
                    clearProps: 'scale,opacity'
                });
                isFullscreen = true;
                fullscreenBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 9v-6h-6v6h2v-4h4v4h2zm6 6v6h6v-6h-2v4h-4v-4h-2z"/></svg> Exit Fullscreen`;
            } else {
                gsap.fromTo(modalContainer, {
                    scale: 1,
                    opacity: 1
                }, {
                    duration: 0.5,
                    scale: 0.95,
                    opacity: 0.7,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        modalContainer.classList.remove('fullscreen');
                        gsap.set(modalContainer, { clearProps: 'scale,opacity' });
                    }
                });
                isFullscreen = false;
                fullscreenBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6V2H2v8h2V4zm16 0v6h2V2h-8v2h6zm0 16h-6v2h8v-8h-2v6zM4 20v-6H2v8h8v-2H4z"></path></svg> Fullscreen`;
            }
        };
    }
    const backToFeedBtn = document.getElementById('back-to-feed');
    if (backToFeedBtn) {
        backToFeedBtn.onclick = () => {
            closeArticleModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

function isUrgentQuestHidden() {
    const cookies = document.cookie.split(';');
    const hideCookie = cookies.find(cookie => cookie.trim().startsWith('embark-urgent-quest-hide='));
    if (hideCookie) {
        const match = hideCookie.match(/embark-urgent-quest-hide=(\d+)/);
        if (match) {
            const hideUntil = parseInt(match[1], 10);
            if (!isNaN(hideUntil) && Date.now() < hideUntil) {
                return true;
            }
        }
    }
    return false;
}

function showUrgentQuest() {
    if (isUrgentQuestHidden() || !urgentQuest) {
        urgentQuestSection?.classList.add('hidden');
        return;
    }
    urgentQuestSection?.classList.remove('hidden');
    urgentQuestContent.innerHTML = '';
    // Set infinity symbol instead of running timer
    urgentQuestTimer.textContent = '∞';
}

function updateUrgentQuestTimer() {
    const now = Date.now();
    let diff = Math.max(0, urgentQuest.deadline - now);
    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    diff %= 1000 * 60 * 60;
    const minutes = String(Math.floor(diff / (1000 * 60))).padStart(2, '0');
    diff %= 1000 * 60;
    const seconds = String(Math.floor(diff / 1000)).padStart(2, '0');
    urgentQuestTimer.textContent = `${hours}:${minutes}:${seconds}`;
    const acceptBtn = document.getElementById('urgent-quest-accept');
    if (urgentQuest.deadline - now <= 0) {
        urgentQuestTimer.textContent = '00:00:00';
        urgentQuestContent.textContent = 'Quest expired!';
        clearInterval(window.urgentQuestTimerInterval);
        if (acceptBtn) acceptBtn.disabled = true;
    } else {
        if (acceptBtn) acceptBtn.disabled = false;
    }
}

function ensureUrgentQuestModal() {
    if (document.getElementById('urgent-quest-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'urgent-quest-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.65)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '100000';
    modal.innerHTML = `
      <div style="background:var(--bg-elevated,#222);padding:2rem 2.5rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:95vw;width:350px;text-align:center;">
        <div style="font-size:1.1rem;font-weight:600;margin-bottom:1.5rem;">Before you start...</div>
        <div style="margin-bottom:1.2rem;display:flex;align-items:flex-start;gap:0.7rem;">
          <input type='checkbox' id='uq-modal-checkbox' style='margin-top:0.2rem;'>
          <label for='uq-modal-checkbox' style='text-align:left;cursor:pointer;'>I ensure that I will read and complete the urgent quest without any cheating.</label>
        </div>
        <button id='uq-modal-start' style='padding:0.6rem 2.2rem;background:var(--accent-primary);color:#fff;border:none;border-radius:8px;font-size:1.08rem;font-weight:700;cursor:pointer;transition:background 0.2s;' disabled>Start</button>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => { document.getElementById('uq-modal-checkbox').focus(); }, 100);
}

function setupUrgentQuestAccept() {
    const btn = document.getElementById('urgent-quest-accept');
    if (!btn) return;
    btn.onclick = (e) => {
        e.preventDefault();
        showNotification('Level not unlocked yet', 'warning');
    };
}

window.EmbarkApp = {
    extractVideoId,
    getWatchedVideos,
    saveWatchedVideos,
    getContinueWatching,
    saveContinueWatching,
    toggleTheme,
    initializeTheme,
    showNotification,
    dismissNotification
};