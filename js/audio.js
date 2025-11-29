// === BOYU | 星际音频核心 V8.0 (全域交互唤醒版) ===

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 智能路径修正 (双重保险)
    const path = window.location.pathname;
    // 只要不在根目录下，就加前缀
    // 判断逻辑：如果 URL 里包含 .html 且不包含 index.html (或者是子目录结构)
    // 简单粗暴法：检测特定文件夹名
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

    // 3. 获取 DOM
    const audio = document.getElementById('global-audio');
    const masterWave = document.getElementById('master-wave');
    const trackNameDisplay = document.getElementById('current-track-name');
    const timeDisplay = document.getElementById('time-display');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const playlistContainer = document.getElementById('playlist-container');
    
    if (!audio) return;

    let currentTrackIndex = 0;
    let isDragging = false;
    audio.volume = 0.5;

    // ==============================
    // 🧠 记忆恢复与强行唤醒
    // ==============================
    
    function initAudioState() {
        const savedIndex = localStorage.getItem('audio_index');
        const savedTime = localStorage.getItem('audio_time');
        
        // 只要有记录，就准备续播
        if (savedIndex !== null) {
            currentTrackIndex = parseInt(savedIndex);
            audio.src = pathPrefix + playlist[currentTrackIndex].src;
            const restoreTime = parseFloat(savedTime || 0);
            if (restoreTime > 0 && isFinite(restoreTime)) {
                audio.currentTime = restoreTime;
            }
        } else {
            audio.src = pathPrefix + playlist[0].src;
        }

        renderPlaylist();

        // 如果之前是播放状态（或者有进度），我们尝试自动播放
        // 关键策略：先更新UI，让用户觉得“没断”，然后并在后台尝试播放
        if (savedIndex !== null) {
            updateUIState(true); // <--- 视觉抢跑：先让波形跳动起来
            
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("自动播放被拦截，部署全域监听...");
                    
                    // 这种情况下，虽然UI在跳，但声音没出来。
                    // 我们需要监听用户的【任何】有效交互来解开静音
                    const resumeAudio = () => {
                        audio.play();
                        // 移除监听，避免重复触发
                        ['click', 'keydown', 'wheel', 'touchstart'].forEach(e => 
                            document.removeEventListener(e, resumeAudio)
                        );
                    };
                    
                    // 监听点击、按键、滚动、触摸
                    ['click', 'keydown', 'wheel', 'touchstart'].forEach(e => 
                        document.addEventListener(e, resumeAudio, { once: true })
                    );
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
    });

    // ==============================
    // 🎛️ 控制逻辑
    // ==============================

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
        updateListHighlight();
    }

    window.toggleMainPlayback = function() {
        if (audio.paused) {
            if (!audio.src || audio.src === window.location.href) {
                audio.src = pathPrefix + playlist[currentTrackIndex].src;
            }
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
            audio.play().then(() => updateUIState(true));
        }
    };

    function updateUIState(isPlaying) {
        const track = playlist[currentTrackIndex];
        if(trackNameDisplay) {
            trackNameDisplay.innerHTML = isPlaying ? `<span class="text-accent-blue">PLAYING:</span> ${track.title.toUpperCase()}` : "AUDIO PAUSED";
        }
        
        if(masterWave) {
            if(isPlaying) {
                masterWave.classList.add('playing');
                // 确保 HTML 结构正确以支持 CSS 动画
                if(!masterWave.innerHTML.includes('animate-')) {
                     masterWave.innerHTML = `
                        <div class="wave-bar w-[2px] h-1 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate]"></div>
                        <div class="wave-bar w-[2px] h-2 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.1s]"></div>
                        <div class="wave-bar w-[2px] h-1.5 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.2s]"></div>
                        <div class="wave-bar w-[2px] h-3 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.3s]"></div>`;
                }
            } else {
                masterWave.classList.remove('playing');
                masterWave.innerHTML = `
                    <div class="wave-bar w-[2px] h-1 bg-white"></div>
                    <div class="wave-bar w-[2px] h-2 bg-white"></div>
                    <div class="wave-bar w-[2px] h-1.5 bg-white"></div>
                    <div class="wave-bar w-[2px] h-3 bg-white"></div>`;
            }
        }
        
        if(timeDisplay && isPlaying) timeDisplay.classList.remove('hidden');
        if(progressContainer && isPlaying) progressContainer.classList.remove('hidden');

        updateListHighlight(isPlaying);
    }

    function updateListHighlight(isPlaying = !audio.paused) {
        document.querySelectorAll('.track-item').forEach((item, index) => {
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

    audio.addEventListener('timeupdate', () => {
        if (!isDragging && progressBar) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percent}%`;
            if (timeDisplay) timeDisplay.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });

    if(progressContainer) {
        progressContainer.addEventListener('mousedown', (e) => { e.stopPropagation(); isDragging = true; seek(e); });
        progressContainer.addEventListener('click', (e) => { e.stopPropagation(); seek(e); });
        
        function seek(e) {
            const rect = progressContainer.getBoundingClientRect();
            const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
            audio.currentTime = percent * audio.duration;
        }

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

    audio.addEventListener('ended', () => {
        let next = (currentTrackIndex + 1) % playlist.length;
        window.playTrack(next);
    });

    initAudioState();
});