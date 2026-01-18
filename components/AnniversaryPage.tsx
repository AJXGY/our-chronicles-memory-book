import React, { useState } from "react";
import { SpecialDate } from "../types";
import {
  Calendar,
  Heart,
  Cake,
  Gift,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
} from "lucide-react";

interface AnniversaryPageProps {
  dates: SpecialDate[];
  onAddDate?: (date: SpecialDate) => void;
  onUpdateDate?: (date: SpecialDate) => void;
  onDeleteDate?: (id: string) => void;
}

export const AnniversaryPage: React.FC<AnniversaryPageProps> = ({
  dates,
  onAddDate,
  onUpdateDate,
  onDeleteDate,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);
  const [formData, setFormData] = useState<Partial<SpecialDate>>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    type: "anniversary",
  });

  const getDaysDiff = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    // Reset hours for accurate day count
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // For birthdays, find the next one
    const currentYear = now.getFullYear();
    target.setFullYear(currentYear);

    if (target < now) {
      target.setFullYear(currentYear + 1);
    }

    const diffTime = Math.abs(target.getTime() - now.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getDaysTogether = () => {
    // Find the anniversary date or use fallback
    const anniversaryDate = dates.find((d) => d.type === "anniversary");
    const start = anniversaryDate
      ? new Date(anniversaryDate.date)
      : new Date("2023-02-14");
    const now = new Date();
    const diff = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleOpenModal = (date?: SpecialDate) => {
    if (date) {
      setEditingDate(date);
      setFormData(date);
    } else {
      setEditingDate(null);
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        type: "anniversary",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDate(null);
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      type: "anniversary",
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.type) {
      alert("请填写所有必填项");
      return;
    }

    if (editingDate) {
      // Update existing
      onUpdateDate?.({ ...editingDate, ...formData } as SpecialDate);
    } else {
      // Add new
      const newDate: SpecialDate = {
        id: Date.now().toString(),
        title: formData.title,
        date: formData.date,
        type: formData.type as "birthday" | "anniversary" | "other",
      };
      onAddDate?.(newDate);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个纪念日吗?")) {
      onDeleteDate?.(id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return <Cake className="w-6 h-6" />;
      case "anniversary":
        return <Heart className="w-6 h-6" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-amber-100 text-amber-500";
      case "anniversary":
        return "bg-rose-100 text-rose-500";
      default:
        return "bg-blue-100 text-blue-500";
    }
  };

  return (
    <div className="p-6 md:p-12 pb-24 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <Gift className="w-8 h-8 text-pink-500" />
            重要纪念日
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
        <p className="text-slate-500 mt-2">记住每一个特别的日子</p>
      </div>

      <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-3xl p-8 text-white shadow-xl text-center mb-12">
        <Heart className="w-12 h-12 mx-auto mb-4 animate-pulse text-white/80" />
        <h3 className="text-2xl font-bold mb-2">我们已经相爱</h3>
        <div className="text-6xl font-bold font-mono my-4">
          {getDaysTogether()} <span className="text-xl">天</span>
        </div>
        <p className="opacity-90">
          始于{" "}
          {dates.find((d) => d.type === "anniversary")?.date
            ? new Date(
                dates.find((d) => d.type === "anniversary")!.date
              ).toLocaleDateString("zh-CN")
            : "2023年2月14日"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dates.map((date) => {
          const daysLeft = getDaysDiff(date.date);

          return (
            <div
              key={date.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(
                      date.type
                    )}`}
                  >
                    {getTypeIcon(date.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      {date.title}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {new Date(date.date).toLocaleDateString("zh-CN")}
                      {date.type === "birthday" && ` (${getAge(date.date)}岁)`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(date)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(date.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-center bg-slate-50 rounded-xl py-3">
                <div className="text-2xl font-bold text-slate-800">
                  {daysLeft}
                </div>
                <div className="text-xs text-slate-400">天后</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-fadeInUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {editingDate ? "编辑纪念日" : "添加纪念日"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="例如：我的生日"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  日期
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  类型
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as
                        | "birthday"
                        | "anniversary"
                        | "other",
                    })
                  }
                >
                  <option value="birthday">生日</option>
                  <option value="anniversary">纪念日</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
