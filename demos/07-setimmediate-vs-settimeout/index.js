/**
 * Demo 07: setImmediate vs setTimeout
 * 
 * 对应知识点：What is the execution order of setImmediate and setTimeout?
 * 解析：
 * 1. 在主模块 (Main Module) 中，setTimeout(fn, 0) 和 setImmediate() 执行顺序是不确定的（取决于进程性能）。
 * 2. 在 I/O 回调 (I/O Cycle) 中，setImmediate() 永远先于 setTimeout(fn, 0) 执行，因为 I/O 阶段之后紧接着就是 check 阶段。
 */

const fs = require('fs');
const path = require('path');

console.log('--- 演示：setImmediate vs setTimeout ---');

// --- 场景 1：在主模块中执行（顺序不确定） ---
console.log('\n🎈 场景 1：在主模块中执行');
console.log('=> 这里的执行顺序是不确定的 (Non-deterministic)！取决于当前进程进入 Event Loop 的耗时。');

setTimeout(() => {
    console.log('[Main Module] setTimeout executed');
}, 0);

setImmediate(() => {
    console.log('[Main Module] setImmediate executed');
});

// --- 场景 2：在 I/O 回调中执行（顺序确定） ---
// 给场景 1 留一点时间，稍微延迟执行场景 2，避免日志混在一起
setTimeout(() => {
    console.log('\n🎈 场景 2：在 I/O 回调中执行');
    console.log('=> 这里的执行顺序是确定的 (Deterministic)！setImmediate 永远先执行。');
    console.log('=> 因为 I/O 回调阶段结束后，轮到的下一个阶段就是 check (setImmediate)。');

    fs.readFile(__filename, () => {
        setTimeout(() => {
            console.log('[I/O Cycle] setTimeout executed');
        }, 0);
        
        setImmediate(() => {
            console.log('[I/O Cycle] setImmediate executed  <-- 永远先于 setTimeout 执行');
        });
    });
}, 100);

// 给场景 2 留时间完成
setTimeout(() => {
    console.log('\n✅ 演示结束，进程即将退出。\n');
    process.exit(0);
}, 300);
