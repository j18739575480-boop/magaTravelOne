/**
 * 主应用逻辑
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('应用初始化开始...');
    
    // 初始化认证系统
    initAuth();
    
    // 监听登录状态变化
    document.addEventListener('loginStatusChanged', function(event) {
        updateUIForLoginStatus(event.detail.isLoggedIn, event.detail.userInfo);
    });
    
    // 导航栏交互处理
    setupNavigation();
    setupLoginButton();
    setupLogoutButton();
    
    // 平滑滚动处理
    setupSmoothScroll();
    
    // 初始化通知系统
    Utils.initNotificationSystem();
    
    // 在页面活跃时刷新会话，防止意外过期
    document.addEventListener('visibilitychange', Utils.handleVisibilityChange);
    
    // 初始化表单处理
    initApplicationForm();
    
    console.log('应用初始化完成');
});

/**
 * 初始化申请表单
 */
function initApplicationForm() {
    const form = document.getElementById('applicationForm');
    const pdfPreviewArea = document.getElementById('pdfPreviewArea');
    const pdfPreview = document.getElementById('pdfPreview');
    const downloadPDFButton = document.getElementById('downloadPDF');
    const newFormButton = document.getElementById('newForm');
    const saveFormButton = document.getElementById('saveForm');
    const savedFormsDropdown = document.getElementById('savedForms');
    const loadFormButton = document.getElementById('loadForm');
    
    // 保存当前生成的PDF数据
    let currentPDFData = null;
    // 保存当前表单数据
    let currentFormData = null;
    
    // 尝试从本地存储加载保存的表单
    loadSavedForms();
    
    if (form) {
        // 表单提交事件处理
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // 显示加载状态
            const submitButton = form.querySelector('.submit-btn');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="icon-loading"></i> 处理中...';
            submitButton.disabled = true;
            
            try {
                // 收集表单数据
                const formData = new FormData(form);
                const formDataObj = {};
                formData.forEach((value, key) => {
                    formDataObj[key] = value.trim();
                });
                
                // 保存当前表单数据用于重复填单
                currentFormData = formDataObj;
                
                // 使用setTimeout模拟异步处理
                setTimeout(() => {
                    try {
                        // 翻译表单数据为英文
                        const translatedData = TranslationService.translateFormData(formDataObj);
                        
                        // 生成PDF
                        currentPDFData = PDFGenerator.generatePDF(translatedData);
                        
                        // 显示PDF预览
                        PDFGenerator.previewPDF(currentPDFData, pdfPreview);
                        
                        // 显示预览区域
                        if (pdfPreviewArea) {
                            pdfPreviewArea.classList.remove('hidden');
                            
                            // 平滑滚动到预览区域
                            pdfPreviewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        
                        // 显示成功通知
                        Utils.showNotification('英文PDF报单已生成', 'success');
                        
                    } catch (error) {
                        console.error('生成PDF失败:', error);
                        Utils.showNotification('生成PDF失败，请稍后重试', 'error');
                    } finally {
                        // 恢复按钮状态
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                    }
                }, 1000);
                
            } catch (error) {
                console.error('处理表单数据失败:', error);
                Utils.showNotification('处理表单数据失败，请稍后重试', 'error');
                
                // 恢复按钮状态
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
    
    // 下载PDF按钮事件处理
    if (downloadPDFButton) {
        downloadPDFButton.addEventListener('click', function() {
            if (currentPDFData) {
                PDFGenerator.downloadPDF(currentPDFData);
                Utils.showNotification('PDF文件已下载', 'success');
            } else {
                Utils.showNotification('没有可下载的PDF文件', 'error');
            }
        });
    }
    
    // 重新填单按钮事件处理
    if (newFormButton) {
        newFormButton.addEventListener('click', function() {
            // 隐藏预览区域
            if (pdfPreviewArea) {
                pdfPreviewArea.classList.add('hidden');
            }
            
            // 重置表单
            if (form) {
                form.reset();
                
                // 滚动到表单顶部
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // 清除当前数据
            currentPDFData = null;
            currentFormData = null;
        });
    }
    
    // 保存表单按钮事件处理
    if (saveFormButton) {
        saveFormButton.addEventListener('click', function() {
            if (currentFormData) {
                // 获取用户输入的表单名称
                const formName = prompt('请输入保存的表单名称:', `申请单_${new Date().toLocaleDateString()}`);
                
                if (formName && formName.trim()) {
                    // 从本地存储获取现有保存的表单
                    const savedForms = getSavedForms();
                    
                    // 创建新的表单记录
                    const formRecord = {
                        id: Date.now().toString(),
                        name: formName.trim(),
                        date: new Date().toISOString(),
                        data: currentFormData
                    };
                    
                    // 添加到保存的表单列表
                    savedForms.push(formRecord);
                    
                    // 保存到本地存储
                    localStorage.setItem('savedVisaApplications', JSON.stringify(savedForms));
                    
                    // 更新下拉列表
                    loadSavedForms();
                    
                    Utils.showNotification('表单已保存', 'success');
                }
            } else {
                // 如果没有当前表单数据，尝试收集表单中的数据
                const formData = collectFormData();
                if (Object.keys(formData).length > 0) {
                    // 保存当前表单数据
                    currentFormData = formData;
                    
                    // 重新调用保存功能
                    saveFormButton.click();
                } else {
                    Utils.showNotification('没有可保存的表单数据', 'error');
                }
            }
        });
    }
    
    // 加载表单按钮事件处理
    if (loadFormButton) {
        loadFormButton.addEventListener('click', function() {
            if (savedFormsDropdown && savedFormsDropdown.value) {
                // 获取保存的表单数据
                const savedForms = getSavedForms();
                const selectedFormId = savedFormsDropdown.value;
                const selectedForm = savedForms.find(form => form.id === selectedFormId);
                
                if (selectedForm && form) {
                    // 加载表单数据到表单
                    fillFormWithData(form, selectedForm.data);
                    
                    // 更新当前表单数据
                    currentFormData = selectedForm.data;
                    
                    Utils.showNotification(`已加载表单: ${selectedForm.name}`, 'success');
                    
                    // 隐藏预览区域
                    if (pdfPreviewArea) {
                        pdfPreviewArea.classList.add('hidden');
                    }
                    
                    // 滚动到表单顶部
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                Utils.showNotification('请选择要加载的表单', 'error');
            }
        });
    }
    
    // 收集表单数据
    function collectFormData() {
        if (!form) return {};
        
        const formData = new FormData(form);
        const formDataObj = {};
        formData.forEach((value, key) => {
            if (value.trim()) {
                formDataObj[key] = value.trim();
            }
        });
        
        return formDataObj;
    }
    
    // 获取保存的表单列表
    function getSavedForms() {
        try {
            const saved = localStorage.getItem('savedVisaApplications');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('获取保存的表单失败:', error);
            return [];
        }
    }
    
    // 加载保存的表单到下拉列表
    function loadSavedForms() {
        if (!savedFormsDropdown) return;
        
        // 清空下拉列表
        savedFormsDropdown.innerHTML = '<option value="">选择保存的表单...</option>';
        
        // 获取保存的表单
        const savedForms = getSavedForms();
        
        // 添加到下拉列表（按日期降序排列）
        savedForms
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(form => {
                const option = document.createElement('option');
                option.value = form.id;
                option.textContent = `${form.name} (${new Date(form.date).toLocaleString()})`;
                savedFormsDropdown.appendChild(option);
            });
    }
    
    // 填充表单数据
    function fillFormWithData(form, data) {
        for (const [key, value] of Object.entries(data)) {
            const element = form.elements[key];
            if (element) {
                switch (element.type) {
                    case 'checkbox':
                        element.checked = value === 'on' || value === true;
                        break;
                    case 'radio':
                        const radioElements = form.querySelectorAll(`input[name="${key}"]`);
                        radioElements.forEach(radio => {
                            radio.checked = radio.value === value;
                        });
                        break;
                    default:
                        element.value = value;
                }
            }
        }
    }
}

// 初始化认证系统
function initAuth() {
    console.log('初始化认证系统');
    
    // 初始检查登录状态
    checkAndUpdateUI();
    
    // 定期刷新会话（每10分钟），延长登录有效期
    setInterval(() => {
        if (window.AuthManager && AuthManager.checkLoginStatus()) {
            AuthManager.refreshSession();
        }
    }, 10 * 60 * 1000);
}

// 检查并更新UI状态
function checkAndUpdateUI() {
    if (window.AuthManager) {
        const isLoggedIn = AuthManager.checkLoginStatus();
        const userInfo = isLoggedIn ? AuthManager.getUserInfo() : null;
        updateUIForLoginStatus(isLoggedIn, userInfo);
    }
}

// 根据登录状态更新UI
function updateUIForLoginStatus(isLoggedIn, userInfo) {
    const loginButton = document.getElementById('loginBtn') || document.getElementById('login-button');
    const userMenu = document.getElementById('userMenu') || document.getElementById('user-area');
    const userAvatar = document.getElementById('userAvatar') || document.getElementById('user-avatar');
    const userNickname = document.getElementById('userNickname') || document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('logout-button');
    
    // 确保所有必要的元素都存在
    if (!loginButton || !userMenu) {
        console.warn('导航栏元素不完整，无法更新登录状态UI');
        return;
    }
    
    if (isLoggedIn) {
        // 用户已登录，显示用户菜单
        loginButton.style.display = 'none';
        userMenu.style.display = 'flex';
        
        // 更新用户信息显示
        if (userAvatar && userInfo && userInfo.avatar) {
            userAvatar.src = userInfo.avatar;
            userAvatar.alt = userInfo.nickname || '用户头像';
            userAvatar.style.display = 'block';
            // 增强个人中心图标效果
            userAvatar.title = '点击查看个人中心';
            userAvatar.style.cursor = 'pointer';
            userAvatar.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            
            // 添加悬停效果
            userAvatar.onmouseover = function() {
                userAvatar.style.transform = 'scale(1.05)';
                userAvatar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            };
            
            userAvatar.onmouseout = function() {
                userAvatar.style.transform = 'scale(1)';
                userAvatar.style.boxShadow = 'none';
            };
            
            userAvatar.onclick = function() {
                userAvatar.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    userAvatar.style.transform = 'scale(1)';
                    const userSection = document.querySelector('.user-section');
                    if (userSection) {
                        // 添加滚动动画效果
                        userSection.scrollIntoView({ behavior: 'smooth' });
                        // 添加高亮效果，吸引用户注意
                        userSection.style.animation = 'highlight 1s ease';
                        setTimeout(() => {
                            userSection.style.animation = '';
                        }, 1000);
                    }
                }, 100);
            };
        }
        
        if (userNickname && userInfo && userInfo.nickname) {
            userNickname.textContent = userInfo.nickname;
        }
        
        // 确保登出按钮可见
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
        
        // 显示登录成功提示
        showNotification('登录成功，欢迎回来！', 'success');
        
        // 隐藏所有登录提示，包括个人中心的
        document.querySelectorAll('.login-prompt, .not-logged-in').forEach(el => {
            el.classList.add('hidden');
        });
        
        // 显示用户专属内容
        showUserExclusiveContent();
    } else {
        // 用户未登录，显示登录按钮
        loginButton.style.display = 'block';
        userMenu.style.display = 'none';
        
        // 显示所有登录提示
        document.querySelectorAll('.login-prompt, .not-logged-in').forEach(el => {
            el.classList.remove('hidden');
        });
        
        // 隐藏用户专属内容
        hideUserExclusiveContent();
    }
    
    // 为登出按钮添加样式，但不添加事件监听器（事件监听器由setupLogoutButton函数管理）
    if (logoutBtn) {
        logoutBtn.style.transition = 'all 0.2s ease';
        
        // 确保登出按钮可见
        logoutBtn.style.display = 'inline-block';
    }
    
    // 更新其他可能存在的用户信息展示区域
    updateUserProfileUI(isLoggedIn, userInfo);
    // 更新导航栏状态
    updateNavbarAuthState(isLoggedIn, userInfo);
}

// 更新用户个人信息UI
function updateUserProfileUI(isLoggedIn, userInfo) {
    // 查找页面上可能存在的用户信息展示区域
    const profileElements = document.querySelectorAll('.user-profile-info');
    
    // 添加头像样式和动画
    const addAvatarStyles = () => {
        if (!document.querySelector('#avatar-enhanced-styles')) {
            const style = document.createElement('style');
            style.id = 'avatar-enhanced-styles';
            style.textContent = `
                /* 头像容器样式 */
                .avatar-container {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 15px;
                }
                
                /* 头像框架样式 */
                .avatar-frame {
                    position: relative;
                    border-radius: 50%;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    z-index: 2;
                }
                
                /* 悬停效果 */
                .avatar-frame:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }
                
                /* 在线状态徽章 */
                .avatar-badge {
                    position: absolute;
                    bottom: -3px;
                    right: -3px;
                    width: 16px;
                    height: 16px;
                    background: #07C160;
                    border: 2px solid white;
                    border-radius: 50%;
                    animation: pulse-online 2s infinite;
                    z-index: 3;
                }
                
                @keyframes pulse-online {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                /* 头像边框动画 */
                .avatar-border {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    border: 2px solid transparent;
                    background: linear-gradient(45deg, #07C160, #14C145) border-box;
                    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    mask-composite: exclude;
                    animation: rotate-border 3s linear infinite;
                    z-index: 1;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .avatar-container:hover .avatar-border {
                    opacity: 1;
                }
                
                @keyframes rotate-border {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                
                /* 等级徽章样式优化 */
                .level-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 14px;
                    font-weight: bold;
                    margin-left: 8px;
                    transition: all 0.2s ease;
                }
                
                .level-badge:hover {
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    addAvatarStyles();
    
    profileElements.forEach(element => {
        // 添加过渡动画样式
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '0.7';
        element.style.transform = 'translateY(10px)';
        
        if (isLoggedIn && userInfo) {
            // 填充用户信息
            const nicknameEl = element.querySelector('.nickname');
            let avatarEl = element.querySelector('.avatar') || element.querySelector('.user-avatar');
            const levelEl = element.querySelector('.level');
            const pointsEl = element.querySelector('.points');
            
            if (nicknameEl) {
                nicknameEl.textContent = userInfo.nickname || '用户';
                nicknameEl.style.fontWeight = 'bold';
                nicknameEl.style.marginBottom = '8px';
                nicknameEl.style.fontSize = '16px';
                nicknameEl.style.color = '#333';
            }
            
            if (avatarEl && userInfo.avatar) {
                // 创建头像容器和框架以增强视觉效果
                const parent = avatarEl.parentNode;
                
                // 创建头像容器
                const avatarContainer = document.createElement('div');
                avatarContainer.className = 'avatar-container';
                
                // 创建头像框架
                const avatarFrame = document.createElement('div');
                avatarFrame.className = 'avatar-frame';
                
                // 重置和增强头像样式
                avatarEl.src = userInfo.avatar;
                avatarEl.alt = userInfo.nickname || '用户头像';
                avatarEl.style.width = '70px';
                avatarEl.style.height = '70px';
                avatarEl.style.borderRadius = '50%';
                avatarEl.style.objectFit = 'cover';
                avatarEl.style.border = '3px solid white';
                avatarEl.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                avatarEl.style.transition = 'all 0.3s ease';
                
                // 添加头像边框动画元素
                const avatarBorder = document.createElement('div');
                avatarBorder.className = 'avatar-border';
                avatarBorder.style.width = '80px';
                avatarBorder.style.height = '80px';
                
                // 添加在线状态徽章
                const onlineBadge = document.createElement('div');
                onlineBadge.className = 'avatar-badge';
                
                // 组合所有元素
                avatarFrame.appendChild(avatarEl);
                avatarContainer.appendChild(avatarFrame);
                avatarContainer.appendChild(avatarBorder);
                avatarContainer.appendChild(onlineBadge);
                
                // 替换原始头像元素
                parent.replaceChild(avatarContainer, avatarEl);
                
                // 更新引用
                avatarEl = avatarFrame.querySelector('img');
            }
            
            if (levelEl && userInfo.level) {
                levelEl.textContent = userInfo.level;
                // 添加等级徽章类
                levelEl.className = 'level-badge';
                
                // 根据等级设置不同颜色
                if (userInfo.level.includes('高级')) {
                    levelEl.style.background = 'linear-gradient(135deg, #F8D01C, #FFD700)';
                    levelEl.style.color = '#704214';
                    levelEl.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.3)';
                } else if (userInfo.level.includes('VIP')) {
                    levelEl.style.background = 'linear-gradient(135deg, #FF6600, #FF8C42)';
                    levelEl.style.color = '#fff';
                    levelEl.style.boxShadow = '0 2px 8px rgba(255, 102, 0, 0.3)';
                } else {
                    levelEl.style.background = 'linear-gradient(135deg, #E0E0E0, #F5F5F5)';
                    levelEl.style.color = '#757575';
                }
            }
            
            if (pointsEl && userInfo.points !== undefined) {
                // 格式化积分显示，添加千位分隔符
                const formattedPoints = userInfo.points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                pointsEl.innerHTML = `<span style="color:#FF6B00; font-weight:bold;">积分:</span> ${formattedPoints}`;
                // 添加积分图标
                if (!pointsEl.querySelector('.points-icon')) {
                    const pointsIcon = document.createElement('span');
                    pointsIcon.className = 'points-icon';
                    pointsIcon.textContent = '⭐';
                    pointsIcon.style.marginRight = '4px';
                    pointsEl.prepend(pointsIcon);
                }
            }
            
            // 显示用户信息，隐藏所有登录提示
            element.querySelectorAll('.logged-in, .nickname, .user-avatar, .level, .points').forEach(el => {
                el.classList.remove('hidden');
                // 添加元素出现动画
                el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                el.style.opacity = '0';
                el.style.transform = 'translateY(5px)';
                
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 50);
            });
            element.querySelectorAll('.not-logged-in, .login-prompt').forEach(el => {
                el.classList.add('hidden');
            });
        } else {
            // 隐藏用户信息，显示登录提示
            element.querySelectorAll('.logged-in, .nickname, .user-avatar, .level, .points').forEach(el => {
                el.classList.add('hidden');
            });
            element.querySelectorAll('.not-logged-in, .login-prompt').forEach(el => {
                el.classList.remove('hidden');
                // 添加提示出现动画
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '0';
                setTimeout(() => {
                    el.style.opacity = '1';
                }, 50);
            });
        }
        
        // 完成整体过渡动画
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    });
}

// 更新UI以反映登录状态
function updateUIForAuthState(isLoggedIn, userData) {
    if (isLoggedIn && userData) {
        // 登录成功后的界面更新
        console.log('用户已登录:', userData);
        
        // 显示欢迎消息
        showNotification(`欢迎回来，${userData.nickname || '用户'}！`, 'success');
        
        // 关闭登录模态框
        closeLoginModal();
        
        // 更新用户信息显示区域
        updateUserProfileDisplay(userData);
        
        // 显示用户专属内容
        showUserExclusiveContent();
        
        // 隐藏所有登录提示
        hideLoginPrompts();
        
        // 隐藏个人中心登录提示
        document.querySelectorAll('.login-prompt').forEach(el => {
            el.classList.add('hidden');
        });
        
        // 更新需要登录的按钮状态
        updateLoginRequiredButtons(true);
    } else {
        // 登出后的界面更新
        console.log('用户未登录');
        
        // 清除用户信息显示
        clearUserProfileDisplay();
        
        // 隐藏用户专属内容
        hideUserExclusiveContent();
        
        // 显示登录提示
        showLoginPrompts();
        
        // 显示个人中心登录提示
        document.querySelectorAll('.login-prompt').forEach(el => {
            el.classList.remove('hidden');
        });
        
        // 更新需要登录的按钮状态
        updateLoginRequiredButtons(false);
    }
}

// 显示用户个人资料
function updateUserProfileDisplay(userData) {
    // 查找页面上所有用户资料显示区域
    const profileElements = document.querySelectorAll('.user-profile-info');
    
    profileElements.forEach(profile => {
        // 隐藏未登录提示
        profile.querySelectorAll('.not-logged-in, .login-prompt').forEach(el => {
            el.classList.add('hidden');
        });
        
        // 更新头像
        const avatar = profile.querySelector('.user-avatar');
        if (avatar) {
            avatar.src = userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id || 'user'}`;
            avatar.alt = userData.nickname || '用户头像';
            avatar.classList.remove('hidden');
        }
        
        // 更新昵称
        const nickname = profile.querySelector('.nickname');
        if (nickname) {
            nickname.textContent = userData.nickname || '用户';
            nickname.classList.remove('hidden');
        }
        
        // 更新用户等级
        const level = profile.querySelector('.level');
        if (level) {
            level.textContent = `等级 ${userData.level || 1}`;
            level.classList.remove('hidden');
        }
        
        // 更新积分
        const points = profile.querySelector('.points');
        if (points) {
            points.textContent = `积分: ${userData.points || 0}`;
            points.classList.remove('hidden');
        }
    });
}

// 清除用户个人资料显示
function clearUserProfileDisplay() {
    const profileElements = document.querySelectorAll('.user-profile-info');
    
    profileElements.forEach(profile => {
        // 显示未登录提示
        profile.querySelectorAll('.not-logged-in, .login-prompt').forEach(el => {
            el.classList.remove('hidden');
        });
        
        // 隐藏用户信息
        profile.querySelectorAll('.user-avatar, .nickname, .level, .points').forEach(el => {
            el.classList.add('hidden');
        });
    });
}

// 显示用户专属内容
function showUserExclusiveContent() {
    document.querySelectorAll('.user-exclusive').forEach(el => {
        el.classList.remove('hidden');
    });
}

// 隐藏用户专属内容
function hideUserExclusiveContent() {
    document.querySelectorAll('.user-exclusive').forEach(el => {
        el.classList.add('hidden');
    });
}

// 隐藏所有登录提示
function hideLoginPrompts() {
    document.querySelectorAll('.login-required-message').forEach(el => {
        el.classList.add('hidden');
    });
}

// 显示登录提示
function showLoginPrompts() {
    document.querySelectorAll('.login-required-message').forEach(el => {
        el.classList.remove('hidden');
    });
}

// 更新需要登录的按钮状态
function updateLoginRequiredButtons(isLoggedIn) {
    document.querySelectorAll('.login-required').forEach(button => {
        if (isLoggedIn) {
            button.disabled = false;
            button.classList.remove('login-required');
            // 如果有原始事件处理器，可以恢复
            const originalOnClick = button.getAttribute('data-original-onclick');
            if (originalOnClick) {
                button.setAttribute('onclick', originalOnClick);
                button.removeAttribute('data-original-onclick');
            } else {
                button.onclick = null;
            }
        } else {
            // 保存原始事件处理器
            if (button.getAttribute('onclick')) {
                button.setAttribute('data-original-onclick', button.getAttribute('onclick'));
            }
            button.onclick = function() {
                openLoginModal();
                showNotification('请先登录以使用此功能', 'info');
                return false;
            };
            button.disabled = false; // 不使用disabled，而是拦截点击事件
        }
    });
}

// 设置导航栏交互
function setupNavigation() {
    // 移动端菜单切换逻辑（后续添加）
    // ...
}

// 设置登录按钮
function setupLoginButton() {
    // 导航栏登录按钮
    const loginButton = document.getElementById('login-button') || document.getElementById('loginBtn');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            openLoginModal();
        });
    }
    
    // 个人中心登录链接
    const profileLoginLink = document.getElementById('profile-login-link');
    if (profileLoginLink) {
        profileLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            openLoginModal();
        });
    }
    
    // 优惠活动区域的登录按钮
    const promotionLoginButtons = document.querySelectorAll('.promotion-list .login-btn');
    promotionLoginButtons.forEach(button => {
        button.addEventListener('click', function() {
            openLoginModal();
        });
    });
}

