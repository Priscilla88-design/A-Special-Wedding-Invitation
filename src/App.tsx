import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, MapPin, Music, Camera, Gift, Mail, ChevronDown, Menu, X, Instagram, Facebook, Lock, Car, Plane, Info, Phone, Star } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query } from 'firebase/firestore';
import { db, auth, loginWithGoogle } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const WelcomeEnvelope = ({ onOpen }: { onOpen: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -100, scale: 1.1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#e0ddd5] flex items-center justify-center p-6"
    >
      <div className="relative w-full max-w-2xl aspect-[3/2] bg-parchment shadow-2xl rounded-sm border border-sand/30 flex flex-col items-center justify-center text-dark text-center overflow-hidden">
        {/* Envelope Flap Look */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-parchment border-b border-sand/20" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        
        <div className="relative z-10 pt-12">
          <p className="text-luxury mb-4">You are invited to the wedding of</p>
          <h1 className="text-5xl md:text-7xl font-serif italic text-merlot mb-12">Sophie and John</h1>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={onOpen}
              className="wax-seal group"
              id="envelope_seal"
            >
              <Heart className="text-ivory group-hover:scale-110 transition-transform" />
            </button>
            <p className="text-luxury text-[10px] text-merlot/50">Click to Open</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Our Story', href: '#story' },
    { name: 'Details', href: '#details' },
    { name: 'Travel', href: '#travel' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'RSVP', href: '#rsvp', primary: true },
  ];

  return (
    <nav id="main_navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-nav py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className={`font-serif text-2xl italic tracking-tighter transition-colors duration-300 ${isScrolled ? 'text-ivory' : 'text-ivory'}`}>
          Sophie <span className="text-gold">&</span> John
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 hover:text-gold ${
                'text-ivory'
              } ${link.primary ? 'bg-gold text-white px-6 py-2 rounded-full hover:bg-gold/80 transition-transform active:scale-95' : ''}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className="text-ivory" />
          ) : (
            <Menu className="text-ivory" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-merlot border-t border-white/10 shadow-xl md:hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm uppercase tracking-widest font-semibold text-ivory text-center ${link.primary ? 'bg-gold text-white py-4 rounded-lg' : ''}`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const InvitationSuite = () => {
  return (
    <section className="relative min-h-screen bg-merlot flex items-center justify-center py-32 px-6 overflow-hidden">
      {/* Decorative Floral Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 opacity-30 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover rounded-full blur-3xl" alt="" referrerPolicy="no-referrer" />
      </div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1510076857177-7440006aa6b3?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover rounded-full blur-2xl" alt="" referrerPolicy="no-referrer" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Main Invitation Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
            viewport={{ once: true }}
            className="md:col-span-7 parchment-card p-12 md:p-20 text-center rounded-sm"
          >
            <div className="absolute inset-4 border border-gold/30 pointer-events-none" />
            <span className="text-luxury mb-8 block">Kindly join us at our wedding</span>
            <h1 className="text-6xl md:text-8xl font-serif italic text-merlot mb-6 leading-none">Sophie <br/> <span className="text-4xl text-gold not-italic font-sans block my-4 uppercase tracking-[0.5em]">and</span> John</h1>
            
            <div className="space-y-4 font-serif text-xl italic mb-12">
              <p>June 18th, 2028</p>
              <p>THE BEEKMAN</p>
              <p>NEW YORK, NY</p>
            </div>
            
            <div className="flex justify-center gap-6 opacity-60">
              <Star className="w-4 h-4 text-gold fill-gold" />
              <Star className="w-4 h-4 text-gold fill-gold" />
              <Star className="w-4 h-4 text-gold fill-gold" />
            </div>
          </motion.div>

          {/* Scraps & Photos Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: 20, rotate: 5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 5 }}
              viewport={{ once: true }}
              className="bg-white p-2 shadow-lg rounded-sm aspect-square"
            >
              <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20, rotate: -3 }}
              whileInView={{ opacity: 1, x: 0, rotate: -3 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="parchment-card p-6 flex flex-col justify-center items-center text-center rounded-sm shadow-xl"
            >
              <span className="text-luxury text-[8px] mb-2">Countdown</span>
              <CountdownInternal targetDate="2028-06-18T14:00:00" />
              <p className="text-[9px] uppercase tracking-tighter opacity-50 mt-1">Days to go</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20, rotate: 2 }}
              whileInView={{ opacity: 1, x: 0, rotate: 2 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="col-span-2 bg-dark p-1 rounded-sm shadow-2xl"
            >
              <div className="relative border border-white/20 p-8 text-center text-ivory">
                <p className="text-luxury text-gold mb-2">Details</p>
                <div className="flex justify-center gap-2 items-center mb-4">
                   <div className="h-px bg-gold/50 flex-1" />
                   <Heart className="w-4 h-4 text-gold fill-gold" />
                   <div className="h-px bg-gold/50 flex-1" />
                </div>
                <a href="#details" className="text-2xl font-serif italic text-gold hover:text-white transition-colors">View Event Details</a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="col-span-2 bg-accent rounded-sm shadow-xl p-1"
            >
              <a href="#rsvp" className="block w-full h-full bg-accent hover:bg-gold py-6 text-center text-ivory uppercase tracking-[0.3em] font-bold text-xs transition-colors">
                 Confirm Your Attendance
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Header = () => (
  <header className="py-24 px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <span className="text-luxury mb-4 block">Together with their families</span>
      <h2 className="text-5xl md:text-7xl italic font-serif text-ivory mb-4">The Celebration</h2>
      <p className="text-gold tracking-[0.4em] uppercase text-xs font-bold">New York City • Summer 2028</p>
    </motion.div>
  </header>
);

const OurStory = () => (
  <section id="story" className="py-32 px-6 bg-parchment text-dark">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="relative group"
      >
        <div className="aspect-[3/4] rounded-sm overflow-hidden shadow-2xl relative z-10 border-[10px] border-white">
          <img 
            src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80" 
            alt="The Couple" 
            className="w-full h-full object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all duration-1000" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-merlot rounded-sm -z-10 shadow-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-gold/30 -mx-4 -my-4 -z-10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <span className="text-luxury text-merlot mb-4 block">Chapter One</span>
        <h2 className="text-5xl md:text-7xl italic font-serif text-merlot mb-10 leading-tight">Our <span className="not-italic">Story</span></h2>
        <div className="space-y-6 text-slate leading-relaxed font-light text-lg italic">
          <p>
            It began in a crowded New York jazz club, under the soft glow of amber lights and the smooth notes of a saxophone. A shared table, a spilled drink, and a conversation that didn't end until the sun came up over the Hudson.
          </p>
          <p>
            Since then, we've walked every mile of Central Park, explored the hidden corners of Brooklyn, and built a home that feels like our own little sanctuary in the middle of the city noise. 
          </p>
          <p>
            Last December, in the quiet of a snow-covered High Line, John asked a question, and Sophie gave the only answer that felt like home.
          </p>
        </div>
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px bg-gold/50 flex-1" />
          <Heart className="text-gold fill-gold w-4 h-4" />
          <div className="h-px bg-gold/50 flex-1" />
        </div>
      </motion.div>
    </div>
  </section>
);

const Details = () => {
  const events = [
    {
      time: '3:00 PM',
      title: 'Ceremony',
      location: 'The Garden at The Beekman',
      desc: 'Join us for a heartfelt exchange of vows in the historic atrium.',
      icon: <Heart className="w-5 h-5" />
    },
    {
      time: '4:30 PM',
      title: 'Cocktail Hour',
      location: 'The Temple Court',
      desc: 'Crafted cocktails and hors d\'oeuvres accompanied by a live string quartet.',
      icon: <Music className="w-5 h-5" />
    },
    {
      time: '6:30 PM',
      title: 'Reception',
      location: 'The Grand Ballroom',
      desc: 'A formal dinner, celebration, and dancing until late.',
      icon: <Star className="w-5 h-5" />
    }
  ];

  return (
    <section id="details" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-luxury mb-4 block">Celebration</span>
          <h2 className="text-5xl md:text-7xl italic font-serif mb-4">The Details</h2>
          <p className="text-gold uppercase tracking-widest text-xs font-bold">Where the magic happens</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((e, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="parchment-card p-10 md:p-12 text-center group hover:-translate-y-2 transition-all duration-500 rounded-sm"
            >
              <div className="w-12 h-12 bg-merlot text-ivory rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform">
                {e.icon}
              </div>
              <span className="text-luxury text-merlot mb-2 block">{e.time}</span>
              <h3 className="text-3xl font-serif mb-4 text-merlot">{e.title}</h3>
              <p className="text-gold font-serif italic text-sm mb-4">{e.location}</p>
              <p className="text-slate/70 text-sm leading-relaxed">{e.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Attire = () => (
  <section id="attire" className="py-32 px-6 bg-merlot-light/20 relative overflow-hidden">
     <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-luxury mb-4 block">Dress Code</span>
        <h2 className="text-5xl md:text-7xl italic font-serif mb-12 text-merlot">The Attire</h2>
        <div className="parchment-card p-12 md:p-20 rounded-sm">
          <h3 className="text-3xl font-serif italic text-merlot underline decoration-gold/50 underline-offset-8 mb-8">Black Tie Mandatory</h3>
          <p className="text-slate mb-12 italic text-lg leading-relaxed">
            We kindly request that all guests wear formal <span className="font-bold text-merlot not-italic">Black Tie</span> attire. We look forward to seeing everyone in their finest!
          </p>
          <div className="grid md:grid-cols-2 gap-12 text-left border-t border-sand/30 pt-12">
            <div>
              <p className="text-luxury text-merlot mb-4">For Gentlemen</p>
              <p className="text-slate/80 text-sm italic">A tuxedo is required. We suggest a classic black peak or notch lapel with a white formal shirt and black bow tie.</p>
            </div>
            <div>
              <p className="text-luxury text-merlot mb-4">For Ladies</p>
              <p className="text-slate/80 text-sm italic">A formal floor-length evening gown. We encourage rich textures like velvet or silk in deep tonal colors.</p>
            </div>
          </div>
          
          <div className="mt-12 p-8 bg-ivory rounded-sm border border-sand/30">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-merlot mb-6">Color Inspiration</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {['#831515', '#A32929', '#B08D57', '#2D2D2D', '#FDFCFB'].map(c => (
                <div key={c} className="w-10 h-10 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
     </div>
  </section>
);

const TravelAccommodation = () => (
  <section id="travel" className="py-32 px-6 bg-parchment text-dark">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <span className="text-luxury text-merlot mb-4 block">Logistics</span>
        <h2 className="text-5xl md:text-7xl italic font-serif text-merlot mb-4">Travel & Accommodation</h2>
        <div className="flex justify-center mt-6">
           <Plane className="text-gold w-8 h-8" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="parchment-card p-12 rounded-sm border-merlot/10 border-2">
           <h3 className="text-3xl font-serif italic text-merlot mb-6">Where to Stay</h3>
           <div className="space-y-8">
              <div>
                <h4 className="font-bold text-lg mb-2 text-merlot">The Beekman Hotel</h4>
                <p className="text-slate/70 text-sm mb-4">Our wedding venue. We have a block of rooms reserved under the "Sophie & John Wedding."</p>
                <a href="#" className="text-merlot text-[10px] uppercase font-bold tracking-widest border-b border-merlot pb-1">Book Room Block</a>
              </div>
              <div className="h-px bg-sand/50" />
              <div>
                <h4 className="font-bold text-lg mb-2 text-merlot">The Arlo NoMad</h4>
                <p className="text-slate/70 text-sm mb-4">A boutique option just a short walk away for those looking for a different vibe.</p>
                <a href="#" className="text-merlot text-[10px] uppercase font-bold tracking-widest border-b border-merlot pb-1">Visit Website</a>
              </div>
           </div>
        </div>

        <div className="parchment-card p-12 rounded-sm border-merlot/10 border-2">
           <h3 className="text-3xl font-serif italic text-merlot mb-6">Getting There</h3>
           <div className="space-y-8">
              <div>
                <h4 className="font-bold text-lg mb-2 text-merlot"><Plane className="inline w-4 h-4 mr-2" /> By Air</h4>
                <p className="text-slate/70 text-sm">John F. Kennedy (JFK) or LaGuardia (LGA) are the closest airports. Newark (EWR) is also an option but slightly further away.</p>
              </div>
              <div className="h-px bg-sand/50" />
              <div>
                <h4 className="font-bold text-lg mb-2 text-merlot"><Car className="inline w-4 h-4 mr-2" /> Transportation</h4>
                <p className="text-slate/70 text-sm">We recommend using ride-share services (Uber/Lyft) or the iconic New York yellow cabs. Parking at the venue is limited.</p>
              </div>
              <div className="h-px bg-sand/50" />
              <div id="transportation">
                <h4 className="font-bold text-lg mb-2 text-merlot">Shuttle Service</h4>
                <p className="text-slate/70 text-sm">A private shuttle will be provided between The Arlo and The Beekman starting at 2:00 PM on the day of the wedding.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

const Registry = () => (
  <section id="registry" className="py-32 px-6">
    <div className="max-w-4xl mx-auto text-center">
      <span className="text-luxury mb-4 block">Honor Us</span>
      <h2 className="text-5xl md:text-7xl italic font-serif mb-10">Gift Registry</h2>
      <div className="parchment-card p-12 md:p-20 rounded-sm">
        <p className="text-slate mb-12 italic text-lg leading-relaxed max-w-2xl mx-auto">
          Your presence at our wedding is the only gift we require. However, if you wish to honor us with a gift, we have curated a selection at the following registries:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a href="#" className="p-8 border border-sand hover:bg-white transition-colors flex flex-col items-center">
             <Gift className="text-gold w-10 h-10 mb-4" />
             <span className="font-serif text-2xl italic text-merlot">Williams Sonoma</span>
          </a>
          <a href="#" className="p-8 border border-sand hover:bg-white transition-colors flex flex-col items-center">
             <Heart className="text-gold w-10 h-10 mb-4" />
             <span className="font-serif text-2xl italic text-merlot">Zola Honeymoon Fund</span>
          </a>
        </div>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const faqs = [
    { q: "Can I bring a plus one?", a: "Due to capacity limits at our venue, we can only accommodate those listed on your invitation." },
    { q: "Are children welcome?", a: "While we love your little ones, our wedding will be an adults-only event. We hope you appreciate the night off!" },
    { q: "Is there a deadline to RSVP?", a: "Please let us know if you can join us by May 18th, 2028." },
    { q: "What time should I arrive?", a: "The ceremony begins promptly at 3:00 PM. We recommend arriving 15-20 minutes early." }
  ];

  return (
    <section id="faq" className="py-32 px-6 bg-merlot-light/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-luxury mb-4 block">Information</span>
          <h2 className="text-5xl md:text-7xl italic font-serif mb-4">Additional Info</h2>
        </div>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="parchment-card p-8 rounded-sm"
            >
              <h4 className="font-bold text-merlot mb-3 flex items-center gap-2 italic">
                <Info className="w-4 h-4 text-gold" /> {f.q}
              </h4>
              <p className="text-slate/80 text-sm leading-relaxed">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const images = [
    'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1510076857177-7440006aa6b3?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=600&fit=crop',
  ];

  return (
    <section id="gallery" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-luxury mb-4 block">Capturing Moments</span>
          <h2 className="text-5xl md:text-7xl italic font-serif mb-8 text-ivory">Our Gallery</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
           {images.map((img, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="bg-white p-3 shadow-2xl rounded-sm aspect-square overflow-hidden group rotate-1"
               style={{ rotate: `${(i % 2 === 0 ? 1 : -1) * (i + 1)}deg` }}
             >
                <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" referrerPolicy="no-referrer" />
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

const RSVP = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    attendance: 'attending',
    dietary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const path = 'rsvps';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        guests: parseInt(formData.guests, 10),
        createdAt: serverTimestamp(),
      });
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      setIsSubmitting(false);
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch (finalErr: any) {
        const errorDetails = JSON.parse(finalErr.message);
        setError(`Failed to send RSVP: ${errorDetails.error}`);
      }
    }
  };

  return (
    <section id="rsvp" className="py-32 px-6 bg-merlot text-ivory relative">
      <div className="max-w-2xl mx-auto parchment-card p-12 md:p-20 text-dark rounded-sm">
        <div className="text-center mb-12">
           <span className="text-luxury text-merlot mb-4 block">Response</span>
           <h2 className="text-5xl font-serif italic text-merlot mb-4">RSVP</h2>
           <p className="text-gold text-[10px] uppercase font-bold tracking-widest italic">Kindly respond by May 18th, 2028</p>
        </div>

        {submitted ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
             <Heart className="w-16 h-16 text-merlot fill-merlot mx-auto mb-6" />
             <h3 className="text-3xl font-serif italic text-merlot mb-4">See you there!</h3>
             <p className="text-slate italic">Your response has been saved with love.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 italic font-serif text-lg">
             {error && <div className="p-4 bg-red-50 text-red-600 rounded-sm text-sm font-sans mb-4">{error}</div>}
             <div className="space-y-4">
               <label className="text-luxury text-merlot text-[9px] not-italic">Your name</label>
               <input 
                 type="text" 
                 required 
                 className="w-full border-b border-sand bg-transparent pb-2 outline-none focus:border-gold transition-colors"
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
               />
             </div>
             <div className="space-y-4">
               <label className="text-luxury text-merlot text-[9px] not-italic">Email address</label>
               <input 
                 type="email" 
                 required 
                 className="w-full border-b border-sand bg-transparent pb-2 outline-none focus:border-gold transition-colors"
                 value={formData.email}
                 onChange={e => setFormData({...formData, email: e.target.value})}
               />
             </div>
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-luxury text-merlot text-[9px] not-italic">Attendance</label>
                   <select 
                     className="w-full border-b border-sand bg-transparent pb-2 outline-none focus:border-gold transition-colors"
                     value={formData.attendance}
                     onChange={e => setFormData({...formData, attendance: e.target.value as any})}
                   >
                      <option value="attending">Accepts with pleasure</option>
                      <option value="declined">Declines with regret</option>
                   </select>
                </div>
                <div className="space-y-4">
                   <label className="text-luxury text-merlot text-[9px] not-italic">Guest Count</label>
                   <input 
                     type="number" 
                     min="1" 
                     max="2"
                     className="w-full border-b border-sand bg-transparent pb-2 outline-none focus:border-gold transition-colors"
                     value={formData.guests}
                     onChange={e => setFormData({...formData, guests: e.target.value})}
                   />
                </div>
             </div>
             <div className="space-y-4">
               <label className="text-luxury text-merlot text-[9px] not-italic">Dietary Requirements</label>
               <textarea 
                 className="w-full border-b border-sand bg-transparent pb-2 outline-none focus:border-gold transition-colors resize-none h-20"
                 placeholder="Optional..."
                 value={formData.dietary}
                 onChange={e => setFormData({...formData, dietary: e.target.value})}
               />
             </div>
             <button type="submit" disabled={isSubmitting} className="w-full bg-merlot text-ivory py-4 uppercase tracking-[0.4em] text-xs font-bold hover:bg-gold transition-all active:scale-95 disabled:opacity-50">
                {isSubmitting ? 'Sending...' : 'Send Response'}
             </button>
          </form>
        )}
      </div>
    </section>
  );
};

const CountdownInternal = ({ targetDate }: { targetDate: string }) => {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) {
        setDays(0);
        return;
      }
      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <div className="text-4xl md:text-5xl font-serif text-merlot italic leading-none">{days}</div>;
};

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email === 'priscillaawuku88@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  const fetchRsvps = async () => {
    setLoading(true);
    const path = 'rsvps';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRsvps(data);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchRsvps();
  }, [isAdmin]);

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="py-12 text-center bg-merlot-light/20">
        <p className="text-ivory/60 text-sm">Access Restricted to Wedding Couple.</p>
        <button onClick={() => auth.signOut()} className="text-gold text-[10px] uppercase font-bold mt-4">Sign Out</button>
      </div>
    );
  }

  return (
    <div className="py-24 px-6 bg-parchment text-dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-luxury text-merlot mb-4 block">Guest Responses</span>
            <h2 className="text-4xl font-serif italic text-merlot">Guest List</h2>
          </div>
          <p className="text-slate/40 text-[10px] uppercase font-bold">Total: {rsvps.length}</p>
        </div>

        {loading ? (
          <div className="text-center py-20 italic font-serif">Loading guest list...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand text-[10px] uppercase tracking-widest text-slate/50">
                  <th className="py-4 px-4 font-bold">Guest Name</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold">Guests</th>
                  <th className="py-4 px-4 font-bold">Dietary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 text-sm italic font-serif">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td className="py-4 px-4 text-merlot">{rsvp.name}<br/><span className="text-[10px] text-slate/40 tracking-tight not-italic">{rsvp.email}</span></td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-widest ${rsvp.attendance === 'attending' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rsvp.attendance}
                      </span>
                    </td>
                    <td className="py-4 px-4">{rsvp.guests}</td>
                    <td className="py-4 px-4 text-slate/60 text-xs">{rsvp.dietary || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button onClick={() => auth.signOut()} className="mt-12 text-gold text-[10px] uppercase font-bold tracking-widest border-b border-gold pb-1">Sign Out</button>
      </div>
    </div>
  );
};

const Contacts = () => (
   <section id="contacts" className="py-24 bg-merlot border-t border-white/10 text-center">
      <div className="max-w-5xl mx-auto px-6">
        <span className="text-luxury mb-4 block">Get in touch</span>
        <h2 className="text-4xl font-serif italic mb-12">Contact Us</h2>
        <div className="grid md:grid-cols-3 gap-12 text-gold">
           <div className="space-y-2">
              <Phone className="w-5 h-5 mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest opacity-60">Chief Bridesmaid</p>
              <p className="text-xl font-serif italic text-ivory">+1 (555) 0123</p>
           </div>
           <div className="space-y-2">
              <Phone className="w-5 h-5 mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest opacity-60">Best Man</p>
              <p className="text-xl font-serif italic text-ivory">+1 (555) 0987</p>
           </div>
           <div className="space-y-2">
              <Mail className="w-5 h-5 mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest opacity-60">General Inquiries</p>
              <p className="text-xl font-serif italic text-ivory">wedding@sophie-john.com</p>
           </div>
        </div>
      </div>
   </section>
);

const Footer = () => (
  <footer className="py-20 bg-dark text-ivory/40 text-center px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-serif italic mb-4 text-gold">Sophie & John</h2>
      <p className="text-[10px] uppercase tracking-[0.5em] mb-12 hover:text-white transition-colors cursor-default">#SophieAndJohn2028</p>
      
      <div className="flex gap-8 justify-center mb-12">
        <a href="#" className="hover:text-gold transition-colors"><Instagram className="w-5 h-5" /></a>
        <a href="#" className="hover:text-gold transition-colors"><Facebook className="w-5 h-5" /></a>
        <a href="#" className="hover:text-gold transition-colors"><Mail className="w-5 h-5" /></a>
      </div>

      <div className="h-px bg-white/5 mb-8" />
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-widest font-bold">
        <p>© 2028 SJ Wedding. All Rights Reserved.</p>
        <div className="flex gap-6">
           <a href="#" onClick={() => loginWithGoogle()} className="hover:text-gold">Admin Portal</a>
           <span>Built with love for our forever.</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="selection:bg-gold selection:text-white overflow-x-hidden min-h-screen bg-merlot">
      <AnimatePresence>
        {!showInvite && <WelcomeEnvelope onOpen={() => setShowInvite(true)} />}
      </AnimatePresence>
      
      {showInvite && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Navbar />
          <main>
            <InvitationSuite />
            <Header />
            <OurStory />
            <Details />
            <Attire />
            <TravelAccommodation />
            <Registry />
            <FAQ />
            <Gallery />
            <RSVP />
            <Contacts />
            <AdminDashboard />
          </main>
          <Footer />
        </motion.div>
      )}
    </div>
  );
}
