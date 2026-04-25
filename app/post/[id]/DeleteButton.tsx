'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DeleteButton({ postId, userId }: { postId: number; userId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this artwork?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)

    if (error) {
      alert('Delete error: ' + error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        background: '#f44336',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.8rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem'
      }}
    >
      Delete
    </button>
  )
}