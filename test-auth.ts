import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const email = `test-${Date.now()}@example.com`
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test Setup User',
        role: 'foreman'
      }
    }
  })

  if (error) {
    console.error('Signup Error:', error.message)
    process.exit(1)
  }

  console.log('Signup success:', data.user?.id)

  const { data: userRec, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', data.user?.id)
    .single()

  if (fetchError) {
    console.error('Fetch public.users Error:', fetchError.message)
    process.exit(1)
  }

  console.log('User found in database:', userRec)
}

test()
