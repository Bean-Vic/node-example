/**
 * Demo 04: Express Router
 * 
 * 对应知识点：What is Express Router and how to use it?
 * 解析：Router 就像是一个"迷你"的 express 应用，常用于将路由模块化。
 */

const express = require('express');
const app = express();

// 1. 创建 Router 实例
const userRouter = express.Router();
const productRouter = express.Router();

// 2. 为 Router 定义路由和中间件
userRouter.use((req, res, next) => {
    console.log('[UserRouter Middleware] 访问了用户相关路由');
    next();
});

userRouter.get('/', (req, res) => {
    console.log('[UserRouter Handler] GET /users');
    res.json({ message: '获取到用户列表' });
});

userRouter.post('/', (req, res) => {
    console.log('[UserRouter Handler] POST /users');
    res.json({ message: '创建了一个新用户' });
});

productRouter.get('/:id', (req, res) => {
    console.log(`[ProductRouter Handler] GET /products/${req.params.id}`);
    res.json({ message: `获取到商品 ${req.params.id} 的信息` });
});

// 3. 将 Router 挂载到主应用上
app.use('/users', userRouter);
app.use('/products', productRouter);

const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`Server started on port ${port}... Running simulated fetch requests\n`);
    
    try {
        console.log('>>> 发起请求: GET /users');
        const getRes = await fetch(`http://localhost:${port}/users`);
        console.log('🔽 Client received:', await getRes.json(), '\n');

        console.log('>>> 发起请求: POST /users');
        const postRes = await fetch(`http://localhost:${port}/users`, { method: 'POST' });
        console.log('🔽 Client received:', await postRes.json(), '\n');

        console.log('>>> 发起请求: GET /products/123');
        const productRes = await fetch(`http://localhost:${port}/products/123`);
        console.log('🔽 Client received:', await productRes.json(), '\n');

    } catch (e) {
        console.error('Error fetching test:', e);
    } finally {
        server.close();
        console.log('\n✅ 演示结束，进程即将退出。\n');
    }
});
