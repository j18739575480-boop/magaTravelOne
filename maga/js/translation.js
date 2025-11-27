/**
 * 翻译相关功能模块
 * 用于将中文表单数据转换为英文格式，以便生成英文PDF报单
 */

const TranslationService = {
    // 签证类型翻译映射
    visaTypeMap: {
        'tourist': 'Tourist Visa',
        'business': 'Business Visa',
        'student': 'Student Visa',
        'work': 'Work Visa',
        'other': 'Other Visa'
    },
    
    // 表单字段翻译映射
    fieldMap: {
        'fullName': 'Full Name',
        'phone': 'Phone Number',
        'email': 'Email Address',
        'travelCountry': 'Destination Country',
        'travelDate': 'Planned Travel Date',
        'visaType': 'Visa Type',
        'travelDuration': 'Estimated Stay Duration (days)',
        'passportNumber': 'Passport Number',
        'passportExpiry': 'Passport Expiry Date',
        'specialRequirements': 'Special Requirements or Remarks'
    },
    
    /**
     * 模拟翻译函数（实际应用中应替换为翻译API调用）
     * @param {string} text - 要翻译的中文文本
     * @returns {string} 翻译后的英文文本
     */
    translateText: function(text) {
        // 简单的模拟翻译逻辑
        // 在实际应用中，这里应该调用翻译API（如Google Translate API、百度翻译API等）
        // 这里仅作为演示，返回模拟翻译结果
        if (!text || typeof text !== 'string') {
            return text;
        }
        
        // 一些常见中文到英文的简单映射
        const commonTranslations = {
            '旅游签证': 'Tourist Visa',
            '商务签证': 'Business Visa',
            '学生签证': 'Student Visa',
            '工作签证': 'Work Visa',
            '其他签证': 'Other Visa'
        };
        
        // 检查是否有直接匹配的翻译
        for (const [chinese, english] of Object.entries(commonTranslations)) {
            if (text.includes(chinese)) {
                text = text.replace(chinese, english);
            }
        }
        
        // 对于国家名称的简单处理（实际应用中应使用完整的国家名称翻译表）
        const countryMap = {
            '中国': 'China',
            '美国': 'United States',
            '日本': 'Japan',
            '韩国': 'South Korea',
            '英国': 'United Kingdom',
            '法国': 'France',
            '德国': 'Germany',
            '澳大利亚': 'Australia',
            '加拿大': 'Canada',
            '新加坡': 'Singapore',
            '泰国': 'Thailand',
            '意大利': 'Italy',
            '西班牙': 'Spain',
            '俄罗斯': 'Russia'
        };
        
        for (const [chinese, english] of Object.entries(countryMap)) {
            if (text === chinese) {
                return english;
            }
        }
        
        // 对于其他文本，返回原文（实际应用中应调用翻译API）
        // 这里添加一个标记，表明这是需要翻译但尚未翻译的文本
        // 在生产环境中，应替换为真实的翻译API调用
        return text; // 注意：在实际应用中，这里应该调用翻译API
    },
    
    /**
     * 翻译表单数据
     * @param {Object} formData - 中文表单数据
     * @returns {Object} 翻译后的英文表单数据
     */
    translateFormData: function(formData) {
        const translatedData = {};
        
        // 遍历表单数据，进行翻译
        for (const [field, value] of Object.entries(formData)) {
            // 获取英文字段名
            const englishField = this.fieldMap[field] || field;
            
            // 根据字段类型进行翻译
            if (field === 'visaType' && this.visaTypeMap[value]) {
                // 签证类型使用预定义映射
                translatedData[englishField] = this.visaTypeMap[value];
            } else if (field === 'travelCountry' || field === 'specialRequirements') {
                // 需要翻译的文本字段
                translatedData[englishField] = this.translateText(value);
            } else {
                // 不需要翻译的字段（如日期、数字、邮箱等）
                translatedData[englishField] = value;
            }
        }
        
        return translatedData;
    },
    
    /**
     * 格式化日期为英文格式
     * @param {string} dateString - 日期字符串（YYYY-MM-DD格式）
     * @returns {string} 格式化后的日期字符串
     */
    formatDate: function(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        // 格式化为英文日期格式：Month Day, Year
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
};

// 导出翻译服务
window.TranslationService = TranslationService;