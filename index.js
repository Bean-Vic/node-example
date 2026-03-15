const readline = require('readline');
const { fork } = require('child_process');
const path = require('path');

const demos = [
    { id: 1, name: 'Event Loop Execution Order', path: './demos/01-event-loop/index.js' },
    { id: 2, name: 'setImmediate vs setTimeout', path: './demos/02-setimmediate-vs-settimeout/index.js' },
    { id: 3, name: 'Express Middleware Order', path: './demos/03-express-middleware/index.js' },
    { id: 4, name: 'Express Router Modularization', path: './demos/04-express-router/index.js' },
    { id: 5, name: 'Express Async Error Handling', path: './demos/05-express-error-handling/index.js' },
    { id: 6, name: 'Mongoose Schema vs Model', path: './demos/06-schema-vs-model/index.js' },
    { id: 7, name: 'Mongoose Population (Joins)', path: './demos/07-mongoose-population/index.js' },
    { id: 8, name: 'MongoDB Aggregation (Pipelines)', path: './demos/08-mongodb-aggregation/index.js' },
    { id: 9, name: 'Mongoose .lean() Query Optimization', path: './demos/09-mongoose-lean/index.js' },
    { id: 10, name: 'Mongoose Hooks and "this"', path: './demos/10-mongoose-hooks/index.js' },
    { id: 11, name: 'Mongoose Pre and Post Hooks', path: './demos/11-mongoose-pre-post/index.js' },
    { id: 12, name: 'RESTful API Mock', path: './demos/12-restful-api/index.js' },
    { id: 13, name: 'JWT Auth Flow Simulation', path: './demos/13-jwt-auth/index.js' }
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 更加暴力的清屏函数，确保清除 WebStorm 或常见终端的滚动缓冲区
const clearConsole = () => {
    process.stdout.write(
        process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H'
    );
};

const printMenu = () => {
    console.log('\n=======================================');
    console.log('🚀 Node.js Backend 知识点交互 Demo');
    console.log('=======================================');
    demos.forEach(demo => {
        console.log(`[${demo.id}] ${demo.name}`);
    });
    console.log('[0] 退出程序');
    console.log('---------------------------------------');
};

const runDemo = (index) => {
    // 每次运行新的 Demo 前，强制清空全部控制台，保持干净
    clearConsole();

    const demo = demos[index - 1];
    console.log(`\n>>> 正在运行 Demo: ${demo.name} <<<\n`);

    const child = fork(path.resolve(__dirname, demo.path));

    child.on('close', (code) => {
        console.log(`\n--- Demo 执行完毕 (Exit Code: ${code}) ---`);
        promptUser();
    });
};

const promptUser = () => {
    printMenu();
    rl.question('请输入序号以执行相应的 Demo (0-13): ', (answer) => {
        const choice = parseInt(answer.trim(), 10);

        if (choice === 0) {
            console.log('\nBye 👋');
            rl.close();
        } else if (choice >= 1 && choice <= demos.length) {
            runDemo(choice);
        } else {
            clearConsole(); // 输入错误时也清屏重绘菜单
            console.log('\n⚠️ 无效的序号，请输入 0 到 13 之间的数字。');
            promptUser();
        }
    });
};

// Start CLI
clearConsole(); // 首次启动清屏
promptUser();