document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 歌单配置
    const playlist = [
        { title: "Saman", artist: "Ólafur Arnalds", src: "assets/Saman.mp3" },
        { title: "Oceans", artist: "Ólafur Arnalds", src: "assets/Oceans.mp3" },
        { title: "Loom", artist: "Ólafur Arnalds", src: "assets/Loom.mp3" },
        { title: "My Only Girl", artist: "方大同", src: "assets/MyOnlyGirl.mp3" }
    ];

    // 2. 智能路径修正 (核心功能)
    // 如果当前网址里包含 blog, travel 等文件夹名，说明在子页面，路径前加 ../
    const path = window.location.pathname;
    const subFolders = ['/blog/', '/travel/', '/pages/', '/posts/'];
    const isSubPage = subFolders.some(folder => path.includes(folder));
    const pathPrefix = isSubPage ? '../' : '';

    const audio = document.getElementById('global-audio');
    const masterWave = document.getElementById('master-wave');
    const trackNameDisplay = document.getElementById('current-track-name');
    const timeDisplay = document.getElementById('time-display');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const playlistContainer = document.getElementById('playlist-container');
    
    if (!audio) return; // 如果页面没播放器，不执行

    let currentTrackIndex = 0;
    let isDragging = false;
    audio.volume = 0.5;

    // 渲染歌单
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
    }

    // 播放/暂停主开关
    window.toggleMainPlayback = function() {
        if (audio.paused) {
            // 第一次播放时，自动加上正确的前缀路径
            if (!audio.src || audio.src === window.location.href) {
                audio.src = pathPrefix + playlist[currentTrackIndex].src;
            }
            audio.play().then(() => updateUIState(true)).catch(console.error);
        } else {
            audio.pause();
            updateUIState(false);
        }
    };

    // 切歌
    window.playTrack = function(index) {
        if (currentTrackIndex === index && !audio.paused) {
            audio.pause(); updateUIState(false);
        } else {
            currentTrackIndex = index;
            audio.src = pathPrefix + playlist[index].src; // 自动加前缀
            audio.play().then(() => updateUIState(true)).catch(console.error);
        }
    };

    // 更新 UI
    function updateUIState(isPlaying) {
        const track = playlist[currentTrackIndex];
        if(isPlaying) {
            trackNameDisplay.innerHTML = `<span class="text-accent-blue">PLAYING:</span> ${track.title.toUpperCase()}`;
            masterWave.classList.add('playing');
            masterWave.innerHTML = `<div class="wave-bar w-[2px] h-1 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate]"></div><div class="wave-bar w-[2px] h-2 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.1s]"></div><div class="wave-bar w-[2px] h-1.5 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.2s]"></div><div class="wave-bar w-[2px] h-3 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.3s]"></div>`;
            timeDisplay.classList.remove('hidden');
            progressContainer.classList.remove('hidden');
        } else {
            trackNameDisplay.innerHTML = track.title.toUpperCase();
            masterWave.classList.remove('playing');
            masterWave.innerHTML = `<div class="wave-bar w-[2px] h-1 bg-white"></div><div class="wave-bar w-[2px] h-2 bg-white"></div><div class="wave-bar w-[2px] h-1.5 bg-white"></div><div class="wave-bar w-[2px] h-3 bg-white"></div>`;
        }
        
        // 更新列表图标
        document.querySelectorAll('.track-item').forEach((item, index) => {
            const iconBox = item.querySelector('.icon-box');
            const icon = item.querySelector('.track-icon');
            const title = item.querySelector('.track-title');
            if (index === currentTrackIndex) {
                title.classList.add('text-accent-blue');
                iconBox.classList.remove('opacity-0'); iconBox.classList.add('opacity-100');
                icon.className = isPlaying ? 'ri-pause-fill track-icon text-lg' : 'ri-play-fill track-icon text-lg';
            } else {
                title.classList.remove('text-accent-blue');
                iconBox.classList.remove('opacity-100'); iconBox.classList.add('opacity-0');
                icon.className = 'ri-play-fill track-icon text-lg';
            }
        });
    }

    // 进度条逻辑
    function formatTime(s) { return isNaN(s) ? "0:00" : Math.floor(s/60) + ":" + (Math.floor(s%60)<10?'0':'') + Math.floor(s%60); }
    audio.addEventListener('timeupdate', () => {
        if (!isDragging && progressBar) {
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            timeDisplay.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });
    if(progressContainer) {
        progressContainer.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            audio.currentTime = ((e.clientX - progressContainer.getBoundingClientRect().left) / progressContainer.getBoundingClientRect().width) * audio.duration;
        });
    }
    audio.addEventListener('ended', () => { window.playTrack((currentTrackIndex + 1) % playlist.length); });

    renderPlaylist();
});