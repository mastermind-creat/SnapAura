
import React from 'react';
import { Copy, Share2, MessageCircle, FileText, ArrowRight } from './Icons';
import { useNeural } from './NeuralContext';
import { showToast } from './Toast';

interface SmartCardProps {
  title: string;
  subtitle?: string;
  content: string | React.ReactNode;
  icon?: any;
  className?: string;
  actions?: 'text' | 'image' | 'none';
  rawText?: string; // For copying/forwarding
}

const SmartCard: React.FC<SmartCardProps> = ({ title, subtitle, content, icon: Icon, className, actions = 'text', rawText }) => {
  const { dispatchIntent } = useNeural();
  const textPayload = rawText || (typeof content === 'string' ? content : '');

  const handleCopy = () => {
      navigator.clipboard.writeText(textPayload);
      showToast("Copied to clipboard", "success");
  };

  const handleToChat = () => {
      dispatchIntent({ type: 'SEND_TO_CHAT', payload: { text: `Analyze this: ${textPayload}` } });
  };

  const handleToNotes = () => {
      dispatchIntent({ type: 'SEND_TO_NOTES', payload: { text: textPayload, title: title } });
  };

  return (
    <div className={`bg-[#292d3e] shadow-neu rounded-2xl p-5 relative group overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
            {Icon && (
                <div className="p-2 bg-[#292d3e] shadow-neu-pressed rounded-full text-primary">
                    <Icon size={18} />
                </div>
            )}
            <div>
                <h3 className="font-bold text-gray-200 text-sm leading-tight">{title}</h3>
                {subtitle && <p className="text-[10px] text-gray-500 uppercase tracking-wider">{subtitle}</p>}
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-sm text-gray-300 leading-relaxed font-medium">
        {content}
      </div>

      {/* Smart Action Dock (Hover/Active) */}
      {actions !== 'none' && (
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 justify-end opacity-80">
              <button onClick={handleCopy} className="p-2 hover:text-white text-gray-500 transition-colors" title="Copy">
                  <Copy size={16} />
              </button>
              <button onClick={handleToChat} className="p-2 hover:text-blue-400 text-gray-500 transition-colors" title="Discuss in Chat">
                  <MessageCircle size={16} />
              </button>
              <button onClick={handleToNotes} className="p-2 hover:text-yellow-400 text-gray-500 transition-colors" title="Save to Notes">
                  <FileText size={16} />
              </button>
          </div>
      )}
      
      {/* Glow Effect */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
    </div>
  );
};

export default SmartCard;
