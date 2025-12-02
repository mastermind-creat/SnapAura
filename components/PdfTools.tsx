
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
        <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-red-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500/20 p-3 rounded-full text-red-400"><FileText size={24} /></div>
                    <h2 className="text-xl font-bold text-white">PDF Tools</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => fileRef.current?.click()} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-left">
                        <ImagePlus className="text-red-400 mb-2" size={24} />
                        <h4 className="font-bold text-white text-sm">Image to PDF</h4>
                        <p className="text-[10px] text-gray-500">Combine photos</p>
                    </button>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 opacity-50 cursor-not-allowed text-left">
                        <FileDigit className="text-gray-500 mb-2" size={24} />
                        <h4 className="font-bold text-gray-400 text-sm">PDF to Text</h4>
                        <p className="text-[10px] text-gray-600">Coming Soon</p>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-white/20 group">
                                    <img src={img} className="w-full h-full object-cover" alt={`Page ${i+1}`} />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Minimize size={10} className="text-white"/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={generatePdf} 
                            disabled={isGenerating}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" /> : <Download />} Download PDF
                        </button>
                        <button onClick={() => setImages([])} className="w-full text-xs text-red-400 hover:text-red-300">Clear All</button>
                    </div>
                )}
            </div>
            <input type="file" multiple ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
    );
};

export default PdfTools;
