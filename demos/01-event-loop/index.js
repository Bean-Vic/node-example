/**
 * Demo 01: Event Loop Execution Order
 * 
 * 对应知识点：What is the execution order of synchronous code, process.nextTick, Promise.then, setTimeout, and setImmediate?
 * 总结：同步代码 -> process.nextTick -> Promise microtasks -> setTimeout/setImmediate (macrotasks)
 */

console.log('--- 演示：Event Loop 执行顺序 ---');
console.log('预期顺序应该为: 1 (Sync), 5 (Sync), 4 (nextTick), 3 (Promise), 2 (setTimeout)');
console.log('-----------------------------------');

console.log('1. 同步代码 - earliest');

setTimeout(() => {
    console.log('2. setTimeout - macrotask');
}, 0);

Promise.resolve().then(() => {
    console.log('3. Promise.then - microtask');
});

process.nextTick(() => {
    console.log('4. process.nextTick - highest priority microtask');
});

console.log('5. 同步代码 - latest');

// 因为是简单的控制台输出，给足够的时间后退出进程
setTimeout(() => {
    console.log('\n✅ 演示结束，进程即将退出。\n');
    process.exit(0);
}, 100);
