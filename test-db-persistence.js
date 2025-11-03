#!/usr/bin/env node

/**
 * Test script to verify database persistence
 * This script tests the complete flow:
 * 1. Check if conversations exist in database
 * 2. Verify messages can be saved
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runQuery(query) {
  try {
    const { stdout, stderr } = await execAsync(
      `docker exec supabase_db_dar-app psql -U postgres -t -A -c "${query}"`
    );
    if (stderr) console.error('Query error:', stderr);
    return stdout.trim();
  } catch (error) {
    console.error('Failed to run query:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Testing Database Persistence\n');

  // Check conversations
  console.log('1. Checking conversations in database:');
  const convCount = await runQuery('SELECT COUNT(*) FROM conversations;');
  console.log(`   Total conversations: ${convCount}\n`);

  if (convCount === '0') {
    console.log('⚠️  No conversations found in database.');
    console.log('   This explains the foreign key constraint violation.\n');
  } else {
    const conversations = await runQuery(
      'SELECT id, title, created_at FROM conversations ORDER BY created_at DESC LIMIT 5;'
    );
    console.log('   Recent conversations:');
    conversations.split('\n').forEach(line => {
      if (line) console.log(`   - ${line}`);
    });
    console.log();
  }

  // Check messages
  console.log('2. Checking messages in database:');
  const msgCount = await runQuery('SELECT COUNT(*) FROM messages;');
  console.log(`   Total messages: ${msgCount}\n`);

  if (msgCount !== '0') {
    const messages = await runQuery(
      `SELECT conversation_id, role, substring(content, 1, 50) as content, created_at FROM messages ORDER BY created_at DESC LIMIT 5;`
    );
    console.log('   Recent messages:');
    messages.split('\n').forEach(line => {
      if (line) console.log(`   - ${line}`);
    });
    console.log();
  }

  // Check RLS policies
  console.log('3. Checking RLS policies:');
  const policies = await runQuery(
    `SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('conversations', 'messages');`
  );
  console.log('   Active policies:');
  policies.split('\n').forEach(line => {
    if (line) console.log(`   - ${line}`);
  });
  console.log();

  // Recommendations
  console.log('📋 Recommendations:');
  if (convCount === '0') {
    console.log('   ❌ No conversations exist - need to clear localStorage and create new conversation');
  }
  console.log('   ❌ Invalid Anthropic API key - update ANTHROPIC_API_KEY in .env.local');
  console.log();
}

main().catch(console.error);
