'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // In your page.js, update the handleGenerate function:
const handleGenerate = async () => {
  if (!prompt.trim()) {
    setError('Please enter a prompt.')
    return
  }

  setLoading(true)
  setImage(null)
  setError('')

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    const data = await res.json()
    
    // Add debugging
    console.log('API Response:', data)
    console.log('Image URL:', data.image)

    if (!res.ok) {
      const message = typeof data === 'string' ? data : data?.error || 'Failed to generate image from server.';
      throw new Error(message);
    }

    setImage(data.image)
  } catch (err) {
    setError(err?.message || 'Unexpected error occurred.')
    console.error("Frontend image generation error:", err)
  } finally {
    setLoading(false)
  }
}
  const handleDownloadImage = () => {
    if (image) {
      const link = document.createElement('a')
      link.href = image
      link.download = 'generated_image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-teal-100 font-inter">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-xl w-full text-center transform transition-transform duration-300 hover:scale-[1.01] border border-gray-200">
        <h1 className="text-4xl font-extrabold mb-4 flex items-center justify-center gap-3 text-gray-800">
          <span className="text-teal-600">✨</span> AI Canvas <span className="text-teal-600">🎨</span>
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Unleash your creativity. Describe what you envision, and let AI bring it to life.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A serene landscape with cherry blossoms and a distant mountain, oil painting style"
            className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-gray-700 focus:outline-none focus:ring-3 focus:ring-teal-400 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            className="bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-teal-400 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center mb-4 text-teal-600 font-medium">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating your masterpiece...
          </div>
        )}

        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
            Error: {error}
          </p>
        )}

        {image && (
          <div className="mt-8 flex flex-col items-center">
            <Image
              src={image}
              alt="Generated"
              width={500}
              height={500}
              className="max-w-full h-auto rounded-xl shadow-xl border border-gray-200 object-contain max-h-[400px] mb-6"
              priority
            />
            <button
              onClick={handleDownloadImage}
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-blue-400"
            >
              Download Image
            </button>
          </div>
        )}

        <div className="mt-10">
          <Link href="/support" passHref>
            <button className="bg-teal-50 text-teal-700 font-semibold px-6 py-3 rounded-xl border border-teal-300 shadow-md hover:bg-teal-100 hover:border-teal-400 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 flex items-center justify-center gap-2 text-lg">
              Support the Developer 💖
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
