/**
 * Demo 05: RESTful API & CRUD, Express req props
 * 
 * 对应知识点：
 * 1. RESTful API style & CRUD
 * 2. req.params, req.query, req.body
 */

const express = require('express');

const app = express();
app.use(express.json()); // 用于解析 req.body

let users = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' }
];

// Read: GET - 使用 req.query
app.get('/api/users', (req, res) => {
    const role = req.query.role;
    console.log(`[Route] GET /api/users - query parameter role=${role}`);
    
    if (role) {
        return res.json(users.filter(u => u.role === role));
    }
    res.json(users);
});

// Read: GET specific resource - 使用 req.params
app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`[Route] GET /api/users/:id - params id=${id}`);
    
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// Create: POST - 使用 req.body
app.post('/api/users', (req, res) => {
    console.log('[Route] POST /api/users - received body:', req.body);
    
    const newUser = {
        id: users.length ? users[users.length - 1].id + 1 : 1,
        name: req.body.name,
        role: req.body.role || 'user'
    };
    users.push(newUser);
    res.status(201).json(newUser); // 201 Created
});

// Update: PUT - 整体更新 (有时也常用作部分更新，尽管 RESTful 严格意义是 PUT 整体，PATCH 部分)
app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`[Route] PUT /api/users/:id - params id=${id}, body:`, req.body);
    
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    
    users[index] = { id, ...req.body }; // 更新替换
    res.json(users[index]);
});

// Delete: DELETE - 删除资源
app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`[Route] DELETE /api/users/:id - params id=${id}`);
    
    users = users.filter(u => u.id !== id);
    res.status(204).send(); // 204 No Content
});

const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`==> RESTful API Server running on port ${port} <==`);

    console.log('\n1. POST: Create a new user (Create)');
    let res = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Charlie', role: 'user' })
    });
    console.log('Response:', await res.json());

    console.log('\n2. GET: Fetch list with query parameter (Read)');
    res = await fetch(`${baseUrl}/api/users?role=user`);
    console.log('Response:', await res.json());

    console.log('\n3. PUT: Update a specific user (Update)');
    res = await fetch(`${baseUrl}/api/users/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Alice Smith', role: 'super-admin' })
    });
    console.log('Response:', await res.json());

    console.log('\n4. DELETE: Delete a user (Delete)');
    res = await fetch(`${baseUrl}/api/users/2`, { method: 'DELETE' });
    console.log('Response Status:', res.status, res.statusText); // Expected 204 No Content
    
    console.log('\n5. GET: Fetch all users after operations');
    res = await fetch(`${baseUrl}/api/users`);
    console.log('Response:', await res.json());

    server.close();
    console.log('\n✅ 演示结束，进程即将退出。\n');
});
