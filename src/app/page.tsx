import Link from 'next/link'
import Image from 'next/image'
import NavigationWrapper from '@/components/ui/NavigationWrapper'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <NavigationWrapper />
      
      {/* Hero Section - Agency Side Style */}
      <div className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="hero-parallax-container h-[120%] w-full absolute -top-[10%]">
            <Image
              src="/images/homepage/hero_mast.jpg"
              alt="Rock star kids background"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Horizontal gradient overlay - dark left, transparent right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"></div>
          
          {/* Grunge torn edge effect - cuts into the image itself */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-20 z-10"
            style={{
              background: `
                radial-gradient(ellipse 120px 40px at 8% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 90px 30px at 18% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 110px 35px at 28% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 85px 25px at 38% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 130px 45px at 48% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 95px 32px at 58% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 105px 38px at 68% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 88px 28px at 78% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 115px 42px at 88% 100%, black 45%, transparent 46%),
                radial-gradient(ellipse 100px 35px at 98% 100%, black 45%, transparent 46%)
              `
            }}
          ></div>
          
          {/* Additional torn paper texture */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-12 z-10"
            style={{
              background: `
                radial-gradient(ellipse 60px 20px at 12% 100%, black 40%, transparent 41%),
                radial-gradient(ellipse 45px 15px at 25% 100%, black 40%, transparent 41%),
                radial-gradient(ellipse 70px 25px at 40% 100%, black 40%, transparent 41%),
                radial-gradient(ellipse 55px 18px at 55% 100%, black 40%, transparent 41%),
                radial-gradient(ellipse 65px 22px at 70% 100%, black 40%, transparent 41%),
                radial-gradient(ellipse 50px 16px at 85% 100%, black 40%, transparent 41%)
              `
            }}
          ></div>
        </div>
        
        {/* Main Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto pt-20">
          <div className="relative">
            {/* Left Side - Typography - Now with more space */}
            <div className="space-y-8 relative z-20 lg:w-[65%]">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight">
                <span className="block text-white">THE</span>
                <span className="block bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                  ALTERNATIVE
                </span>
                <span className="block text-white">TO BORING</span>
                <span className="block bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                  PHOTO STUDIOS
                </span>
              </h1>
              
              {/* Scrolling text banner */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 h-12 -skew-y-1"></div>
                <div className="relative flex items-center h-12 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap">
                    <span className="text-black font-bold text-lg mx-4">ROCK STAR KIDS //</span>
                    <span className="text-black font-bold text-lg mx-4">PUNK PHOTOGRAPHY //</span>
                    <span className="text-black font-bold text-lg mx-4">ELECTRIC SESSIONS //</span>
                    <span className="text-black font-bold text-lg mx-4">ROCK STAR KIDS //</span>
                    <span className="text-black font-bold text-lg mx-4">PUNK PHOTOGRAPHY //</span>
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="pt-8">
                <Link
                  href="/packages"
                  className="inline-block px-8 py-4 text-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full hover:scale-105 transition-transform duration-300"
                >
                  BOOK A SESSION
                </Link>
              </div>
            </div>
            
            {/* Right Side - Decorative elements only */}
            <div className="absolute top-0 right-0 lg:w-[45%] h-full flex items-center justify-center z-10">
              {/* Starburst decoration */}
              <div className="absolute -top-20 -right-20 w-80 h-80 opacity-20">
                <div className="relative w-full h-full">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-32 bg-gradient-to-t from-transparent via-cyan-400 to-transparent"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 64px',
                        transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                      }}
                    />
                  ))}
                  <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Grunge Styled Elodi Photo */}
            <div className="relative">
              {/* Starburst behind photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-96 h-96">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-40 bg-gradient-to-t from-transparent via-pink-500 to-transparent"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 80px',
                        transform: `translate(-50%, -50%) rotate(${i * 11.25}deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Grunge Photo Container */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="relative w-[500px] h-[500px]">
                  {/* Multiple layered frames for grunge effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-cyan-400/30 rounded-3xl transform rotate-2"></div>
                  <div className="absolute inset-3 bg-gradient-to-tl from-cyan-400/20 to-pink-500/20 rounded-2xl transform -rotate-1"></div>
                  
                  {/* Main photo container with distressed edges */}
                  <div className="relative w-full h-full overflow-hidden rounded-2xl transform rotate-1">
                    {/* Photo */}
                    <Image
                      src="/images/homepage/elodi.JPG"
                      alt="Elodi rock star transformation"
                      fill
                      className="object-cover"
                    />
                    
                    {/* Halftone effect overlay */}
                    <div 
                      className="absolute inset-0 opacity-60 mix-blend-multiply"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 0% 0%, transparent 1px, rgba(0,0,0,0.8) 1px, rgba(0,0,0,0.8) 2px, transparent 2px),
                          radial-gradient(circle at 50% 50%, transparent 1px, rgba(0,0,0,0.6) 1px, rgba(0,0,0,0.6) 2px, transparent 2px),
                          radial-gradient(circle at 100% 100%, transparent 1px, rgba(0,0,0,0.7) 1px, rgba(0,0,0,0.7) 2px, transparent 2px)
                        `,
                        backgroundSize: '8px 8px, 12px 12px, 6px 6px',
                        backgroundPosition: '0 0, 4px 4px, 2px 2px'
                      }}
                    ></div>
                    
                    {/* Color halftone effect */}
                    <div 
                      className="absolute inset-0 opacity-40 mix-blend-overlay"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 25% 25%, transparent 1px, rgba(232,86,39,0.3) 1px, rgba(232,86,39,0.3) 2px, transparent 2px),
                          radial-gradient(circle at 75% 75%, transparent 1px, rgba(7,191,221,0.3) 1px, rgba(7,191,221,0.3) 2px, transparent 2px),
                          radial-gradient(circle at 50% 25%, transparent 1px, rgba(246,103,108,0.2) 1px, rgba(246,103,108,0.2) 2px, transparent 2px)
                        `,
                        backgroundSize: '10px 10px, 14px 14px, 8px 8px',
                        backgroundPosition: '0 0, 7px 7px, 4px 4px'
                      }}
                    ></div>
                    
                    {/* Grunge texture overlay */}
                    <div 
                      className="absolute inset-0 opacity-25 mix-blend-overlay"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 20% 80%, transparent 20%, rgba(0,0,0,0.4) 21%, rgba(0,0,0,0.4) 25%, transparent 26%),
                          radial-gradient(circle at 80% 20%, transparent 20%, rgba(255,255,255,0.2) 21%, rgba(255,255,255,0.2) 25%, transparent 26%),
                          radial-gradient(circle at 40% 40%, transparent 20%, rgba(0,0,0,0.3) 21%, rgba(0,0,0,0.3) 25%, transparent 26%)
                        `
                      }}
                    ></div>
                    
                    {/* Gradient color overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-cyan-400/20 mix-blend-color"></div>
                    
                    {/* Distressed border effect */}
                    <div className="absolute inset-0 border-4 border-white/30 rounded-2xl"></div>
                    <div className="absolute inset-2 border-2 border-black/40 rounded-xl"></div>
                  </div>
                  
                  {/* Decorative grunge elements */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full opacity-70 blur-sm"></div>
                  <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-r from-cyan-400 to-pink-500 rotate-45 opacity-50"></div>
                  
                  {/* Vintage photo corner tears */}
                  <div className="absolute top-0 right-0 w-10 h-10 bg-black transform rotate-45 translate-x-5 -translate-y-5 opacity-40"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 bg-black transform rotate-45 -translate-x-4 translate-y-4 opacity-30"></div>
                </div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="space-y-12">
              <div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-8">THE GIST</h2>
                <p className="text-gray-300 text-lg leading-relaxed font-oswald">
                  Electric Muse is the alternative to boring photo studios and cookie-cutter portraits. 
                  Think of it as therapy for parents tired of stiff, artificial photos where kids are 
                  told to sit still and smile. We're an edgy collective of photographers, stylists, 
                  and rock enthusiasts creating authentic moments and transforming kids into legends.
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
                    WHAT WE DO
                  </h3>
                  <p className="text-gray-300 font-oswald">
                    Transform your kids into rock stars with professional styling, instruments, and attitude coaching.
                  </p>
                </div>
                
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
                    HOW WE DO IT
                  </h3>
                  <p className="text-gray-300 font-oswald">
                    Through authentic styling, real instruments, smoke machines, and letting kids be their wildest selves.
                  </p>
                </div>
                
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
                    WHERE WE DO IT
                  </h3>
                  <p className="text-gray-300 font-oswald">
                    Professional studio with authentic rock stage setup and lighting.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
                    WHEN WE DO IT
                  </h3>
                  <p className="text-gray-300 font-oswald">
                    Year-round sessions with seasonal rock themes and special events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Session Section */}
      <div className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black mb-16">
            <span className="block text-white">NEXT SESSION</span>
            <span className="block bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              EXPERIENCES THAT EXCEED
            </span>
            <span className="block bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              EXPECTATIONS
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Session Info */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-4">
                  ROCK STAR EXPERIENCE '25
                </h3>
                <p className="text-gray-300 text-lg mb-2 font-oswald">Available year-round @ studio sessions</p>
                <p className="text-gray-300 text-lg font-oswald">
                  <span className="underline">Professional Photography Studio</span> - Your Location
                </p>
              </div>
              
              <Link
                href="/packages"
                className="inline-block px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full hover:scale-105 transition-transform duration-300"
              >
                VIEW PACKAGES
              </Link>
              
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Right - TV/Monitor Graphic */}
            <div className="relative">
              {/* Decorative badge */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center transform -rotate-12 z-20">
                <div className="text-center">
                  <div className="text-black font-black text-sm">IT WAS</div>
                  <div className="text-black font-black text-sm">AWESOME</div>
                </div>
              </div>
              
              {/* TV Monitor */}
              <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-8 rounded-3xl transform rotate-2">
                <div className="bg-black rounded-2xl p-4 aspect-video relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"
                    alt="Rock star kid session"
                    fill
                    className="object-cover rounded-lg"
                  />
                  
                  {/* TV Screen effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10"></div>
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)`
                  }}></div>
                </div>
                
                {/* TV Controls */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Showcase */}
      <div className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-center mb-16">
            <span className="block text-white">THIS IS HOW WE'VE</span>
            <span className="block bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              BEEN ROCKING
            </span>
          </h2>
          
          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { src: '/images/homepage/elodi.JPG', alt: 'Elodi rock star' },
              { src: '/images/homepage/ez.JPG', alt: 'EZ rock session' },
              { src: 'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?w=400&h=400&fit=crop', alt: 'Rock kid 1' },
              { src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', alt: 'Rock kid 2' },
              { src: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=400&fit=crop', alt: 'Rock styling' },
              { src: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop', alt: 'Studio session' },
              { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', alt: 'Rock instruments' },
              { src: 'https://images.unsplash.com/photo-1594736797933-d0a9ba3fe78a?w=400&h=400&fit=crop', alt: 'Kids rock band' }
            ].map((image, idx) => (
              <div key={idx} className="relative aspect-square group">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-block px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full hover:scale-105 transition-transform duration-300"
            >
              VIEW GALLERY
            </Link>
          </div>
        </div>
      </div>

      {/* Get Involved Section */}
      <div className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Starburst decorations */}
          <div className="absolute left-0 top-1/2 w-64 h-64 opacity-20 -translate-y-1/2">
            <div className="relative w-full h-full">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-24 bg-gradient-to-t from-transparent via-cyan-400 to-transparent"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 48px',
                    transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                  }}
                />
              ))}
              <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
          
          <div className="absolute right-0 top-1/2 w-64 h-64 opacity-20 -translate-y-1/2">
            <div className="relative w-full h-full">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-24 bg-gradient-to-t from-transparent via-pink-500 to-transparent"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 48px',
                    transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                  }}
                />
              ))}
              <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-pink-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            WANT TO GET INVOLVED?
          </h2>
          <p className="text-gray-300 text-xl mb-12 font-oswald">
            Ready to transform your little one into a rock legend?
          </p>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="First Name *"
                className="w-full px-6 py-4 bg-transparent border-2 border-pink-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <input
                type="text"
                placeholder="Last Name *"
                className="w-full px-6 py-4 bg-transparent border-2 border-pink-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Child's Name *"
                className="w-full px-6 py-4 bg-transparent border-2 border-pink-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <input
                type="text"
                placeholder="Child's Age"
                className="w-full px-6 py-4 bg-transparent border-2 border-pink-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            
            <input
              type="email"
              placeholder="Email Address *"
              className="w-full px-6 py-4 bg-transparent border-2 border-pink-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            
            <textarea
              placeholder="Tell Us About Your Rock Star..."
              rows={4}
              className="w-full px-6 py-4 bg-transparent border-2 border-pink-500 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
            
            <Link
              href="/packages"
              className="inline-block px-12 py-4 text-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full hover:scale-105 transition-transform duration-300"
            >
              BOOK NOW
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-black font-black text-xl">EM</span>
              </div>
              <span className="text-white font-bold text-xl">ELECTRIC MUSE</span>
            </div>
            
            <div className="flex space-x-8 text-gray-400">
              <Link href="/packages" className="hover:text-white transition-colors">PACKAGES</Link>
              <Link href="/gallery" className="hover:text-white transition-colors">GALLERY</Link>
              <Link href="/booking" className="hover:text-white transition-colors">BOOKING</Link>
              <Link href="/contact" className="hover:text-white transition-colors">CONTACT</Link>
            </div>
          </div>
          
          <div className="text-center text-gray-500">
            <p>© 2025 Electric Muse Photography. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
    </div>
  )
}