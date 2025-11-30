/**
 * Script to promote an existing user to developer role
 * 
 * Usage:
 * 1. Create an account through the signup page first
 * 2. Run: npx ts-node scripts/create-developer.ts your@email.com
 * 
 * Or run the SQL directly in Supabase SQL Editor:
 * UPDATE user_roles 
 * SET role = 'developer' 
 * WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please ensure .env.local has:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function makeDeveloper(email: string) {
  console.log(`\n🔄 Promoting ${email} to developer role...\n`)

  // 1. Find user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.error('❌ Error fetching users:', userError.message)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)
  
  if (!user) {
    console.error(`❌ User not found: ${email}`)
    console.error('\nPlease ensure:')
    console.error('1. The user has signed up through the website')
    console.error('2. The email address is correct')
    process.exit(1)
  }

  console.log(`✓ Found user: ${user.email} (ID: ${user.id})`)

  // 2. Update user role to 'developer'
  const { error: updateError } = await supabase
    .from('user_roles')
    .update({ role: 'developer' })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('❌ Error updating role:', updateError.message)
    process.exit(1)
  }

  // 3. Verify the update
  const { data: roleData, error: verifyError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (verifyError) {
    console.error('❌ Error verifying role:', verifyError.message)
    process.exit(1)
  }

  console.log(`✓ Updated role to: ${roleData.role}`)
  console.log('\n✅ Success! User is now a developer.\n')
  console.log('The user can now:')
  console.log('  • Access the /admin panel')
  console.log('  • Manage products')
  console.log('  • See the Admin link in the header\n')
}

// Get email from command line args
const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: npx ts-node scripts/create-developer.ts <email>')
  console.error('\nExample:')
  console.error('  npx ts-node scripts/create-developer.ts john@example.com')
  console.error('\nOr run this SQL in Supabase SQL Editor:')
  console.error("  UPDATE user_roles SET role = 'developer' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your@email.com');")
  process.exit(1)
}

// Run the script
makeDeveloper(email).catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
