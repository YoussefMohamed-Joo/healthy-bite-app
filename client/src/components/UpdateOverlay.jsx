import { useState, useEffect } from 'react'
import { onUpdateFound } from '@/utils/updateEvent'
import UpdatePrompt from './UpdatePrompt'

export default function UpdateOverlay() {
  const [update, setUpdate] = useState(null)
  const [force, setForce] = useState(false)

  useEffect(() => onUpdateFound((data, f) => {
    setUpdate(data)
    setForce(f)
  }), [])

  if (!update) return null

  return (
    <UpdatePrompt
      data={update}
      force={force}
      onClose={() => { setUpdate(null); setForce(false) }}
    />
  )
}
