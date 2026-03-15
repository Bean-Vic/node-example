/**
 * Demo 07: Mongoose Pre and Post Hooks
 * 
 * 对应知识点：What are pre and post hooks in Mongoose?
 * 解析：
 * - Pre hooks 在某些特定的 Mongoose 操作（如 save, validate, remove 等）之前执行。常用于：密码哈希、修改文档属性、级联删除前检查等。
 * - Post hooks 在这些操作完成之后执行。常用于：发送邮件、记录日志、清理缓存、级联删除后续处理等。
 */

const mongoose = require('mongoose');

// ==========================================
// 1. 定义 Schema 并配置 Hooks
// ==========================================
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date }
});

// --- Pre Hooks (操作执行前) ---
// 1. pre('save') 钩子可以有 next 参数（回调风格），也可以返回 Promise（推荐）
userSchema.pre('save', function(next) {
    console.log(`[Pre-Save Hook 1] 📝 准备保存用户: ${this.username}...`);
    
    // 我们可以在这里自动设置 createdAt 字段
    if (!this.createdAt) {
        console.log(`[Pre-Save Hook 1] ⏳ 自动补充 createdAt 字段...`);
        this.createdAt = new Date();
    }
    next(); // 必须调用 next()，或者返回一个 Promise
});

userSchema.pre('save', async function() {
    console.log(`[Pre-Save Hook 2] 🔒 正在进行密码哈希处理... (模拟)`);
    // 模拟耗时的 bcrypt hash 操作
    await new Promise(resolve => setTimeout(resolve, 500));
    this.password = `###HASHED-${this.password}###`;
    console.log(`[Pre-Save Hook 2] ✅ 密码哈希完成。`);
    // async 函数自动返回 Promise，不需要显式调用 next()
});

// --- Post Hooks (操作执行后) ---
// post 钩子接收执行完毕后的文档 (doc) 作为参数
userSchema.post('save', function(doc, next) {
    console.log(`\n[Post-Save Hook] 📧 成功保存用户 ${doc.username} 到数据库！`);
    console.log(`[Post-Save Hook] 📨 正在触发欢迎邮件发送逻辑...`);
    // 模拟发送邮件
    setTimeout(() => {
        console.log(`[Post-Save Hook] ✉️ 欢迎邮件成功发送给 ${doc.username}。`);
        next(); // 结束 post hook
    }, 500);
});

// 错误处理相关的 Post Hook
// 如果操作抛出异常，Mongoose 会传递一个 error 对象给包含 3 个参数的 post hook
userSchema.post('save', function(error, doc, next) {
    if (error.name === 'ValidationError') {
        console.log(`[Post-Save Error Hook] ❌ 捕获到 Mongoose 验证错误: ${error.message}`);
        next(new Error('用户验证失败，请检查必填字段'));
    } else {
        next(error); // 继续传递其它类型的错误
    }
});

const User = mongoose.model('Demo7User', userSchema);

// ==========================================
// 2. 模拟连接数据库并执行演示代码
// ==========================================
async function runDemo() {
    console.log('--- 演示：Mongoose Pre and Post Hooks 生命周期 ---\n');

    try {
        // 由于是演示，我们连接一个内存 MongoDB 或者干脆不真正连接数据库
        // 但 Mongoose 的 Model.create/save 需要真实连接。
        // 这里为了轻量化演示，我们不实际建立网络连接，只是手动调用同步的验证行为来触发 pre validate hook，
        // 或者直接提供一个仅在内存运行的 mock 示例。在此 demo 中，我们仅使用普通的 mongoose document 实例化。
        // 🚨 注意：未连接 MongoDB 的情况下，执行 .save() 会一直 pending（直到建立连接或超时）
        // 故在此使用 Mock 的执行过程（直接触发 hooks 对应的 emit 方法进行模拟教学，或者临时启动 mongodb-memory-server）
        
        console.log('⚠️ 为免依赖真实 MongoDB 实例，下面将手动触发 Document 生命周期：');
        
        const newUser = new User({ username: 'HookMaster', password: 'mySecretPassword' });

        // 步骤 1: 触发 Pre Validate
        console.log('\n>>> 阶段 1: 实例化文档，准备 Save');
        
        // ==========================================
        // 为了演示目的且不依赖 MongoDB 实例，我们手动提取并执行注册的 Hooks
        // ==========================================
        
        console.log('\n--- 开始执行 Pre-Save Hooks ---');
        // 获取所有绑定的 pre('save') 钩子函数
        const preSaveHooks = userSchema.s.hooks._pres.get('save') || [];
        for (const hookObj of preSaveHooks) {
            const fn = hookObj.fn;
            if (fn.length > 0) {
                // 回调风格
                await new Promise(resolve => fn.call(newUser, resolve));
            } else {
                // Promise 风格
                await fn.call(newUser);
            }
        }

        console.log('\n--- 模拟数据库 Save 操作 ---');
        console.log(`[DB] 执行 insert({ username: '${newUser.username}', password: '${newUser.password}', createdAt: ${newUser.createdAt} })`);
        newUser._id = new mongoose.Types.ObjectId(); // 模拟生成 ID
        
        console.log('\n--- 开始执行 Post-Save Hooks ---');
        // 获取所有绑定的 post('save') 钩子函数
        const postSaveHooks = userSchema.s.hooks._posts.get('save') || [];
        for (const hookObj of postSaveHooks) {
            const fn = hookObj.fn;
            // 判断是否是错误处理 hook
            if (fn.length === 3) {
                continue; // 成功时不执行 error handler
            } else if (fn.length === 2) {
                await new Promise(resolve => fn.call(newUser, newUser, resolve));
            } else {
                await fn.call(newUser, newUser);
            }
        }
        
        
        // 给 post hook 的 setTimeout 留点时间打印
        await new Promise(resolve => setTimeout(resolve, 600));
        

    } catch (err) {
        console.error('Demo 执行出错:', err);
    } finally {
        console.log('\n✅ 演示结束，进程即将退出。\n');
        process.exit(0);
    }
}

runDemo();