// 设置登出按钮
function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button') || document.getElementById('logoutBtn');
    if (logoutButton) {
        // 添加登出按钮悬停效果
        logoutButton.style.transition = 'all 0.2s ease';
        
        logoutButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f5f5f5';
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        
        logoutButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // 点击事件处理
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.AuthManager) {
                // 使用自定义确认对话框
                customConfirm({
                    title: '确认登出',
                    message: '确定要退出登录吗？',
                    confirmText: '确定',
                    cancelText: '取消',
                    onConfirm: function() {
                        // 添加加载状态
                        logoutButton.innerHTML = '<i class="icon-loading"></i> 处理中...';
                        logoutButton.disabled = true;
                        
                        // 淡出过渡动画
                        const userArea = document.getElementById('user-area') || document.getElementById('userMenu');
                        if (userArea) {
                            userArea.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            userArea.style.opacity = '0';
                            userArea.style.transform = 'translateY(-10px)';
                        }
                        
                        // 延迟执行登出，展示过渡效果
                        setTimeout(() => {
                            AuthManager.logout();
                            showNotification('成功登出', 'success');
                            
                            // 重置按钮状态
                            logoutButton.innerHTML = '退出登录';
                            logoutButton.disabled = false;
                        }, 300);
                    }
                });
            }
        });
    }
}

