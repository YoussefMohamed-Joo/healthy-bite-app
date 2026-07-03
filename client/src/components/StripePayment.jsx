import { useState, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2 } from 'lucide-react'

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePk ? loadStripe(stripePk) : null
const API = import.meta.env.VITE_API_URL || ''

function StripeCheckoutForm({ amount, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/checkout' },
      redirect: 'if_required',
    })
    if (error) {
      onError(error.message)
    } else {
      onSuccess()
    }
    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جاري تأكيد الدفع...</span>
        ) : (
          `ادفع ${amount.toFixed(2)} ج.م`
        )}
      </button>
    </form>
  )
}

export default function StripePayment({ amount, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState(null)

  useEffect(() => {
    if (!stripePk) return
    fetch(`${API}/orders/create-payment-intent`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then(r => r.json())
      .then(d => { if (d.clientSecret) setClientSecret(d.clientSecret) })
      .catch(() => {})
  }, [amount])

  if (!stripePk) return null

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#2E7D32' } } }}>
      <StripeCheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
