/**
 * 微信登录认证相关功能
 */

// 模拟微信登录状态管理
const AuthManager = {
    // 登录状态存储键名
    STORAGE_KEY: 'zoular_user_info',
    // 登录有效期（毫秒），默认2小时
    SESSION_EXPIRE_TIME: 2 * 60 * 60 * 1000,
    
    // 检查用户是否已登录
    checkLoginStatus: function() {
        const userData = this.getUserData();
        if (!userData) {
            return false;
        }
        
        // 检查登录是否过期
        const now = Date.now();
        if (userData.expireTime && now > userData.expireTime) {
            // 登录已过期，清除存储的数据
            this.logout();
            return false;
        }
        
        return true;
    },
    
    // 获取存储的完整用户数据（包含过期时间等信息）
    getUserData: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('获取用户数据失败:', e);
            return null;
        }
    },
    
    // 获取当前登录用户信息
    getUserInfo: function() {
        const userData = this.getUserData();
        return userData ? userData.userInfo : null;
    },
    
    // 设置用户信息（模拟登录成功）
    setUserInfo: function(userInfo) {
        try {
            // 计算过期时间
            const expireTime = Date.now() + this.SESSION_EXPIRE_TIME;
            
            // 存储用户数据和过期时间
            const userData = {
                userInfo: userInfo,
                expireTime: expireTime,
                loginTime: Date.now()
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
            
            // 启动定期检查，防止长时间未操作导致登录过期
            this.startSessionCheck();
            
            // 通知登录状态变化
            this.notifyLoginStatusChange(true);
            
            return true;
        } catch (e) {
            console.error('保存用户信息失败:', e);
            return false;
        }
    },
    
    // 用户登出
    logout: function() {
        try {
            // 清除存储的用户数据
            localStorage.removeItem(this.STORAGE_KEY);
            
            // 停止会话检查
            this.stopSessionCheck();
            
            // 通知登录状态变化
            this.notifyLoginStatusChange(false);
            
            return true;
        } catch (e) {
            console.error('登出失败:', e);
            return false;
        }
    },
    
    // 通知登录状态变化
    notifyLoginStatusChange: function(isLoggedIn) {
        // 触发自定义事件，让页面其他部分响应登录状态变化
        const event = new CustomEvent('loginStatusChanged', {
            detail: {
                isLoggedIn: isLoggedIn,
                userInfo: isLoggedIn ? this.getUserInfo() : null
            }
        });
        document.dispatchEvent(event);
    },
    
    // 模拟扫码成功
    simulateScanSuccess: function() {
        // 这里通常由后端通过WebSocket或轮询通知前端登录成功
        // 这里我们使用模拟数据
        const mockUserInfo = {
            userId: 'wx123456789',
            nickname: '旅行者小明',
            avatar: 'https://via.placeholder.com/150',
            level: '普通会员',
            points: 1200
        };
        
        // 模拟延迟，模拟扫码确认过程
        setTimeout(() => {
            this.setUserInfo(mockUserInfo);
            
            // 关闭登录模态框
            if (window.closeLoginModal) {
                window.closeLoginModal();
            }
            
            // 直接调用更新UI的函数，确保导航栏状态正确更新
            if (window.updateUIForLoginStatus) {
                window.updateUIForLoginStatus(true, mockUserInfo);
            }
        }, 3000);
    },
    
    // 会话检查相关
    sessionCheckInterval: null,
    
    // 启动会话定期检查
    startSessionCheck: function() {
        // 每5分钟检查一次登录状态
        const checkInterval = 5 * 60 * 1000;
        
        // 先清除可能存在的检查
        this.stopSessionCheck();
        
        this.sessionCheckInterval = setInterval(() => {
            if (!this.checkLoginStatus()) {
                // 登录已过期，清除定时器
                this.stopSessionCheck();
            }
        }, checkInterval);
    },
    
    // 停止会话检查
    stopSessionCheck: function() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    },
    
    // 刷新会话有效期
    refreshSession: function() {
        const userInfo = this.getUserInfo();
        if (userInfo) {
            this.setUserInfo(userInfo);
            return true;
        }
        return false;
    }
};

// 初始化认证管理
function initAuth() {
    // 检查当前登录状态
    if (AuthManager.checkLoginStatus()) {
        AuthManager.notifyLoginStatusChange(true);
    }
}

// 导出功能供其他模块使用
window.AuthManager = AuthManager;
window.initAuth = initAuth;