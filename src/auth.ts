import { supabase } from './lib/supabase'

/**
 * Call at the top of every protected page.
 * Redirects to login.html if there is no active session.
 */
export async function requireAuth(): Promise<void> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    window.location.href = '/pages/login.html'
  }
}

/**
 * Returns the current user, or null if not logged in.
 */
export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}
