import React, { useState, useRef, useEffect } from 'react';
import { LetterLayoutConfig } from '../../types/inventory';
import {
  SlidersHorizontal,
  RotateCcw,
  Type,
  AlignJustify,
  Maximize2,
  Table2,
  PenTool,
  MousePointerClick,
  Minus,
  Plus,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface WordFontOption {
  id: string;
  label: string;
  value: string;
  category: 'Serif' | 'Sans-Serif' | 'Monospace';
  note?: string;
}

export const WORD_FONT_OPTIONS: WordFontOption[] = [
  {
    id: 'times-new-roman',
    label: 'Times New Roman',
    value: "'Times New Roman', 'Tinos', Times, serif",
    category: 'Serif',
    note: 'Standar Dinas',
  },
  {
    id: 'calibri',
    label: 'Calibri',
    value: "Calibri, 'Carlito', 'Segoe UI', Arial, sans-serif",
    category: 'Sans-Serif',
    note: 'Default Word',
  },
  {
    id: 'arial',
    label: 'Arial',
    value: "Arial, 'Arimo', Helvetica, sans-serif",
    category: 'Sans-Serif',
    note: 'Resmi Modern',
  },
  {
    id: 'cambria',
    label: 'Cambria',
    value: "Cambria, 'Caladea', Georgia, serif",
    category: 'Serif',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    value: 'Georgia, serif',
    category: 'Serif',
  },
  {
    id: 'garamond',
    label: 'Garamond',
    value: "Garamond, 'EB Garamond', Georgia, serif",
    category: 'Serif',
  },
  {
    id: 'tahoma',
    label: 'Tahoma',
    value: 'Tahoma, Verdana, sans-serif',
    category: 'Sans-Serif',
  },
  {
    id: 'verdana',
    label: 'Verdana',
    value: 'Verdana, Geneva, sans-serif',
    category: 'Sans-Serif',
  },
  {
    id: 'trebuchet',
    label: 'Trebuchet MS',
    value: "'Trebuchet MS', Helvetica, sans-serif",
    category: 'Sans-Serif',
  },
  {
    id: 'bookman',
    label: 'Bookman Old Style',
    value: "'Bookman Old Style', 'URW Bookman', Georgia, serif",
    category: 'Serif',
  },
  {
    id: 'century-gothic',
    label: 'Century Gothic',
    value: "'Century Gothic', Futura, Arial, sans-serif",
    category: 'Sans-Serif',
  },
  {
    id: 'courier-new',
    label: 'Courier New',
    value: "'Courier New', 'Cousine', Courier, monospace",
    category: 'Monospace',
  },
];

export const DEFAULT_LETTER_LAYOUT: LetterLayoutConfig = {
  fontFamily: WORD_FONT_OPTIONS[0].value,
  lineSpacing: 1.25,
  fontSize: 12,
  marginY: 20,
  marginX: 20,
  tablePaddingY: 8,
  sectionGap: 16,
  signatureHeight: 80,
};

export const normalizeLayoutConfig = (
  cfg?: Partial<LetterLayoutConfig> | null
): LetterLayoutConfig => ({
  fontFamily:
    typeof cfg?.fontFamily === 'string' && cfg.fontFamily.trim().length > 0
      ? cfg.fontFamily
      : DEFAULT_LETTER_LAYOUT.fontFamily,
  lineSpacing:
    typeof cfg?.lineSpacing === 'number' && cfg.lineSpacing >= 0.8 && cfg.lineSpacing <= 3
      ? cfg.lineSpacing
      : DEFAULT_LETTER_LAYOUT.lineSpacing,
  fontSize:
    typeof cfg?.fontSize === 'number' && cfg.fontSize >= 8 && cfg.fontSize <= 18
      ? cfg.fontSize
      : DEFAULT_LETTER_LAYOUT.fontSize,
  marginY:
    typeof cfg?.marginY === 'number' && cfg.marginY >= 5 && cfg.marginY <= 40
      ? cfg.marginY
      : DEFAULT_LETTER_LAYOUT.marginY,
  marginX:
    typeof cfg?.marginX === 'number' && cfg.marginX >= 5 && cfg.marginX <= 40
      ? cfg.marginX
      : DEFAULT_LETTER_LAYOUT.marginX,
  tablePaddingY:
    typeof cfg?.tablePaddingY === 'number' && cfg.tablePaddingY >= 2 && cfg.tablePaddingY <= 24
      ? cfg.tablePaddingY
      : DEFAULT_LETTER_LAYOUT.tablePaddingY,
  sectionGap:
    typeof cfg?.sectionGap === 'number' && cfg.sectionGap >= 4 && cfg.sectionGap <= 40
      ? cfg.sectionGap
      : DEFAULT_LETTER_LAYOUT.sectionGap,
  signatureHeight:
    typeof cfg?.signatureHeight === 'number' &&
    cfg.signatureHeight >= 24 &&
    cfg.signatureHeight <= 150
      ? cfg.signatureHeight
      : DEFAULT_LETTER_LAYOUT.signatureHeight,
});

export const getFontLabel = (fontFamily: string): string => {
  const exact = WORD_FONT_OPTIONS.find((f) => f.value === fontFamily);
  if (exact) return exact.label;
  const firstPart = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  return firstPart || 'Times New Roman';
};

interface LetterPreviewToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  layout: LetterLayoutConfig;
  onChangeLayout: (next: LetterLayoutConfig) => void;
  onResetLayout: () => void;
}

