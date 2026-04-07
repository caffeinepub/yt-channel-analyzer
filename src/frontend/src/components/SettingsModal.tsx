import { Info, X, Youtube } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  onSave?: (key: string) => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ocid="settings.modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        aria-label="Close settings"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#101B2B] shadow-2xl"
        aria-modal="true"
        aria-label="About YT Channel Analyzer"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E11D2E]/15">
              <Info size={18} className="text-[#E11D2E]" />
            </div>
            <h2 className="text-base font-semibold text-[#E5E7EB]">About</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-white/8 hover:text-[#E5E7EB]"
            aria-label="Close dialog"
            data-ocid="settings.close_button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E11D2E]">
              <Youtube size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-[#E5E7EB]">
              YT Channel Analyzer
            </h3>
            <p className="text-sm leading-relaxed text-[#9CA3AF]">
              Analyze any YouTube channel instantly. Get AI-powered growth tips,
              video performance stats, SEO insights, and a customized content
              plan — all powered by real YouTube data.
            </p>
          </div>

          <div className="rounded-xl border border-white/6 bg-white/3 p-4 text-center">
            <p className="text-xs text-[#6B7280]">
              Powered by YouTube Data API v3
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center border-t border-white/8 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#E11D2E] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#C0172A]"
            data-ocid="settings.save_button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
