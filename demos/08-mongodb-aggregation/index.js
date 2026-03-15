/**
 * Demo 08: MongoDB Aggregation (via Mongoose)
 * 
 * 对应知识点：What is MongoDB Aggregation Framework?
 * 解析：聚合管道 (Aggregation Pipeline) 是一组多阶段的操作，可以处理数据记录并返回计算后的结果（如过滤、分组、排序、重塑、关联计算等），类似于 SQL 的 GROUP BY、JOIN 等。
 */
const mongoose = require('mongoose');

function runDemo() {
    console.log('--- 演示：MongoDB Aggregation (聚合管道) ---\n');

    console.log('>>> 背景：假设我们有一个基于 Order (订单) 表的数据流水线。\n');

    console.log('📦 集合中的原始数据 (模拟):');
    const rawData = [
        { _id: 1, product: 'Laptop', amount: 1000, status: 'A' },
        { _id: 2, product: 'Mouse', amount: 50, status: 'A' },
        { _id: 3, product: 'Laptop', amount: 1200, status: 'B' },
        { _id: 4, product: 'Mouse', amount: 60, status: 'A' },
    ];
    console.table(rawData);

    console.log('\n=======================================');
    console.log('🛠 执行聚合查询:');
    console.log(`
Order.aggregate([
  { $match: { status: 'A' } },  // 阶段 1: 过滤 (类似 WHERE status='A')
  { $group: {                   // 阶段 2: 分组 (类似 GROUP BY product)
      _id: '$product',          // 按 product 字段分组
      totalAmount: { $sum: '$amount' } // 将 amount 累加
  } }
])`);
    console.log('=======================================\n');

    // 手动模拟 Aggregation 的处理过程：
    console.log('⏳ Pipeline 执行过程:');
    
    // Stage 1: $match
    const matchedData = rawData.filter(d => d.status === 'A');
    console.log('\n[Stage 1] $match 过滤后得到的数据:');
    console.table(matchedData);

    // Stage 2: $group
    const groupedData = matchedData.reduce((acc, curr) => {
        const group = acc.find(g => g._id === curr.product);
        if (group) {
            group.totalAmount += curr.amount;
        } else {
            acc.push({ _id: curr.product, totalAmount: curr.amount });
        }
        return acc;
    }, []);
    
    console.log('\n[Stage 2] $group 分组计算后得到的最终结果:');
    console.table(groupedData);

    console.log('\n✅ 演示结束，进程即将退出。\n');
    process.exit(0);
}

runDemo();
