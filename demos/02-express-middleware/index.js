/**
 * Demo 02: Express Middleware Order
 * 
 * 对应知识点：What is middleware in Express? What is the execution order?
 * 解析：按注册顺序从上到下执行。能够拿到 req, res, next() 进行处理。
 */

const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log('[Middleware 1] 全局中间件执行');
    req.customData = 'hello from mw1';
    next(); // 把控制权交给下一个中间件
});

app.use((req, res, next) => {
    console.log(`[Middleware 2] 读取 customData: ${req.customData}`);
    next();
});

// 特定路由的中间件
app.get('/test', 
    (req, res, next) => {
        console.log('[Route Middleware] 匹配到 /test 路由');
        next();
    }, 
    (req, res) => {
        console.log('[Route Handler] 发送响应给客户端');
        res.json({ success: true, message: 'Done' });
    }
);

const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`Server started on port ${port}... Running simulated fetch request`);
    
    try {
        const response = await fetch(`http://localhost:${port}/test`);
        const json = await response.json();
        console.log('🔽 Client received response:');
        console.log(json);
    } catch (e) {
        console.error('Error fetching test:', e);
    } finally {
        server.close();
        console.log('\n✅ 演示结束，进程即将退出。\n');
    }
});