// 更新导航栏登录状态
function updateNavbarAuthState(isLoggedIn, userData) {
    const loginPrompt = document.getElementById('login-prompt');
    const userArea = document.getElementById('user-area') || document.getElementById('userMenu');
    
    if (!userArea) return;
    
    if (isLoggedIn && userData) {
        // 显示用户信息
        if (loginPrompt) {
            loginPrompt.classList.add('hidden');
        }
        userArea.classList.remove('hidden');
        userArea.style.display = 'flex';
        
        // 更新用户头像
        const userAvatar = document.getElementById('user-avatar') || document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = userData.avatar || 'https://via.placeholder.com/32';
            userAvatar.alt = userData.nickname || '用户头像';
            // 添加个人中心图标效果
            userAvatar.title = '点击查看个人中心';
            userAvatar.style.cursor = 'pointer';
            userAvatar.addEventListener('click', function() {
                document.querySelector('.user-section')?.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // 更新用户名
        const username = document.getElementById('username') || document.getElementById('userNickname');
        if (username) {
            username.textContent = userData.nickname || '用户';
        }
        
        // 确保登出按钮存在并可用
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.classList.remove('hidden');
        }
    } else {
        // 显示登录提示
        if (loginPrompt) {
            loginPrompt.classList.remove('hidden');
        }
        userArea.classList.add('hidden');
        userArea.style.display = 'none';
    }
}

// 设置平滑滚动
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 打开登录模态框
function openLoginModal() {
    // 检查是否已登录
    if (window.AuthManager && AuthManager.checkLoginStatus()) {
        showNotification('您已经登录了', 'info');
        return;
    }
    
    const modal = document.getElementById('loginModal') || document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 模拟加载二维码并开始轮询登录状态
        simulateQRCodeLoading();
    }
}

