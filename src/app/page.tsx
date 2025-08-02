import Link from 'next/link'
import Image from 'next/image'
import NavigationWrapper from '@/components/ui/NavigationWrapper'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <NavigationWrapper />
      
      {/* Hero Section with Background Image */}
      <div className="relative isolate min-h-[90vh] flex items-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/homepage/hero_mast.jpg"
            alt="Rock star kid"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
                Electric Muse
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-100">
                Transform your little ones into rock stars! Professional photography sessions 
                with punk rock styling for the coolest kids in town.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/packages"
                  className="rounded-full px-6 py-3 text-lg font-semibold text-white shadow-sm transition-all hover:scale-105"
                  style={{backgroundColor: 'rgb(185, 32, 86)', borderColor: 'rgb(185, 32, 86)'}}
                >
                  Book a Session
                </Link>
                <Link 
                  href="/login" 
                  className="text-lg font-semibold leading-6 text-white hover:text-gray-300"
                >
                  Sign in <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Preview Section */}
      <div className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Rock Star Transformations
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              From everyday kids to legendary rock stars - see the magic happen!
            </p>
          </div>
          
          {/* Gallery Grid */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {[
              { src: '/images/homepage/elodi.JPG', alt: 'Elodi rock star photo' },
              { src: '/images/homepage/ez.JPG', alt: 'EZ rock star photo' },
              { src: 'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?w=800&h=800&fit=crop', alt: 'Boy with sunglasses' },
              { src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop', alt: 'Girl with violin' }
            ].map((image, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-2xl bg-black group hover:scale-105 transition-transform duration-300">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="font-semibold text-lg hover:text-pink-300"
              style={{color: 'rgb(185, 32, 86)'}}
            >
              Shop Our Gallery <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section with Images */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7" style={{color: 'rgb(185, 32, 86)'}}>Rock Star Experience</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need for an unforgettable photo session
          </p>
        </div>
        
        {/* Feature Cards with Images */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Professional Styling */}
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <div className="aspect-[16/9] relative">
                <Image
                  src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&h=400&fit=crop"
                  alt="Professional styling"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">✨</span> Professional Styling
                </h3>
                <p className="mt-3 text-gray-300">
                  Complete rock star makeover with professional hair, makeup, and outfit styling. 
                  We have everything from leather jackets to band tees!
                </p>
              </div>
            </div>

            {/* Studio Quality */}
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <div className="aspect-[16/9] relative">
                <Image
                  src="https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=400&fit=crop"
                  alt="Studio photography"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">📸</span> Studio Quality Photos
                </h3>
                <p className="mt-3 text-gray-300">
                  Professional photography with studio lighting, smoke machines, and authentic 
                  rock-themed backdrops. Every shot is a masterpiece!
                </p>
              </div>
            </div>

            {/* Print Products */}
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <div className="aspect-[16/9] relative">
                <Image
                  src="https://i.pinimg.com/474x/52/4a/66/524a667f1948e91db490694380b1ae42.jpg"
                  alt="Print products"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">🎁</span> Custom Products
                </h3>
                <p className="mt-3 text-gray-300">
                  Turn your rock star photos into amazing products - canvas prints, photo books, 
                  t-shirts, and more. Perfect for gifts!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Parents Love Us
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              "My daughter felt like a real rock star! The team was amazing with kids and the 
              photos are absolutely stunning. We'll treasure these forever!"
            </p>
            <p className="mt-4 font-semibold" style={{color: 'rgb(185, 32, 86)'}}>- Sarah M.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16" style={{backgroundColor: 'rgb(185, 32, 86)'}}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to Rock?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-pink-200">
              Book your session today and give your little rock star an experience they'll never forget!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/packages"
                className="rounded-full bg-white px-6 py-3 text-lg font-semibold text-primary shadow-sm hover:bg-gray-100 transition-all hover:scale-105"
              >
                View Packages
              </Link>
              <Link
                href="/register"
                className="text-lg font-semibold leading-6 text-white hover:text-pink-200"
              >
                Create Account <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-8 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              © 2024 Electric Muse Photography. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}