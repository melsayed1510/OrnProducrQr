import React from 'react'
import { supabase } from '../services/supabase'

export default function useAuth(){
  const [session, setSession] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{
    let mounted = true

    supabase.auth.getSession().then(({ data })=>{
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession)=>{
      setSession(newSession)
    })

    return ()=>{
      mounted = false
      sub.subscription.unsubscribe()
    }
  },[])

  return { session, loading }
}
