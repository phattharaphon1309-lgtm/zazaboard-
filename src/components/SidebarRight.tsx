import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Zap,
  Cpu
} from 'lucide-react';

interface SidebarRightProps {
  onSelectTag: (tag: string) => void;
  activeTag: string;
  onOpenGuideModal: () => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  onSelectTag,
  activeTag,
  onOpenGuideModal,
}) => {
  const { user } = useAuth();

  const trendingTags = [
    { tag: '#ประกาศจากแอดมิน', count: '1.2K โพสต์', isHot: true },
    { tag: '#สายไอที', count: '890 โพสต์', isHot: true },
    { tag: '#มนุษย์เงินเดือน', count: '654 โพสต์', isHot: false },
    { tag: '#เทรนด์วันนี้', count: '521 โพสต์', isHot: true },
    { tag: '#ซีรีส์เด็ด', count: '430 โพสต์', isHot: false },
    { tag: '#PunXCyber', count: '312 โพสต์', isHot: false },
  ];

  return (
    <aside className="w-full lg:w-80 space-y-5">

      {/* Cyber 6-Feature Verification Widget */}
      <div className="bg-[#0a0f1d]/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md cyber-glow-cyan">
        <div className="flex items-center justify-between gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 mb-2.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>[SYS.REQUIREMENTS // 6/6]</span>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.2 rounded font-bold">
            VERIFIED
          </span>
        </div>

        <button
          onClick={onOpenGuideModal}
          className="w-full mb-3 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition transform hover:scale-[1.02] active:scale-[0.98] font-['Chakra_Petch',sans-serif]"
        >
          <span>🧪 เปิดวิธีทดสอบ 6 ฟีเจอร์</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        
        <div className="space-y-1.5 text-[11px] text-slate-300 font-['Prompt',sans-serif]">
          
          <div className="p-2 rounded-xl bg-[#080d1e] border border-cyan-500/20">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>1. สมาชิก & Hashing</span>
              <span className="text-[10px] text-emerald-400 font-mono">bcrypt 10 rounds</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">รหัสผ่านถูกแฮช One-way ปลอดภัย 100%</p>
          </div>

          <div className="p-2 rounded-xl bg-[#080d1e] border border-cyan-500/20">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>2. สิทธิ์ 2 บทบาท</span>
              <span className="text-[10px] text-fuchsia-300 font-mono">User vs Admin</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">แอดมินปักหมุด/ล็อค/ลบได้ทุกกระทู้และจัดการสิทธิ์</p>
          </div>

          <div className="p-2 rounded-xl bg-[#080d1e] border border-cyan-500/20">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>3. CRUD มีเจ้าของ</span>
              <span className="text-[10px] text-cyan-400 font-mono">Owner Only</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">User A ไม่สามารถแก้/ลบกระทู้ User B ได้เด็ดขาด</p>
          </div>

          <div className="p-2 rounded-xl bg-[#080d1e] border border-cyan-500/20">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>4. 2 ฟอร์มบันทึก DB</span>
              <span className="text-[10px] text-amber-300 font-mono">2 Forms</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">ฟอร์มตั้งกระทู้ใหม่ + ฟอร์มส่งความคิดเห็น/อารมณ์</p>
          </div>

          <div className="p-2 rounded-xl bg-[#080d1e] border border-cyan-500/20">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>5. ปิดบังข้อมูล (Masking)</span>
              <span className="text-[10px] text-cyan-300 font-mono">08x-***-xxxx</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">ปิดบังเบอร์โทรศัพท์และอีเมลในกระทู้ & ตาราง</p>
          </div>

          <div className="p-2 rounded-xl bg-[#080d1e] border border-cyan-500/20">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>6. หน้าผู้ดูแลระบบ</span>
              <span className="text-[10px] text-fuchsia-400 font-mono">Admin Portal</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">สถิติระบบ, จัดการผู้ใช้, สลับบทบาท, ตรวจสอบ</p>
          </div>

        </div>
      </div>

      {/* Cyber X-style Trending in Thailand */}
      <div className="bg-[#0a0f1d]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-bold text-white mb-3">
          <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>[CYBER.TRENDS // TH]</span>
          </div>
          <span className="text-[10px] text-cyan-400/70 font-mono">X HOT</span>
        </div>

        <div className="space-y-1.5">
          {trendingTags.map((item, index) => {
            const isSelected = activeTag === item.tag;
            return (
              <button
                key={index}
                onClick={() => onSelectTag(isSelected ? '' : item.tag)}
                className={`w-full text-left p-2.5 rounded-xl transition group ${
                  isSelected
                    ? 'bg-cyan-950 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'hover:bg-cyan-950/40 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>RANK 0{index + 1}</span>
                  {item.isHot && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-950 text-pink-400 border border-pink-800/60 font-semibold font-mono">
                      HOT 🔥
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-cyan-200 group-hover:text-cyan-400 transition font-['Chakra_Petch',sans-serif]">
                  {item.tag}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{item.count}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 text-[11px] text-slate-500 leading-relaxed font-mono">
        <p>PunX CyberBoard • Hybrid Pantip x X</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Cyberpunk Theme • board007-daa9e node
        </p>
      </div>

    </aside>
  );
};
