import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimes = {}
      posts.forEach(p => {
        const diff = p.expiresAt - Date.now()
        if (diff <= 0) newTimes[p.id] = 'Expired'
        else {
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          const s = Math.floor((diff % 60000) / 1000)
          newTimes[p.id] = `${h}h ${m}m ${s}s`
        }
      })
      setTimeLeft(newTimes)
    }, 1000)
    return () => clearInterval(timer)
  }, [posts])

  const addPost = () => {
    if (!text.trim()) return
    const newPost = {
      id: Date.now(),
      text,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    }
    setPosts([newPost, ...posts])
    setText('')
  }

  const takePhoto = async () => {
    alert('Camera feature will use Capacitor Camera - ready for APK!')
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ textAlign: 'center', color: '#7c3aed' }}>⭕ CIRCLE</h1>
      <p style={{ textAlign: 'center', opacity: 0.7 }}>Social app with countdown posts</p>
      
      <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', margin: '20px 0' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's in your circle?"
          style={{ width: '100%', background: '#2a2a2a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', minHeight: '80px' }}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button onClick={addPost} style={{ flex: 1, background: '#7c3aed', color: 'white', border: 'none', padding: '12px', borderRadius: '8px' }}>Post to Circle</button>
          <button onClick={takePhoto} style={{ background: '#333', color: 'white', border: 'none', padding: '12px', borderRadius: '8px' }}>📷</button>
        </div>
      </div>

      <div>
        {posts.map(post => (
          <div key={post.id} style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
            <p>{post.text}</p>
            <small style={{ color: '#7c3aed' }}>⏳ {timeLeft[post.id] || '24h 0m 0s'} left</small>
          </div>
        ))}
        {posts.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No posts yet. Start your circle!</p>}
      </div>
    </div>
  )
}

export default App
