// import mongoose from 'mongoose';
// import { config } from 'dotenv';
// config();

// async function fixInvoiceIndex() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('Connected to MongoDB');
    
//     const db = mongoose.connection.db;
//     const collection = db.collection('stockins');
    
//     // Get existing indexes
//     const indexes = await collection.indexes();
//     console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));
    
//     // Check if invoiceNo index exists and drop it
//     const invoiceIndex = indexes.find(idx => idx.key && idx.key.invoiceNo);
//     if (invoiceIndex) {
//       console.log('Dropping invoiceNo index:', invoiceIndex.name);
//       await collection.dropIndex(invoiceIndex.name);
//       console.log('Index dropped successfully');
//     }
    
//     // Update all empty string invoiceNo to null
//     const updateResult = await collection.updateMany(
//       { invoiceNo: "" }, 
//       { $set: { invoiceNo: null } }
//     );
//     console.log(`Updated ${updateResult.modifiedCount} documents with empty invoiceNo to null`);
    
//     // Create new sparse unique index for invoiceNo (allows multiple null values)
//     await collection.createIndex(
//       { invoiceNo: 1 }, 
//       { 
//         sparse: true, 
//         unique: true,
//         name: 'invoiceNo_sparse_unique'
//       }
//     );
//     console.log('Created new sparse unique index for invoiceNo');
    
//     await mongoose.disconnect();
//     console.log('✅ Fix completed successfully!');
//   } catch (error) {
//     console.error('❌ Error:', error);
//     await mongoose.disconnect();
//     process.exit(1);
//   }
// }

// fixInvoiceIndex();