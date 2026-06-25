import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, KeyRound, ChevronLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { verifyOtpAndLogin } = useContext(AuthContext);
  
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/auth/request-otp', { email });
      setSuccessMsg(response.data.message || '6-digit code sent to your email.');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await verifyOtpAndLogin(email, otp);
    
    setIsLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="w-full h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md rounded-3xl p-10 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20 shadow-inner">
            <ShieldCheck size={32} className="text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-primaryText mb-2">
            {step === 'email' ? 'Welcome' : 'Enter Code'}
          </h2>
          <p className="text-secondaryText">
            {step === 'email' 
              ? 'Enter your email to sign in or create an account' 
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && step === 'otp' && !error && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
            <ShieldCheck size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-5 animate-fade-in">
            <div className="relative">
              <label className="block text-sm font-medium text-primaryText mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryText" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@realifylens.com"
                  className="w-full bg-sidebar border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-primaryText"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !email}
              className={`w-full bg-accent hover:bg-[#9c7849] text-white py-4 rounded-xl font-medium shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-4 ${isLoading || !email ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              {isLoading ? 'Sending Code...' : 'Continue with Email'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 animate-fade-in">
            <div className="relative">
              <label className="block text-sm font-medium text-primaryText mb-1.5 ml-1">6-Digit Code</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryText" size={20} />
                <input 
                  type="text" 
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                  placeholder="123456"
                  className="w-full bg-sidebar border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-primaryText text-center tracking-[0.5em] text-xl font-bold"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || otp.length !== 6}
              className={`w-full bg-accent hover:bg-[#9c7849] text-white py-4 rounded-xl font-medium shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-4 ${(isLoading || otp.length !== 6) ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
              {!isLoading && <ShieldCheck size={18} />}
            </button>

            <button 
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setError('');
                setSuccessMsg('');
              }}
              className="mt-2 text-secondaryText hover:text-primaryText transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <ChevronLeft size={16} /> Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
