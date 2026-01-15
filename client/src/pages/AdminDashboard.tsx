import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar, Download, Edit2, Trash2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Booking {
  id: number;
  route: string;
  name: string;
  phone: string;
  carModel: string;
  carPlate: string | null;
  bookingDate: string;
  multipleVehicles: number;
  videoUpgrade: number;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<BookingStatus>("pending");
  const [editNotes, setEditNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");

  const bookingsQuery = trpc.booking.list.useQuery();
  const updateMutation = trpc.booking.update.useMutation();
  const deleteMutation = trpc.booking.delete.useMutation();

  if (loading) return <div className="p-8">載入中...</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">存取被拒</h1>
          <p className="text-muted-foreground">您沒有權限訪問此頁面。</p>
        </Card>
      </div>
    );
  }

  const bookings = (bookingsQuery.data || []) as Booking[];

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingMonth = booking.bookingDate.slice(0, 7);
      const monthMatch = bookingMonth === selectedMonth;
      const statusMatch = filterStatus === "all" || booking.status === filterStatus;
      return monthMatch && statusMatch;
    });
  }, [bookings, selectedMonth, filterStatus]);

  const handleUpdate = async (id: number) => {
    try {
      await updateMutation.mutateAsync({
        id,
        status: editStatus,
        notes: editNotes,
      });
      toast.success("預約已更新");
      setEditingId(null);
      bookingsQuery.refetch();
    } catch (error) {
      toast.error("更新失敗");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此預約嗎？")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("預約已刪除");
      bookingsQuery.refetch();
    } catch (error) {
      toast.error("刪除失敗");
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "地點", "姓名", "電話", "車型", "車牌", "日期", "狀態", "多台車", "動態影片", "備註", "建立時間"];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.route,
      b.name,
      b.phone,
      b.carModel,
      b.carPlate || "",
      b.bookingDate,
      b.status,
      b.multipleVehicles ? "是" : "否",
      b.videoUpgrade ? "是" : "否",
      b.notes || "",
      new Date(b.createdAt).toLocaleString("zh-HK"),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings-${selectedMonth}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV 已匯出");
  };

  const statusColors: Record<BookingStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<BookingStatus, string> = {
    pending: "待確認",
    confirmed: "已確認",
    completed: "已完成",
    cancelled: "已取消",
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">預約管理儀表板</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">總預約數</p>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">待確認</p>
            <p className="text-3xl font-bold text-yellow-600">{bookings.filter((b) => b.status === "pending").length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">已確認</p>
            <p className="text-3xl font-bold text-blue-600">{bookings.filter((b) => b.status === "confirmed").length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">已完成</p>
            <p className="text-3xl font-bold text-green-600">{bookings.filter((b) => b.status === "completed").length}</p>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <Label className="text-base font-semibold mb-2 block">選擇月份</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-border"
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block">篩選狀態</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as BookingStatus | "all")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="pending">待確認</SelectItem>
                  <SelectItem value="confirmed">已確認</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              匯出 CSV
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>此月份沒有預約</p>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                {editingId === booking.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">狀態</Label>
                        <Select value={editStatus} onValueChange={(value) => setEditStatus(value as BookingStatus)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">待確認</SelectItem>
                            <SelectItem value="confirmed">已確認</SelectItem>
                            <SelectItem value="completed">已完成</SelectItem>
                            <SelectItem value="cancelled">已取消</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">備註</Label>
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="新增或編輯備註..."
                        className="border-border"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdate(booking.id)}
                        disabled={updateMutation.isPending}
                        className="bg-accent hover:bg-accent/90 text-white"
                      >
                        保存
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outline"
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{booking.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.route}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[booking.status]}`}>
                        {statusLabels[booking.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">電話</p>
                        <p className="font-semibold">{booking.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">車型</p>
                        <p className="font-semibold">{booking.carModel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">預約日期</p>
                        <p className="font-semibold">{booking.bookingDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">建立時間</p>
                        <p className="font-semibold text-sm">{new Date(booking.createdAt).toLocaleDateString("zh-HK")}</p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4 p-3 bg-secondary rounded">
                        <p className="text-sm"><strong>備註：</strong> {booking.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(booking.id);
                          setEditStatus(booking.status);
                          setEditNotes(booking.notes || "");
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        編輯
                      </Button>
                      <Button
                        onClick={() => handleDelete(booking.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        刪除
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
