/**
 * Demo 04: Mongoose Hooks (this binding)
 * 
 * 对应知识点：Why should you avoid arrow functions in some Mongoose hooks?
 * 解析：Mongoose hooks 中的 this 指向当前 document，箭头函数没有自己的 this，会导致绑定失败。
 */

console.log('--- 演示：Mongoose Hooks 中 this 指向问题 (模拟实现) ---\n');

// 模拟 Mongoose Model 的行为
class MockUserModel {
    constructor(name, password) {
        this.name = name;
        this.password = password;
    }

    // 模拟 save 行为
    async save() {
        // 执行 pre-save hook 模拟 (绑定 this 到当前实例)
        if (this.preSaveRegular) {
            await this.preSaveRegular.call(this); // 使用普通函数，this 指向当前 document
        }
        
        if (this.preSaveArrow) {
            await this.preSaveArrow.call(this); // 箭头函数，call 无法改变其内置的 this
        }

        console.log(`[Database] Saving user: ${this.name}, password: ${this.password}`);
    }
}

// 场景 1: 使用普通函数 (正确做法)
console.log('💡 场景 1: 使用普通函数 (正确) -> this.password 可以被正确读取和修改');
const user1 = new MockUserModel('Alice', '123456');
user1.preSaveRegular = function() {
    console.log(`[Hook] Regular function 'this' context refers to user: ${this.name}`);
    // 模拟密码 hash 操作
    this.password = '###HASHED-' + this.password + '###';
};
user1.save().then(() => {
    
    // 场景 2: 使用箭头函数 (错误做法)
    console.log('\n💣 场景 2: 使用箭头函数 (错误) -> this 对象是 undefined（或继承外层作用域的模块 exports 对象 {}）');
    const user2 = new MockUserModel('Bob', '987654');
    user2.preSaveArrow = () => {
        // 在 Node.js 模块顶层作用域中，this 默认是 module.exports（一个空对象 {}）。
        // 在严格模式或某些打包环境下，this 可能会是 undefined。
        // 关键是：它绝对不是当前的 user2 文档实例！
        console.log(`[Hook] Arrow function 'this' context is:`, this); 
        
        try {
            // this.password 在空对象上是 undefined
            // 虽然这里能赋值，但它修改的是外层作用域的 this（即 module.exports），而不是用户文档！
            this.password = '###HASHED-' + this.password + '###';
            
            // 为了演示 Mongoose 中常见的错误（尝试调用文档方法），我们模拟调用一个不存在的方法
            if (!this.isModified) {
                throw new TypeError('this.isModified is not a function (this is not the document)');
            }
        } catch (e) {
            console.error('[Hook] ❌ Error in arrow function hook:', e.message);
        }
    };
    return user2.save();
}).then(() => {
    console.log('\n✅ 演示结束，进程即将退出。\n');
    process.exit(0);
});
