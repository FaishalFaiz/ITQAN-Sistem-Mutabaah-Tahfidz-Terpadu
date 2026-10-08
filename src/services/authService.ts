import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { emitChange } from './storageService';

export interface MusyrifUser {
  id: string;
  email: string;
  fullName: string;
}

const LOCAL_USER_KEY = 'itqan_current_musyrif';

export const authService = {
  // Ambil user yang tersimpan di localStorage secara sinkron
  getStoredUser(): MusyrifUser | null {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore parse error */
    }
    return null;
  },

  // Ambil user musyrif yang sedang login di Supabase
  async getCurrentUser(): Promise<MusyrifUser | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const musyrifUser: MusyrifUser = {
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Muhaffizh',
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(musyrifUser));
        return musyrifUser;
      }
    } catch (err) {
      console.error('Gagal mengecek session Supabase:', err);
    }

    return null;
  },

  // Login akun Musyrif via Supabase Auth
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: MusyrifUser; error?: string }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Konfigurasi Supabase belum disetel di file .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY belum diisi).',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Terjemahan pesan error umum dari Supabase agar ramah pengguna
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email atau kata sandi salah. Silakan periksa kembali.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda atau matikan Confirm Email di Supabase Dashboard.' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const user: MusyrifUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        emitChange('user_logged_in');
        return { success: true, user };
      }

      return { success: false, error: 'User tidak ditemukan.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi Supabase.';
      return { success: false, error: msg };
    }
  },

  // Registrasi Musyrif baru via Supabase Auth
  async signUp(fullName: string, email: string, password: string): Promise<{ success: boolean; hasSession?: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Konfigurasi Supabase belum disetel di file .env. Silakan pasang VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terlebih dahulu.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'musyrif',
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Email ini sudah terdaftar sebagai muhaffizh. Silakan gunakan menu Masuk.' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        if (data.session) {
          const user: MusyrifUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || fullName.trim(),
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
          emitChange('user_logged_in');
        }
        return { success: true, hasSession: Boolean(data.session) };
      }

      return { success: false, error: 'Pendaftaran gagal dilakukan.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat pendaftaran ke Supabase.';
      return { success: false, error: msg };
    }
  },

  // Logout dari Supabase
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    emitChange('user_logged_out');
  },
};
