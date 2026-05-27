import React from 'react';
import { Bed, Tv, Monitor, Layout, Sofa, TreePine } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCategoryDirect } from '../store/uiSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Each category maps to the name the API / products page expects, with custom colors and animations
  const categories = [
    { icon: <Bed size={24} />, name: 'BED', colorText: 'text-blue-500', colorBg: 'bg-blue-50 hover:bg-blue-500', hoverText: 'group-hover:text-white', anim: 'group-hover:-translate-y-2' },
    { icon: <Tv size={24} />, name: 'APPLIANCE', colorText: 'text-purple-500', colorBg: 'bg-purple-50 hover:bg-purple-500', hoverText: 'group-hover:text-white', anim: 'group-hover:rotate-12' },
    { icon: <Monitor size={24} />, name: 'CHAIR', colorText: 'text-emerald-500', colorBg: 'bg-emerald-50 hover:bg-emerald-500', hoverText: 'group-hover:text-white', anim: 'group-hover:scale-110' },
    { icon: <Layout size={24} />, name: 'DINING', colorText: 'text-orange-500', colorBg: 'bg-orange-50 hover:bg-orange-500', hoverText: 'group-hover:text-white', anim: 'group-hover:-translate-y-1 group-hover:rotate-[-5deg]' },
    { icon: <Sofa size={24} />, name: 'SOFA', colorText: 'text-pink-500', colorBg: 'bg-pink-50 hover:bg-pink-500', hoverText: 'group-hover:text-white', anim: 'group-hover:scale-110 group-hover:rotate-[5deg]' },
    { icon: <TreePine size={24} />, name: 'OUTDOOR', colorText: 'text-teal-500', colorBg: 'bg-teal-50 hover:bg-teal-500', hoverText: 'group-hover:text-white', anim: 'group-hover:animate-bounce' },
  ];

  // Set category in Redux then navigate — products page reads from Redux on mount
  const handleCategoryClick = (categoryName) => {
    dispatch(setCategoryDirect(categoryName)); // always sets, no toggle
    navigate('/products');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-6 md:gap-12 px-4 sm:px-6 md:px-12 py-8 md:py-16">
        <div className="flex-1 w-full">
          {/* Landscape image — visible on md+ screens */}
          <img
            src="/images/heroimagelandscape.jpg"
            alt="Interior design"
            className="hidden md:block rounded-2xl shadow-xl object-cover w-full h-[450px]"
          />
          {/* Phone hero image — visible on small screens only */}
          <img
            src="/images/phonehero2.jpg"
            alt="Interior design mobile"
            className="block md:hidden rounded-2xl shadow-xl object-cover w-full h-[280px] sm:h-[340px]"
          />
        </div>

        <div className="flex-1 max-w-xl w-full flex flex-col items-center md:items-start text-center md:text-left">
          {/* Desktop heading */}
          <h1 className="hidden md:block text-4xl lg:text-6xl font-bold leading-tight mb-8 text-slate-900">
            Furnish your <br /> space without <br /> the commitment
          </h1>
          {/* Mobile heading */}
          <h1 className="block md:hidden text-2xl sm:text-4xl font-bold leading-tight mb-4 text-slate-900">
            Furnish your space
          </h1>

          <div className="w-full mb-6 md:mb-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-[1.5rem] transition-all duration-300 group shadow-sm hover:shadow-lg ${cat.colorBg}`}
                >
                  <span className={`mb-2 md:mb-3 transition-all duration-300 ${cat.colorText} ${cat.hoverText} ${cat.anim}`}>
                    {cat.icon}
                  </span>
                  <span className="text-xs md:text-sm font-semibold tracking-wide text-slate-800 transition-colors group-hover:text-white">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/room')}
            className="w-full py-3 md:py-4 bg-[#756477] text-white rounded-full font-semibold hover:bg-[#635465] transition-all text-sm md:text-base"
          >
            Build Your Room
          </button>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-slate-100 py-3 border-y border-slate-200 overflow-hidden flex whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="animate-marquee flex gap-12 pr-12">
          <span>List your furniture &amp; earn</span>
          <span>Seamless Delivery, Zero Heavy Lifting</span>
          <span>Affordability, Flexibility, For Renters</span>
          <span>Elevate Your Space, Effortlessly</span>
          <span>Premium Quality, Sustainable Choices</span>
          <span>No Long-term Contracts, Full Freedom</span>
          <span>Smart Living for Modern Spaces</span>
          <span>Design the home of your dreams today</span>
          
          {/* Duplicate sequence for seamless loop */}
          <span>List your furniture &amp; earn</span>
          <span>Seamless Delivery, Zero Heavy Lifting</span>
          <span>Affordability, Flexibility, For Renters</span>
          <span>Elevate Your Space, Effortlessly</span>
          <span>Premium Quality, Sustainable Choices</span>
          <span>No Long-term Contracts, Full Freedom</span>
          <span>Smart Living for Modern Spaces</span>
          <span>Design the home of your dreams today</span>
        </div>
      </div>

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </main>
  );
};

export default HomePage;