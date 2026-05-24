import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Send,
  Plus,
  Loader2,
  Clock,
  CheckCircle,
  HardDrive,
} from "lucide-react";

export default function Dashboard() {
  const { user, isTeacher, isStudent } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Create project dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectReq, setProjectReq] = useState("");
  const [projectField, setProjectField] = useState("");

  // Create log dialog
  const [logOpen, setLogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [logType, setLogType] = useState("guidance");
  const [logTitle, setLogTitle] = useState("");
  const [logContent, setLogContent] = useState("");

  const utils = trpc.useUtils();

  // Data queries
  const { data: myProjects, isLoading: projectsLoading } = trpc.project.myProjects.useQuery(
    undefined,
    { enabled: isTeacher }
  );
  const { data: myApplications, isLoading: appsLoading } =
    trpc.application.myApplications.useQuery(undefined, { enabled: isStudent });
  const { data: storageStats } = trpc.storage.stats.useQuery(undefined, {
    enabled: isStudent || isTeacher,
  });

  // Mutations
  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      setCreateOpen(false);
      utils.project.myProjects.invalidate();
      setProjectTitle("");
      setProjectDesc("");
      setProjectReq("");
      setProjectField("");
    },
  });

  const createLog = trpc.guidanceLog.create.useMutation({
    onSuccess: () => {
      setLogOpen(false);
      setLogTitle("");
      setLogContent("");
      alert("日志提交成功！");
    },
  });

  trpc.application.review.useMutation({
    onSuccess: () => {
      utils.project.myProjects.invalidate();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A09B94] mb-4">请先登录</p>
          <Link to="/login">
            <Button className="bg-[#C9A87C] text-[#1A1A1D]">去登录</Button>
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
          <h1
            className="text-[#1A1A1D] font-light mb-2"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontFamily: "'Noto Serif SC', serif" }}
          >
            个人中心
          </h1>
          <p className="text-[#A09B94]">
            {user.name} · {isTeacher ? "导师" : isStudent ? "学生" : "管理员"}
          </p>
        </div>

        {/* Storage bar */}
        {storageStats && (
          <div className="bg-[#FAF6F0] rounded-lg p-4 mb-6 border border-[#C9A87C]/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-[#2C2C34]">
                <HardDrive className="w-4 h-4 text-[#C9A87C]" />
                <span>存储空间</span>
              </div>
              <span className="text-[#A09B94] text-xs">
                {(storageStats.used / 1024 / 1024).toFixed(1)} MB /{" "}
                {(storageStats.quota / 1024 / 1024).toFixed(0)} MB
              </span>
            </div>
            <div className="w-full h-2 bg-[#1A1A1D]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A87C] rounded-full transition-all"
                style={{ width: `${Math.min(storageStats.percent, 100)}%` }}
              />
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#FAF6F0] border border-[#C9A87C]/10 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#C9A87C] data-[state=active]:text-[#1A1A1D]">
              <LayoutDashboard className="w-4 h-4 mr-1" />
              概览
            </TabsTrigger>
            {isTeacher && (
              <TabsTrigger value="projects" className="data-[state=active]:bg-[#C9A87C] data-[state=active]:text-[#1A1A1D]">
                <FlaskConical className="w-4 h-4 mr-1" />
                我的课题
              </TabsTrigger>
            )}
            {isStudent && (
              <TabsTrigger value="applications" className="data-[state=active]:bg-[#C9A87C] data-[state=active]:text-[#1A1A1D]">
                <Send className="w-4 h-4 mr-1" />
                我的申请
              </TabsTrigger>
            )}
            <TabsTrigger value="logs" className="data-[state=active]:bg-[#C9A87C] data-[state=active]:text-[#1A1A1D]">
              <BookOpen className="w-4 h-4 mr-1" />
              指导日志
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9A87C]/10 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-[#C9A87C]" />
                  </div>
                  <div>
                    <p className="text-[#1A1A1D] font-medium">
                      {isTeacher ? myProjects?.length ?? 0 : myApplications?.length ?? 0}
                    </p>
                    <p className="text-[#A09B94] text-xs">
                      {isTeacher ? "发布课题" : "提交申请"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#4A7C6F]/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#4A7C6F]" />
                  </div>
                  <div>
                    <p className="text-[#1A1A1D] font-medium">
                      {isTeacher
                        ? myProjects?.filter((p) => p.status === "in_progress").length ?? 0
                        : myApplications?.filter((a) => a.status === "accepted").length ?? 0}
                    </p>
                    <p className="text-[#A09B94] text-xs">
                      {isTeacher ? "进行中" : "已通过"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF6F0] rounded-lg p-6 border border-[#C9A87C]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#E86A56]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#E86A56]" />
                  </div>
                  <div>
                    <p className="text-[#1A1A1D] font-medium">
                      {isTeacher
                        ? myProjects?.filter((p) => p.status === "recruiting").length ?? 0
                        : myApplications?.filter((a) => a.status === "pending").length ?? 0}
                    </p>
                    <p className="text-[#A09B94] text-xs">
                      {isTeacher ? "招募中" : "待审核"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Teacher Projects */}
          {isTeacher && (
            <TabsContent value="projects">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#1A1A1D] font-medium">我的课题</h2>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#C9A87C] hover:bg-[#C9A87C]/90 text-[#1A1A1D]">
                      <Plus className="w-4 h-4 mr-1" />
                      发布课题
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#FAF6F0] border-[#C9A87C]/20 max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-[#1A1A1D]">发布新课题</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label className="text-[#2C2C34]">课题名称</Label>
                        <Input
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="输入课题名称"
                          className="bg-white border-[#C9A87C]/20"
                        />
                      </div>
                      <div>
                        <Label className="text-[#2C2C34]">研究领域</Label>
                        <Input
                          value={projectField}
                          onChange={(e) => setProjectField(e.target.value)}
                          placeholder="例如：人工智能"
                          className="bg-white border-[#C9A87C]/20"
                        />
                      </div>
                      <div>
                        <Label className="text-[#2C2C34]">课题描述</Label>
                        <Textarea
                          value={projectDesc}
                          onChange={(e) => setProjectDesc(e.target.value)}
                          placeholder="详细描述课题内容..."
                          className="bg-white border-[#C9A87C]/20 min-h-[100px]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#2C2C34]">招募要求（选填）</Label>
                        <Textarea
                          value={projectReq}
                          onChange={(e) => setProjectReq(e.target.value)}
                          placeholder="对学生的要求..."
                          className="bg-white border-[#C9A87C]/20"
                        />
                      </div>
                      <Button
                        className="w-full bg-[#C9A87C] hover:bg-[#C9A87C]/90 text-[#1A1A1D]"
                        onClick={() =>
                          createProject.mutate({
                            title: projectTitle,
                            description: projectDesc,
                            requirements: projectReq || undefined,
                            researchField: projectField,
                          })
                        }
                        disabled={createProject.isPending || !projectTitle || !projectDesc || !projectField}
                      >
                        {createProject.isPending ? "发布中..." : "发布课题"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {projectsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#C9A87C] animate-spin" />
                </div>
              ) : !myProjects?.length ? (
                <div className="text-center py-10 bg-[#FAF6F0] rounded-lg border border-[#C9A87C]/10">
                  <p className="text-[#A09B94]">还没有发布课题</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myProjects.map((p) => (
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
                            : p.status === "completed"
                            ? "已完成"
                            : "已关闭"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Student Applications */}
          {isStudent && (
            <TabsContent value="applications">
              <h2 className="text-[#1A1A1D] font-medium mb-6">我的申请</h2>
              {appsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#C9A87C] animate-spin" />
                </div>
              ) : !myApplications?.length ? (
                <div className="text-center py-10 bg-[#FAF6F0] rounded-lg border border-[#C9A87C]/10">
                  <p className="text-[#A09B94] mb-3">还没有提交申请</p>
                  <Link to="/projects">
                    <Button className="bg-[#C9A87C] text-[#1A1A1D]">浏览课题</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((a) => (
                    <div
                      key={a.id}
                      className="bg-[#FAF6F0] rounded-lg p-5 border border-[#C9A87C]/10 flex items-center justify-between"
                    >
                      <div>
                        <Link
                          to={`/projects/${a.projectId}`}
                          className="text-[#1A1A1D] font-medium hover:text-[#C9A87C] transition-colors"
                        >
                          {a.project?.title ?? "课题"}
                        </Link>
                        <p className="text-[#A09B94] text-xs mt-1">
                          申请时间：{new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          a.status === "pending"
                            ? "bg-[#C9A87C]/10 text-[#C9A87C]"
                            : a.status === "accepted"
                            ? "bg-[#4A7C6F]/10 text-[#4A7C6F]"
                            : "bg-[#E86A56]/10 text-[#E86A56]"
                        }`}
                      >
                        {a.status === "pending" ? "待审核" : a.status === "accepted" ? "已通过" : "已拒绝"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Guidance Logs */}
          <TabsContent value="logs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#1A1A1D] font-medium">指导日志</h2>
              <Dialog open={logOpen} onOpenChange={setLogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#C9A87C] hover:bg-[#C9A87C]/90 text-[#1A1A1D]">
                    <Plus className="w-4 h-4 mr-1" />
                    提交日志
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#FAF6F0] border-[#C9A87C]/20 max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-[#1A1A1D]">提交指导日志</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label className="text-[#2C2C34]">选择课题</Label>
                      <Select
                        value={selectedProjectId.toString()}
                        onValueChange={(v) => setSelectedProjectId(Number(v))}
                      >
                        <SelectTrigger className="bg-white border-[#C9A87C]/20">
                          <SelectValue placeholder="选择一个课题" />
                        </SelectTrigger>
                        <SelectContent>
                          {isTeacher
                            ? myProjects
                                ?.filter((p) => p.status === "in_progress")
                                .map((p) => (
                                  <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.title}
                                  </SelectItem>
                                ))
                            : myApplications
                                ?.filter((a) => a.status === "accepted")
                                .map((a) => (
                                  <SelectItem key={a.projectId} value={a.projectId.toString()}>
                                    {a.project?.title ?? "课题"}
                                  </SelectItem>
                                ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#2C2C34]">日志类型</Label>
                      <Select value={logType} onValueChange={setLogType}>
                        <SelectTrigger className="bg-white border-[#C9A87C]/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guidance">指导记录</SelectItem>
                          <SelectItem value="progress">科研进展</SelectItem>
                          <SelectItem value="interaction">互动交流</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#2C2C34]">标题</Label>
                      <Input
                        value={logTitle}
                        onChange={(e) => setLogTitle(e.target.value)}
                        placeholder="日志标题"
                        className="bg-white border-[#C9A87C]/20"
                      />
                    </div>
                    <div>
                      <Label className="text-[#2C2C34]">内容</Label>
                      <Textarea
                        value={logContent}
                        onChange={(e) => setLogContent(e.target.value)}
                        placeholder="详细描述..."
                        className="bg-white border-[#C9A87C]/20 min-h-[120px]"
                      />
                    </div>
                    <Button
                      className="w-full bg-[#C9A87C] hover:bg-[#C9A87C]/90 text-[#1A1A1D]"
                      onClick={() =>
                        createLog.mutate({
                          projectId: selectedProjectId,
                          logType: logType as "guidance" | "progress" | "interaction",
                          title: logTitle,
                          content: logContent,
                        })
                      }
                      disabled={createLog.isPending || !selectedProjectId || !logTitle || !logContent}
                    >
                      {createLog.isPending ? "提交中..." : "提交日志"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Log list */}
            <div className="space-y-4">
              {isTeacher && myProjects
                ?.filter((p) => p.status === "in_progress")
                .map((p) => (
                  <ProjectLogList
                    key={p.id}
                    projectId={p.id}
                    title={p.title}
                  />
                ))}
              {isStudent && myApplications
                ?.filter((a) => a.status === "accepted")
                .map((a) => (
                  <ProjectLogList
                    key={a.projectId}
                    projectId={a.projectId}
                    title={a.project?.title ?? "课题"}
                  />
                ))}
              {((isTeacher && !myProjects?.filter((p) => p.status === "in_progress").length) ||
                (isStudent && !myApplications?.filter((a) => a.status === "accepted").length)) && (
                <div className="text-center py-10 bg-[#FAF6F0] rounded-lg border border-[#C9A87C]/10">
                  <p className="text-[#A09B94]">
                    {isTeacher ? "没有进行中的课题" : "没有已通过的申请"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Component to show logs for a project
function ProjectLogList({ projectId, title }: { projectId: number; title: string }) {
  const { data: logs, isLoading } = trpc.guidanceLog.list.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  if (isLoading) {
    return (
      <div className="bg-[#FAF6F0] rounded-lg p-5 border border-[#C9A87C]/10">
        <Loader2 className="w-4 h-4 text-[#C9A87C] animate-spin" />
      </div>
    );
  }

  if (!logs?.length) return null;

  return (
    <div className="bg-[#FAF6F0] rounded-lg p-5 border border-[#C9A87C]/10">
      <h3 className="text-[#1A1A1D] font-medium text-sm mb-3">{title}</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-lg p-4 border border-[#C9A87C]/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    log.logType === "guidance"
                      ? "bg-[#C9A87C]/10 text-[#C9A87C]"
                      : log.logType === "progress"
                      ? "bg-[#4A7C6F]/10 text-[#4A7C6F]"
                      : "bg-[#2E4A62]/10 text-[#2E4A62]"
                  }`}
                >
                  {log.logType === "guidance"
                    ? "指导"
                    : log.logType === "progress"
                    ? "进展"
                    : "互动"}
                </span>
                <span className="text-[#1A1A1D] font-medium text-sm">{log.title}</span>
              </div>
              <span className="text-[#A09B94] text-xs">
                {new Date(log.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-[#2C2C34] text-sm leading-relaxed">{log.content}</p>
            <div className="mt-2 text-[#A09B94] text-xs">
              提交人：{log.author?.name ?? "未知"} · 公开时间：
              {new Date(log.publicAfter).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
