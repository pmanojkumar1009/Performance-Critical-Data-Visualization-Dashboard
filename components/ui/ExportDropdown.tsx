'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ExportOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
}

interface ExportDropdownProps {
  onExportPDF: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportJSON?: () => void;
  isExporting?: boolean;
}

export function ExportDropdown({
  onExportPDF,
  onExportPNG,
  onExportSVG,
  onExportCSV,
  onExportExcel,
  onExportJSON,
  isExporting = false,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const exportOptions: ExportOption[] = [
    {
      label: 'Export PDF',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: onExportPDF,
      disabled: isExporting,
      shortcut: 'S',
    },
    {
      label: 'Export PNG',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: onExportPNG,
      shortcut: 'E',
    },
    {
      label: 'Export SVG',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      onClick: onExportSVG,
      shortcut: 'Shift+S',
    },
    ...(onExportCSV
      ? [
          {
            label: 'Export CSV',
            icon: (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            onClick: onExportCSV,
          } as ExportOption,
        ]
      : []),
    ...(onExportExcel
      ? [
          {
            label: 'Export Excel',
            icon: (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            onClick: onExportExcel,
          } as ExportOption,
        ]
      : []),
    ...(onExportJSON
      ? [
          {
            label: 'Export JSON',
            icon: (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            ),
            onClick: onExportJSON,
          } as ExportOption,
        ]
      : []),
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-indigo-400/30"
        title="Export Options"
      >
        {isExporting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export</span>
            <svg className="h-3 w-3 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
          {exportOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              disabled={option.disabled}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-slate-600 dark:text-slate-400">{option.icon}</span>
              <span className="flex-1">{option.label}</span>
              {option.shortcut && (
                <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">
                  {option.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