// 关闭登录模态框
function closeLoginModal() {
    const modal = document.getElementById('loginModal') || document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    }
}

// 模拟二维码加载和登录状态检查
function simulateQRCodeLoading() {
    // 支持多个ID选择器以兼容不同命名
    const qrCodeContainer = document.getElementById('qrCodeContainer') || document.getElementById('qrcode-container');
    const qrCodeImage = document.getElementById('qrCodeImage') || (qrCodeContainer ? qrCodeContainer.querySelector('img') : null);
    const loginStatusText = document.getElementById('loginStatusText') || document.getElementById('login-status');
    
    if (qrCodeContainer && qrCodeImage && loginStatusText) {
        // 设置容器样式，使其更美观
        qrCodeContainer.style.textAlign = 'center';
        qrCodeContainer.style.padding = '20px';
        qrCodeContainer.style.background = '#fafafa';
        qrCodeContainer.style.borderRadius = '12px';
        qrCodeContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        
        // 显示加载中状态
        loginStatusText.textContent = '正在生成二维码...';
        loginStatusText.style.color = '#666';
        loginStatusText.style.fontSize = '14px';
        loginStatusText.style.marginTop = '15px';
        loginStatusText.style.fontWeight = '500';
        qrCodeImage.style.display = 'none';
        
        // 移除可能存在的状态类
        loginStatusText.classList.remove('verifying', 'success', 'error');
        
        // 添加加载动画
        const spinner = document.createElement('div');
        spinner.className = 'qr-code-spinner';
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.border = '3px solid #f3f3f3';
        spinner.style.borderTop = '3px solid #07C160';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.margin = '20px auto';
        qrCodeContainer.appendChild(spinner);
        
        // 添加旋转动画样式
        if (!document.querySelector('#qr-code-styles')) {
            const style = document.createElement('style');
            style.id = 'qr-code-styles';
            style.textContent = `
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .qr-code-border { position: relative; display: inline-block; }
                .qr-code-border::after { content: ''; position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; border: 2px solid #07C160; border-radius: 10px; opacity: 0; animation: pulse-border 2s ease-in-out infinite; }
                @keyframes pulse-border { 0% { transform: scale(0.95); opacity: 0; } 50% { opacity: 0.7; } 100% { transform: scale(1.05); opacity: 0; } }
                .qr-code-expiry { font-size: 12px; color: #999; margin-top: 10px; }
                .wechat-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: white; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
                .wechat-logo img { width: 30px; height: 30px; }
            `;
            document.head.appendChild(style);
        }
        
        // 模拟生成二维码延迟
        setTimeout(() => {
            // 移除加载动画
            if (spinner.parentNode) {
                spinner.parentNode.removeChild(spinner);
            }
            
            // 使用更逼真的微信登录二维码图像
            const timestamp = new Date().getTime();
            // 使用真实的微信登录二维码风格图像
            qrCodeImage.src = `https://picsum.photos/seed/wechatlogin/200/200?t=${timestamp}`;
            qrCodeImage.alt = '微信扫码登录';
            
            // 设置二维码图像样式
            qrCodeImage.style.width = '200px';
            qrCodeImage.style.height = '200px';
            qrCodeImage.style.borderRadius = '10px';
            qrCodeImage.style.boxShadow = '0 3px 15px rgba(0,0,0,0.1)';
            qrCodeImage.style.transition = 'transform 0.3s ease';
            qrCodeImage.style.display = 'block';
            qrCodeImage.style.margin = '0 auto';
            
            // 添加悬停效果
            qrCodeImage.onmouseover = function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
            };
            
            qrCodeImage.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 3px 15px rgba(0,0,0,0.1)';
            };
            
            // 创建带有微信标志的边框
            const qrCodeWrapper = document.createElement('div');
            qrCodeWrapper.className = 'qr-code-border';
            qrCodeWrapper.style.position = 'relative';
            qrCodeWrapper.style.display = 'inline-block';
            
            // 将二维码图片放入包装器
            qrCodeContainer.insertBefore(qrCodeWrapper, qrCodeImage);
            qrCodeWrapper.appendChild(qrCodeImage);
            
            // 添加微信标志
            const wechatLogo = document.createElement('div');
            wechatLogo.className = 'wechat-logo';
            qrCodeWrapper.appendChild(wechatLogo);
            
            // 在中间添加微信图标
            const wechatIcon = document.createElement('img');
            wechatIcon.src = 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.png';
            wechatIcon.alt = '微信';
            wechatLogo.appendChild(wechatIcon);
            
            // 更新状态文本
            loginStatusText.textContent = '请使用微信扫描二维码登录';
            loginStatusText.style.color = '#333';
            loginStatusText.style.fontSize = '16px';
            
            // 添加过期提示
            const expiryText = document.createElement('div');
            expiryText.className = 'qr-code-expiry';
            expiryText.textContent = '二维码有效期60秒，请尽快扫码';
            qrCodeContainer.appendChild(expiryText);
            
            // 模拟用户扫码成功（实际应通过WebSocket或轮询）
            if (window.AuthManager) {
                // 在实际应用中，这里会启动轮询或建立WebSocket连接
                // 这里我们提供一个手动触发的方式来模拟扫码成功
                const simulateButton = document.getElementById('simulateScan') || document.getElementById('simulate-scan');
                if (simulateButton) {
                    // 设置模拟按钮样式
                    simulateButton.textContent = '模拟登录';
                    simulateButton.style.display = 'inline-block';
                    simulateButton.style.marginTop = '15px';
                    simulateButton.style.padding = '8px 20px';
                    simulateButton.style.backgroundColor = '#07C160';
                    simulateButton.style.color = 'white';
                    simulateButton.style.border = 'none';
                    simulateButton.style.borderRadius = '20px';
                    simulateButton.style.fontSize = '14px';
                    simulateButton.style.cursor = 'pointer';
                    simulateButton.style.transition = 'all 0.2s ease';
                    
                    // 添加悬停效果
                    simulateButton.onmouseover = function() {
                        this.style.backgroundColor = '#06AD56';
                        this.style.transform = 'translateY(-1px)';
                        this.style.boxShadow = '0 3px 8px rgba(7, 193, 96, 0.3)';
                    };
                    
                    simulateButton.onmouseout = function() {
                        this.style.backgroundColor = '#07C160';
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = 'none';
                    };
                    
                    // 移除可能存在的旧事件监听器
                    simulateButton.onclick = null;
                    
                    simulateButton.onclick = function() {
                        loginStatusText.textContent = '登录中，请稍候...';
                        loginStatusText.classList.add('verifying');
                        loginStatusText.style.color = '#07C160';
                        
                        // 禁用按钮防止重复点击
                        simulateButton.disabled = true;
                        simulateButton.classList.add('disabled');
                        simulateButton.style.opacity = '0.7';
                        simulateButton.style.cursor = 'not-allowed';
                        
                        // 添加加载中动画
                        const btnSpinner = document.createElement('span');
                        btnSpinner.className = 'btn-spinner';
                        btnSpinner.style.display = 'inline-block';
                        btnSpinner.style.width = '14px';
                        btnSpinner.style.height = '14px';
                        btnSpinner.style.border = '2px solid rgba(255,255,255,0.3)';
                        btnSpinner.style.borderTop = '2px solid white';
                        btnSpinner.style.borderRadius = '50%';
                        btnSpinner.style.animation = 'spin 1s linear infinite';
                        btnSpinner.style.marginRight = '8px';
                        
                        simulateButton.prepend(btnSpinner);
                        
                        AuthManager.simulateScanSuccess();
                    };
                }
            }
        }, 1500);
    }
}

