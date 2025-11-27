// packages/rag/test-setup.ts
import 'dotenv/config';
import { runRagPipeline } from './src/index.js';

async function testSetup() {
  console.log('🧪 Testing RAG Pipeline Setup...\n');

  // Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('❌ OPENAI_API_KEY not found in environment');
  }
  console.log('✅ OPENAI_API_KEY found');

  if (!process.env.PINECONE_API_KEY) {
    throw new Error('❌ PINECONE_API_KEY not found in environment');
  }
  console.log('✅ PINECONE_API_KEY found\n');

  // Test the pipeline
  try {
    console.log('📦 Running RAG pipeline (first sync)...');
    
    const result = await runRagPipeline({
      rootDir: process.cwd(),
      query: 'What is the main entry point of this project?',
      pinecone: {
        index: 'dxgen-docs',
        apiKey: process.env.PINECONE_API_KEY,
      },
      context: {
        userId: 'test-user',
        projectId: 'test-project',
      },
      sync: {
        enabled: true,
        fullReindex: true,
      },
      retrieverOptions: {
        topK: 5,
      },
    });

    console.log('\n✅ Pipeline executed successfully!');
    console.log(`📊 Indexed ${result.syncSummary?.upsertedCount || 0} chunks`);
    console.log(`📄 Retrieved ${result.documents.length} relevant documents\n`);

    if (result.documents.length > 0) {
      console.log('📝 Sample document:');
      console.log(`   File: ${result.documents[0].metadata.relativePath}`);
      console.log(`   Score: ${result.documents[0].metadata.score}`);
      console.log(`   Preview: ${result.documents[0].pageContent.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

testSetup();