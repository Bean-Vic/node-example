/**
 * Demo 03: Express Async Error Handling
 * 
 * 对应知识点：
 * 1. How does Express handle errors?
 * 2. Why do async route handlers usually need try/catch or an asyncHandler?
 * 3. What is the difference between 400 and 500 errors?
 */

const express = require('express');

const app = express();
app.use(express.json());

// 模拟包裹 async 函数的 util
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 模拟 400 - 客户端错误 (Bad Request)
app.post('/api/users', asyncHandler(async (req, res) => {
    console.log('[Route] POST /api/users - 校验参数...');
    if (!req.body.name) {
        const err = new Error('Username is required');
        err.status = 400; // 客户端错误
        throw err;
    }
    res.status(201).json({ id: 1, name: req.body.name });
}));

// 模拟 500 - 服务端异常 (Internal Server Error)
app.get('/api/crash', asyncHandler(async (req, res) => {
    console.log('[Route] GET /api/crash - 模拟服务端内部异常...');
    // 假设数据库连接失败或者代码抛错
    throw new Error('Database connection failed unexpectedly');
}));

// 全局错误处理中间件 (必须是 4 个参数)
app.use((err, req, res, next) => {
    console.error(`[Error Handler] 捕获异常: ${err.message} (Status: ${err.status || 500})`);
    res.status(err.status || 500).json({
        error: err.message,
        type: err.status === 400 ? 'Client Error' : 'Server Error'
    });
});

const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`==> Server started on port ${port} <==`);
    
    const baseUrl = `http://localhost:${port}`;

    console.log('\n--- 场景 1: 发送缺少必填参数的非法请求 (触发 400) ---');
    const res1 = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // 缺少 name
    });
    console.log(`Response Status: ${res1.status}`);
    console.log('Response Body:', await res1.json());

    console.log('\n--- 场景 2: 访问会触发服务端异常的路由 (触发 500) ---');
    const res2 = await fetch(`${baseUrl}/api/crash`);
    console.log(`Response Status: ${res2.status}`);
    console.log('Response Body:', await res2.json());

    server.close();
    console.log('\n✅ 演示结束，进程即将退出。\n');
});
