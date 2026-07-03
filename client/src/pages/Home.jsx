import Hero from '@/components/Hero'
import PopularMeals from '@/components/PopularMeals'
import SubscriptionPlans from '@/components/SubscriptionPlans'
import Testimonials from '@/components/Testimonials'
import MobileDownload from '@/components/MobileDownload'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Hero />
      <PopularMeals />
      <SubscriptionPlans />
      <Testimonials />
      <MobileDownload />
      <Footer />
    </>
  )
}
