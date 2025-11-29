// === BOYU | 星际音频核心 V8.0 (修复版) ===

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 智能路径修正
    const path = window.location.pathname;
    const subFolders = ['/blog/', '/travel/', '/media/'];
    const isSubPage = subFolders.some(folder => path.includes(folder));
    const pathPrefix = isSubPage ? '../' : '';

    // 2. 歌单配置
    const playlist = [
        { title: "Saman", artist: "Ólafur Arnalds", src: "assets/Saman.mp3" },
        { title: "Oceans", artist: "Ólafur Arnalds", src: "assets/Oceans.mp3" },
        { title: "Loom", artist: "Ólafur Arnalds", src: "assets/Loom.mp3" },
        { title: "My Only Girl", artist: "方大同", src: "assets/MyOnlyGirl.mp3" }
    ];

    // 3. 获取 DOM 元素 (统一变量名，防止出错)
    const audio = document.getElementById('global-audio');
    const masterWave = document.getElementById('master-wave');
    const trackNameDisplay = document.getElementById('current-track-name');
    const timeDisplay = document.getElementById('time-display');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar'); // 关键修复：统一ID
    const playlistContainer = document.getElementById('playlist-container');
    const durationEl = document.getElementById('duration');
    
    // 如果页面没播放器，退出
    if (!audio) return;

    let currentTrackIndex = 0;
    let isDragging = false;
    audio.volume = 0.5;

    // === 记忆恢复 ===
    function initAudioState() {
        const savedIndex = localStorage.getItem('audio_index');
        const savedTime = localStorage.getItem('audio_time');
        const wasPlaying = localStorage.getItem('audio_playing') === 'true';

        if (savedIndex !== null) {
            currentTrackIndex = parseInt(savedIndex);
            audio.src = pathPrefix + playlist[currentTrackIndex].src;
            const restoreTime = parseFloat(savedTime || 0);
            if(restoreTime > 0 && isFinite(restoreTime)) audio.currentTime = restoreTime;
        } else {
            audio.src = pathPrefix + playlist[0].src;
        }

        renderPlaylist();
        
        if (wasPlaying) {
            updateUIState(true);
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // 自动播放失败静默处理，等待用户交互
                    const resume = () => { audio.play(); removeListeners(); };
                    const removeListeners = () => ['click','keydown','wheel','touchstart'].forEach(e => document.removeEventListener(e, resume));
                    ['click','keydown','wheel','touchstart'].forEach(e => document.addEventListener(e, resume, {once:true}));
                });
            }
        } else {
            updateUIState(false);
        }
    }

    // 保存状态
    window.addEventListener('pagehide', () => {
        localStorage.setItem('audio_index', currentTrackIndex);
        localStorage.setItem('audio_time', audio.currentTime);
        const isActive = !audio.paused || (masterWave && masterWave.classList.contains('playing'));
        localStorage.setItem('audio_playing', isActive);
    });

    // === 渲染歌单 ===
    function renderPlaylist() {
        if(!playlistContainer) return;
        playlistContainer.innerHTML = '';
        playlist.forEach((track, index) => {
            const div = document.createElement('div');
            div.className = `track-item relative group/item border-b border-white/5 transition-colors hover:bg-white/5`;
            div.innerHTML = `
                <div class="flex items-center gap-4 p-3 cursor-pointer" onclick="window.playTrack(${index})">
                    <div class="text-dim text-xs font-mono w-4">0${index + 1}</div>
                    <div class="flex-1">
                        <div class="text-white font-serif text-sm tracking-wide track-title">${track.title}</div>
                        <div class="text-dim text-[10px] font-mono mt-0.5">${track.artist}</div>
                    </div>
                    <div class="w-6 flex justify-center text-accent-blue transition-opacity opacity-0 group-hover/item:opacity-50 icon-box">
                        <i class="ri-play-fill track-icon text-lg"></i>
                    </div>
                </div>
            `;
            playlistContainer.appendChild(div);
        });
        // 延迟一下更新高亮，确保DOM生成完毕
        setTimeout(() => updateUIState(!audio.paused), 50);
    }

    // === 全局控制函数 ===

    window.toggleMainPlayback = function() {
        if (audio.paused) {
            if (!audio.src || audio.src === window.location.href) audio.src = pathPrefix + playlist[currentTrackIndex].src;
            audio.play().then(() => updateUIState(true));
        } else {
            audio.pause();
            updateUIState(false);
        }
    };

    window.playTrack = function(index) {
        if (currentTrackIndex === index && !audio.paused) {
            audio.pause(); updateUIState(false);
        } else {
            currentTrackIndex = index;
            audio.src = pathPrefix + playlist[index].src;
            audio.play().then(() => updateUIState(true)).catch(console.error);
        }
    };

    function updateUIState(isPlaying) {
        const track = playlist[currentTrackIndex];
        
        // 更新文字
        if(trackNameDisplay) {
            trackNameDisplay.innerHTML = isPlaying ? `<span class="text-accent-blue">PLAYING:</span> ${track.title.toUpperCase()}` : "AUDIO PAUSED";
        }
        
        // 更新波形
        if(masterWave) {
            if(isPlaying) {
                masterWave.classList.add('playing');
                masterWave.innerHTML = `<div class="wave-bar w-[2px] h-1 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate]"></div><div class="wave-bar w-[2px] h-2 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.1s]"></div><div class="wave-bar w-[2px] h-1.5 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.2s]"></div><div class="wave-bar w-[2px] h-3 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.3s]"></div>`;
            } else {
                masterWave.classList.remove('playing');
                masterWave.innerHTML = `<div class="wave-bar w-[2px] h-1 bg-white"></div><div class="wave-bar w-[2px] h-2 bg-white"></div><div class="wave-bar w-[2px] h-1.5 bg-white"></div><div class="wave-bar w-[2px] h-3 bg-white"></div>`;
            }
        }
        
        // 显示时间/进度条容器
        if(timeDisplay && isPlaying) timeDisplay.classList.remove('hidden');
        if(progressContainer && isPlaying) progressContainer.classList.remove('hidden');

        // 更新列表高亮
        const trackItems = document.querySelectorAll('.track-item');
        trackItems.forEach((item, index) => {
            const title = item.querySelector('.track-title');
            const iconBox = item.querySelector('.icon-box');
            const icon = item.querySelector('.track-icon');
            
            if (index === currentTrackIndex) {
                title?.classList.add('text-accent-blue');
                iconBox?.classList.remove('opacity-0'); iconBox?.classList.add('opacity-100');
                if(icon) icon.className = isPlaying ? 'ri-pause-fill track-icon text-lg' : 'ri-play-fill track-icon text-lg';
            } else {
                title?.classList.remove('text-accent-blue');
                iconBox?.classList.remove('opacity-100'); iconBox?.classList.add('opacity-0');
                if(icon) icon.className = 'ri-play-fill track-icon text-lg';
            }
        });
    }

    function formatTime(s) { return isNaN(s) ? "0:00" : Math.floor(s/60) + ":" + (Math.floor(s%60)<10?'0':'') + Math.floor(s%60); }

    // === 进度条核心 (修复点：变量名 unified) ===
    audio.addEventListener('timeupdate', () => {
        // 只有在不拖动时才更新，防止跳动
        if (!isDragging && progressBar) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percent}%`; // ✅ 这里修复了，现在进度条会动了
            
            if(timeDisplay) {
                const current = formatTime(audio.currentTime);
                const total = formatTime(audio.duration || 0);
                timeDisplay.innerText = `${current} / ${total}`;
            }
        }
    });

    // 拖动交互
    if(progressContainer) {
        function seek(e) {
            const rect = progressContainer.getBoundingClientRect();
            const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
            if(audio.duration) audio.currentTime = percent * audio.duration;
        }

        progressContainer.addEventListener('mousedown', (e) => { e.stopPropagation(); isDragging = true; seek(e); });
        progressContainer.addEventListener('click', (e) => { e.stopPropagation(); seek(e); });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = progressContainer.getBoundingClientRect();
                const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                progressBar.style.width = `${percent * 100}%`;
            }
        });
        
        document.addEventListener('mouseup', (e) => { 
            if(isDragging) { isDragging = false; }
        });
    }

    // === 自动循环 (Loop Back) ===
    audio.addEventListener('ended', () => {
        // 如果是最后一首 (index 3)，+1 变成 4，对 4 取余等于 0，回到第一首
        // 如果是第一首 (index 0)，+1 变成 1，对 4 取余等于 1，播放下一首
        let nextIndex = (currentTrackIndex + 1) % playlist.length;
        
        console.log("Song ended. Playing next:", nextIndex); // Debug info
        window.playTrack(nextIndex);
    });

    initAudioState();
});