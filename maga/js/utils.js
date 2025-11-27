/**
 * 通用工具函数集合
 */

/**
 * 自定义确认对话框
 */
function customConfirm(options) {
    const defaultOptions = {
        title: '确认操作',
        message: '确定要执行此操作吗？',
        confirmText: '确定',
        cancelText: '取消',
        onConfirm: null,
        onCancel: null
    };
    
    const config = { ...defaultOptions, ...options };
    
    // 创建模态框容器
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'custom-confirm-overlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.right = '0';
    modalOverlay.style.bottom = '0';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.zIndex = '9999';
    modalOverlay.style.animation = 'fadeIn 0.2s ease';
    
    // 创建对话框
    const modalDialog = document.createElement('div');
    modalDialog.className = 'custom-confirm-dialog';
    modalDialog.style.backgroundColor = 'white';
    modalDialog.style.borderRadius = '8px';
    modalDialog.style.padding = '24px';
    modalDialog.style.width = '360px';
    modalDialog.style.maxWidth = '90%';
    modalDialog.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    modalDialog.style.animation = 'slideUp 0.3s ease';
    
    // 创建标题
    const title = document.createElement('h3');
    title.className = 'custom-confirm-title';
    title.textContent = config.title;
    title.style.margin = '0 0 16px 0';
    title.style.fontSize = '18px';
    title.style.fontWeight = '500';
    title.style.color = '#333';
    
    // 创建消息
    const message = document.createElement('p');
    message.className = 'custom-confirm-message';
    message.textContent = config.message;
    message.style.margin = '0 0 24px 0';
    message.style.fontSize = '14px';
    message.style.color = '#666';
    message.style.lineHeight = '1.5';
    
    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'custom-confirm-buttons';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '12px';
    
    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.className = 'custom-confirm-cancel';
    cancelButton.textContent = config.cancelText;
    cancelButton.style.padding = '8px 20px';
    cancelButton.style.border = '1px solid #ddd';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.backgroundColor = 'white';
    cancelButton.style.color = '#666';
    cancelButton.style.fontSize = '14px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.transition = 'all 0.2s ease';
    
    // 创建确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.className = 'custom-confirm-confirm';
    confirmButton.textContent = config.confirmText;
    confirmButton.style.padding = '8px 20px';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '4px';
    confirmButton.style.backgroundColor = '#07C160';
    confirmButton.style.color = 'white';
    confirmButton.style.fontSize = '14px';
    confirmButton.style.cursor = 'pointer';
    confirmButton.style.transition = 'all 0.2s ease';
    
    // 添加按钮悬停效果
    cancelButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#f5f5f5';
    });
    
    cancelButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = 'white';
    });
    
    confirmButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#06AD56';
    });
    
    confirmButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#07C160';
    });
    
    // 添加按钮点击事件
    cancelButton.addEventListener('click', function() {
        // 淡出动画
        modalOverlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 200);
        
        if (typeof config.onCancel === 'function') {
            config.onCancel();
        }
    });
    
    confirmButton.addEventListener('click', function() {
        // 淡出动画
        modalOverlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 200);
        
        if (typeof config.onConfirm === 'function') {
            config.onConfirm();
        }
    });
    
    // 添加键盘事件（ESC关闭，Enter确认）
    const handleKeyDown = function(e) {
        if (e.key === 'Escape') {
            cancelButton.click();
        } else if (e.key === 'Enter') {
            confirmButton.click();
        }
    };
    
    modalOverlay.addEventListener('keydown', handleKeyDown);
    
    // 添加ESC点击外部关闭
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            cancelButton.click();
        }
    });
    
    // 构建DOM结构
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    
    modalDialog.appendChild(title);
    modalDialog.appendChild(message);
    modalDialog.appendChild(buttonContainer);
    
    modalOverlay.appendChild(modalDialog);
    
    // 添加到页面
    document.body.appendChild(modalOverlay);
    
    // 自动聚焦到确认按钮
    confirmButton.focus();
    
    // 添加动画样式
    if (!document.querySelector('#custom-confirm-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-confirm-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 初始化通知系统
 */
function initNotificationSystem() {
    // 创建通知容器
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notification-container') || document.createElement('div');
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到容器
    notificationContainer.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * 添加全局样式
 */
function addGlobalStyles() {
    // 检查是否已经添加过样式
    if (document.getElementById('global-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'global-styles';
    
    styleElement.textContent = `
        /* 通知样式 */
        #notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .notification {
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .notification-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .notification-warning {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .notification-info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        /* 确认对话框样式 */
        .confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .confirm-overlay.show {
            opacity: 1;
        }
        
        .confirm-dialog {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            width: 90%;
            max-width: 400px;
            transform: translateY(-20px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .confirm-dialog.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .confirm-header {
            padding: 16px 20px;
            font-size: 18px;
            font-weight: 600;
            border-bottom: 1px solid #eee;
        }
        
        .confirm-content {
            padding: 20px;
            line-height: 1.5;
        }
        
        .confirm-actions {
            padding: 16px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            border-top: 1px solid #eee;
        }
        
        .confirm-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
        }
        
        .confirm-yes {
            background-color: #007bff;
            color: white;
        }
        
        .confirm-yes:hover {
            background-color: #0056b3;
        }
        
        .confirm-no {
            background-color: #6c757d;
            color: white;
        }
        
        .confirm-no:hover {
            background-color: #545b62;
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
    if (!document.hidden) {
        // 页面变为可见时，检查登录状态
        if (typeof checkAndUpdateUI === 'function') {
            checkAndUpdateUI();
        }
    }
}

// 导出工具函数
export default {
    customConfirm,
    initNotificationSystem,
    showNotification,
    addGlobalStyles,
    handleVisibilityChange
};

// 也通过window对象提供全局访问
window.Utils = {
    customConfirm,
    initNotificationSystem,
    showNotification,
    addGlobalStyles,
    handleVisibilityChange
};