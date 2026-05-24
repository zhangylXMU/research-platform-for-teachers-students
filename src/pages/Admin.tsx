import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shield,
  Users,
  FlaskConical,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

export default function Admin() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: verifications, isLoading: verLoading } =
    trpc.dashboard.recentVerifications.useQuery(undefined, { enabled: isAdmin });
  const { data: recentProjects } = trpc.dashboard.recentProjects.useQuery(undefined, {
    enabled: isAdmin,
  });

  const utils = trpc.useUtils();

  const verifyMutation = trpc.teacher.verify.useMutation({
    onSuccess: () => {
      utils.dashboard.stats.invalidate();
      utils.dashboard.recentVerifications.invalidate();
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#E86A56] mx-auto mb-4" />
          <p className="text-[#1A1A1D] text-lg mb-2">权限不足</p>
          <p className="text-[#A09B94] mb-4">你需要管理员权限才能访问此页面</p>
          <Link to="/">
            <Button className="bg-[#C9A87C] text-[#1A1A1D]">返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-[72px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#A09B94] hover:text-[#C9A87C] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </Link>
          <h1
            className="text-[#1A1A1D] font-light mb-2"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontFamily: "'Noto Serif SC', serif" }}
          >
            管理后台
          </h1>
          <p className="text-[#A09B94]">平台数据统计与用户管理</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#FAF6F0] border border-[#C9A87C]/10 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#C9A87C] data-[state=active]:text-[#1A1A1D]">
              <Shield className="w-4 h-4 mr-1" />
              概览
            </TabsTrigger>
            <TabsTrigger value="verifications" className="data-[state=active]:bg-[#C9A87C] data-[state=active]:text-[#1A1A1D]">
              <UserCheck className="w-4 h-4 mr-1" />
              导师审核
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-[#C9A87C] data-[state=active]:text-[#1A1A1D]">
              <FlaskConical className="w-4 h-4 mr-1" />
              课题管理
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            {statsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-[#C9A87C] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "总用户数", value: stats?.totalUsers ?? 0, icon: Users, color: "text-[#C9A87C]" },
                  { label: "导师人数", value: stats?.totalTeachers ?? 0, icon: UserCheck, color: "text-[#4A7C6F]" },
                  { label: "待审核", value: stats?.pendingVerifications ?? 0, icon: Clock, color: "text-[#E86A56]" },
                  { label: "课题总数", value: stats?.totalProjects ?? 0, icon: FlaskConical, color: "text-[#2E4A62]" },
                  { label: "日志总数", value: stats?.totalLogs ?? 0, icon: BookOpen, color: "text-[#8B7355]" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-[#FAF6F0] rounded-lg p-5 border border-[#C9A87C]/10"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <div>
                        <p className="text-[#1A1A1D] text-2xl font-light">{item.value}</p>
                        <p className="text-[#A09B94] text-xs">{item.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Verifications */}
          <TabsContent value="verifications">
            {verLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-[#C9A87C] animate-spin" />
              </div>
            ) : !verifications?.length ? (
              <div className="text-center py-10 bg-[#FAF6F0] rounded-lg border border-[#C9A87C]/10">
                <p className="text-[#A09B94]">暂无待审核申请</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((v) => (
                  <div
                    key={v.id}
                    className="bg-[#FAF6F0] rounded-lg p-5 border border-[#C9A87C]/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#1A1A1D] font-medium">{v.institution}</p>
                        <Badge
                          className={`text-xs ${
                            v.verificationStatus === "pending"
                              ? "bg-[#C9A87C]/20 text-[#C9A87C]"
                              : v.verificationStatus === "verified"
                              ? "bg-[#4A7C6F]/20 text-[#4A7C6F]"
                              : "bg-[#E86A56]/20 text-[#E86A56]"
                          }`}
                        >
                          {v.verificationStatus === "pending"
                            ? "待审核"
                            : v.verificationStatus === "verified"
                            ? "已通过"
                            : "已拒绝"}
                        </Badge>
                      </div>
                      <p className="text-[#A09B94] text-sm">
                        {v.title} · {Array.isArray(v.researchFields) ? v.researchFields.join(", ") : ""}
                      </p>
                      {v.bio && <p className="text-[#A09B94] text-xs mt-1">{v.bio}</p>}
                    </div>
                    {v.verificationStatus === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#4A7C6F] hover:bg-[#4A7C6F]/90 text-white"
                          onClick={() => verifyMutation.mutate({ teacherProfileId: v.id, status: "verified" })}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          通过
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#E86A56] text-[#E86A56] hover:bg-[#E86A56]/10"
                          onClick={() => verifyMutation.mutate({ teacherProfileId: v.id, status: "rejected" })}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          拒绝
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            {!recentProjects?.length ? (
              <div className="text-center py-10 bg-[#FAF6F0] rounded-lg border border-[#C9A87C]/10">
                <p className="text-[#A09B94]">暂无课题</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#FAF6F0] rounded-lg p-5 border border-[#C9A87C]/10"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/projects/${p.id}`}
                          className="text-[#1A1A1D] font-medium hover:text-[#C9A87C] transition-colors"
                        >
                          {p.title}
                        </Link>
                        <p className="text-[#A09B94] text-sm mt-1">{p.researchField}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          p.status === "recruiting"
                            ? "bg-[#4A7C6F]/10 text-[#4A7C6F]"
                            : p.status === "in_progress"
                            ? "bg-[#C9A87C]/10 text-[#C9A87C]"
                            : "bg-[#A09B94]/10 text-[#A09B94]"
                        }`}
                      >
                        {p.status === "recruiting"
                          ? "招募中"
                          : p.status === "in_progress"
                          ? "进行中"
                          : "已完成"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
