import { useEffect, useMemo, useState } from "react";
import { PlusCircle, RefreshCw, Clock3, Pencil, Trash } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { workScheduleService } from "@/services/workScheduleService";
import type { ShiftTemplate } from "@/services/workScheduleService";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  startTime: string;
  endTime: string;
};

const IS_MOCK_MODE = true; // Doi thanh false khi ket noi backend
const MOCK_SHIFT_TYPES: ShiftTemplate[] = [
  { id: "morning", cinemaId: "MOCK_CINEMA_ID", name: "Ca sang", startTime: "08:00", endTime: "12:00" },
  { id: "afternoon", cinemaId: "MOCK_CINEMA_ID", name: "Ca chieu", startTime: "12:00", endTime: "18:00" },
  { id: "night", cinemaId: "MOCK_CINEMA_ID", name: "Ca toi", startTime: "18:00", endTime: "23:00" },
];

const emptyForm: FormState = {
  name: "",
  startTime: "08:00",
  endTime: "12:00",
};

export function ShiftTypesPage() {
  const cinemaId = useAuthStore((s) => s.user?.cinemaId ?? "");
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const normalizeTime = (time?: string) => (time || "").slice(0, 5);

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => normalizeTime(a.startTime).localeCompare(normalizeTime(b.startTime))),
    [templates]
  );

  const loadTemplates = async () => {
    if (IS_MOCK_MODE) {
      setTemplates(MOCK_SHIFT_TYPES);
      return;
    }

    if (!cinemaId) {
      setTemplates([]);
      addNotification({
        type: "error",
        title: "Khong tim thay ma rap",
        message: "Vui long dang nhap lai hoac kiem tra thong tin tai khoan.",
        duration: 3500,
      });
      return;
    }
    setIsLoading(true);
    try {
      const data = await workScheduleService.getShiftTemplates(cinemaId);
      setTemplates(data ?? []);
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong the tai ca lam",
        message: "Vui long thu lai hoac kiem tra ket noi.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [cinemaId]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: ShiftTemplate) => {
    setEditingId(tpl.id);
    setForm({
      name: tpl.name,
      startTime: normalizeTime(tpl.startTime),
      endTime: normalizeTime(tpl.endTime),
    });
    setIsModalOpen(true);
  };

  const submitForm = async () => {
    if (!cinemaId && !IS_MOCK_MODE) {
      addNotification({
        type: "error",
        title: "Chua co ma rap",
        message: "Khong the luu ca lam neu chua xac dinh rap quan ly.",
        duration: 3500,
      });
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        if (IS_MOCK_MODE) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === editingId ? { ...t, ...form } : t))
          );
        } else {
          const updated = await workScheduleService.updateShiftTemplate(cinemaId, editingId, {
            name: form.name,
            startTime: form.startTime,
            endTime: form.endTime,
          });
          setTemplates((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
        }
        addNotification({
          type: "success",
          title: "Cap nhat ca lam",
          message: "Da cap nhat ca lam thanh cong.",
          duration: 3000,
        });
      } else {
        if (IS_MOCK_MODE) {
          const created: ShiftTemplate = {
            id: `mock-${Date.now()}`,
            cinemaId: cinemaId || "MOCK_CINEMA_ID",
            ...form,
          };
          setTemplates((prev) => [...prev, created]);
        } else {
          const created = await workScheduleService.createShiftTemplate(cinemaId, {
            name: form.name,
            startTime: form.startTime,
            endTime: form.endTime,
          });
          setTemplates((prev) => [...prev, created]);
        }
        addNotification({
          type: "success",
          title: "Them ca lam",
          message: "Da tao ca lam moi.",
          duration: 3000,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong the luu ca lam",
        message: "Vui long kiem tra thong tin va thu lai.",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTemplate = async (tpl: ShiftTemplate) => {
    if (!cinemaId && !IS_MOCK_MODE) {
      addNotification({
        type: "error",
        title: "Chua co ma rap",
        message: "Khong the xoa ca lam khi chua xac dinh rap.",
        duration: 3000,
      });
      return;
    }
    setWorkingId(tpl.id);
    try {
      if (IS_MOCK_MODE) {
        setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
      } else {
        await workScheduleService.deleteShiftTemplate(cinemaId, tpl.id);
        setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
      }
      addNotification({
        type: "success",
        title: "Da xoa ca lam",
        message: tpl.name,
        duration: 2500,
      });
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong the xoa ca lam",
        message: "Thu lai sau.",
        duration: 3500,
      });
    } finally {
      setWorkingId(null);
    }
  };

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ca lam"
        description="Quan ly danh sach ca lam, khung gio va trang thai kich hoat."
      />

      {IS_MOCK_MODE && (
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
          Du lieu dang duoc gia lap de xem UI. Bo qua ket noi backend, thao tac chi cap nhat trong giao dien.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Danh sach ca lam</CardTitle>
            <CardDescription>Ap dung cho rap: {cinemaId || "Chua xac dinh"}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadTemplates} disabled={isLoading || (!cinemaId && !IS_MOCK_MODE)}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Tai lai
            </Button>
            <Button size="sm" onClick={openCreateModal} disabled={!cinemaId && !IS_MOCK_MODE}>
              <PlusCircle className="h-4 w-4" />
              Them ca lam
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!cinemaId && !IS_MOCK_MODE ? (
            <p className="text-sm text-muted-foreground">
              Khong the hien thi ca lam vi chua xac dinh rap quan ly.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Dang tai ca lam...</p>
          ) : sortedTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chua co ca lam. Them moi de bat dau.</p>
          ) : (
            <div className="space-y-3">
              {sortedTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tpl.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {normalizeTime(tpl.startTime)} - {normalizeTime(tpl.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(tpl)}>
                      <Pencil className="h-4 w-4" />
                      Sua
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteTemplate(tpl)}
                      disabled={workingId === tpl.id}
                    >
                      <Trash className="h-4 w-4" />
                      Xoa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Chinh sua ca lam" : "Them ca lam moi"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ten ca</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Vi du: Ca sang"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Bat dau</Label>
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Ket thuc</Label>
              <Input
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Huy
            </Button>
            <Button onClick={submitForm} disabled={isSaving || !form.name}>
              {isSaving ? "Dang luu..." : "Luu"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
