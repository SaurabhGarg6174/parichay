'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                    <h3 className="truncate pr-4 text-[15px] font-semibold text-foreground">{title}</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" aria-hidden />
                    </button>
                </div>
                <div className="overflow-y-auto px-5 py-4">
                    {children}
                </div>
                {footer && (
                    <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-surface-muted px-5 py-3.5">
                        {footer}
                    </div>
                )}
            </div>

        </div>
    );
}
