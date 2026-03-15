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
    console.log('\n💣 场景 2: 使用箭头函数 (错误) -> this 对象是 undefined（或继承外层作用域的 window/global）');
    const user2 = new MockUserModel('Bob', '987654');
    user2.preSaveArrow = () => {
        // 下面这行会输出 undefined，因为箭头函数内部没有 this，这里会试图从全局继承
        console.log(`[Hook] Arrow function 'this' context is:`, this); 
        
        try {
            // this.password 这里会是不能设置/获取的异常或者未定义
            this.password = '###HASHED-' + this.password + '###';
        } catch (e) {
            console.error('[Hook] Error in arrow function hook:', e.message);
        }
    };
    return user2.save();
}).then(() => {
    console.log('\n✅ 演示结束，进程即将退出。\n');
    process.exit(0);
});
