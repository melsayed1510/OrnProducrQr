import { supabase } from './supabase'

export async function fetchProducts(){
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createProduct(payload){
  const { data, error } = await supabase.from('products').insert(payload).select('*').single()
  if (error) throw error
  return data
}

export async function updateProduct(id, payload){
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function deleteProduct(id){
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function isSlugTaken(slug, excludeId=null){
  let q = supabase.from('products').select('id').eq('slug', slug).limit(1)
  if (excludeId) q = q.neq('id', excludeId)
  const { data, error } = await q
  if (error) throw error
  return (data && data.length > 0)
}
