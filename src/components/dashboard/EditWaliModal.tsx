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
  const [selectedHalaqah, setSelectedHalaqah] = useState('');
  const [halaqahList, setHalaqahList] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (santri) {
      setParentName(santri.parentName || '');
      setParentPhone(santri.parentPhone || '');
      setSelectedHalaqah(santri.halaqahName || 'Halaqoh Abu Bakar Ash-Shiddiq');
      const list = storageService.getHalaqahList().map((h) => h.name);
      setHalaqahList(list);
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
      halaqahName: selectedHalaqah || santri.halaqahName,
    };

    storageService.updateSantri(updatedSantri);
    onSuccess?.(updatedSantri);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
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
              className="text-xs h-9.5 bg-slate-100/80 border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-400 focus:bg-white focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
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
                className="text-xs h-9.5 pl-9 font-mono bg-slate-100/80 border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-400 focus:bg-white focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20"
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Nomor WhatsApp aktif wali santri untuk menerima laporan mutaba'ah.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kelompok Halaqoh Santri
            </label>
            <select
              value={selectedHalaqah}
              onChange={(e) => setSelectedHalaqah(e.target.value)}
              className="w-full h-9.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-slate-100/80 text-slate-900 shadow-xs hover:border-slate-400 focus:bg-white focus:outline-none focus:border-[#0070BA] focus:ring-2 focus:ring-[#0070BA]/20 cursor-pointer transition-all"
            >
              {halaqahList.map((hName) => (
                <option key={hName} value={hName}>
                  {hName}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-xs font-semibold h-9.5 px-4 border-slate-200 rounded-lg cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto text-xs font-semibold h-9.5 px-4 bg-[#0070BA] hover:bg-[#005C9E] text-white rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
