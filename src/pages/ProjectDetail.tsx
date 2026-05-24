import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FlaskConical,
  User,
  Users,
  FileText,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const statusMap: Record<string, { label: string; color: string }> = {
  recruiting: { label: "招募中", color: "bg-[#4A7C6F]" },
  in_progress: { label: "进行中", color: "bg-[#C9A87C]" },
  completed: { label: "已完成", color: "bg-[#A09B94]" },
  closed: { label: "已关闭", color: "bg-[#E86A56]" },
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isStudent } = useAuth();
  const [applyMessage, setApplyMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const projectId = Number(id);

  const { data: project, isLoading } = trpc.project.detail.useQuery(
    { id: projectId },
    { enabled: !isNaN(projectId) }
  );

  const utils = trpc.useUtils();

  const applyMutation = trpc.application.applyNow.useMutation({
    onSuccess: () => {
      setDialogOpen(false);
      setApplyMessage("");
      utils.project.detail.invalidate({ id: projectId });
      utils.application.myApplications.invalidate();
      alert("申请已提交！");
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const reviewMutation = trpc.application.review.useMutation({
    onSuccess: () => {
      utils.project.detail.invalidate({ id: projectId });
    },
  });

  const isOwner = project?.teacherId === user?.id;
  const hasApplied = project?.applications?.some((a) => a.studentId === user?.id);
  const isMember = project?.members?.some((m) => m.studentId === user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A87C] animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
        <div className="text-center">
          <FlaskConical className="w-12 h-12 text-[#A09B94] mx-auto mb-4" />
          <p className="text-[#A09B94]">课题不存在</p>
          <Link to="/projects">
            <Button variant="link" className="text-[#C9A87C]">
              返回课题列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-[72px]">
      {/* Header */}
      <div className="bg-[#2E4A62] py-12">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-[#A09B94] hover:text-[#C9A87C] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回课题列表</span>
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  className={`${
                    statusMap[project.status]?.color ?? "bg-[#A09B94]"
                  } text-white`}
                >
                  {statusMap[project.status]?.label ?? project.status}
                </Badge>
                <span className="text-[#A09B94] text-sm">{project.researchField}</span>
              </div>
              <h1
                className="text-[#F4F1EA] font-light"
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                {project.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
              <h2 className="text-[#1A1A1D] font-medium mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C9A87C]" />
                课题描述
              </h2>
              <p className="text-[#2C2C34] leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Requirements */}
            {project.requirements && (
              <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
                <h2 className="text-[#1A1A1D] font-medium mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C9A87C]" />
                  招募要求
                </h2>
                <p className="text-[#2C2C34] leading-relaxed">{project.requirements}</p>
              </div>
            )}

            {/* Applications (teacher only) */}
            {isOwner && project.applications && project.applications.length > 0 && (
              <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
                <h2 className="text-[#1A1A1D] font-medium mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#C9A87C]" />
                  申请列表
                </h2>
                <div className="space-y-4">
                  {project.applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#C9A87C]/10"
                    >
                      <div>
                        <p className="text-[#1A1A1D] font-medium text-sm">
                          {app.student?.name ?? "学生"}
                        </p>
                        {app.message && (
                          <p className="text-[#A09B94] text-xs mt-1">{app.message}</p>
                        )}
                        <Badge
                          className={`mt-2 text-xs ${
                            app.status === "pending"
                              ? "bg-[#C9A87C]/20 text-[#C9A87C]"
                              : app.status === "accepted"
                              ? "bg-[#4A7C6F]/20 text-[#4A7C6F]"
                              : "bg-[#E86A56]/20 text-[#E86A56]"
                          }`}
                        >
                          {app.status === "pending"
                            ? "待审核"
                            : app.status === "accepted"
                            ? "已通过"
                            : "已拒绝"}
                        </Badge>
                      </div>
                      {app.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-[#4A7C6F] hover:bg-[#4A7C6F]/90 text-white"
                            onClick={() =>
                              reviewMutation.mutate({ id: app.id, status: "accepted" })
                            }
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            通过
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#E86A56] text-[#E86A56] hover:bg-[#E86A56]/10"
                            onClick={() =>
                              reviewMutation.mutate({ id: app.id, status: "rejected" })
                            }
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            {project.members && project.members.length > 0 && (
              <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
                <h2 className="text-[#1A1A1D] font-medium mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C9A87C]" />
                  参与学生
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-[#C9A87C]/10"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#C9A87C]/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-[#C9A87C]" />
                      </div>
                      <span className="text-sm text-[#1A1A1D]">{m.student?.name ?? "学生"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher info */}
            <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
              <h3 className="text-[#A09B94] text-xs uppercase tracking-wider mb-4">导师信息</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#C9A87C]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#C9A87C]" />
                </div>
                <div>
                  <p className="text-[#1A1A1D] font-medium text-sm">
                    {project.teacher?.name ?? "未知导师"}
                  </p>
                  <p className="text-[#A09B94] text-xs">{project.teacher?.role === "teacher" ? "认证导师" : ""}</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
              <h3 className="text-[#A09B94] text-xs uppercase tracking-wider mb-4">课题信息</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A09B94]">最多招募</span>
                  <span className="text-[#1A1A1D]">{project.maxStudents} 人</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A09B94]">当前参与</span>
                  <span className="text-[#1A1A1D]">{project.members?.length ?? 0} 人</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A09B94]">申请人数</span>
                  <span className="text-[#1A1A1D]">{project.applications?.length ?? 0} 人</span>
                </div>
              </div>
            </div>

            {/* Apply button */}
            {isStudent && project.status === "recruiting" && !hasApplied && !isMember && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-[#E86A56] hover:bg-[#E86A56]/90 text-white py-5">
                    申请加入
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#FAF6F0] border-[#C9A87C]/20">
                  <DialogHeader>
                    <DialogTitle className="text-[#1A1A1D]">申请加入课题</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Textarea
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      placeholder="写一段自我介绍或申请理由..."
                      className="bg-white border-[#C9A87C]/20 focus:border-[#C9A87C] min-h-[100px]"
                    />
                    <Button
                      className="w-full bg-[#C9A87C] hover:bg-[#C9A87C]/90 text-[#1A1A1D]"
                      onClick={() =>
                        applyMutation.mutate({
                          projectId: project.id,
                          message: applyMessage,
                        })
                      }
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending ? "提交中..." : "提交申请"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {hasApplied && (
              <div className="bg-[#C9A87C]/10 rounded-lg p-4 text-center border border-[#C9A87C]/20">
                <CheckCircle className="w-5 h-5 text-[#C9A87C] mx-auto mb-2" />
                <p className="text-[#C9A87C] text-sm">已提交申请</p>
              </div>
            )}

            {isMember && (
              <div className="bg-[#4A7C6F]/10 rounded-lg p-4 text-center border border-[#4A7C6F]/20">
                <CheckCircle className="w-5 h-5 text-[#4A7C6F] mx-auto mb-2" />
                <p className="text-[#4A7C6F] text-sm">你已是课题成员</p>
                <Link to="/dashboard">
                  <Button variant="link" className="text-[#4A7C6F] text-xs mt-1">
                    查看指导日志
                  </Button>
                </Link>
              </div>
            )}

            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline" className="w-full border-[#C9A87C]/30 text-[#1A1A1D]">
                  登录后申请
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
