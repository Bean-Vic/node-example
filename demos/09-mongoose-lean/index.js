/**
 * Demo 09: Mongoose .lean()
 * 
 * 对应知识点：What does .lean() do in Mongoose queries and why use it?
 * 解析：
 * - 默认情况下，Mongoose 查询返回的是 "Document 实例对象"（非常重，包含内部状态、save方法、getters/setters、虚拟属性等）。
 * - 加上 `.lean()` 后，Mongoose 会跳过实例化步骤，直接返回原生的纯 JS 对象 (POJO)。
 * - 优点：查询速度极快，内存占用极小。适用于只读操作（如渲染页面或只返回 JSON 给前端）。
 */
const mongoose = require('mongoose');

function runDemo() {
    console.log('--- 演示：Mongoose .lean() 查询优化 ---\n');

    // 定义一个简单的 Schema 和 Model
    const userSchema = new mongoose.Schema({ name: String, age: Number });
    userSchema.virtual('isAdult').get(function() { return this.age >= 18; });
    
    const User = mongoose.model('Demo9User', userSchema);
    
    // 模拟数据
    const rawMongooseDocument = new User({ name: 'Bob', age: 20 });
    
    console.log('>>> 比较普通查询与使用 .lean() 查询返回对象的不同\n');

    console.log('=======================================');
    console.log('🐢 普通查询 (Mongoose Document 实例):');
    console.log(`User.findOne({ name: 'Bob' })`);
    console.log('特点: 可以调用 .save()，有虚拟属性 (Virtuals)，响应比较重。');
    console.log('实例类型:', rawMongooseDocument.constructor.name);
    console.log('包含内置状态（部分）:', Object.keys(rawMongooseDocument).slice(0, 5).join(', ') + ', ...');
    console.log('虚拟属性 isAdult:', rawMongooseDocument.isAdult);
    console.log('拥有 .save() 方法?', typeof rawMongooseDocument.save === 'function');

    console.log('\n=======================================');
    console.log('🚀 使用 .lean() 查询 (纯原生 JS 对象):');
    console.log(`User.findOne({ name: 'Bob' }).lean()`);
    console.log('特点: 只是简单的数据载体，没有 .save() 方法，不包含虚拟属性。极大地节省内存并提升几十倍的构建速度。');
    
    const leanDocument = { _id: new mongoose.Types.ObjectId(), name: 'Bob', age: 20, __v: 0 };
    
    console.log('实例类型:', leanDocument.constructor.name);
    console.log('实际数据:', leanDocument);
    console.log('虚拟属性 isAdult:', leanDocument.isAdult); // undefined
    console.log('拥有 .save() 方法?', typeof leanDocument.save === 'function');
    console.log('=======================================\n');

    console.log('💡 结论: 如果你只是查询并读取数据（如用于 GET API），加上 .lean() 能大幅提升性能！');
    
    console.log('\n✅ 演示结束，进程即将退出。\n');
    process.exit(0);
}

runDemo();
