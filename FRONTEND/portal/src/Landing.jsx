import { useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = ["About", "Services", "Doctors", "Blog", "Contact"];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative font-sans bg-[#f0f8ff] text-gray-800 overflow-x-hidden">
      {/* Background blobs */}
      <div className="relative inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00bcd4]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-[#00bcd4]/15 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4">

        {/* NAVBAR */}
        <nav className="relative z-50 bg-white/80 backdrop-blur-md shadow-sm top-0">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-bold text-[#00bcd4]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00bcd4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Medilink
            </div>
            <ul className="hidden md:flex gap-8 text-gray-600 font-medium">
              {NAV_LINKS.map(l => (
                <li key={l} className="hover:text-[#00bcd4] cursor-pointer transition-colors">{l}</li>
              ))}
            </ul>
            <button className="hidden md:block bg-[#00bcd4] text-black px-5 py-2 rounded-full font-semibold hover:bg-[#0097a7] transition-colors shadow">
              <Link to="/signup" style={{ textDecoration: 'none', color: 'inherit' }}>
                Appointment
              </Link>
            </button>
            <button className="md:hidden text-[#d7e6e8]" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {menuOpen && (
            <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map(l => <a key={l} className="text-gray-600 hover:text-[#00bcd4]" href="#">{l}</a>)}
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button className="bg-[#60a7b1] text-gray-700 px-5 py-2 rounded-full font-semibold w-fit">Appointment</button>
              </Link>
            </div>
          )}
        </nav>

        {/* HERO */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="text-[#00bcd4] font-semibold uppercase tracking-widest text-sm mb-3">Medical</p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
              Healthcare_01<br />Solutions
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              We provide the best medical care experience. Find doctors, schedule appointments, and manage your health all in one place.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-[#00bcd4] to-[#0097a7] rounded-[40%_60%_60%_40%/50%_40%_60%_50%] flex items-center justify-center shadow-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop"
                alt="Doctors"
                className="w-full h-full object-cover opacity-90 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 bg-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-[#00bcd4]/20 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" fill="#00bcd4" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 14H11v-4H7v-2h4V6h2v4h4v2h-4v4z" /></svg>
                </div>
                <span className="text-sm font-bold text-gray-700">+500 Doctors</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK INFO CARDS */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#fffbfb] text-gray-700 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" fill="#00bcd4" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>
                <span className="font-bold text-sm">Opening Hours</span>
              </div>
              <p className="text-sm opacity-90">Mon–Fri: 8am – 8pm</p>
              <p className="text-sm opacity-90">Sat–Sun: 9am – 5pm</p>
              <button className="mt-3 bg-white/20 hover:bg-white/30 text-gray-700 text-xs px-4 py-1.5 rounded-full transition-colors">Info</button>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#00bcd4]/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" fill="#00bcd4" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" /></svg>
                </div>
                <span className="font-bold text-sm text-gray-700">Appointment</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Book your visit with our specialists quickly and easily.</p>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button className="bg-[#00bcd4] text-gray text-xs px-4 py-1.5 rounded-full hover:bg-[#0097a7] transition-colors">Request</button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#00bcd4]/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" fill="#00bcd4" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                </div>
                <span className="font-bold text-sm text-gray-700">Find Doctors</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Search and connect with top certified healthcare professionals.</p>
              <button className="bg-[#00bcd4] text-gray-700 text-xs px-4 py-1.5 rounded-full hover:bg-[#0097a7] transition-colors">Doctors</button>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#00bcd4]/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" fill="#00bcd4" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg>
                </div>
                <span className="font-bold text-sm text-gray-700">Find Locations</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Locate nearby clinics and hospitals in your area.</p>
              <button className="bg-[#00bcd4] text-gray-700 text-xs px-4 py-1.5 rounded-full hover:bg-[#0097a7] transition-colors">Locations</button>
            </div>
          </div>
        </section>

        {/* OUR MEDICAL SERVICES */}
        <section className="relative z-10 bg-white py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#00bcd4] font-semibold uppercase tracking-widest text-sm mb-2">Service</p>
              <h2 className="text-4xl font-extrabold text-gray-900">Our Medical Services</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 flex justify-center relative">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/20 to-[#00bcd4]/5 rounded-full" />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/6614/6614117.png"
                    alt="Medical"
                    className="w-64 h-64 object-cover rounded-full absolute top-4 left-4 shadow-xl"
                  />
                  {["Eye Care", "Cardiology", "Medicine", "Dental", "Orthopedic"].map((s, i) => {
                    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                    const x = 50 + 45 * Math.cos(angle);
                    const y = 50 + 45 * Math.sin(angle);
                    return (
                      <div
                        key={s}
                        className="absolute bg-white shadow-md rounded-full px-3 py-1 text-xs font-semibold text-[#00bcd4] border border-[#00bcd4]/20 whitespace-nowrap"
                        style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
                      >
                        {s}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Dental Care Service</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Our dental care team provides comprehensive oral health services including routine checkups, cosmetic dentistry, orthodontics, and emergency dental care. We use the latest technology to ensure your smile is at its best.
                </p>
                <button className="bg-[#00bcd4] text-gray-700 px-6 py-2.5 rounded-full font-semibold hover:bg-[#0097a7] transition-colors shadow">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* OUR SPECIALITY */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#00bcd4] font-semibold uppercase tracking-widest text-sm mb-2">Features</p>
              <h2 className="text-4xl font-extrabold text-gray-900">Our Speciality</h2>
            </div>
            <div className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold">Online Appointment</h3>
                </div>
                <p className="opacity-90 mb-6 leading-relaxed">
                  Schedule your medical appointments online 24/7. Choose your preferred doctor, time slot, and get instant confirmation — all from the comfort of your home.
                </p>
                <button className="bg-white text-[#00bcd4] px-6 py-2.5 rounded-full font-bold hover:bg-gray-50 transition-colors shadow">
                  Learn More
                </button>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop"
                    alt="Online Appointment"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APPOINTMENT SCHEDULES */}
        <section className="relative z-10 bg-white py-20 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-[#00bcd4] font-semibold uppercase tracking-widest text-sm mb-3">Time Table</p>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-5">Appointment<br />Schedules</h2>
              <p className="text-gray-500 mb-8 leading-relaxed max-w-md">
                View our comprehensive appointment timetable and find the perfect slot that fits your schedule. Our streamlined booking system ensures you never have to wait long.
              </p>
              <Link to="/signup">
                <button className="bg-[#00bcd4] text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-[#0097a7] transition-colors shadow-lg">
                  Schedule
                </button>
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-[#00bcd4] to-[#0097a7] rounded-3xl shadow-2xl p-4 transform rotate-3">
                  <div className="bg-white/20 rounded-xl p-2 mb-2">
                    <p className="text-white font-bold text-center text-sm">February 2026</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <div key={i} className="text-white/70 text-xs text-center font-semibold">{d}</div>
                    ))}
                    {Array.from({ length: 28 }, (_, i) => (
                      <div key={i} className={`text-xs text-center py-1 rounded-lg font-medium ${i + 1 === 16 ? "bg-white text-[#00bcd4]" : "text-white"
                        }`}>{i + 1}</div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-[#00bcd4]">24</p>
                    <p className="text-xs text-gray-500 font-semibold">Slots Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR DOCTORS */}
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#00bcd4] font-semibold uppercase tracking-widest text-sm mb-2">Team</p>
              <h2 className="text-4xl font-extrabold text-gray-900">Our Doctors</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {[
                { name: "Dr. Sarah Johnson", role: "Cardiologist", img: "https://as1.ftcdn.net/v2/jpg/01/03/94/32/1000_F_103943265_Bc2gEerF75zmw7UziBL1FLkS2vBEnFNo.jpg" },
                { name: "Dr. Michael Chen", role: "Neurologist", img: "https://tse4.mm.bing.net/th/id/OIP.-02-txfc-2WE4rXwkDSV9wAAAA?w=200&h=200&rs=1&pid=ImgDetMain&o=7&rm=3" },
              ].map((doc) => (
                <div key={doc.name} className="bg-white rounded-3xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow group border border-gray-100">
                  <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <img src={doc.img} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{doc.name}</h3>
                  <p className="text-[#00bcd4] font-semibold text-sm mt-1">{doc.role}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    {["linkedin", "twitter", "mail"].map(s => (
                      <div key={s} className="w-8 h-8 bg-[#00bcd4]/10 rounded-full flex items-center justify-center hover:bg-[#00bcd4]/20 cursor-pointer transition-colors">
                        <div className="w-3 h-3 bg-[#00bcd4] rounded-sm opacity-70" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button className="border-2 border-[#00bcd4] text-[#00bcd4] px-8 py-3 rounded-full font-bold hover:bg-[#00bcd4] hover:text-white transition-colors">
                See All Doctors
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 bg-[#0097a7] text-white py-10 px-6 mt-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M12 8v8M8 12h8" />
              </svg>
              Medilink
            </div>
            <p className="text-white/70 text-sm text-center">
              © 2026 MedCare. All rights reserved. Your health, our priority.
            </p>
            <div className="flex gap-6 text-sm text-white/80">
              {["Privacy", "Terms", "Contact"].map(l => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
