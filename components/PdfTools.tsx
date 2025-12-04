
import React, { useState, useRef } from 'react';
import { FileText, ImagePlus, Download, RefreshCw, FileDigit, Scissors, Minimize } from './Icons';
import { showToast } from './Toast';

// Access jspdf from global
declare const jspdf: any;

const PdfTools: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach((file: any) => {
                const reader = new FileReader();
                reader.onload = () => setImages(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const generatePdf = () => {
        if(images.length === 0) return;
        setIsGenerating(true);
        
        try {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            
            let width = doc.internal.pageSize.getWidth();
            let height = doc.internal.pageSize.getHeight();

            images.forEach((img, index) => {
                if (index > 0) doc.addPage();
                doc.addImage(img, 'JPEG', 0, 0, width, height, undefined, 'FAST');
            });

            doc.save('snapaura-doc.pdf');
            showToast("PDF Downloaded!", "success");
        } catch(e) {
            console.error(e);
            showToast("Error creating PDF", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-red-400"><FileText size={24} /></div>
                    <h2 className="text-xl font-bold text-gray-200">PDF Tools</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => fileRef.current?.click()} className="p-5 bg-[#292d3e] shadow-neu rounded-2xl active:shadow-neu-pressed transition-all text-left group">
                        <ImagePlus className="text-red-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
                        <h4 className="font-bold text-gray-200 text-sm">Image to PDF</h4>
                        <p className="text-[10px] text-gray-500">Combine photos</p>
                    </button>
                    <div className="p-5 bg-[#292d3e] shadow-neu rounded-2xl opacity-50 cursor-not-allowed text-left">
                        <FileDigit className="text-gray-500 mb-3" size={24} />
                        <h4 className="font-bold text-gray-400 text-sm">PDF to Text</h4>
                        <p className="text-[10px] text-gray-600">Coming Soon</p>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-neu-pressed bg-[#1e212d] group">
                                    <img src={img} className="w-full h-full object-cover opacity-80" alt={`Page ${i+1}`} />
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white z-10 pointer-events-none">{i+1}</div>
                                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                        <Minimize size={10} className="text-white"/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={generatePdf} 
                            disabled={isGenerating}
                            className="w-full bg-[#292d3e] text-red-400 shadow-neu hover:text-red-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:shadow-neu-pressed"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" /> : <Download />} Download PDF
                        </button>
                        <button onClick={() => setImages([])} className="w-full text-xs text-gray-500 hover:text-gray-300 py-2">Clear All</button>
                    </div>
                )}
            </div>
            <input type="file" multiple ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
    );
};

export default PdfTools;
