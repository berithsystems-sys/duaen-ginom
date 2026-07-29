import React, { useState } from 'react';
import {
  Wand2,
  X,
  Play,
  Plus,
  Trash2,
  ArrowRight,
  Monitor,
  Smartphone,
  Video,
} from 'lucide-react';
import { TourPreset, TourStep } from '../types';
import { SAMPLE_TOURS } from '../data/sampleTours';

interface AutomationTourPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTourAndRecord: (tour: TourPreset) => void;
}

export const AutomationTourPanel: React.FC<AutomationTourPanelProps> = ({
  isOpen,
  onClose,
  onRunTourAndRecord,
}) => {
  const [selectedTour, setSelectedTour] = useState<TourPreset>(SAMPLE_TOURS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-800/80 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Automated Video Tutorial Builder</h2>
              <p className="text-[11px] text-slate-400">Run hands-free cursor walkthroughs across PC & Mobile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tour Presets & Steps */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200 text-xs">
          <div>
            <label className="font-bold text-slate-300 text-xs mb-2 block">Choose Tour Preset</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_TOURS.map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => setSelectedTour(tour)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTour.id === tour.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-100">{tour.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{tour.description}</div>
                  <div className="mt-2 text-[10px] text-indigo-400 font-semibold">{tour.steps.length} Automated Steps</div>
                </button>
              ))}
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-slate-300 flex items-center justify-between">
              <span>Automated Sequence Steps</span>
              <span className="text-[10px] text-slate-500">Smooth Bezier Path Curve</span>
            </div>
            <div className="space-y-1.5 divide-y divide-slate-800/60">
              {selectedTour.steps.map((step, idx) => (
                <div key={step.id} className="pt-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-400">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-200">{step.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span className="flex items-center px-1.5 py-0.5 rounded bg-slate-800">
                      {step.viewport === 'desktop' ? <Monitor className="w-3 h-3 mr-1 text-blue-400" /> : <Smartphone className="w-3 h-3 mr-1 text-emerald-400" />}
                      {step.viewport.toUpperCase()}
                    </span>
                    <span>{step.durationMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/80 px-5 py-3 border-t border-slate-700/80 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium">
            Cancel
          </button>
          <button
            onClick={() => {
              onRunTourAndRecord(selectedTour);
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center space-x-2"
          >
            <Video className="w-4 h-4" />
            <span>START AUTO-RECORD TOUR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
