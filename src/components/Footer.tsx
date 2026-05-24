import { Link } from "react-router";
import { FlaskConical, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#3D5A80] border-t border-[#D4B896]/30">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Top section */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-[#C9A87C]" />
              <span className="text-[#F4F1EA] font-semibold text-lg">启明星科创</span>
            </div>
            <p className="text-[#A09B94] text-sm leading-relaxed">
              搭建科研供需对接桥梁，让学术探索之路不再孤单。
              连接高校老师与学生，共创科研未来。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[#F4F1EA] font-medium mb-4 text-sm tracking-wider">快速导航</h4>
            <ul className="space-y-3">
              {[
                { label: "首页", path: "/" },
                { label: "科研课题", path: "/projects" },
                { label: "登录", path: "/login" },
                { label: "注册", path: "/register" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#A09B94] text-sm hover:text-[#C9A87C] transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#F4F1EA] font-medium mb-4 text-sm tracking-wider">联系我们</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[#A09B94] text-sm">
                <Mail className="w-4 h-4 text-[#C9A87C]" />
                contact@qmx.edu.cn
              </li>
              <li className="flex items-center gap-2 text-[#A09B94] text-sm">
                <Phone className="w-4 h-4 text-[#C9A87C]" />
                010-8888-9999
              </li>
              <li className="flex items-center gap-2 text-[#A09B94] text-sm">
                <MapPin className="w-4 h-4 text-[#C9A87C]" />
                北京市海淀区学府路1号
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative text */}
        <div className="py-8 border-t border-[#D4B896]/10 text-center">
          <span
            className="text-[6rem] md:text-[9rem] font-light leading-none tracking-tight"
            style={{ fontFamily: "'Noto Serif SC', serif", color: "rgba(160,155,148,0.12)" }}
          >
            启明
          </span>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-[#D4B896]/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#A09B94] text-xs">
            &copy; 2025 启明星科创. 保留所有权利.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-[#A09B94] text-xs hover:text-[#C9A87C] transition-colors">
              隐私政策
            </Link>
            <Link to="#" className="text-[#A09B94] text-xs hover:text-[#C9A87C] transition-colors">
              使用条款
            </Link>
            <Link to="/login" className="text-[#A09B94] text-xs hover:text-[#C9A87C] transition-colors">
              管理员入口
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
