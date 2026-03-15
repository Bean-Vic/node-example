/**
 * Demo 06: JWT Auth Flow Simulation
 * 
 * 对应知识点：Briefly explain the JWT authentication flow in a typical Express app.
 * 解析：Login -> Generate JWT -> Client stores -> Client sends in Header (Bearer) -> Middleware verifies -> Route handles
 */

const express = require('express');

// 为了保持无依赖运行本 Demo，这里模拟一个极其简化的 JWT 签名和校验功能，
// 真实项目中应该使用 npm jsonwebtoken 库
const mockJwt = {
    sign: (payload) => {
        const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
        return `mockheader.${payloadBase64}.mocksig`;
    },
    verify: (token) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error('Invalid token structure');
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            return payload;
        } catch (e) {
            throw new Error('Verification failed');
        }
    }
};

const app = express();
app.use(express.json());

// 模拟数据库用户信息
const userDb = { id: 101, username: 'Bean', password: 'password123' };

// 1. 登录并签发 JWT
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`[Auth] User attempting to login: ${username}`);

    if (username === userDb.username && password === userDb.password) {
        // 登录成功，签发 Token
        console.log(`[Auth] Login success. Generating token...`);
        const token = mockJwt.sign({ id: userDb.id, username: userDb.username, role: 'admin' });
        return res.json({ token, message: 'Login successful' });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
});

// 2. JWT 验证中间件
const verifyTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']; // format: Bearer <token>
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`[Verify] No token provided or wrong format.`);
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    console.log(`[Verify] Verifying token: ${token}`);

    try {
        const decoded = mockJwt.verify(token);
        req.user = decoded; // 挂载到 req 对象供后续路由使用
        console.log(`[Verify] Token valid. User payload:`, req.user);
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// 3. 受保护路由
app.get('/api/protected', verifyTokenMiddleware, (req, res) => {
    console.log(`[Protected Route] Handling request for user: ${req.user.username}`);
    res.json({ message: `Welcome to the secure zone, ${req.user.username}! Your role is: ${req.user.role}` });
});

const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`==> JWT Auth Mock Server running on port ${port} <==`);

    console.log('\n--- 场景 1: 尝试访问受保护路由 (无 Token) ---');
    let res = await fetch(`${baseUrl}/api/protected`);
    console.log(`[Client] Status: ${res.status}, Body:`, await res.json());

    console.log('\n--- 场景 2: 用户登录 (获取 Token) ---');
    res = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Bean', password: 'password123' })
    });
    const loginData = await res.json();
    console.log(`[Client] Login Response:`, loginData);
    const token = loginData.token;

    console.log('\n--- 场景 3: 附带 Token 访问受保护路由 ---');
    res = await fetch(`${baseUrl}/api/protected`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`[Client] Status: ${res.status}, Body:`, await res.json());

    console.log('\n--- 场景 4: 附带伪造 Token 访问受保护路由 ---');
    res = await fetch(`${baseUrl}/api/protected`, {
        headers: { 'Authorization': `Bearer fakeheader.notbase64_.bad` }
    });
    console.log(`[Client] Status: ${res.status}, Body:`, await res.json());

    server.close();
    console.log('\n✅ 演示结束，进程即将退出。\n');
});
