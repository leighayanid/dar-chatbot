#!/usr/bin/env node

/**
 * Test the complete chat flow to verify persistence
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runQuery(query) {
  try {
    const { stdout } = await execAsync(
      `docker exec supabase_db_dar-app psql -U postgres -t -A -c "${query}"`
    );
    return stdout.trim();
  } catch (error) {
    console.error('Query failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('🧪 Testing Complete Chat Flow\n');

  // Step 1: Get the actual conversation ID from database
  const convId = await runQuery(
    'SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1;'
  );

  if (!convId) {
    console.log('❌ No conversations found in database');
    console.log('   Action needed: Clear browser localStorage and reload page\n');
    return;
  }

  console.log(`✅ Found conversation in database: ${convId}\n`);

  // Step 2: Verify we can insert a test message
  console.log('Testing message insertion...');

  // Get user_id
  const userId = await runQuery(
    'SELECT id FROM auth.users LIMIT 1;'
  );

  if (!userId) {
    console.log('❌ No users found in database\n');
    return;
  }

  console.log(`✅ Found user: ${userId}\n`);

  // Try to insert a test message
  const testContent = 'Test message from script';
  const insertQuery = `
    INSERT INTO messages (conversation_id, role, content, user_id)
    VALUES ('${convId}', 'user', '${testContent}', '${userId}')
    RETURNING id;
  `;

  const messageId = await runQuery(insertQuery);

  if (messageId) {
    console.log(`✅ Successfully inserted test message: ${messageId}\n`);

    // Verify it was saved
    const savedMessage = await runQuery(
      `SELECT role, content FROM messages WHERE id = '${messageId}';`
    );
    console.log(`✅ Message verified in database: ${savedMessage}\n`);

    // Clean up test message
    await runQuery(`DELETE FROM messages WHERE id = '${messageId}';`);
    console.log('✅ Cleaned up test message\n');
  } else {
    console.log('❌ Failed to insert test message\n');
  }

  // Step 3: Check current message count
  const msgCount = await runQuery('SELECT COUNT(*) FROM messages;');
  console.log(`📊 Current message count: ${msgCount}\n`);

  // Step 4: Instructions
  console.log('📋 Next Steps:');
  console.log('   1. Update ANTHROPIC_API_KEY in .env.local with a valid key');
  console.log('   2. Clear browser localStorage (or update conversation ID to match DB)');
  console.log(`   3. Set localStorage key "dar-conversation-id" to: ${convId}`);
  console.log('   4. Reload the page and try sending a message');
  console.log('   5. Check console logs for success/error messages\n');

  console.log('💡 Quick fix - Run this in browser console:');
  console.log(`   localStorage.setItem('dar-conversation-id', '${convId}');`);
  console.log(`   localStorage.setItem('dar-chat-messages', '[]');`);
  console.log(`   location.reload();\n`);
}

main().catch(console.error);
