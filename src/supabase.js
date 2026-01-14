import { createClient } from '@supabase/supabase-js'

// Substitua abaixo pelos dados que estão na tela do Supabase
const supabaseUrl = 'https://vsawkcusikfhinqpeqop.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXdrY3VzaWtmaGlucXBlcW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODk1NzEsImV4cCI6MjA4MjQ2NTU3MX0.we3YNWSvjDwEz9SMaZQeUZSS7LrgyEj5_4u9xMbu9Rk'

export const supabase = createClient(supabaseUrl, supabaseKey)