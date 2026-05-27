import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Code, Server, Shield, Sparkles, Award, Cpu, 
  Layers, Users, ArrowRight, MessageSquare, 
  Phone, Zap, Settings, ChevronRight, Home, RefreshCw 
} from "lucide-react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("frontend"); // Default to frontend, no 'all' option

  const techStack = {
    frontend: [
      { name: "React.js", desc: "Core Frontend Framework", icon: "⚛️" },
      { name: "Vite", desc: "Super-fast Build Tooling", icon: "⚡" },
      { name: "Tailwind CSS", desc: "Modern Utility Styling", icon: "🎨" },
      { name: "Redux Toolkit", desc: "Global State Management", icon: "🔄" },
      { name: "TanStack Query", desc: "Async Data Fetching & Sync", icon: "📡" },
      { name: "Framer Motion", desc: "Smooth Fluid Animations", icon: "🎬" },
      { name: "Three.js & Model Viewer", desc: "3D Product Previews", icon: "📦" }
    ],
    backend: [
      { name: "Django", desc: "High-level Python Framework", icon: "🐍" },
      { name: "Django REST Framework", desc: "Scalable REST APIs", icon: "⚙️" },
      { name: "FastAPI", desc: "AI Microservice & RAG Processing", icon: "🚀" },
      { name: "JWT & OAuth", desc: "Secure Authentication Systems", icon: "🔑" },
      { name: "WebSockets (Channels)", desc: "Real-time Messaging Protocol", icon: "💬" }
    ],
    infrastructure: [
      { name: "PostgreSQL", desc: "Robust Relational Database", icon: "🗄️" },
      { name: "Redis", desc: "In-memory Cache & WebSocket Broker", icon: "🔴" },
      { name: "Celery & Celery Beat", desc: "Background Queue & Cron Jobs", icon: "🕒" },
      { name: "Cloudinary", desc: "Optimized Media & Assets Manager", icon: "☁️" },
      { name: "Docker & Compose", desc: "Seamless Containerization", icon: "🐳" },
      { name: "AWS EC2 (t3.small)", desc: "Scalable Cloud Hosting", icon: "☁️" },
      { name: "Nginx & Certbot SSL", desc: "Reverse Proxy & Secure Encryption", icon: "🔒" },
      { name: "Terraform", desc: "Infrastructure as Code", icon: "🏗️" }
    ]
  };

  const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "Tech Stack", href: "#tech-stack" },
    { label: "Modules", href: "#modules" },
    { label: "Architecture", href: "#architecture" },
    { label: "Security & Performance", href: "#security" },
    { label: "Achievements", href: "#achievements" },
    { label: "Connect", href: "#connect" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/50 text-[#756477] selection:bg-[#756477] selection:text-white pb-20 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#756477]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />
      
      {/* Header / Hero Section */}
      <header className="relative pt-28 pb-12 px-6 max-w-6xl mx-auto text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-purple-100 text-xs font-bold tracking-wide text-[#756477] mb-6 shadow-sm backdrop-blur-md"
        >
          <img src="/favicorn.png" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
          Rentout.in Documentation
        </motion.div>

        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-[#756477] to-[#806b82] bg-clip-text text-transparent tracking-tight mb-6"
        >
          Rentout.in
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
        >
          A premium, production-grade full-stack furniture and appliances rental platform.
          Designed to empower students, working professionals, and temporary residents, while enabling owners to generate passive income.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
<Link
  to="/"
  className="px-6 py-3 bg-[#635465] hover:bg-[#524554] text-white font-bold rounded-xl shadow-lg shadow-[#635465]/10 hover:shadow-xl hover:shadow-[#635465]/20 transition-all flex items-center gap-2 group"
>
  <Home size={18} />
  Back to Home
  <ArrowRight size={16} className="group-hover:translate-x-1 transition-all" />
</Link>
          </motion.div>
        </header>


      <main className="max-w-6xl mx-auto px-6 mt-16 space-y-24 relative z-10">
        
        {/* SECTION: Overview & Core Concept */}
        <section id="overview" className="scroll-mt-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold shadow-sm">
                <Zap size={14} /> Key Mission
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Addressing Real-world Sharing Economy Gaps
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Relocating temporarily to a new city often involves astronomical upfront expenses for basic utilities like home furniture or essential electronic appliances. 
                <strong className="text-[#635465]"> Rentout.in</strong> solves this by creating a reliable, peer-to-peer and managed ecosystem for secure rentals.
              </p>
              
              <div className="space-y-4 pt-2">
                {[
                  "Eliminates hefty capital commitments for temporary or student stays.",
                  "Enables product owners to monetize idle or excess inventory effortlessly.",
                  "Offers an immersive 3D/AR preview to check items in real environments.",
                  "Secures transaction endpoints with seamless payment systems."
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#635465]/10 border border-[#635465]/20 flex items-center justify-center text-[#635465] font-bold shrink-0 text-xs shadow-sm">
                      ✓
                    </span>
                    <span className="text-slate-600 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual Glassmorphic Grid for Problem Solving */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 border border-slate-100 rounded-3xl p-8 shadow-md backdrop-blur-md relative"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Sparkles className="text-[#635465]" size={18} />
                Core Architecture Focus
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Cost Reduction", desc: "Avoid the high upfront retail cost of new assets.", color: "border-blue-100 bg-blue-50/30 text-blue-900" },
                  { title: "Asset Monetization", desc: "Earn passive income by sharing unused inventory.", color: "border-amber-100 bg-amber-50/30 text-amber-900" },
                  { title: "Eco-Friendly Loop", desc: "Promote circular utility, reducing global e-waste.", color: "border-emerald-100 bg-emerald-50/30 text-emerald-900" },
                  { title: "Absolute Trust", desc: "Built-in KYC verification and secure escrow.", color: "border-purple-100 bg-purple-50/30 text-purple-900" },
                ].map((card, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${card.color} flex flex-col justify-between shadow-sm`}>
                    <span className="font-bold text-sm">{card.title}</span>
                    <span className="text-slate-600 text-xs mt-2">{card.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION: Technologies Stack with Tabs (No 'All' option) */}
        <section id="tech-stack" className="scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 text-[#635465] border border-purple-100 text-xs font-bold mb-3 shadow-sm">
              <Code size={14} /> Full Stack Architecture
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Powerful & Modern Stack
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              A carefully selected set of frameworks, databases, caches, and tools optimized for maximum performance.
            </p>
          </div>

          {/* Filter Tab System */}
          <div className="flex justify-center gap-2 mb-8 bg-purple-50/50 border border-purple-100/55 p-1.5 rounded-xl max-w-md mx-auto shadow-inner">
            {["frontend", "backend", "infrastructure"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeTab === tab 
                    ? "bg-[#635465] text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid Render */}
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {techStack[activeTab].map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={item.name}
                  className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-[#635465]/30 hover:bg-[#635465]/5 shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">{item.icon}</div>
                    <h4 className="font-bold text-slate-800 text-sm md:text-base">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* SECTION: User Modules */}
        <section id="modules" className="scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 text-xs font-bold mb-3 shadow-sm">
              <Users size={14} /> Modular Workspaces
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Tailored User Roles & Modules
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              The application divides workflow permissions into three dedicated modules to maximize security and flow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* User Module */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mb-4 font-bold">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">User Module</h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex gap-2"><ChevronRight size={14} className="text-blue-500 shrink-0" /> Browse & filter products</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-blue-500 shrink-0" /> Add to cart / Book rentals</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-blue-500 shrink-0" /> Online payment integration</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-blue-500 shrink-0" /> Real-time chat with product owners</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-blue-500 shrink-0" /> OTP verification & history logs</li>
                </ul>
              </div>
            </motion.div>

            {/* Owner Module */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-4 font-bold">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Owner Module</h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex gap-2"><ChevronRight size={14} className="text-purple-500 shrink-0" /> List furniture or appliances</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-purple-500 shrink-0" /> Upload assets & 3D models</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-purple-500 shrink-0" /> Manage pricing & inventory</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-purple-500 shrink-0" /> Track booking logs and analytics</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-purple-500 shrink-0" /> Interactive chat with buyers</li>
                </ul>
              </div>
            </motion.div>

            {/* Admin Module */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 font-bold">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Admin Module</h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex gap-2"><ChevronRight size={14} className="text-emerald-500 shrink-0" /> Verify user KYC docs</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-emerald-500 shrink-0" /> Approve or flag active listings</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-emerald-500 shrink-0" /> Manage global payments & platform</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-emerald-500 shrink-0" /> Track real-time network activity</li>
                  <li className="flex gap-2"><ChevronRight size={14} className="text-emerald-500 shrink-0" /> Multi-tiered security control panels</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION: Flow / Architecture */}
        <section id="architecture" className="scroll-mt-28">
          <div className="bg-[#635465]/5 border border-purple-100 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold mb-3 shadow-sm">
                <Layers size={14} /> System Architecture
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Highly Integrated Infrastructure
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                A decoupled microservice & monolith layout mapping out Frontend clients, robust core API databases, dynamic AI RAG servers, and scalable devops environments.
              </p>
            </div>

            {/* Architecture Flow Representation */}
            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Box 1 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#635465] text-sm mb-2">Frontend Clients</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    React + Vite with Redux state client-side. Standard HTTP routing, asynchronous queries, real-time WebSocket channels, and immersive Three.js components.
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Three.js / React</span>
                  <span>SSL / HTTPS</span>
                </div>
              </div>

              {/* Box 2 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#635465] text-sm mb-2">Core API Services</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Django REST framework powering authentication, databases, storage queues, billing, and system states. Complemented by Celery workers.
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Django REST / PostgreSQL</span>
                  <span>Celery Workers</span>
                </div>
              </div>

              {/* Box 3 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#635465] text-sm mb-2">AI Microservice</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Dedicated FastAPI server processing AI chatbot operations, using LangChain for RAG (Retrieval-Augmented Generation) on our product listings.
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>FastAPI / LangChain</span>
                  <span>RAG System</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Security & Performance */}
        <section id="security" className="scroll-mt-28">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold mb-4 shadow-sm">
                  <Shield size={14} /> Security First
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-3">Robust Security Features</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Security protocols are strictly embedded into the lifecycle of each user action on the Rentout.in network.
                </p>

                <div className="space-y-4">
                  {[
                    { label: "Token System", desc: "JWT token authentication for secure sessions." },
                    { label: "OAuth Integration", desc: "Secure external authentication handles." },
                    { label: "OTP Verification", desc: "SMS/Email verification to prevent bot accounts." },
                    { label: "Protected Endpoints", desc: "Authorized API access with cors policy verification." }
                  ].map((sec, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <span className="text-rose-500 font-bold">●</span>
                      <div>
                        <span className="font-bold text-slate-800 block">{sec.label}</span>
                        <span className="text-slate-600">{sec.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-55 text-amber-800 border border-amber-100 text-xs font-bold mb-4 shadow-sm" style={{ backgroundColor: '#fffbeb', borderColor: '#fef3c7' }}>
                  <Settings size={14} /> Optimization
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-3">Performance & Scalability</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Engineered from the ground up for high concurrency, fast page loading, and minimal latency.
                </p>

                <div className="space-y-4">
                  {[
                    { label: "Caching layer", desc: "Redis queries to speed up product search responses." },
                    { label: "Asset Storage", desc: "Cloudinary optimized image and 3D preview loading." },
                    { label: "Async workers", desc: "Celery managing notification queues in background." },
                    { label: "Microservice Design", desc: "FastAPI isolates heavy AI computation from monolith." }
                  ].map((opt, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <span className="text-amber-500 font-bold">●</span>
                      <div>
                        <span className="font-bold text-slate-800 block">{opt.label}</span>
                        <span className="text-slate-600">{opt.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Challenges, Achievements & Future */}
        <section id="achievements" className="scroll-mt-28">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Challenges & Achievements */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Award className="text-[#635465]" size={20} />
                Key Achievements
              </h3>
              <div className="space-y-3">
                {[
                  "Successfully built a production-grade full-stack platform.",
                  "Created a decoupled FastAPI AI microservice supporting RAG with LangChain.",
                  "Configured automated multi-service Docker Compose networks.",
                  "Designed real-time messaging with asynchronous backend WebSocket triggers."
                ].map((ach, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-100 text-xs font-medium text-slate-600 shadow-sm">
                    🏆 {ach}
                  </div>
                ))}
              </div>
            </div>

            {/* Future Enhancements */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <RefreshCw className="text-[#635465]" size={20} />
                Future Enhancements
              </h3>
              <div className="space-y-3">
                {[
                  "Extending listings catalog to home and accommodation rentals.",
                  "Integrating smart ML-based user recommendation systems.",
                  "Adding detailed interactive dashboard analytics for owners.",
                  "Designing a native mobile companion application."
                ].map((fut, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-100 text-xs font-medium text-slate-600 shadow-sm">
                    🚀 {fut}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Developers Profile & Projects */}
        <section id="connect" className="scroll-mt-28">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 max-w-2xl mx-auto shadow-sm">
            <h3 className="text-lg font-bold text-[#635465] text-center mb-1">Connect With Me</h3>
            <p className="text-slate-500 text-[11px] text-center mb-4">
              Reach out through my social channels or check my current work.
            </p>

            <div className="flex justify-center gap-3 flex-wrap mb-5">
              <a 
                href="https://github.com/favas-cv" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold shadow-sm"
              >
                GitHub
              </a>
              <a 
                href="https://linkedin.com/in/muhammed-favas-cv-3a397336a" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-all text-xs font-bold shadow-sm"
              >
                LinkedIn
              </a>
              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold shadow-sm"
              >
                <Phone size={12} className="text-white" />
                WhatsApp
              </a>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 mb-2.5 text-center">Also From Me</h4>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a 
                  href="https://peakpack.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all text-xs w-full sm:w-auto justify-center"
                >
                  <span>🎒</span>
                  <span className="font-bold text-slate-700">PeakPack</span>
                  <span className="text-[10px] text-slate-400 font-medium">(Traveller E-commerce)</span>
                </a>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs w-full sm:w-auto justify-center">
                  <span>🧭</span>
                  <span className="font-bold text-slate-700">Vayikatti.in</span>
                  <span className="text-[10px] text-violet-500 font-black uppercase tracking-wider">(Coming Soon)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer copyright */}
      <footer className="text-center text-slate-400 text-xs mt-20 pt-8 border-t border-slate-100">
        &copy; {new Date().getFullYear()} Rentout.in. All rights reserved.
      </footer>
    </div>
  );
}
