// 服装搭配模拟器 - 主要业务逻辑
class FashionSimulator {
    constructor() {
        this.currentOutfit = {
            top: {
                type: 'tshirt',
                fabric: 'cotton',
                color: '#FF6B6B',
                style: 'tshirt'
            },
            bottom: {
                type: 'jeans',
                fabric: 'denim',
                color: '#45B7D1',
                style: 'jeans'
            }
        };
        
        this.currentView = 'top';
        this.user = this.loadUser();
        this.savedOutfits = this.loadSavedOutfits();
        
        this.fabrics = {
            cotton: { name: '棉质', price: 100, texture: 'soft', season: 'all' },
            denim: { name: '牛仔', price: 150, texture: 'rough', season: 'all' },
            leather: { name: '皮革', price: 400, texture: 'smooth', season: 'winter' },
            linen: { name: '亚麻', price: 200, texture: 'breathable', season: 'summer' },
            tweed: { name: '粗花呢', price: 300, texture: 'warm', season: 'winter' },
            cashmere: { name: '羊绒', price: 500, texture: 'luxury', season: 'winter' },
            silk: { name: '丝绸', price: 350, texture: 'luxury', season: 'summer' },
            velvet: { name: '天鹅绒', price: 280, texture: 'luxury', season: 'winter' },
            polyester: { name: '涤纶', price: 80, texture: 'synthetic', season: 'all' },
            wool: { name: '羊毛', price: 250, texture: 'warm', season: 'winter' },
            chiffon: { name: '雪纺', price: 180, texture: 'light', season: 'summer' },
            corduroy: { name: '灯芯绒', price: 160, texture: 'warm', season: 'winter' },
            flannel: { name: '法兰绒', price: 140, texture: 'soft', season: 'winter' },
            satin: { name: '缎面', price: 220, texture: 'smooth', season: 'all' },
            lace: { name: '蕾丝', price: 190, texture: 'delicate', season: 'summer' }
        };
        
        this.moodColors = {
            happy: ['#FFE066', '#FF6B6B', '#4ECDC4', '#45B7D1'],
            calm: ['#A8E6CF', '#DCEDC8', '#FFD3E1', '#E8F8F5'],
            excited: ['#FF6B6B', '#FF8E53', '#FF6B9D', '#C44569'],
            sad: ['#74B9FF', '#0984E3', '#6C5CE7', '#A29BFE'],
            romantic: ['#FD79A8', '#FDCB6E', '#E17055', '#00B894'],
            professional: ['#2D3436', '#636E72', '#74B9FF', '#A29BFE']
        };
        
        this.stylePreferences = {
            business: { fabrics: ['wool', 'cotton', 'silk'], colors: ['#2D3436', '#636E72', '#74B9FF'] },
            casual: { fabrics: ['cotton', 'denim', 'linen'], colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] },
            vintage: { fabrics: ['tweed', 'wool', 'corduroy'], colors: ['#8B4513', '#CD853F', '#DEB887'] },
            sport: { fabrics: ['polyester', 'cotton', 'mesh'], colors: ['#00B894', '#00CEC9', '#0984E3'] },
            elegant: { fabrics: ['silk', 'satin', 'chiffon'], colors: ['#FD79A8', '#FDCB6E', '#E17055'] },
            street: { fabrics: ['denim', 'leather', 'cotton'], colors: ['#2D3436', '#636E72', '#FF6B6B'] }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeCarousel();
        this.setupCanvas();
        this.updateDisplay();
        this.startBackgroundAnimation();
        this.loadUserPreferences();
    }
    
