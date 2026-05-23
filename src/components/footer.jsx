const Footer = () => {
  const footerLinks = [
    { title: 'For Renters', links: ['Collections', 'Seasonal Kits', 'Insurance Policy', 'Returns'] },
    { title: 'For Owners', links: ['List Your Item', 'Host Community', 'Safety Standards', 'Earnings Calculator'] },
    { title: 'Company', links: ['Sustainability', 'Help Center', 'Contact', 'Careers'] }
  ];

  return (
    <footer className="bg-slate-50 pt-16 pb-8 px-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div>
          <h3 className="font-bold text-lg mb-4">Rentout.in</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Investing in spaces through circular economy and thoughtful design. Curated by experts, loved by the modern nomad.
          </p>
        </div>
        {footerLinks.map((section) => (
          <div key={section.title}>
            <h4 className="font-semibold text-sm mb-4 text-slate-800">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map(link => (
                <li key={link}><a href="#" className="text-slate-500 text-sm hover:text-black transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
        <p>© 2026 The Curated Living. All Rights Reserved.</p>
        <div className="flex gap-4 items-center">
          <span>RETWEET</span>
          <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;