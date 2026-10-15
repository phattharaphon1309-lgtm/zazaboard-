import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Phone, User, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, Terminal } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!username || !password) {
          throw new Error('กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน');
        }
        await login(username, password);
        onClose();
      } else {
        // Register validations
        if (!username || !password || !email) {
          throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
        }
        if (password.length < 6) {
          throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        if (password !== confirmPassword) {
          throw new Error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        }

        await register({
          username,
          displayName: displayName || username,
          password,
          email,
          phoneNumber,
          citizenId,
          bio,
        });

        setSuccess('สมัครสมาชิกสำเร็จ! รหัสผ่านถูกแฮชด้วย bcrypt (10 rounds) เรียบร้อยแล้ว');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090e1f] border border-cyan-500/50 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col cyber-glow-cyan">
        
        {/* Glow Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-blue-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyan-400 hover:text-white p-1 rounded-lg hover:bg-cyan-950/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 mb-2 shadow-lg shadow-cyan-500/30">
            <Terminal className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
            {mode === 'login' ? 'เข้าสู่ระบบ [CYBER.AUTH]' : 'สมัครสมาชิกใหม่ [REGISTER]'}
          </h2>
          <p className="text-xs text-cyan-300/80 mt-1 font-mono">
            // ใส่ชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[#050814] p-1 rounded-xl mb-4 border border-cyan-500/30">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition font-['Chakra_Petch',sans-serif] ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/20'
                : 'text-cyan-300 hover:text-white'
            }`}
          >
            เข้าสู่ระบบ (Login)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition font-['Chakra_Petch',sans-serif] ${
              mode === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-black shadow-md shadow-fuchsia-500/20'
                : 'text-cyan-300 hover:text-white'
            }`}
          >
            สมัครสมาชิก (Password Hashing)
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/80 text-rose-300 text-xs flex items-center gap-2 font-['Prompt',sans-serif]">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/80 text-emerald-300 text-xs flex items-center gap-2 font-['Prompt',sans-serif]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Username / Login ID */}
            <div>
              <label className="block text-xs font-medium text-cyan-200 mb-1 font-mono">
                {mode === 'login' ? 'ชื่อผู้ใช้ หรือ อีเมล' : 'ชื่อผู้ใช้ (Username)'}
                <span className="text-pink-400 ml-0.5">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'ชื่อผู้ใช้ หรือ อีเมล' : 'เช่น cyber_user01'}
                  className="w-full bg-[#050814] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                />
              </div>
            </div>

            {/* Register Extra Fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-cyan-200 mb-1 font-['Prompt',sans-serif]">
                    ชื่อแสดงผล (Display Name)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น นักสืบไซเบอร์ หรือ สมาชิกทั่วไป"
                    className="w-full bg-[#050814] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-['Prompt',sans-serif]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-cyan-200 mb-1 font-mono">
                    อีเมล (Email) <span className="text-pink-400">*</span>
                    <span className="text-[10px] text-cyan-400 ml-1.5 font-mono">// MASKED AUTOMATICALLY</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="เช่น user@punx.cyber"
                      className="w-full bg-[#050814] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                    />
                  </div>
                </div>

                {/* Personal Data Field to be Masked: Phone Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-cyan-200 font-mono">
                      เบอร์โทรศัพท์ (Phone)
                    </label>
                    <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/50 font-mono">
                      🔒 MASKED: 08x-***-xxxx
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="เช่น 0812345678"
                      className="w-full bg-[#050814] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-['Prompt',sans-serif]">
                    เบอร์โทรศัพท์จะถูกซ่อนจากผู้ใช้อื่น และแสดงแบบ Masking เพื่อความปลอดภัยตาม PDPA
                  </p>
                </div>

                {/* Citizen ID */}
                <div>
                  <label className="block text-xs font-medium text-cyan-200 mb-1 font-mono">
                    เลขบัตรประชาชน / สมาชิกยืนยันตัวตน
                    <span className="text-[10px] text-cyan-400 ml-1.5 font-mono">// MASKED</span>
                  </label>
                  <input
                    type="text"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    placeholder="เช่น 1-1002-34567-89-0"
                    className="w-full bg-[#050814] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-cyan-200 font-mono">
                  รหัสผ่าน (Password) <span className="text-pink-400">*</span>
                </label>
                {mode === 'register' && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    bcrypt Hashed (10 rounds)
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                  className="w-full bg-[#050814] border border-cyan-500/30 rounded-xl pl-9 pr-10 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-cyan-200 mb-1 font-mono">
                  ยืนยันรหัสผ่านอีกครั้ง <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านเดิมให้ตรงกัน"
                    className="w-full bg-[#050814] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
                  />
                </div>
              </div>
            )}


            {/* Security Notice */}
            <div className="p-2.5 rounded-xl bg-[#050814] border border-cyan-500/30 text-[11px] text-cyan-300 leading-relaxed flex items-start gap-2 font-mono">
              <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <strong>[SECURITY]</strong> รหัสผ่านจะถูกแฮชด้วย <code>bcrypt.hash</code> แบบ One-way Salted Hash ทันที ไม่เก็บ Plaintext ในระบบเด็ดขาด
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition disabled:opacity-50 mt-2 font-['Chakra_Petch',sans-serif] tracking-wide"
            >
              {loading
                ? 'กำลังประมวลผล (PROCESSING)...'
                : mode === 'login'
                ? 'เข้าสู่ระบบ (LOGIN)'
                : 'สร้างบัญชีผู้ใช้ (CREATE ACCOUNT)'}
            </button>

            {/* Google Firebase Login Button */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-cyan-500/20"></div>
              <span className="flex-shrink mx-2 text-[10px] text-cyan-400/70 font-mono uppercase tracking-wider">OR</span>
              <div className="flex-grow border-t border-cyan-500/20"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await loginWithGoogle();
                  setSuccess('เข้าสู่ระบบด้วย Google สำเร็จ!');
                  setTimeout(() => onClose(), 600);
                } catch (err: any) {
                  console.warn('Google popup error:', err);
                  setError('Google Popup หรือ Provider ยังไม่ได้เปิดใช้งานใน Firebase Console — สามารถเข้าสู่ระบบด้วย User และ รหัสผ่านด้านบนได้ทันทีครับ');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 transition flex items-center justify-center gap-2 shadow font-['Prompt',sans-serif]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>เข้าสู่ระบบด้วย Google (Firebase Auth)</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