    setupEventListeners() {
        // 服装类型切换
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.type;
                this.updateStyleSelector();
                this.updateDisplay();
            });
        });
        
        // 款式选择
        document.addEventListener('click', (e) => {
            if (e.target.closest('.style-card')) {
                const card = e.target.closest('.style-card');
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.currentOutfit[this.currentView].style = card.dataset.style;
                this.updateDisplay();
            }
        });
        
        // 材质选择
        document.addEventListener('click', (e) => {
            if (e.target.closest('.fabric-card')) {
                const card = e.target.closest('.fabric-card');
                document.querySelectorAll('.fabric-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.currentOutfit[this.currentView].fabric = card.dataset.fabric;
                this.updateDisplay();
                this.updatePriceEstimate();
            }
        });
        
        // 颜色选择
        document.addEventListener('click', (e) => {
            if (e.target.closest('.color-picker')) {
                const picker = e.target.closest('.color-picker');
                this.currentOutfit[this.currentView].color = picker.dataset.color;
                this.updateDisplay();
                this.updateBackgroundColor();
            }
        });
        
        // 自定义颜色
        document.getElementById('customColor').addEventListener('change', (e) => {
            const color = e.target.value;
            this.currentOutfit[this.currentView].color = color;
            document.getElementById('colorCode').value = color;
            this.updateDisplay();
            this.updateBackgroundColor();
        });
        
        document.getElementById('colorCode').addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                document.getElementById('customColor').value = color;
                this.currentOutfit[this.currentView].color = color;
                this.updateDisplay();
                this.updateBackgroundColor();
            }
        });
        
        // 心情选择
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyMoodRecommendation(e.target.dataset.mood);
            });
        });
        
        // 风格选择
        document.querySelectorAll('.style-card[data-style]').forEach(card => {
            card.addEventListener('click', (e) => {
                const style = e.currentTarget.dataset.style;
                this.applyStyleRecommendation(style);
            });
        });
        
        // 操作按钮
        document.getElementById('saveOutfit').addEventListener('click', () => this.saveCurrentOutfit());
        document.getElementById('resetOutfit').addEventListener('click', () => this.resetOutfit());
        document.getElementById('randomOutfit').addEventListener('click', () => this.generateRandomOutfit());
        
        // 用户相关
        document.getElementById('loginBtn').addEventListener('click', () => this.showLogin());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }
    
    initializeCarousel() {
        new Splide('#fabricCarousel', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '1rem',
            pagination: false,
            arrows: false,
            autoplay: true,
            interval: 3000,
            pauseOnHover: true
        }).mount();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('outfitCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawOutfit();
    }
    
    updateStyleSelector() {
        const selector = document.getElementById('styleSelector');
        const styles = this.currentView === 'top' ? 
            ['tshirt', 'shirt', 'sweater', 'jacket'] : 
            ['jeans', 'pants', 'skirt', 'shorts'];
        
        selector.innerHTML = styles.map(style => `
            <div class="style-card ${this.currentOutfit[this.currentView].style === style ? 'selected' : ''}" data-style="${style}">
                <i class="fas fa-${this.getStyleIcon(style)}"></i>
                <div class="text-sm">${this.getStyleName(style)}</div>
            </div>
        `).join('');
    }
    
    getStyleIcon(style) {
        const icons = {
            tshirt: 'tshirt',
            shirt: 'user-tie',
            sweater: 'snowflake',
            jacket: 'user-secret',
            jeans: 'user',
            pants: 'user',
            skirt: 'female',
            shorts: 'user'
        };
        return icons[style] || 'tshirt';
    }
    
    getStyleName(style) {
        const names = {
            tshirt: 'T恤',
            shirt: '衬衫',
            sweater: '毛衣',
            jacket: '外套',
            jeans: '牛仔裤',
            pants: '休闲裤',
            skirt: '裙子',
            shorts: '短裤'
        };
        return names[style] || style;
    }
    
    drawOutfit() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制上衣
        this.drawClothingItem('top', 50, 50, 300, 200);
        
        // 绘制下装
        this.drawClothingItem('bottom', 50, 280, 300, 200);
        
        // 添加装饰元素
        this.addDecorations();
    }
    
    drawClothingItem(type, x, y, width, height) {
        const item = this.currentOutfit[type];
        
        // 创建渐变背景
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, this.lightenColor(item.color, 0.3));
        gradient.addColorStop(1, item.color);
        
        // 绘制基本形状
        this.ctx.fillStyle = gradient;
        this.ctx.strokeStyle = this.darkenColor(item.color, 0.2);
        this.ctx.lineWidth = 2;
        
        // 根据款式绘制不同形状
        this.drawClothingShape(item.style, x, y, width, height);
        
        // 添加纹理效果
        this.addFabricTexture(item.fabric, x, y, width, height);
        
        // 添加高光和阴影
        this.addShading(x, y, width, height);
    }
    
    drawClothingShape(style, x, y, width, height) {
        this.ctx.beginPath();
        
        switch (style) {
            case 'tshirt':
                // T恤形状
                this.ctx.moveTo(x + width * 0.3, y);
                this.ctx.lineTo(x + width * 0.7, y);
                this.ctx.lineTo(x + width * 0.8, y + height * 0.3);
                this.ctx.lineTo(x + width, y + height * 0.4);
                this.ctx.lineTo(x + width, y + height);
                this.ctx.lineTo(x, y + height);
                this.ctx.lineTo(x, y + height * 0.4);
                this.ctx.lineTo(x + width * 0.2, y + height * 0.3);
                this.ctx.closePath();
                break;
                
            case 'shirt':
                // 衬衫形状
                this.ctx.moveTo(x + width * 0.25, y);
                this.ctx.lineTo(x + width * 0.75, y);
                this.ctx.lineTo(x + width * 0.85, y + height * 0.2);
                this.ctx.lineTo(x + width, y + height * 0.25);
                this.ctx.lineTo(x + width, y + height);
                this.ctx.lineTo(x, y + height);
                this.ctx.lineTo(x, y + height * 0.25);
                this.ctx.lineTo(x + width * 0.15, y + height * 0.2);
                this.ctx.closePath();
                
                // 添加衬衫领子
                this.ctx.moveTo(x + width * 0.25, y);
                this.ctx.lineTo(x + width * 0.35, y - height * 0.1);
                this.ctx.lineTo(x + width * 0.65, y - height * 0.1);
                this.ctx.lineTo(x + width * 0.75, y);
                break;
                
            case 'jeans':
                // 牛仔裤形状
                this.ctx.moveTo(x + width * 0.1, y);
                this.ctx.lineTo(x + width * 0.9, y);
                this.ctx.lineTo(x + width * 0.85, y + height * 0.3);
                this.ctx.lineTo(x + width * 0.8, y + height * 0.7);
                ctx.lineTo(x + width * 0.7, y + height);
                this.ctx.lineTo(x + width * 0.3, y + height);
                this.ctx.lineTo(x + width * 0.2, y + height * 0.7);
                this.ctx.lineTo(x + width * 0.15, y + height * 0.3);
                this.ctx.closePath();
                break;
                
            default:
                // 默认矩形
                this.ctx.rect(x, y, width, height);
        }
        
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    addFabricTexture(fabric, x, y, width, height) {
        const pattern = this.createFabricPattern(fabric);
        if (pattern) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(x, y, width, height);
            this.ctx.restore();
        }
    }
    
    createFabricPattern(fabric) {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 20;
        patternCanvas.height = 20;
        const patternCtx = patternCanvas.getContext('2d');
        
        switch (fabric) {
            case 'denim':
                // 牛仔纹理
                patternCtx.fillStyle = 'rgba(100, 100, 150, 0.3)';
                patternCtx.fillRect(0, 0, 20, 20);
                patternCtx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
                for (let i = 0; i < 20; i += 4) {
                    patternCtx.beginPath();
                    patternCtx.moveTo(i, 0);
                    patternCtx.lineTo(i, 20);
                    patternCtx.stroke();
                }
                break;
                
            case 'leather':
                // 皮革纹理
                patternCtx.fillStyle = 'rgba(139, 69, 19, 0.2)';
                patternCtx.fillRect(0, 0, 20, 20);
                patternCtx.fillStyle = 'rgba(139, 69, 19, 0.1)';
                for (let i = 0; i < 10; i++) {
                    patternCtx.fillRect(Math.random() * 20, Math.random() * 20, 2, 2);
                }
                break;
                
            case 'cotton':
                // 棉质纹理
                patternCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                patternCtx.fillRect(0, 0, 20, 20);
                patternCtx.fillStyle = 'rgba(200, 200, 200, 0.1)';
                for (let i = 0; i < 5; i++) {
                    patternCtx.fillRect(Math.random() * 20, Math.random() * 20, 3, 3);
                }
                break;
        }
        
        return this.ctx.createPattern(patternCanvas, 'repeat');
    }
    
    addShading(x, y, width, height) {
        // 添加高光
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        
        this.ctx.save();
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }
    
    addDecorations() {
        // 添加一些装饰元素
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(380, 80, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(370, 90, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    updateDisplay() {
        this.drawOutfit();
        this.updateOutfitName();
        this.updatePriceEstimate();
        this.updateSuggestions();
    }
    
    updateOutfitName() {
        const { top, bottom } = this.currentOutfit;
        const topFabric = this.fabrics[top.fabric];
        const bottomFabric = this.fabrics[bottom.fabric];
        
        const names = [
            `${topFabric.name}${this.getStyleName(top.style)}搭配`,
            `时尚${bottomFabric.name}${this.getStyleName(bottom.style)}`,
            `${this.getColorName(top.color)}与${this.getColorName(bottom.color)}的完美组合`,
            `都市${topFabric.name}风情`,
            `优雅${bottomFabric.name}造型`
        ];
        
        const randomName = names[Math.floor(Math.random() * names.length)];
        document.getElementById('outfitName').textContent = randomName;
    }
    
    getColorName(hexColor) {
        const colorNames = {
            '#FF6B6B': '珊瑚红',
            '#4ECDC4': '薄荷绿',
            '#45B7D1': '天空蓝',
            '#96CEB4': '薄荷色',
            '#FFEAA7': '奶油黄',
            '#DDA0DD': '梅花紫',
            '#98D8C8': '薄荷绿',
            '#F7DC6F': '金黄',
            '#BB8FCE': '淡紫色',
            '#85C1E9': '天蓝色',
            '#F8C471': '橙色',
            '#82E0AA': '薄荷绿'
        };
        return colorNames[hexColor] || '彩色';
    }
    
    updatePriceEstimate() {
        const { top, bottom } = this.currentOutfit;
        const topPrice = this.fabrics[top.fabric].price;
        const bottomPrice = this.fabrics[bottom.fabric].price;
        
        // 基础价格 + 材质加成 + 颜色加成
        let totalPrice = (topPrice + bottomPrice) * 1.5;
        
        // 特殊颜色加价
        if (['#DDA0DD', '#BB8FCE', '#F7DC6F'].includes(top.color) || 
            ['#DDA0DD', '#BB8FCE', '#F7DC6F'].includes(bottom.color)) {
            totalPrice *= 1.2;
        }
        
        // 稀有材质加价
        if (['cashmere', 'silk', 'leather'].includes(top.fabric) || 
            ['cashmere', 'silk', 'leather'].includes(bottom.fabric)) {
            totalPrice *= 1.3;
        }
        
        document.getElementById('priceEstimate').textContent = `¥${Math.round(totalPrice)}`;
    }
    
    updateSuggestions() {
        const suggestions = [
            '这款搭配非常适合日常通勤，既舒适又时尚。',
            '选择这种材质会让您在夏季保持清爽。',
            '这种颜色组合能够很好地衬托您的肤色。',
            '建议搭配简约的配饰来突出服装本身的设计。',
            '这款造型适合多种场合，非常实用。'
        ];
        
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        document.getElementById('suggestions').textContent = randomSuggestion;
    }
    
    applyMoodRecommendation(mood) {
        const colors = this.moodColors[mood];
        if (colors) {
            this.currentOutfit.top.color = colors[0];
            this.currentOutfit.bottom.color = colors[1] || colors[0];
            this.updateDisplay();
            this.updateBackgroundColor();
            this.showNotification(`已为您推荐${this.getMoodName(mood)}的搭配色彩！`);
        }
    }
    
    getMoodName(mood) {
        const names = {
            happy: '开心',
            calm: '平静',
            excited: '兴奋',
            sad: '失落',
            romantic: '浪漫',
            professional: '专业'
        };
        return names[mood] || mood;
    }
    
    applyStyleRecommendation(style) {
        const preferences = this.stylePreferences[style];
        if (preferences) {
            this.currentOutfit.top.fabric = preferences.fabrics[0];
            this.currentOutfit.bottom.fabric = preferences.fabrics[1] || preferences.fabrics[0];
            this.currentOutfit.top.color = preferences.colors[0];
            this.currentOutfit.bottom.color = preferences.colors[1] || preferences.colors[0];
            this.updateDisplay();
            this.updateBackgroundColor();
            this.showNotification(`已为您推荐${this.getStyleName(style)}风格！`);
        }
    }
    
    generateRandomOutfit() {
        const fabricKeys = Object.keys(this.fabrics);
        const colorKeys = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        
        this.currentOutfit.top.fabric = fabricKeys[Math.floor(Math.random() * fabricKeys.length)];
        this.currentOutfit.bottom.fabric = fabricKeys[Math.floor(Math.random() * fabricKeys.length)];
        this.currentOutfit.top.color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        this.currentOutfit.bottom.color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        
        this.updateDisplay();
        this.updateBackgroundColor();
        this.showNotification('已为您生成随机搭配！');
    }
    
    resetOutfit() {
        this.currentOutfit = {
            top: { type: 'tshirt', fabric: 'cotton', color: '#FF6B6B', style: 'tshirt' },
            bottom: { type: 'jeans', fabric: 'denim', color: '#45B7D1', style: 'jeans' }
        };
        this.updateDisplay();
        this.updateBackgroundColor();
        this.showNotification('已重置为默认搭配！');
    }
    
    saveCurrentOutfit() {
        if (!this.user.isLoggedIn) {
            this.showNotification('请先登录后再保存搭配！', 'warning');
            return;
        }
        
        const outfit = {
            id: Date.now(),
            name: document.getElementById('outfitName').textContent,
            top: { ...this.currentOutfit.top },
            bottom: { ...this.currentOutfit.bottom },
            price: document.getElementById('priceEstimate').textContent,
            createdAt: new Date().toISOString(),
            userId: this.user.id
        };
        
        this.savedOutfits.push(outfit);
        this.saveOutfits();
        this.showNotification('搭配已保存到您的收藏！');
    }
    
    updateBackgroundColor() {
        const topColor = this.currentOutfit.top.color;
        const bottomColor = this.currentOutfit.bottom.color;
        
        const dynamicBg = document.getElementById('dynamicBg');
        dynamicBg.style.background = `linear-gradient(45deg, ${topColor}40, ${bottomColor}40, #667eea, #764ba2)`;
    }
    
    startBackgroundAnimation() {
        // 使用anime.js创建背景动画
        anime({
            targets: '.dynamic-bg',
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            duration: 8000,
            loop: true,
            easing: 'easeInOutSine'
        });
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        const icon = notification.querySelector('i');
        
        notificationText.textContent = message;
        
        // 更新图标
        icon.className = type === 'warning' ? 
            'fas fa-exclamation-triangle text-yellow-500 mr-3' : 
            'fas fa-check-circle text-green-500 mr-3';
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // 用户相关方法
    loadUser() {
        const userData = localStorage.getItem('fashionUser');
        return userData ? JSON.parse(userData) : { isLoggedIn: false, username: '游客' };
    }
    
    saveUser() {
        localStorage.setItem('fashionUser', JSON.stringify(this.user));
    }
    
    loadSavedOutfits() {
        const outfitsData = localStorage.getItem('savedOutfits');
        return outfitsData ? JSON.parse(outfitsData) : [];
    }
    
    saveOutfits() {
        localStorage.setItem('savedOutfits', JSON.stringify(this.savedOutfits));
    }
    
    loadUserPreferences() {
        if (this.user.isLoggedIn) {
            document.getElementById('username').textContent = this.user.username;
            document.getElementById('loginBtn').classList.add('hidden');
            document.getElementById('logoutBtn').classList.remove('hidden');
        }
    }
    
    showLogin() {
        window.location.href = 'login.html';
    }
    
    logout() {
        this.user = { isLoggedIn: false, username: '游客' };
        this.saveUser();
        document.getElementById('username').textContent = '游客';
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
        this.showNotification('已退出登录！');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.fashionSimulator = new FashionSimulator();
});