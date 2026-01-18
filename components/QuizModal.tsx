import React, { useState, useEffect } from 'react';
import { generateQuiz, QuizQuestion } from '../services/zhipuService';
import { Memory } from '../types';
import { X, Trophy, AlertCircle, Loader2, Check, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  memories: Memory[];
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ memories, onClose }) => {
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const q = await generateQuiz(memories);
      if (mounted) {
        setQuiz(q);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [memories]);

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
  };

  const isCorrect = selectedOption === quiz?.correctIndex;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative animate-fadeInUp">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">纪念日大挑战</h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">正在从回忆中提取考题...</p>
            </div>
          ) : !quiz ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂时无法生成问答。</p>
            </div>
          ) : (
            <div>
              <p className="text-lg text-slate-800 font-medium mb-8 leading-relaxed">
                {quiz.question}
              </p>

              <div className="space-y-3">
                {quiz.options.map((option, idx) => {
                  let btnClass = "w-full p-4 rounded-xl text-left border-2 transition-all duration-200 flex items-center justify-between group ";
                  
                  if (showResult) {
                    if (idx === quiz.correctIndex) {
                      btnClass += "border-green-500 bg-green-50 text-green-700";
                    } else if (idx === selectedOption) {
                      btnClass += "border-red-500 bg-red-50 text-red-700";
                    } else {
                      btnClass += "border-slate-100 text-slate-400 opacity-50";
                    }
                  } else {
                    btnClass += "border-slate-100 hover:border-rose-200 hover:bg-rose-50 text-slate-700";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={showResult}
                      className={btnClass}
                    >
                      <span className="font-medium">{option}</span>
                      {showResult && idx === quiz.correctIndex && <Check className="w-5 h-5 text-green-600" />}
                      {!showResult && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`mt-6 p-4 rounded-xl text-sm leading-relaxed ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <p className="font-bold mb-1">{isCorrect ? '回答正确!' : '哎呀，错了!'}</p>
                  {quiz.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