// 自定义确认对话框函数
// customConfirm函数已移至utils.js中

// 初始化通知系统
function initNotificationSystem() {
    // 检查通知容器是否已存在
    let container = document.getElementById('notification-container');
    if (!container) {
        // 创建通知容器
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    // 添加全局样式到页面
    addGlobalStyles();
}

// 添加全局样式
function addGlobalStyles() {
    // 检查样式是否已存在
    if (document.getElementById('global-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'global-styles';
    styleEl.textContent = `
        /* 个人中心高亮动画 */
        @keyframes highlight {
            0% { background-color: transparent; }
            50% { background-color: rgba(255, 107, 0, 0.1); }
            100% { background-color: transparent; }
        }
        
        /* 平滑过渡动画 */
        .user-section, .user-profile-info, #userMenu {
            transition: all 0.3s ease;
        }
        
        /* 登录相关元素的基础样式 */
        .login-prompt, .not-logged-in {
            transition: opacity 0.3s ease;
        }
        
        /* 头像基础样式 */
        .user-avatar, .avatar {
            transition: all 0.2s ease;
        }
        
        /* 登录成功和登出时的动画 */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOutDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(10px);
            }
        }
    `;
    
    document.head.appendChild(styleEl);
}

// 显示通知提示
function showNotification(message, type = 'info') {
    // 获取通知容器
    let container = document.getElementById('notification-container');
    if (!container) {
        // 如果容器不存在，创建它
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 触发动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒后自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 处理页面可见性变化，在页面重新可见时检查登录状态
function handleVisibilityChange() {
    if (!document.hidden) {
        // 页面重新可见，检查登录状态
        checkAndUpdateUI();
    }
}

// 导出全局函数
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
// showNotification已通过Utils对象导出
window.checkAndUpdateUI = checkAndUpdateUI;

// 导出应用对象
window.App = {
    openLoginModal,
    closeLoginModal,
    showNotification: Utils.showNotification,
    customConfirm: Utils.customConfirm,
    checkAndUpdateUI,
    isLoggedIn: function() {
        return window.AuthManager ? AuthManager.checkLoginStatus() : false;
    },
    getUserInfo: function() {
        return window.AuthManager ? AuthManager.getUserInfo() : null;
    }
};