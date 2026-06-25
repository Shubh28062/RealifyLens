import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Image as ImageIcon, Zap, ArrowRight, Shield, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-all duration-300 border border-border group">
    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
      <Icon size={28} className="text-accent" />
    </div>
    <h3 className="text-xl font-bold text-primaryText mb-3">{title}</h3>
    <p className="text-secondaryText leading-relaxed">{description}</p>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useContext(AuthContext);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden selection:bg-accent/30 text-primaryText">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-accent font-bold text-2xl tracking-wide cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shadow-inner">
              <ShieldCheck size={24} className="text-accent" />
            </div>
            RealifyLens
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="text-secondaryText hover:text-accent transition-colors p-2">
              {isDarkMode ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            <button 
              onClick={handleCTA}
              className="bg-primaryText text-background hover:scale-105 transition-transform px-6 py-2.5 rounded-xl font-semibold shadow-lg"
            >
              {user ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-8 animate-fade-in-up">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
          </span>
          Next-Generation Deepfake Detection
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold text-primaryText tracking-tight mb-8 leading-[1.1] max-w-4xl">
          Uncover the truth behind <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#d4a86a]">every single pixel.</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-secondaryText max-w-2xl mb-12 leading-relaxed">
          Upload any image and let our military-grade AI models instantly detect manipulations, synthetic generations, and hidden metadata anomalies.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={handleCTA}
            className="bg-accent hover:bg-[#9c7849] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
          >
            Start Analyzing Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="glass-panel px-8 py-4 rounded-2xl font-bold text-lg text-primaryText hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            How it works
          </button>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="border-y border-border bg-sidebar/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 text-secondaryText font-medium text-sm md:text-base">
          <div className="flex items-center gap-2"><Shield size={20} /> Bank-Level Security</div>
          <div className="flex items-center gap-2"><Zap size={20} /> Sub-second Analysis</div>
          <div className="flex items-center gap-2"><Activity size={20} /> 99.9% Accuracy Model</div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Enterprise-Grade Forensics</h2>
          <p className="text-secondaryText max-w-2xl mx-auto text-lg">
            Our platform combines three powerful analysis engines to provide definitive proof of an image's authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Search}
            title="Error Level Analysis"
            description="We compress the image and compare it against itself. Artificial additions stand out brightly like a sore thumb on our heatmaps."
          />
          <FeatureCard 
            icon={ImageIcon}
            title="Diffusion Detection"
            description="Our neural networks are trained to spot the microscopic artifacts left behind by Midjourney, DALL-E, and Stable Diffusion."
          />
          <FeatureCard 
            icon={ShieldCheck}
            title="Metadata Extraction"
            description="We strip the EXIF data and raw file headers to reveal exactly what software or camera originally created the file."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="glass-panel rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-accent/20">
          <div className="absolute inset-0 bg-accent/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to find the truth?</h2>
            <p className="text-xl text-secondaryText mb-10 max-w-xl mx-auto">
              Join thousands of journalists, researchers, and professionals who trust RealifyLens.
            </p>
            <button 
              onClick={handleCTA}
              className="bg-primaryText text-background px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-transform"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-sidebar/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-accent font-bold text-xl">
            <ShieldCheck size={20} /> RealifyLens
          </div>
          <p className="text-secondaryText text-sm">
            © {new Date().getFullYear()} RealifyLens AI Forensics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
