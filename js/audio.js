// === BOYU | 星际音频核心 (Centralized Audio System) ===

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 智能路径修正
    // 如果当前页面在子文件夹 (如 /blog/ 或 /travel/)，路径前加 ../
    const isSubPage = window.location.pathname.includes('/blog/') || window.location.pathname.includes('/travel/');
    const pathPrefix = isSubPage ? '../' : '';

    // 2. 歌单配置 (已修复 Saman.mp3 大小写)
    const playlist = [
        { title: "Saman", artist: "Ólafur Arnalds", src: "assets/Saman.mp3" }, // ✅ 已修正大写 S
        { title: "Oceans", artist: "Ólafur Arnalds", src: "assets/Oceans.mp3" },
        { title: "Loom", artist: "Ólafur Arnalds", src: "assets/Loom.mp3" },
        { title: "My Only Girl", artist: "方大同", src: "assets/MyOnlyGirl.mp3" }
    ];

    // 3. 获取 DOM 元素 (增加安全检查，防止页面没播放器时报错)
    const audio = document.getElementById('global-audio');
    const masterWave = document.getElementById('master-wave');
    const trackNameDisplay = document.getElementById('current-track-name');
    const timeDisplay = document.getElementById('time-display');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const playlistContainer = document.getElementById('playlist-container');
    
    // 如果页面上没有音频元素，直接退出，不运行后续逻辑
    if (!audio) return;

    let currentTrackIndex = 0;
    let isDragging = false;

    // 设置默认音量
    audio.volume = 0.5;

    // --- 核心功能函数 ---

    // 格式化时间
    function formatTime(s) {
        if(isNaN(s)) return "0:00";
        return Math.floor(s/60) + ":" + (Math.floor(s%60)<10?'0':'') + Math.floor(s%60);
    }

    // 渲染歌单列表
    function renderPlaylist() {
        if (!playlistContainer) return;
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
    }

    // 更新 UI 状态
    function updateUIState(isPlaying) {
        const track = playlist[currentTrackIndex];
        
        // 主按钮文字
        if (trackNameDisplay) {
            trackNameDisplay.innerHTML = isPlaying ? `<span class="text-accent-blue">PLAYING:</span> ${track.title.toUpperCase()}` : "AUDIO PAUSED";
        }

        // 波形动画
        if (masterWave) {
            if (isPlaying) {
                masterWave.classList.add('playing');
                masterWave.innerHTML = `
                    <div class="wave-bar w-[2px] h-1 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate]"></div>
                    <div class="wave-bar w-[2px] h-2 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.1s]"></div>
                    <div class="wave-bar w-[2px] h-1.5 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.2s]"></div>
                    <div class="wave-bar w-[2px] h-3 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.3s]"></div>`;
            } else {
                masterWave.classList.remove('playing');
                masterWave.innerHTML = `
                    <div class="wave-bar w-[2px] h-1 bg-white"></div>
                    <div class="wave-bar w-[2px] h-2 bg-white"></div>
                    <div class="wave-bar w-[2px] h-1.5 bg-white"></div>
                    <div class="wave-bar w-[2px] h-3 bg-white"></div>`;
            }
        }

        // 显示时间与进度条
        if (timeDisplay && isPlaying) timeDisplay.classList.remove('hidden');
        if (progressContainer && isPlaying) progressContainer.classList.remove('hidden');

        // 更新列表项图标高亮
        const trackItems = document.querySelectorAll('.track-item');
        trackItems.forEach((item, index) => {
            const title = item.querySelector('.track-title');
            const iconBox = item.querySelector('.icon-box');
            const icon = item.querySelector('.track-icon');
            
            if (index === currentTrackIndex) {
                title?.classList.add('text-accent-blue');
                iconBox?.classList.remove('opacity-0');
                iconBox?.classList.add('opacity-100');
                if (icon) icon.className = isPlaying ? 'ri-pause-fill track-icon text-lg' : 'ri-play-fill track-icon text-lg';
            } else {
                title?.classList.remove('text-accent-blue');
                iconBox?.classList.remove('opacity-100');
                iconBox?.classList.add('opacity-0');
                if (icon) icon.className = 'ri-play-fill track-icon text-lg';
            }
        });
    }

    // === 全局暴露的控制函数 (供 HTML onclick 调用) ===

    // 1. 主按钮开关
    window.toggleMainPlayback = function() {
        if (audio.paused) {
            // 如果还没加载源，加载当前索引并加上路径前缀
            if (!audio.src || audio.src === window.location.href) {
                audio.src = pathPrefix + playlist[currentTrackIndex].src;
            }
            audio.play().then(() => updateUIState(true)).catch(console.error);
        } else {
            audio.pause();
            updateUIState(false);
        }
    };

    // 2. 列表切歌
    window.playTrack = function(index) {
        if (currentTrackIndex === index && !audio.paused) {
            audio.pause();
            updateUIState(false);
        } else {
            currentTrackIndex = index;
            audio.src = pathPrefix + playlist[index].src; // 关键：加上路径前缀
            audio.volume = 0.5;
            audio.play().then(() => updateUIState(true)).catch(console.error);
        }
    };

    // === 事件监听 ===

    // 进度条更新
    audio.addEventListener('timeupdate', () => {
        if (!isDragging && progressBar) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percent}%`;
            if (timeDisplay) timeDisplay.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });

    // 进度条拖拽/点击
    if (progressContainer) {
        function seek(e) {
            const rect = progressContainer.getBoundingClientRect();
            const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
            audio.currentTime = percent * audio.duration;
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
            if (isDragging) {
                isDragging = false;
                const rect = progressContainer.getBoundingClientRect();
                const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                audio.currentTime = percent * audio.duration;
            }
        });
    }

    // 自动连播
    audio.addEventListener('ended', () => {
        let next = (currentTrackIndex + 1) % playlist.length;
        window.playTrack(next);
    });

    // 初始化渲染
    renderPlaylist();
});