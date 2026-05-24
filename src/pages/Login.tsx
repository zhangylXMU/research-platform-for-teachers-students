import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: () => {
      window.location.href = searchParams.get("redirect") || "/";
    },
    onError: (err) => {
      setError(err.message || "登录失败");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("请填写所有字段");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1D] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#A09B94] hover:text-[#C9A87C] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回首页</span>
        </Link>

        {/* Card */}
        <div className="bg-[#2C2C34] rounded-lg border border-[#C9A87C]/10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C9A87C]/10 mb-4">
              <FlaskConical className="w-6 h-6 text-[#C9A87C]" />
            </div>
            <h1
              className="text-[#F4F1EA] text-2xl font-light"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              欢迎回来
            </h1>
            <p className="text-[#A09B94] text-sm mt-2">登录你的启明星科创账户</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">用户名</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名"
                className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C]"
              />
            </div>

            <div>
              <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">密码</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09B94] hover:text-[#C9A87C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[#E86A56] text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#C9A87C] hover:bg-[#C9A87C]/90 text-[#1A1A1D] font-medium py-5"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "登录中..." : "登录"}
            </Button>
          </form>

          {/* Quick login hints */}
          <div className="mt-6 pt-6 border-t border-[#C9A87C]/10">
            <p className="text-[#A09B94] text-xs text-center mb-3">测试账户快速登录</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "管理员", u: "guanliyuan", p: "Flzx3000c" },
                { label: "导师", u: "teacher1", p: "teacherpassword" },
                { label: "学生", u: "student1", p: "studentpassword" },
              ].map((acct) => (
                <button
                  key={acct.label}
                  onClick={() => {
                    setUsername(acct.u);
                    setPassword(acct.p);
                  }}
                  className="text-xs py-2 px-1 rounded bg-[#1A1A1D] text-[#C9A87C] border border-[#C9A87C]/20 hover:border-[#C9A87C]/50 transition-colors"
                >
                  {acct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[#A09B94] text-sm mt-6">
            还没有账户？{" "}
            <Link to="/register" className="text-[#C9A87C] hover:underline">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
