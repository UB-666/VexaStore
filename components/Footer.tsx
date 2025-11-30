'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Footer() {
  const router = useRouter()
  
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setTimeout(() => router.push(href), 150)
  }
  return (
    <motion.footer 
      className="relative bg-gradient-to-br from-gray-950 via-cyan-950 to-blue-950 text-white mt-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-900/50"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 pt-20">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
              }
            }
          }}
        >
          {/* Brand */}
          <motion.div 
            className="md:col-span-2"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <motion.div 
              className="flex items-center gap-3 mb-4 group"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 200, duration: 0.4 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">VexaStore</h3>
            </motion.div>
            <motion.p 
              className="text-gray-300 max-w-md mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              A modern, full-stack e-commerce platform built with cutting-edge technologies. Experience seamless shopping with secure payments and beautiful design.
            </motion.p>
            <motion.div 
              className="flex gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center group"
                whileHover={{ scale: 1.15, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center group"
                whileHover={{ scale: 1.15, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center group"
                whileHover={{ scale: 1.15, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </motion.a>
            </motion.div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <h4 className="text-lg font-bold mb-4 text-cyan-300">Quick Links</h4>
            <ul className="space-y-3">

               <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                <a href="/" onClick={handleNavigation('/')} className="text-gray-300 hover:text-cyan-300 transition-all duration-500 flex items-center gap-2 group cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-500"></span>
                  Home
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                <a href="/" onClick={handleNavigation('/#products')} className="text-gray-300 hover:text-cyan-300 transition-all duration-500 flex items-center gap-2 group cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-500"></span>
                  Products
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                <a href="/about" onClick={handleNavigation('/about')} className="text-gray-300 hover:text-cyan-300 transition-all duration-500 flex items-center gap-2 group cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-500"></span>
                  About
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                <a href="/contact" onClick={handleNavigation('/contact')} className="text-gray-300 hover:text-cyan-300 transition-all duration-500 flex items-center gap-2 group cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-500"></span>
                  Contact
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                <a href="/cart" onClick={handleNavigation('/cart')} className="text-gray-300 hover:text-cyan-300 transition-all duration-500 flex items-center gap-2 group cursor-pointer">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-500"></span>
                  Cart
                </a>
              </motion.li>
            </ul>
          </motion.div>
          
          {/* Tech Stack */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <h4 className="text-lg font-bold mb-4 text-cyan-300">Powered By</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <motion.li 
                className="flex items-center gap-2 hover:text-cyan-300 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <span className="text-cyan-400">▸</span> Next.js
              </motion.li>
              <motion.li 
                className="flex items-center gap-2 hover:text-cyan-300 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <span className="text-cyan-400">▸</span> TypeScript
              </motion.li>
              <motion.li 
                className="flex items-center gap-2 hover:text-cyan-300 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <span className="text-cyan-400">▸</span> Tailwind CSS
              </motion.li>
              <motion.li 
                className="flex items-center gap-2 hover:text-cyan-300 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <span className="text-cyan-400">▸</span> Supabase
              </motion.li>
              <motion.li 
                className="flex items-center gap-2 hover:text-cyan-300 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <span className="text-cyan-400">▸</span> Framer Motion
              </motion.li>
              <motion.li 
                className="flex items-center gap-2 hover:text-cyan-300 transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <span className="text-cyan-400">▸</span> Stripe Payments
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>
        
        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 mt-8 border-t border-cyan-500/20 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.p 
            className="text-gray-300 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            &copy; {new Date().getFullYear()} VexaStore by <span className="text-cyan-400 font-semibold">Upjeet Baswan</span>. Crafted with <motion.span 
              className="text-cyan-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >💙</motion.span>
          </motion.p>
          <motion.div 
            className="flex gap-6 text-sm text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <motion.a 
              href="#" 
              className="hover:text-cyan-300 transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="#" 
              className="hover:text-cyan-300 transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              Terms of Service
            </motion.a>
            <motion.a 
              href="/contact" 
              onClick={handleNavigation('/contact')}
              className="hover:text-cyan-300 transition-all duration-300 cursor-pointer"
              whileHover={{ y: -2 }}
            >
              Contact
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
