import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Image, AlertTriangle, FileText, Maximize, HardDrive, Calendar, CheckCircle, Type, Loader2, Copy, Check } from 'lucide-react';

const Analysis = () => {
  const location = useLocation();
  const analysisData = location.state?.analysisData;
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState(null);
  const [ocrError, setOcrError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!analysisData) {
    return <Navigate to="/" replace />;
  }

  const { saved_filename, ela_filename, ai_result, metadata, created_at } = analysisData;
  const originalImageUrl = `http://localhost:5000/api/analysis/image/${saved_filename}`;
  const elaImageUrl = ela_filename ? `http://localhost:5000/api/analysis/ela/${ela_filename}` : null;
  
  const isError = ai_result?.label === 'error';
  const isAI = ai_result?.label === 'artificial';
  const confidenceScore = ai_result?.confidence ? ai_result.confidence.toFixed(1) : 0;
  
  let dateObj = new Date(created_at);
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date(); // Fallback for old database records
  }
  const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleExtractText = async () => {
    if (!originalImageUrl) return;
    setIsExtracting(true);
    setOcrError(null);
    setExtractedText(null);

    try {
      const response = await fetch(originalImageUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');

      const uploadResponse = await fetch('http://localhost:5000/api/ocr/extract-text', {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(result.message || 'OCR extraction failed');
      }

      setExtractedText(result.text || "No text detected in image.");
      setIsCopied(false);
    } catch (err) {
      console.error("OCR Error:", err);
      setOcrError(err.message || 'Failed to extract text. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="w-full min-h-full p-10 bg-background text-primaryText">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Image Analysis</h1>
        <p className="text-secondaryText">AI-powered forensic analysis results</p>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Original Image */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Original Image</h3>
          <div className="w-full aspect-square bg-sidebar rounded-2xl flex items-center justify-center overflow-hidden">
            <img src={originalImageUrl} alt="Original" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* ELA Forensic Heatmap */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col">
          <h3 className="text-lg font-semibold mb-4">ELA Forensic Heatmap</h3>
          <div className="w-full aspect-square bg-black rounded-2xl flex items-center justify-center overflow-hidden">
            {elaImageUrl ? (
              <img src={elaImageUrl} alt="ELA Heatmap" className="w-full h-full object-cover" />
            ) : (
              <p className="text-white/50 text-sm">ELA generation failed</p>
            )}
          </div>
        </div>

        {/* Detection Result */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Detection Result</h3>
          
          <div className="flex items-center gap-4 mb-10">
            {isError ? (
              <AlertTriangle size={48} className="text-orange-500" strokeWidth={1.5} />
            ) : isAI ? (
              <AlertTriangle size={48} className="text-red-500" strokeWidth={1.5} />
            ) : (
              <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
            )}
            <div>
              <h2 className="text-2xl font-bold text-primaryText">
                {isError ? 'Analysis Failed' : isAI ? 'AI Generated' : 'Authentic'}
              </h2>
              <p className="text-sm text-secondaryText">
                {isError ? 'AI model could not process image' : isAI ? 'Synthetic image detected' : 'Likely human-made'}
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-secondaryText">Confidence Score</span>
              <span className={`text-3xl font-bold ${isError ? 'text-orange-500' : isAI ? 'text-red-500' : 'text-green-500'}`}>
                {confidenceScore}%
              </span>
            </div>
            <div className="w-full h-3 bg-sidebar rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isError ? 'bg-orange-500' : isAI ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Text Extraction Section */}
      <div className="bg-card rounded-3xl p-8 shadow-sm border border-border mb-8">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="text-xl font-bold flex items-center gap-2 mb-1"><Type size={22} className="text-accent" /> Optical Character Recognition</h3>
             <p className="text-sm text-secondaryText">Extract text and typography directly from the analyzed image</p>
           </div>
           <button 
              onClick={handleExtractText}
              disabled={isExtracting}
              className="py-3 px-8 bg-accent text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:bg-[#9c7849] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/20 active:scale-95"
            >
              {isExtracting ? <Loader2 size={20} className="animate-spin" /> : <Type size={20} />}
              {isExtracting ? 'Extracting...' : 'Extract Text'}
            </button>
        </div>
        
        {ocrError && (
          <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
            <AlertTriangle size={18} /> {ocrError}
          </div>
        )}
        
        {extractedText && (
          <div className="bg-sidebar rounded-2xl p-6 border border-border relative mt-4 shadow-inner">
             <button 
                onClick={handleCopy}
                className={`absolute top-4 right-4 px-4 py-2 rounded-lg transition-all shadow-sm border flex items-center gap-2 ${
                  isCopied ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-card hover:bg-black/5 dark:hover:bg-white/5 border-border text-primaryText'
                }`}
                title={isCopied ? "Copied!" : "Copy Text"}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />} 
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {isCopied ? 'Copied' : 'Copy'}
                </span>
             </button>
             <div className="bg-card/60 dark:bg-black/40 p-6 rounded-xl border border-white/50 dark:border-black/50 mt-8 min-h-[100px]">
               <p className="text-[15px] whitespace-pre-wrap font-mono text-primaryText leading-relaxed">
                 {extractedText}
               </p>
             </div>
          </div>
        )}
      </div>

      {/* Image Metadata */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-8">
        <h3 className="text-lg font-semibold mb-6">Image Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 text-secondaryText mb-2 text-sm">
              <FileText size={16} /> File Format
            </div>
            <p className="font-semibold text-lg">{metadata?.format || 'Unknown'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-secondaryText mb-2 text-sm">
              <Maximize size={16} /> Dimensions
            </div>
            <p className="font-semibold text-lg">{metadata?.dimensions || 'Unknown'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-secondaryText mb-2 text-sm">
              <HardDrive size={16} /> File Size
            </div>
            <p className="font-semibold text-lg">
              {metadata?.size_bytes ? (metadata.size_bytes / 1024).toFixed(1) + ' KB' : 'Unknown'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-secondaryText mb-2 text-sm">
              <Calendar size={16} /> Analyzed
            </div>
            <p className="font-semibold text-lg">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Detailed Metadata Section */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-8">
        <h3 className="text-lg font-semibold mb-6">Detailed Metadata Analysis</h3>
        
        {/* Red Flags / Detections */}
        {metadata?.analysis?.red_flags && metadata.analysis.red_flags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-red-500 flex items-center gap-2 mb-3">
              <AlertTriangle size={18} /> Metadata Red Flags
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondaryText bg-sidebar p-4 rounded-xl">
              {metadata.analysis.red_flags.map((flag, idx) => (
                <li key={idx} className="text-red-600">{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* EXIF Data */}
        {metadata?.exif && Object.keys(metadata.exif).length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">EXIF Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(metadata.exif).map(([key, value]) => (
                <div key={key} className="bg-sidebar p-3 rounded-xl flex flex-col">
                  <span className="text-xs text-secondaryText uppercase font-semibold">{key}</span>
                  <span className="text-sm truncate" title={String(value)}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Info */}
        {metadata?.raw_info && Object.keys(metadata.raw_info).length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-3">Raw Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(metadata.raw_info).map(([key, value]) => (
                <div key={key} className="bg-sidebar p-3 rounded-xl flex flex-col">
                  <span className="text-xs text-secondaryText uppercase font-semibold">{key}</span>
                  <span className="text-sm truncate" title={String(value)}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!metadata?.exif || Object.keys(metadata.exif).length === 0) && (!metadata?.raw_info || Object.keys(metadata.raw_info).length === 0) && (
          <p className="text-sm text-secondaryText bg-sidebar p-4 rounded-xl">No extended metadata (EXIF/Raw Info) found in this image. This could mean the metadata was stripped before upload.</p>
        )}
      </div>

    </div>
  );
};

export default Analysis;
