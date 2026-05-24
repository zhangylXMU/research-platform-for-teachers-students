import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FlaskConical,
  Search,
  ArrowRight,
  User,
  Loader2,
} from "lucide-react";

const researchFields = [
  "全部",
  "人工智能",
  "机器学习",
  "自然语言处理",
  "生物信息学",
  "材料科学",
  "量子计算",
  "环境科学",
  "经济学",
  "心理学",
  "其他",
];

const statusMap: Record<string, { label: string; color: string }> = {
  recruiting: { label: "招募中", color: "bg-[#4A7C6F]" },
  in_progress: { label: "进行中", color: "bg-[#C9A87C]" },
  completed: { label: "已完成", color: "bg-[#A09B94]" },
  closed: { label: "已关闭", color: "bg-[#E86A56]" },
};

export default function Projects() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [field, setField] = useState("全部");

  const { data, isLoading } = trpc.project.list.useQuery({
    status: "recruiting",
    field: field === "全部" ? undefined : field,
  });

  const projects =
    data?.projects.filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.researchField.toLowerCase().includes(q)
      );
    }) ?? [];

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-[72px]">
      {/* Header */}
      <div className="bg-[#2E4A62] py-16 md:py-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <h1
            className="text-[#F4F1EA] font-light mb-3"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontFamily: "'Noto Serif SC', serif",
            }}
          >
            科研课题
          </h1>
          <p className="text-[#A09B94]">浏览所有正在招募中的科研项目，寻找适合你的研究方向</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 -mt-8">
        <div className="bg-[#FAF6F0] rounded-lg shadow-lg border border-[#C9A87C]/10 p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09B94]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索课题名称、关键词..."
              className="pl-10 bg-white border-[#C9A87C]/20 focus:border-[#C9A87C]"
            />
          </div>
          <Select value={field} onValueChange={setField}>
            <SelectTrigger className="w-full sm:w-48 bg-white border-[#C9A87C]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {researchFields.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Project grid */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C9A87C] animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical className="w-12 h-12 text-[#A09B94] mx-auto mb-4" />
            <p className="text-[#A09B94] text-lg">暂无符合条件的课题</p>
            <p className="text-[#A09B94]/70 text-sm mt-1">试试调整筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={isAuthenticated ? `/projects/${project.id}` : "/login"}
                className="group bg-[#FAF6F0] rounded-lg border border-[#C9A87C]/10 hover:border-[#C9A87C]/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      className={`${
                        statusMap[project.status]?.color ?? "bg-[#A09B94]"
                      } text-white text-xs`}
                    >
                      {statusMap[project.status]?.label ?? project.status}
                    </Badge>
                    <span className="text-[#A09B94] text-xs">{project.researchField}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[#1A1A1D] font-medium text-lg mb-2 group-hover:text-[#C9A87C] transition-colors line-clamp-2">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#A09B94] text-sm leading-relaxed line-clamp-3 mb-4">
                    {project.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#C9A87C]/10">
                    <div className="flex items-center gap-2 text-[#A09B94] text-xs">
                      <User className="w-3 h-3" />
                      <span>{project.teacher?.name ?? "导师"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#C9A87C] text-xs group-hover:gap-2 transition-all">
                      <span>查看详情</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
