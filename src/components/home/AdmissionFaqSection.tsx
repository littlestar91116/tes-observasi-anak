import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface AdmissionFaqSectionProps {
  faqList: FaqItem[];
  onRegisterClick: () => void;
}

export const AdmissionFaqSection: React.FC<AdmissionFaqSectionProps> = ({ faqList, onRegisterClick }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="alur-dan-faq" className="py-20 bg-gradient-to-b from-[#FDFBF7] to-white border-t border-amber-100/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-600">
            Pusat Informasi & Bantuan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Menemukan jawaban seputar pendaftaran, persiapan observasi anak berkebutuhan khusus, dan komitmen layanan kami.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqList.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base sm:text-lg hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{item.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-amber-50/20">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-base">Masih memiliki pertanyaan khusus seputar anak Anda?</h4>
            <p className="text-xs sm:text-sm text-slate-600">Tim kami siap diajak berdiskusi santai terlebih dahulu tanpa komitmen awal.</p>
          </div>
          <button
            onClick={onRegisterClick}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Daftar Observasi Sekarang
          </button>
        </div>

      </div>
    </section>
  );
};
