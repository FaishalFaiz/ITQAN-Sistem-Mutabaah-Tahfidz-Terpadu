import React, { useState, useEffect } from 'react';
import { UserCheck, Phone, Check } from 'lucide-react';
import type { Santri } from './types';
import { storageService } from '../../services/storageService';
import { waGatewayService } from '../../services/waGatewayService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditWaliModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri | null;
  onSuccess?: (updatedSantri: Santri) => void;
}

export const EditWaliModal: React.FC<EditWaliModalProps> = ({
  isOpen,
  onClose,
  santri,
  onSuccess,
}) => {
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (santri) {
      setParentName(santri.parentName || '');
      setParentPhone(santri.parentPhone || '');
      setErrorMsg('');
    }
  }, [santri, isOpen]);

  if (!santri) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim()) {
      setErrorMsg('Nama wali santri wajib diisi.');
      return;
    }

    const cleanPhone = parentPhone.trim() ? waGatewayService.normalizePhoneNumber(parentPhone.trim()) : '';

    const updatedSantri: Santri = {
      ...santri,
      parentName: parentName.trim(),
      parentPhone: cleanPhone,
    };

    storageService.updateSantri(updatedSantri);
    onSuccess?.(updatedSantri);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0070BA] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Edit Kontak Wali Santri
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Perbarui nama wali dan nomor WhatsApp untuk santri <strong className="text-slate-700">{santri.name}</strong> (NIS: {santri.nis}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="p-2 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Wali / Orang Tua <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={parentName}
              onChange={(e) => {
                setParentName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: Bpk. Fajar Ramli"
              className="text-xs h-9 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp Wali
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="Contoh: 081234567808 atau 6281234567808"
                className="text-xs h-9 pl-9 font-mono bg-white"
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Nomor WhatsApp aktif wali santri untuk menerima laporan mutaba'ah.
            </span>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold h-9.5 px-4 border-slate-200 rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="text-xs font-semibold h-9.5 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
