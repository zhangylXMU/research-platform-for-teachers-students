import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  Users,
  BookOpen,
  Shield,
  Clock,
  HardDrive,
  ChevronDown,
  Microscope,
  Handshake,
  Beaker,
} from "lucide-react";

const stats = [
  { number: "200+", label: "注册学生" },
  { number: "50+", label: "认证导师" },
  { number: "30+", label: "科研课题" },
  { number: "95%", label: "课题完成率" },
];

const steps = [
  {
    num: "01",
    title: "注册认证",
    desc: "创建你的学术档案",
    detail: "学生提交真实身份信息与学业阶段，导师上传高校任职资质证明。平台管理员审核通过后，双方获得完整功能权限。",
    image: "/step-01.jpg",
    icon: BookOpen,
  },
  {
    num: "02",
    title: "浏览匹配",
    desc: "发现契合的科研方向",
    detail: "学生按研究领域、导师资历、课题难度筛选浏览。导师查看学生提交的科研意向书与简历，选择合适人选。",
    image: "/step-02.jpg",
    icon: Microscope,
  },
  {
    num: "03",
    title: "确认对接",
    desc: "建立正式指导关系",
    detail: "双方线上沟通确认研究方向与预期目标。平台生成对接记录，自动解锁指导日志提交入口，记录永久不可篡改。",
    image: "/step-03.jpg",
    icon: Handshake,
  },
  {
    num: "04",
    title: "开展研究",
    desc: "全程记录科研历程",
    detail: "导师定期提交指导日志，学生上传实验数据与阶段成果。所有记录带服务器时间戳，半年后自动公开。",
    image: "/step-04.jpg",
    icon: Beaker,
  },
];

const features = [
  {
    num: "02",
    title: "全程留痕",
    desc: "每一次师生互动、每一篇指导日志、每一条科研进展，都带有不可篡改的服务器时间戳。提交半年后自动公开，确保科研历程的真实可追溯。",
    icon: Clock,
  },
  {
    num: "03",
    title: "隐私守护",
    desc: "公开前的指导记录与科研数据仅师生双方及平台管理员可见。半年后自动转为公开状态，供学术社区参考。所有内容一旦提交，永久无法修改。",
    icon: Shield,
  },
  {
    num: "04",
    title: "弹性存储",
    desc: "每位注册用户默认拥有 100MB 个人网络空间。当存储空间不足时，可通过付费套餐进行扩容。平台同时预留了支付模块，未来可支持指导费与科研经费的托管结算。",
    icon: HardDrive,
  },
];

