import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as "student" | "teacher") || "student";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">(defaultRole);
  const [gradeLevel, setGradeLevel] = useState("undergraduate");
  const [school, setSchool] = useState("");
  const [institution, setInstitution] = useState("");
  const [title, setTitle] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message || "注册失败");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !username || !password) {
      setError("请填写所有必填字段");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }

    const input: Record<string, unknown> = {
      name,
      username,
      password,
      role,
    };

    if (role === "student") {
      input.gradeLevel = gradeLevel;
      input.school = school;
    } else {
      input.institution = institution;
      input.title = title;
    }

    registerMutation.mutate(input as {
      name: string;
      username: string;
      password: string;
      role: "student" | "teacher";
      gradeLevel?: "middle" | "high" | "undergraduate" | "master" | "phd";
      school?: string;
      institution?: string;
      title?: string;
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1D] flex items-center justify-center px-6 py-12">
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
              <UserPlus className="w-6 h-6 text-[#C9A87C]" />
            </div>
            <h1
              className="text-[#F4F1EA] text-2xl font-light"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              创建账户
            </h1>
            <p className="text-[#A09B94] text-sm mt-2">加入启明星科创，开启科研之旅</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selection */}
            <div>
              <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">身份类型</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-3 px-4 rounded-lg border text-sm transition-all ${
                    role === "student"
                      ? "border-[#C9A87C] bg-[#C9A87C]/10 text-[#C9A87C]"
                      : "border-[#C9A87C]/20 text-[#A09B94] hover:border-[#C9A87C]/40"
                  }`}
                >
                  学生
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`py-3 px-4 rounded-lg border text-sm transition-all ${
                    role === "teacher"
                      ? "border-[#C9A87C] bg-[#C9A87C]/10 text-[#C9A87C]"
                      : "border-[#C9A87C]/20 text-[#A09B94] hover:border-[#C9A87C]/40"
                  }`}
                >
                  导师
                </button>
              </div>
            </div>

            <div>
              <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">姓名</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的真实姓名"
                className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C]"
              />
            </div>

            <div>
              <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">用户名</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="设置登录用户名"
                className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C]"
              />
            </div>

            {/* Student-specific fields */}
            {role === "student" && (
              <>
                <div>
                  <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">学业阶段</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2C2C34] border-[#C9A87C]/20">
                      <SelectItem value="middle">初中</SelectItem>
                      <SelectItem value="high">高中</SelectItem>
                      <SelectItem value="undergraduate">本科</SelectItem>
                      <SelectItem value="master">硕士</SelectItem>
                      <SelectItem value="phd">博士</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">所在学校</Label>
                  <Input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="例如：清华大学"
                    className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C]"
                  />
                </div>
              </>
            )}

            {/* Teacher-specific fields */}
            {role === "teacher" && (
              <>
                <div>
                  <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">所属高校/机构</Label>
                  <Input
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="例如：北京大学"
                    className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C]"
                  />
                </div>
                <div>
                  <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">职称</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：教授 / 副教授"
                    className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C]"
                  />
                </div>
              </>
            )}

            <div>
              <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">密码</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位"
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

            <div>
              <Label className="text-[#F4F1EA]/80 text-sm mb-2 block">确认密码</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className="bg-[#1A1A1D] border-[#C9A87C]/20 text-[#F4F1EA] placeholder:text-[#A09B94]/50 focus:border-[#C9A87C]"
              />
            </div>

            {error && <p className="text-[#E86A56] text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#C9A87C] hover:bg-[#C9A87C]/90 text-[#1A1A1D] font-medium py-5"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "注册中..." : "注册"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-[#A09B94] text-sm mt-6">
            已有账户？{" "}
            <Link to="/login" className="text-[#C9A87C] hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