const LINE_SPACING_PRESETS = [1.0, 1.15, 1.25, 1.5, 1.75, 2.0];
const FONT_SIZE_PRESETS = [9, 10, 11, 12, 13, 14];
const MARGIN_PRESETS = [
  { label: 'Sempit', marginY: 12, marginX: 15 },
  { label: 'Standar', marginY: 20, marginX: 20 },
  { label: 'Lebar', marginY: 25, marginX: 25 },
];

export const LetterPreviewToolbar: React.FC<LetterPreviewToolbarProps> = ({
  isEditMode,
  onToggleEditMode,
  layout,
  onChangeLayout,
  onResetLayout,
}) => {
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontMenuOpen(false);
      }
    };
    if (isFontMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFontMenuOpen]);

  const updateField = <K extends keyof LetterLayoutConfig>(
    key: K,
    value: LetterLayoutConfig[K]
  ) => {
    onChangeLayout({
      ...layout,
      [key]: value,
    });
  };

  const stepLineSpacing = (delta: number) => {
    const next = Math.min(2.5, Math.max(0.9, Number((layout.lineSpacing + delta).toFixed(2))));
    updateField('lineSpacing', next);
  };

  const activeFontLabel = getFontLabel(layout.fontFamily);

  return (
    <div className="no-print space-y-2.5 mb-3">
      {/* Compact Mode Edit Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isEditMode
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isEditMode ? 'Mode Edit Aktif' : 'Mode Edit Pratinjau'}
            {isEditMode && <Check className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Quick Inline Summary Pills */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
            <span
              className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-700 truncate max-w-[140px]"
              style={{ fontFamily: layout.fontFamily }}
              title={`Font aktif: ${activeFontLabel}`}
            >
              {activeFontLabel}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-600">
              <strong className="text-slate-800">{layout.fontSize}pt</strong>
            </span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-600">
              Spasi: <strong className="text-slate-800">{layout.lineSpacing.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Quick Line Spacing Stepper right on bar */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">
            Line Spacing:
          </span>
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => stepLineSpacing(-0.05)}
              title="Kurangi spasi baris (-0.05)"
              className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-[11px] font-bold text-slate-800 tabular-nums min-w-[42px] text-center">
              {layout.lineSpacing.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => stepLineSpacing(0.05)}
              title="Tambah spasi baris (+0.05)"
              className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Edit Mode Formatting Panel */}
      {isEditMode && (
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h4 className="text-xs font-bold text-slate-800">
                Pengaturan Font, Spasi, Tata Letak & Edit Teks Langsung
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                <MousePointerClick className="w-3 h-3" />
                Klik teks pada kertas pratinjau untuk edit langsung
              </span>
              <button
                type="button"
                onClick={onResetLayout}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Standar
              </button>
            </div>
          </div>

          {/* Word-like Font Ribbon Bar (Font Family Selector + Font Size) */}
          <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-600" />
                Jenis & Ukuran Huruf (Seperti Microsoft Word)
              </label>
              <span className="text-[11px] text-slate-500">
                Aktif:{' '}
                <strong
                  className="text-indigo-700"
                  style={{ fontFamily: layout.fontFamily }}
                >
                  {activeFontLabel} ({layout.fontSize} pt)
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start">
              {/* Custom Word Font Dropdown with Live Typeface Preview */}
              <div className="md:col-span-6 relative" ref={fontDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsFontMenuOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-indigo-400 rounded-lg text-xs text-slate-800 shadow-2xs transition-colors cursor-pointer"
                >
                  <span
                    className="truncate font-semibold text-[13px]"
                    style={{ fontFamily: layout.fontFamily }}
                  >
                    {activeFontLabel}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      isFontMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isFontMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 max-h-64 overflow-y-auto py-1 divide-y divide-slate-100">
                    {WORD_FONT_OPTIONS.map((font) => {
                      const isSelected = layout.fontFamily === font.value;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => {
                            updateField('fontFamily', font.value);
                            setIsFontMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-indigo-50/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-800' : 'text-slate-800'
                          }`}
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <span
                              className="text-[14px] truncate"
                              style={{ fontFamily: font.value }}
                            >
                              {font.label}
                            </span>
                            {font.note && (
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-sans shrink-0">
                                {font.note}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-400 font-sans">
                              {font.category}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Font Size Selector & Slider */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <div className="flex items-center gap-1 flex-wrap">
                  {FONT_SIZE_PRESETS.map((pt) => {
                    const active = layout.fontSize === pt;
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => updateField('fontSize', pt)}
                        className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {pt} pt
                      </button>
                    );
                  })}
                  <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg px-1 py-0.5 ml-auto">
                    <button
                      type="button"
                      onClick={() =>
                        updateField('fontSize', Math.max(8, Number((layout.fontSize - 0.5).toFixed(1))))
                      }
                      className="p-1 text-slate-600 hover:text-indigo-700 cursor-pointer"
                      title="Perkecil huruf (-0.5pt)"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-1.5 text-[11px] font-bold text-slate-800 tabular-nums">
                      {layout.fontSize}pt
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateField('fontSize', Math.min(16, Number((layout.fontSize + 0.5).toFixed(1))))
                      }
                      className="p-1 text-slate-600 hover:text-indigo-700 cursor-pointer"
                      title="Perbesar huruf (+0.5pt)"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Word Font Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Cepat:
              </span>
              {WORD_FONT_OPTIONS.slice(0, 6).map((font) => {
                const active = layout.fontFamily === font.value;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateField('fontFamily', font.value)}
                    style={{ fontFamily: font.value }}
                    className={`px-2.5 py-1 text-[11.5px] rounded-md border transition-colors cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    {font.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Line Spacing & Margins + Table/Gap/TTD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Line Spacing */}
            <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <AlignJustify className="w-3.5 h-3.5 text-blue-600" />
                  Line Spacing (Spasi Baris)
                </label>
                <span className="text-xs font-bold text-blue-700 tabular-nums">
                  {layout.lineSpacing.toFixed(2)}x
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {LINE_SPACING_PRESETS.map((preset) => {
                  const active = Math.abs(layout.lineSpacing - preset) < 0.01;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateField('lineSpacing', preset)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      {preset.toFixed(preset % 1 === 0 ? 1 : 2)}
                    </button>
                  );
                })}
              </div>
              <input
                type="range"
                min={0.9}
                max={2.2}
                step={0.05}
                value={layout.lineSpacing}
                onChange={(e) => updateField('lineSpacing', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5"
              />
            </div>

            {/* Margin Kertas */}
            <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                  Margin Kertas A4
                </label>
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {layout.marginY} × {layout.marginX} mm
                </span>
              </div>
              <div className="flex gap-1.5">
                {MARGIN_PRESETS.map((p) => {
                  const active = layout.marginY === p.marginY && layout.marginX === p.marginX;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() =>
                        onChangeLayout({
                          ...layout,
                          marginY: p.marginY,
                          marginX: p.marginX,
                        })
                      }
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[9.5px] text-slate-500">Atas / Bawah ({layout.marginY}mm)</span>
                  <input
                    type="range"
                    min={8}
                    max={35}
                    step={1}
                    value={layout.marginY}
                    onChange={(e) => updateField('marginY', parseInt(e.target.value, 10))}
                    className="w-full accent-slate-700 cursor-pointer h-1.5"
                  />
                </div>
                <div>
                  <span className="block text-[9.5px] text-slate-500">Kiri / Kanan ({layout.marginX}mm)</span>
                  <input
                    type="range"
                    min={8}
                    max={35}
                    step={1}
                    value={layout.marginX}
                    onChange={(e) => updateField('marginX', parseInt(e.target.value, 10))}
                    className="w-full accent-slate-700 cursor-pointer h-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Table Row Height, Section Gap, Signature Height */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tinggi Baris Tabel */}
            <div className="space-y-1.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Table2 className="w-3 h-3 text-emerald-600" />
                  Tinggi Baris Tabel
                </label>
                <span className="text-[10px] font-bold text-emerald-700 tabular-nums">
                  {layout.tablePaddingY}px
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={18}
                step={1}
                value={layout.tablePaddingY}
                onChange={(e) => updateField('tablePaddingY', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Rapat</span>
                <span>Standar</span>
                <span>Lega</span>
              </div>
            </div>

            {/* Jarak Antar Bagian */}
            <div className="space-y-1.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <AlignJustify className="w-3 h-3 text-amber-600" />
                  Spasi Paragraf
                </label>
                <span className="text-[10px] font-bold text-amber-700 tabular-nums">
                  {layout.sectionGap}px
                </span>
              </div>
              <input
                type="range"
                min={6}
                max={32}
                step={2}
                value={layout.sectionGap}
                onChange={(e) => updateField('sectionGap', parseInt(e.target.value, 10))}
                className="w-full accent-amber-600 cursor-pointer h-1.5 mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Padat</span>
                <span>Normal</span>
                <span>Longgar</span>
              </div>
            </div>

            {/* Ruang Tanda Tangan */}
            <div className="space-y-1.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <PenTool className="w-3 h-3 text-purple-600" />
                  Ruang Tanda Tangan
                </label>
                <span className="text-[10px] font-bold text-purple-700 tabular-nums">
                  {layout.signatureHeight}px
                </span>
              </div>
              <input
                type="range"
                min={32}
                max={130}
                step={4}
                value={layout.signatureHeight}
                onChange={(e) => updateField('signatureHeight', parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer h-1.5 mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Kecil</span>
                <span>Standar</span>
                <span>Besar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
