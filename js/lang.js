// === BOYU | 星际语言核心 (Universal Translator V50) ===

const translations = {
    "en": {
        // --- [全局导航 Global Nav] ---
        "nav.about": "ABOUT",
        "nav.projects": "PROJECTS",
        "nav.blog": "BLOG",
        
        // 系统下拉菜单
        "nav.system": "SYSTEM",
        "nav.sys.visuals": "// VISUAL LOGS",
        "nav.sys.repo": "// REPOSITORY",
        "nav.sys.media": "// NEURAL INPUTS", // 已修复：不再是 RSS
        
        "nav.join": "JOIN CREW",
        "nav.back": "← RETURN TO BASE", // 子页面返回按钮

        // --- [首页 Index] ---
        "hero.title": "ASTRAL<br>FRONTIER",
        
        // 个人介绍 (PA交易员 + 探索者版)
        "about.intro": "I am BOYU. A <strong>Trader</strong> and <strong>World Explorer</strong>.",
        "about.desc": "Dedicated to building a trusted digital world (Ethicraft) and a more reliable self.<br><br>Beyond the rise and fall of K-lines, I immerse myself in the fjords of <strong>Norway</strong>, the music of Ólafur Arnalds, and the bliss of a duo world. This site is not a code repo, but a log of wealth logic and life aesthetics.<br><br>Recording all thoughts, failures, epiphanies, and growth. Learning to find direction in chaos.",
        "btn.contact": "CONTACT ME",
        
        // 项目描述
        "proj.ethicraft.desc": "A permanently free Web3 learning and certification platform.",
        "proj.pa.desc": "Naked K-line trading system and psychology notes.",
        "proj.iceland.desc": "Visual records of solitude, wastelands, and auroras.", // 对应 Planetary Logs 的描述

        // 博客预览
        "blog.readall": "READ ALL ->",

        // 摄影预览
        "optics.enter": "ENTER GALLERY",
        
        // 底部 Nexus
        "nexus.title": "REGISTER TO NEURAL LINK",
        "nexus.desc": "Register as an observer of the [BOYU] node. Receive the latest trading strategies and interstellar visuals first.",
        "btn.activate": "ACTIVATE ACCOUNT",
        "nexus.fuel": "FUEL THE SHIP",
        "btn.sponsor": "SPONSOR ME",

        // --- [旅行页 Travel] ---
        "world.title": "WORLD ARCHIVE",
        "world.desc": "Measuring the dimensions of the world with a lens. From tropical steel forests to polar ice wastelands.",
        "filter.all": "ALL // VIEW ALL",
        "filter.sg": "SINGAPORE // LION CITY",
        "filter.cn": "CHINA // HOMELAND",
        "filter.ice": "ICELAND // THE NORTH",
        "card.read": "READ LOG",

        // --- [书影音页 Media] ---
        "media.title": "NEURAL<br>LIBRARY",
        "media.desc": "Input source for the mind. Books, Frequencies, and Cinema.",
        "media.books": "DATA ARCHIVE // BOOKS",
        "media.music": "SONIC WAVES // MUSIC",
        "media.status": "CURRENTLY CONSUMING",

        // --- [文章页 Post] ---
        "post.back": "← BACK TO TERMINAL",
        "post.date": "DATE:",
        "post.cat": "CATEGORY:"
    },
    "zh": {
        // --- [全局导航] ---
        "nav.about": "关于",
        "nav.projects": "项目",
        "nav.blog": "博客",
        
        // 系统下拉菜单
        "nav.system": "系统",
        "nav.sys.visuals": "// 影像日志",
        "nav.sys.repo": "// 代码仓库",
        "nav.sys.media": "// 精神食粮", // 已修复
        
        "nav.join": "加入舰队",
        "nav.back": "← 返回基地",

        // --- [首页 Index] ---
        "hero.title": "星界<br>边境",
        
        // 个人介绍
        "about.intro": "我是 BOYU。一名<strong>交易员</strong>与<strong>世界探索者</strong>。",
        "about.desc": "致力于构建一个可信的数字世界 (Ethicraft) 和一个更可靠的自己。<br><br>在 K 线的涨跌之外，我沉浸于<strong>挪威</strong>的峡湾、Ólafur Arnalds 的音乐，以及幸福的二人世界。这个站点不是代码仓库，而是记录财富逻辑与生活美学的航海日志。<br><br>记录所有思考、失败、顿悟和成长，学习如何在混沌里找到方向。",
        "btn.contact": "联系我",

        // 项目描述
        "proj.ethicraft.desc": "永久免费的 Web3 学习与考试认证平台。",
        "proj.pa.desc": "裸K交易系统与心态磨砺笔记。",
        "proj.iceland.desc": "关于孤独、荒原与极光的影像记录。", // 对应 Planetary Logs

        // 博客预览
        "blog.readall": "查看全部 ->",

        // 摄影预览
        "optics.enter": "进入画廊",
        
        // 底部 Nexus
        "nexus.title": "注册神经网络链接",
        "nexus.desc": "注册成为 [BOYU] 节点的观察者。第一时间接收最新的交易策略与星际影像。",
        "btn.activate": "激活账号",
        "nexus.fuel": "为飞船注能",
        "btn.sponsor": "赞助我",

        // --- [旅行页 Travel] ---
        "world.title": "世界档案",
        "world.desc": "用镜头丈量世界的维度。从热带的钢铁森林，到极地的冰原荒野。",
        "filter.all": "全部 // ALL",
        "filter.sg": "新加坡 // SINGAPORE",
        "filter.cn": "中国 // CHINA",
        "filter.ice": "冰岛 // ICELAND",
        "card.read": "阅读日志",

        // --- [书影音页 Media] ---
        "media.title": "神经<br>图书馆",
        "media.desc": "大脑的输入源。书籍、频率与影像。",
        "media.books": "数据档案 // 书籍",
        "media.music": "声波共振 // 音乐",
        "media.status": "正在输入中",

        // --- [文章页 Post] ---
        "post.back": "← 返回终端",
        "post.date": "日期:",
        "post.cat": "分类:"
    }
};