const mentors = [
  {
    name: "陈建国教授",
    school: "清华大学",
    field: "人工智能 / 深度学习",
    bio: "在神经网络与深度学习领域深耕十五年，发表SCI论文60余篇，主持多项国家自然科学基金项目。",
    image: "/mentor-01.jpg",
  },
  {
    name: "林雅芳博士",
    school: "北京大学",
    field: "生物信息学 / 基因组学",
    bio: "专注于基因组数据分析与算法开发，致力于用计算方法解决生物医学难题，指导的学生多次获奖。",
    image: "/mentor-02.jpg",
  },
  {
    name: "王德明教授",
    school: "复旦大学",
    field: "材料科学 / 纳米技术",
    bio: "材料科学领域资深专家，研究方向涵盖纳米材料合成与应用，拥有丰富的产学研合作经验。",
    image: "/mentor-03.jpg",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* ====== HERO ====== */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="Research lab"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.4)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1D]/60 via-transparent to-[#1A1A1D]/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <h1
            className="text-[#F4F1EA] font-light leading-tight mb-6"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontFamily: "'Noto Serif SC', serif",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            }}
          >
            <span className="block">启明星科创</span>
            <span className="block text-[#C9A87C] mt-2" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
              科研师生对接平台
            </span>
          </h1>
          <p className="text-[#F4F1EA]/70 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            搭建科研供需对接桥梁，让每一次学术探索都有导师相伴
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <Link to="/projects">
                <Button
                  size="lg"
                  className="bg-[#E86A56] hover:bg-[#E86A56]/90 text-white px-8 py-6 text-base"
                >
                  浏览课题 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-[#E86A56] hover:bg-[#E86A56]/90 text-white px-8 py-6 text-base"
                  >
                    立即加入 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#C9A87C]/50 text-[#F4F1EA] hover:bg-[#C9A87C]/10 px-8 py-6 text-base"
                  >
                    浏览课题
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[#A09B94] text-xs tracking-wider">向下滚动</span>
          <ChevronDown
            className="w-5 h-5 text-[#C9A87C]"
            style={{ animation: "scrollIndicator 2s ease-in-out infinite" }}
          />
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className="bg-[#F4F1EA] py-24 md:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <span
                className="text-[#A09B94] font-light block mb-4"
                style={{ fontSize: "clamp(4rem, 8vw, 6rem)", fontFamily: "'Cormorant Garamond', serif" }}
              >
                01
              </span>
              <h2
                className="text-[#1A1A1D] font-light mb-3"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                启明导师计划
              </h2>
              <p className="text-[#A09B94] text-xs uppercase tracking-[0.2em] mb-6">
                平台愿景
              </p>
              <p className="text-[#2C2C34] leading-relaxed mb-8">
                启明星科创致力于为高校老师和各阶段学生搭建一个高效的科研对接平台。
                无论你是初出茅庐的科研新手，还是经验丰富的学术导师，都能在这里找到
                志同道合的合作伙伴。我们相信，每一次师生对接都是一段精彩科研旅程的开始。
              </p>
              <Link to="/projects">
                <Button className="bg-[#E86A56] hover:bg-[#E86A56]/90 text-white">
                  了解更多 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-6 mt-12">
                {stats.map((s) => (
                  <div key={s.label} className="border-l-2 border-[#C9A87C] pl-4">
                    <div
                      className="text-[#1A1A1D] font-light"
                      style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {s.number}
                    </div>
                    <div className="text-[#A09B94] text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - image */}
            <div className="relative">
              <img
                src="/feature-privacy.jpg"
                alt="Research"
                className="w-full rounded-lg shadow-2xl border border-[#C9A87C]/20"
                style={{ transform: "rotate(1deg)" }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-[#C9A87C]/30 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== STEPS / FLIP CARDS ====== */}
      <section className="bg-[#2E4A62] py-24 md:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <h2
            className="text-[#F4F1EA] text-center font-light mb-16"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontFamily: "'Noto Serif SC', serif",
            }}
          >
            四步开启科研之旅
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="group relative bg-[#2C2C34] rounded-lg overflow-hidden border border-[#C9A87C]/10 hover:border-[#C9A87C]/30 transition-all duration-500"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[#F4F1EA] font-medium text-lg">{step.title}</h3>
                    <span
                      className="text-[#A09B94]/30 font-light text-3xl"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <p className="text-[#C9A87C] text-sm mb-3">{step.desc}</p>
                  <p className="text-[#A09B94] text-sm leading-relaxed">{step.detail}</p>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#C9A87C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="bg-[#FAF6F0] py-24 md:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="space-y-24">
            {features.map((f, i) => (
              <div
                key={f.num}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <span
                    className="text-[#A09B94] font-light block mb-4"
                    style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {f.num}
                  </span>
                  <h3
                    className="text-[#1A1A1D] font-light mb-4"
                    style={{
                      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-[#2C2C34] leading-relaxed">{f.desc}</p>
                </div>
                <div className={`${i % 2 === 1 ? "lg:order-1" : ""} relative`}>
                  <div className="bg-[#2E4A62] rounded-lg p-12 flex items-center justify-center min-h-[280px]">
                    <f.icon className="w-16 h-16 text-[#C9A87C]" strokeWidth={1} />
                  </div>
                  <div
                    className="absolute -bottom-3 -right-3 w-full h-full border border-[#C9A87C]/20 rounded-lg"
                    style={{ zIndex: -1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== MENTORS ====== */}
      <section className="bg-[#2C2C34] py-24 md:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2
              className="text-[#F4F1EA] font-light mb-3"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              科研导师团队
            </h2>
            <p className="text-[#A09B94] text-sm">来自全国各大高校的一线科研力量</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mentors.map((m) => (
              <div
                key={m.name}
                className="bg-[#1A1A1D]/50 rounded-lg p-8 border border-[#C9A87C]/10 hover:border-[#C9A87C]/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-28 h-28 rounded-full object-cover border-2 border-[#C9A87C] mb-6 group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="text-[#F4F1EA] font-medium text-lg mb-1">{m.name}</h4>
                  <p className="text-[#4A7C6F] text-sm mb-1">{m.school}</p>
                  <p className="text-[#A09B94] text-xs mb-4">{m.field}</p>
                  <p className="text-[#F4F1EA]/70 text-sm leading-relaxed">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIAL ====== */}
      <section className="bg-[#F4F1EA] py-24 md:py-32">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12">
          <div className="bg-[#2C2C34] rounded-lg p-8 md:p-16 border-l-4 border-r-4 border-[#C9A87C] relative">
            {/* Quote mark */}
            <span
              className="absolute top-4 left-8 text-[#C9A87C]/20 font-light leading-none"
              style={{ fontSize: "8rem", fontFamily: "'Cormorant Garamond', serif" }}
            >
              &ldquo;
            </span>

            <p className="text-[#F4F1EA] text-lg md:text-xl leading-relaxed mb-8 relative z-10">
              通过启明导师计划，我找到了一位在生物信息学领域非常有经验的导师。
              三个月的指导下，我完成了第一个独立科研项目，并成功在校内学术展上展示。
            </p>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C9A87C]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#C9A87C]" />
              </div>
              <div>
                <p className="text-[#F4F1EA] font-medium text-sm">王小明</p>
                <p className="text-[#A09B94] text-xs">北京大学 · 生命科学学院</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="relative bg-[#2E4A62] py-32 md:py-40 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#C9A87C]"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `boatFloat ${6 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${-Math.random() * 8}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
          <h2
            className="text-[#F4F1EA] font-light mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontFamily: "'Noto Serif SC', serif",
            }}
          >
            开启你的科研之旅
          </h2>
          <p className="text-[#A09B94] mb-10">注册成为学生或导师，发现无限可能</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=student">
              <Button
                size="lg"
                className="bg-[#E86A56] hover:bg-[#E86A56]/90 text-white px-8 py-6 text-base"
              >
                我是学生
              </Button>
            </Link>
            <Link to="/register?role=teacher">
              <Button
                size="lg"
                variant="outline"
                className="border-[#C9A87C] text-[#F4F1EA] hover:bg-[#C9A87C]/10 px-8 py-6 text-base"
              >
                我是导师
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
