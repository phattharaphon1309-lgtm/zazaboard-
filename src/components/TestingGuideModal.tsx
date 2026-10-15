import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  FileText, 
  EyeOff, 
  ArrowRight,
  Terminal,
  LogIn
} from 'lucide-react';

interface TestingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateThread: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const TestingGuideModal: React.FC<TestingGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateThread,
  onOpenAdmin,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const testSteps = [
    {
      step: 1,
      title: '1. สมัครสมาชิก & Password Hashing',
      badge: 'bcrypt 10 rounds',
      color: 'from-emerald-500 to-teal-500',
      icon: <KeyRound className="w-5 h-5 text-emerald-400" />,
      desc: 'ระบบใช้ bcrypt เข้ารหัสรหัสผ่านแบบ One-way Salted Hash ไม่เก็บ Plaintext ในฐานข้อมูล',
      howTo: [
        'กดปุ่ม "สมัครสมาชิก" ด้านบน หรือกดปุ่มด้านล่างเพื่อเปิดฟอร์ม',
        'กรอกชื่อผู้ใช้, อีเมล, เบอร์โทรศัพท์ และรหัสผ่านที่ต้องการ',
        'เมื่อกดสร้างบัญชี รหัสผ่านจะถูกแปลงเป็น Salted Hash เช่น `$2b$10$...` ในฐานข้อมูลก่อนบันทึกเสมอ',
      ],
      actions: (
        <button
          onClick={() => {
            onClose();
            onOpenAuth('register');
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow transition flex items-center gap-1.5 font-['Chakra_Petch',sans-serif]"
        >
          <span>เปิดฟอร์มสมัครสมาชิก (Register)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
    {
      step: 2,
      title: '2. สิทธิ์ 2 บทบาท (User vs Admin)',
      badge: 'RBAC แยกสิทธิ์ชัดเจน',
      color: 'from-cyan-500 to-blue-500',
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      desc: 'สิทธิ์ของ User และ Admin แตกต่างกันอย่างเด็ดขาด โดยเข้าใช้งานด้วย User และรหัสผ่านของตนเอง',
      howTo: [
        'บัญชี Admin: เข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ จะสามารถปักหมุด (Pin), ล็อคกระทู้ (Lock), ลบกระทู้ และจัดการแดชบอร์ดแอดมินได้',
        'บัญชี User ทั่วไป: เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่สมัครไว้ สามารถตั้งกระทู้และตอบความคิดเห็นได้ แต่ไม่สามารถเข้าแดชบอร์ดแอดมินได้',
        'ทดสอบ: ลองเข้าสู่ระบบด้วย User ทั่วไป แล้วกดเข้าแดชบอร์ดแอดมิน จะพบการป้องกันสิทธิ์',
      ],
      actions: (
        <button
          onClick={() => {
            onClose();
            onOpenAuth('login');
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-black shadow transition flex items-center gap-1.5 font-['Chakra_Petch',sans-serif]"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>เปิดหน้าต่างเข้าสู่ระบบ (ใส่ User & รหัสผ่าน)</span>
        </button>
      ),
    },
    {
      step: 3,
      title: '3. CRUD ข้อมูลมีเจ้าของ (Ownership)',
      badge: 'User A ห้ามแก้ข้อมูล User B',
      color: 'from-blue-500 to-cyan-500',
      icon: <Lock className="w-5 h-5 text-blue-400" />,
      desc: 'ระบบตรวจสอบความเป็นเจ้าของ (authorId === userId) ทั้งในปุ่มเมนู และที่ API',
      howTo: [
        'เข้าสู่ระบบด้วยบัญชีของท่าน แล้วสร้างกระทู้ใหม่ขึ้นมา 1 กระทู้',
        'ออกจากระบบ แล้วสมัครสมาชิกใหม่ด้วยอีกชื่อหนึ่ง หรือเข้าสู่ระบบด้วยบัญชีอื่น',
        'เลื่อนไปที่กระทู้ของบัญชีแรก กดปุ่ม (...) ที่มุมกระทู้ จะพบว่าปุ่ม "แก้ไข" และ "ลบ" มีแม่กุญแจล็อคไว้ ไม่สามารถแก้ไขของผู้อื่นได้',
      ],
      actions: (
        <button
          onClick={() => {
            onClose();
            onOpenAuth('login');
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow transition flex items-center gap-1.5 font-['Chakra_Petch',sans-serif]"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>เข้าสู่ระบบเพื่อทดสอบความเป็นเจ้าของ</span>
        </button>
      ),
    },
    {
      step: 4,
      title: '4. ฟอร์ม 2 ฟอร์มบันทึก DB & แสดงผล',
      badge: '2 Input Forms',
      color: 'from-amber-500 to-orange-500',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      desc: 'ฟอร์มรับข้อมูล 2 ชุดที่บันทึกลงฐานข้อมูลและดึงกลับมาแสดงผลบนหน้าจอทันที',
      howTo: [
        'ฟอร์มที่ 1 (ตั้งกระทู้ใหม่): กดปุ่ม "ตั้งกระทู้" สีฟ้า กรอกหัวข้อ, เลือกห้องสนทนา, พิมพ์เนื้อหาและแฮชแท็ก กดโพสต์แล้วกระทู้จะปรากฏบนฟีดทันที',
        'ฟอร์มที่ 2 (ตอบความคิดเห็น): คลิกเปิดดูกระทู้ใดก็ได้ เลื่อนลงไปที่กล่อง "ร่วมแสดงความคิดเห็น (Form 2)" พิมพ์ข้อความและเลือกอารมณ์ความรู้สึก กดส่งแล้วความคิดเห็นจะบันทึกลงฐานข้อมูลทันที',
      ],
      actions: (
        <button
          onClick={() => {
            onClose();
            onOpenCreateThread();
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-black shadow transition flex items-center gap-1.5 font-['Chakra_Petch',sans-serif]"
        >
          <span>เปิดฟอร์มตั้งกระทู้ใหม่ (Form 1)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
    {
      step: 5,
      title: '5. ปิดบังข้อมูลส่วนบุคคล (PDPA Masking)',
      badge: '08x-***-xxxx',
      color: 'from-cyan-500 to-teal-500',
      icon: <EyeOff className="w-5 h-5 text-cyan-400" />,
      desc: 'ปกป้องข้อมูลส่วนบุคคล (PII) ทั้งเบอร์โทรศัพท์และอีเมล เมื่อแสดงผลสู่สาธารณะ',
      howTo: [
        'ดูที่หัวกระทู้หรือใต้ความคิดเห็นของสมาชิก: จะพบเบอร์โทรศัพท์แสดงเป็น "08x-***-xxxx" เสมอสำหรับบุคคลทั่วไป',
        'หากล็อกอินเป็นเจ้าของกระทู้หรือแอดมิน: จะมีปุ่มรูปดวงตา "👁️ ดูจริง / ซ่อน" ให้คลิกเปิดดูเบอร์จริงได้เฉพาะผู้มีสิทธิ์',
        'ในหน้าแดชบอร์ดแอดมิน: มีปุ่ม "🔒 ซ่อนข้อมูลส่วนบุคคล / 👁️ แสดงข้อมูลจริง (Masking Toggle)" เพื่อทดสอบสลับโหมดการปกปิดข้อมูลทั้งระบบ',
      ],
      actions: (
        <div className="p-2.5 rounded-xl bg-[#050814] border border-cyan-500/40 flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-300">📱 08x-***-xxxx (Masked)</span>
          <span className="text-[10px] text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/50">
            PDPA COMPLIANT
          </span>
        </div>
      ),
    },
    {
      step: 6,
      title: '6. หน้าผู้ดูแลระบบ (Admin Dashboard)',
      badge: 'Admin Portal',
      color: 'from-fuchsia-500 to-purple-500',
      icon: <ShieldCheck className="w-5 h-5 text-fuchsia-400" />,
      desc: 'หน้าจัดการระบบเฉพาะแอดมิน สรุปสถิติ จัดการสมาชิก และดูแลกระทู้',
      howTo: [
        'เข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin Account)',
        'กดเมนู "แดชบอร์ดแอดมิน (Admin)" ที่แถบซ้าย หรือกดปุ่มด้านล่างนี้',
        'แท็บ 1: จัดการสมาชิก — ดูรายชื่อ, สลับสิทธิ์ User ⇄ Admin, ระงับบัญชี, และปุ่มทดสอบสลับโหมด Masking',
        'แท็บ 2: จัดการกระทู้ — ปักหมุดกระทู้สำคัญ (Pin), ล็อคกระทู้งดตอบ (Lock), ลบกระทู้ใดก็ได้',
        'แท็บ 3 & 4: รายการแจ้งรายงานปัญหา และบันทึกประวัติการทำงาน (Audit Logs)',
      ],
      actions: (
        <button
          onClick={() => {
            onClose();
            if (user?.role === 'admin') {
              onOpenAdmin();
            } else {
              onOpenAuth('login');
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-fuchsia-500 hover:bg-fuchsia-400 text-black shadow transition flex items-center gap-1.5 font-['Chakra_Petch',sans-serif]"
        >
          <span>{user?.role === 'admin' ? 'เข้าสู่หน้าแดชบอร์ดแอดมิน' : 'เข้าสู่ระบบด้วยบัญชี Admin'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const current = testSteps.find(s => s.step === activeStep) || testSteps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#090e1f] border border-cyan-500/60 rounded-2xl shadow-2xl p-6 max-h-[92vh] flex flex-col overflow-hidden cyber-glow-cyan">
        
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyan-400 hover:text-white p-1 rounded-lg hover:bg-cyan-950/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
              คู่มือทดสอบ 6 ฟีเจอร์ตามข้อกำหนด (Test Suite)
            </h2>
          </div>
          <p className="text-xs text-cyan-300/80 mt-0.5 font-mono">
            // คลิกลำดับข้อเพื่อตรวจสอบความถูกต้องและกดปุ่มเพื่อเริ่มทดสอบ
          </p>
        </div>

        {/* Steps Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-4 font-mono">
          {testSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-2 rounded-xl text-left border text-xs transition flex items-center gap-2 ${
                activeStep === s.step
                  ? 'bg-cyan-950 border-cyan-400 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-[#050814] border-cyan-500/20 text-slate-400 hover:text-cyan-200'
              }`}
            >
              <span className="text-xs text-cyan-400">0{s.step}.</span>
              <span className="truncate">{s.title.split('. ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Step Detail Box */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#050814] border border-cyan-500/30 space-y-4 custom-scrollbar">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40">
                {current.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">{current.title}</h3>
                <p className="text-[11px] text-cyan-300/80 font-['Prompt',sans-serif]">{current.desc}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold">
              {current.badge}
            </span>
          </div>

          <div className="space-y-2 pt-1 font-['Prompt',sans-serif]">
            <div className="text-xs font-semibold text-cyan-200 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>// ขั้นตอนการทดสอบ (HOW TO TEST):</span>
            </div>
            <div className="space-y-1.5 pl-4 text-xs text-slate-300">
              {current.howTo.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400 text-[11px] mt-0.5 font-mono">[{i + 1}]</span>
                  <span className="leading-relaxed">{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between flex-wrap gap-2 font-mono">
            <div className="text-[11px] text-slate-400">
              ACCOUNT: <strong className="text-white">@{user ? user.username : 'GUEST'}</strong> ({user?.role?.toUpperCase() || 'UNAUTHENTICATED'})
            </div>
            {current.actions}
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
          >
            ← PREV
          </button>
          <span className="text-[11px] text-cyan-300 font-bold">STEP 0{activeStep} / 06</span>
          <button
            onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
            disabled={activeStep === 6}
            className="px-3 py-1.5 rounded-lg text-cyan-300 hover:text-white disabled:opacity-30 flex items-center gap-1 font-bold"
          >
            <span>NEXT</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
};