// === 核心逻辑 Core Logic ===

// 1. 初始化语言状态
document.addEventListener("DOMContentLoaded", () => {
    let currentLang = localStorage.getItem('site-lang') || 'en'; 
    updateContent(currentLang);
});

// 2. 全局切换函数 (供 HTML onclick 调用)
window.toggleLanguage = function() {
    let currentLang = localStorage.getItem('site-lang') || 'en';
    let newLang = currentLang === 'en' ? 'zh' : 'en';
    localStorage.setItem('site-lang', newLang);
    updateContent(newLang);
}

// 3. 更新页面内容 (Text & UI)
function updateContent(lang) {
    if (!lang) lang = localStorage.getItem('site-lang') || 'en';

    // A. 更新量子滑块状态 (Quantum Toggle)
    const switchContainer = document.querySelector('.lang-switch-container');
    const textEn = document.querySelector('.lang-text.left');
    const textZh = document.querySelector('.lang-text.right');
    
    if(switchContainer) {
        if (lang === 'en') {
            switchContainer.classList.remove('lang-zh-mode');
            if(textEn) textEn.style.color = '#000'; // 选中黑字
            if(textZh) textZh.style.color = '#666'; // 未选灰字
        } else {
            switchContainer.classList.add('lang-zh-mode');
            if(textEn) textEn.style.color = '#666';
            if(textZh) textZh.style.color = '#000';
        }
    }

    // B. 更新普通文字按钮 (如果有旧版按钮残留)
    const btnEn = document.getElementById('lang-en');
    const btnZh = document.getElementById('lang-zh');
    if(btnEn && btnZh) {
        if (lang === 'en') {
            btnEn.className = 'text-white font-bold transition-colors';
            btnZh.className = 'text-dim hover:text-white transition-colors';
        } else {
            btnEn.className = 'text-dim hover:text-white transition-colors';
            btnZh.className = 'text-white font-bold transition-colors';
        }
    }

    // C. 遍历替换所有文本
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // 如果是输入框的 placeholder
            if(el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = translations[lang][key];
            } else {
                // 普通元素，支持 HTML 标签 (如 <br>)
                el.innerHTML = translations[lang][key];
            }
        }
    });
}
