/**
 * Demo 06: Mongoose Schema vs Model
 * 
 * 对应知识点：What is the difference between Schema and Model in Mongoose?
 * 解析：
 * - Schema（模式）：定义了集合中文档的结构（字段类型、默认值、验证规则等），但它本身不做任何数据库操作，可以把它看作是一个蓝图或配置对象。
 * - Model（模型）：使用 Schema 编译而成的一个构造函数。它提供了与数据库交互的所有接口（如 find, create, update, delete 等），代表着数据库中的一个特定集合（Collection）。每个由 Model 创建出的实例即是一个 Document（文档）。
 */

const mongoose = require('mongoose');

console.log('--- 演示：Mongoose Schema vs Model ---\n');

// ==========================================
// 1. Schema（蓝图/结构规范）
// ==========================================
console.log('>>> 第一步：创建 Schema (定义结构)');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, min: 0 }
});

// 我们可以在 Schema 上定义实例方法（作用于具体的 document）
productSchema.methods.getDisplayPrice = function() {
    return `$${this.price.toFixed(2)}`;
};

// 也可以定义静态方法（作用于整个 Model 集合）
productSchema.statics.findByMinPrice = function(minPrice) {
    console.log(`[静态方法] 正在查询所有价格大于 ${minPrice} 的商品...`);
    // 注意：这里只是演示，因为没连数据库会直接返回模拟数据
    return [{ name: 'Laptop', price: 999 }];
};

console.log('✅ Schema 创建成功，但此时它还不能查询或保存数据！');
console.log('💡 productSchema 是一个:', productSchema.constructor.name, '\n');

// ==========================================
// 2. Model（操作数据库的类/构造函数）
// ==========================================
console.log('>>> 第二步：使用 Schema 编译出 Model (生成数据库操作接口)');
const Product = mongoose.model('Product', productSchema);

console.log('✅ Model 创建成功，它可以用来读写数据库。');
console.log('💡 Product 本身是一个:', typeof Product);
console.log('💡 Product 的原型是:', Object.getPrototypeOf(Product).name); // Model

// 演示 Model 上的静态方法调用
console.log('\n--- Model 级别的操作 (针对整个集合) ---');
console.log('Model.find() 存在吗？', typeof Product.find === 'function' ? 'Yes' : 'No');
// 调用定义在 Schema 中的静态方法
const expensiveItems = Product.findByMinPrice(500);
console.log('查询结果:', expensiveItems);

// ==========================================
// 3. Document 实例（由 Model 创建出的具体数据实体）
// ==========================================
console.log('\n>>> 第三步：通过 Model 实例化出 Document');
const myProduct = new Product({ name: 'Coffee Mug', price: 12.5 });

console.log('\n--- Document 级别的操作 (针对单条数据) ---');
console.log('💡 myProduct 是一个:', myProduct.constructor.modelName, '实例');
console.log('💡 是否可以通过 myProduct.save() 保存？', typeof myProduct.save === 'function' ? 'Yes' : 'No');

// 调用定义在 Schema 中的实例方法
console.log('调用 myProduct.getDisplayPrice():', myProduct.getDisplayPrice());

console.log('\n=======================================');
console.log('📝 总结:');
console.log('1. Schema => 只是一个描述数据长什么样的对象 (蓝图)');
console.log('2. Model  => 使用这个蓝图生产出来的 "数据库交互类"，负责对 Collection 进行增删改查');
console.log('3. Document => Model 实例化的对象，对应表里的一行数据 (Row)');
console.log('=======================================\n');

console.log('✅ 演示结束，进程即将退出。\n');
process.exit(0);
