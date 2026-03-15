/**
 * Demo 07: Mongoose Population
 * 
 * 对应知识点：What is Population in Mongoose?
 * 解析：Population 是自动将文档中引用的其他集合中的 ID 替换为被引用的文档的完整对象的过程（类似于 SQL 中的 JOIN，但这是在应用层完成的）。
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

function runDemo() {
    console.log('--- 演示：Mongoose Population (关联查询) ---\n');

    // 1. 定义 Author (作者) Schema
    const authorSchema = new Schema({
        name: String,
        bio: String
    });
    const Author = mongoose.model('Demo7Author', authorSchema);

    // 2. 定义 Book (书籍) Schema，它引用了 Author
    const bookSchema = new Schema({
        title: String,
        // 使用 ObjectId 类型，并指定 ref (关联的是哪一个 Model)
        authorId: { type: Schema.Types.ObjectId, ref: 'Demo7Author' }
    });
    const Book = mongoose.model('Demo7Book', bookSchema);

    // 模拟数据
    const mockAuthorId = new mongoose.Types.ObjectId();
    const mockAuthor = new Author({ _id: mockAuthorId, name: 'J.K. Rowling', bio: 'British author' });
    const mockBook = new Book({ title: 'Harry Potter', authorId: mockAuthorId });

    console.log('>>> 数据库中的原始数据存在形式:');
    console.log('Author:', { _id: mockAuthor._id.toString(), name: mockAuthor.name });
    console.log('Book  :', { title: mockBook.title, authorId: mockBook.authorId.toString() });

    console.log('\n=======================================');
    console.log('🔄 执行 Population 之前 (Book 查询结果):');
    console.log(mockBook.toObject());
    console.log('👆 注意: authorId 只是一个字符串/ObjectId，没有作者的具体信息。');

    // Mongoose 会在后台执行一个额外的 Query，去 Author 表里找对应 ID 的数据，然后把数据填拼到这个字段上
    const populatedBook = mockBook.toObject();
    populatedBook.authorId = mockAuthor.toObject(); // 手动模拟 Population 行为的结果

    console.log('\n=======================================');
    console.log('✨ 执行 .populate("authorId") 之后 (Book 查询结果):');
    console.log(populatedBook);
    console.log('👆 注意: authorId 字段现在变成了一个完整的对象，包含了作者的 name 和 bio！');
    
    console.log('\n✅ 演示结束，进程即将退出。\n');
    process.exit(0);
}

runDemo();
