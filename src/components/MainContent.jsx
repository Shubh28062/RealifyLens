import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Layers, Cpu, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
      <Icon size={24} className="text-accent" />
    </div>
    <h3 className="text-lg font-semibold text-primaryText mb-2">{title}</h3>
    <p className="text-sm text-secondaryText leading-relaxed">{description}</p>
  </div>
);

const MainContent = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('/analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Navigate to Analysis page with the results
      navigate('/dashboard/analysis', { state: { analysisData: response.data.analysis } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to analyze the image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full p-6 md:p-12 flex flex-col items-center">
      
      {/* Header Section */}
      <div className="max-w-3xl w-full text-center mt-4 md:mt-8 mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          AI-Powered Forensic Analysis
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-primaryText mb-6 tracking-tight leading-tight">
          Uncover the truth behind <br className="hidden md:block"/> <span className="text-accent">every pixel</span>
        </h1>
        <p className="text-lg text-secondaryText max-w-xl mx-auto">
          Upload any image and let our advanced AI models detect manipulations, AI generations, and deepfakes with military-grade precision.
        </p>
      </div>

      {/* Dropzone Area */}
      <div 
        onClick={() => !isUploading && fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-3xl glass-panel border-2 border-dashed ${isDragging ? 'border-accent bg-accent/10' : 'border-accent/30'} rounded-3xl p-12 text-center transition-all hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/10 group ${isUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'} mb-6`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/jpeg, image/png, image/webp" 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-accent animate-spin mb-6" />
            <h3 className="text-xl font-semibold text-primaryText mb-2">Analyzing Image...</h3>
            <p className="text-secondaryText">Running AI models and ELA extraction. This may take a moment.</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-2xl bg-card shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud size={32} className="text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-primaryText mb-2">Drag & drop an image here</h3>
            <p className="text-secondaryText mb-8">Supports JPG, PNG, WEBP up to 50MB</p>
            
            <button className="bg-accent hover:bg-[#9c7849] text-white px-8 py-3.5 rounded-xl font-medium shadow-lg shadow-accent/20 transition-all active:scale-95">
              Select Image to Analyze
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mb-10 text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-xl border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      {/* Features Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <FeatureCard 
          icon={Layers}
          title="Error Level Analysis"
          description="Detects localized manipulations by analyzing compression artifacts across different regions of the image."
        />
        <FeatureCard 
          icon={Cpu}
          title="AI Generation Detection"
          description="Identifies artifacts left by modern diffusion models like Midjourney, DALL-E, and Stable Diffusion."
        />
        <FeatureCard 
          icon={CheckCircle}
          title="Explainable Results"
          description="Get detailed heatmaps and confidence scores to understand exactly why an image was flagged."
        />
      </div>

    </div>
  );
};

export default MainContent;
