'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LikeButton({ postId, initialLikes }: { postId: number; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)
  const [userLiked, setUserLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle()
      setUserLiked(!!data)
    }
    check()
  }, [postId])

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('Please sign in')
      setLoading(false)
      return
    }
    if (userLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
      if (!error) {
        setLikes(prev => prev - 1)
        setUserLiked(false)
        // принудительно обновим likes_count (триггер сделает это сам, но на всякий случай)
        await supabase.rpc('decrement_post_likes', { post_id: postId })
      } else console.error(error)
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id })
      if (!error) {
        setLikes(prev => prev + 1)
        setUserLiked(true)
        await supabase.rpc('increment_post_likes', { post_id: postId })
      } else console.error(error)
    }
    setLoading(false)
  }

  return (
    <button onClick={handleLike} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
      {userLiked ? '❤️' : '🤍'} {likes}
    </button>
  )
}