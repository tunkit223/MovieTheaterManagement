import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, PenSquare, PlusCircle, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { getStaffsByCinema } from "@/services/staffService";
import { workScheduleService } from "@/services/workScheduleService";
import type { ShiftTemplate, WorkScheduleResponse } from "@/services/workScheduleService";
import type { StaffProfile } from "@/types/StaffType/StaffProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/permissions";

type StaffMember = {
  id: string;
  name: string;
  role?: string;
  cinemaId?: string | null;
};

type ShiftAssignment = {
  scheduleId: string;
  userId: string;
  userName?: string;
};

type ShiftSlot = {
  id: string;
  templateId: string;
  name: string;
  startTime: string;
  endTime: string;
  assignments: ShiftAssignment[];
};

type DaySchedule = {
  date: string;
  slots: ShiftSlot[];
};

type SlotSelector = { date: string; slotId: string } | null;

const IS_MOCK_MODE = true; // Doi thanh false de ket noi lai backend

const MOCK_SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: "morning", cinemaId: "MOCK_CINEMA_ID", name: "Ca sang", startTime: "08:00", endTime: "12:00" },
  { id: "afternoon", cinemaId: "MOCK_CINEMA_ID", name: "Ca chieu", startTime: "12:00", endTime: "18:00" },
  { id: "night", cinemaId: "MOCK_CINEMA_ID", name: "Ca toi", startTime: "18:00", endTime: "23:00" },
];

const MOCK_STAFF_POOL: StaffMember[] = [
  { id: "s1", name: "Nguyen Van A", role: "Quan ly" },
  { id: "s2", name: "Tran Thi B", role: "Thu ngan" },
  { id: "s3", name: "Le Van C", role: "Soat ve" },
  { id: "s4", name: "Pham Thi D", role: "Ban do uong" },
  { id: "s5", name: "Hoang Van E", role: "Ky thuat" },
];

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const startOfWeek = (date: Date) => {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = clone.getDate() - day + (day === 0 ? -6 : 1);
  clone.setDate(diff);
  return clone;
};

const buildWeekDates = (startDate: Date) => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(toInputDate(d));
  }
  return dates;
};

const formatDayLabel = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
};

const formatTimeLabel = (time?: string) => {
  if (!time) return "--:--";
  return time.slice(0, 5);
};

const mapStaffProfileToMember = (staff: StaffProfile): StaffMember => {
  const fullName = [staff.firstName, staff.lastName].filter(Boolean).join(" ").trim();
  return {
    id: staff.staffId || staff.accountId,
    name: fullName || staff.username || staff.email,
    role: staff.jobTitle || undefined,
    cinemaId: staff.cinemaId,
  };
};

const buildScheduleFromApi = (
  dates: string[],
  templates: ShiftTemplate[],
  schedules: WorkScheduleResponse[]
): DaySchedule[] => {
  if (!templates.length) return [];

  const schedulesByDate = new Map<string, WorkScheduleResponse[]>();
  schedules.forEach((item) => {
    const dateKey = typeof item.workDate === "string" ? item.workDate : toInputDate(new Date(item.workDate));
    const list = schedulesByDate.get(dateKey) ?? [];
    list.push(item);
    schedulesByDate.set(dateKey, list);
  });

  const sortedTemplates = [...templates].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  return dates.map((date) => {
    const daySchedules = schedulesByDate.get(date) ?? [];
    return {
      date,
      slots: sortedTemplates.map((tpl) => {
        const matches = daySchedules.filter((s) => s.shiftTypeId === tpl.id);
        return {
          id: `${tpl.id}-${date}`,
          templateId: tpl.id,
          name: tpl.name,
          startTime: formatTimeLabel(tpl.startTime || matches[0]?.shiftStart),
          endTime: formatTimeLabel(tpl.endTime || matches[0]?.shiftEnd),
          assignments: matches.map((m) => ({
            scheduleId: m.id,
            userId: m.userId,
            userName: m.userName,
          })),
        };
      }),
    };
  });
};

const buildMockSchedule = (dates: string[], templates: ShiftTemplate[], staff: StaffMember[]): DaySchedule[] => {
  const sortedTemplates = [...templates].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  return dates.map((date, dateIndex) => ({
    date,
    slots: sortedTemplates.map((tpl, tplIndex) => {
      const assigned = staff
        .filter((_, staffIndex) => (staffIndex + dateIndex + tplIndex) % 2 === 0)
        .slice(0, 3);
      const fallback = staff[(dateIndex + tplIndex) % staff.length];
      const finalAssigned = assigned.length ? assigned : [fallback];

      return {
        id: `${tpl.id}-${date}`,
        templateId: tpl.id,
        name: tpl.name,
        startTime: formatTimeLabel(tpl.startTime),
        endTime: formatTimeLabel(tpl.endTime),
        assignments: finalAssigned.map((member, idx) => ({
          scheduleId: `${tpl.id}-${date}-${idx}`,
          userId: member.id,
          userName: member.name,
        })),
      };
    }),
  }));
};

export function WorkSchedulePage() {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [staffPool, setStaffPool] = useState<StaffMember[]>([]);
  const [selector, setSelector] = useState<SlotSelector>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStaffId, setSavingStaffId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ date: string; shiftTypeId: string; userIds: string[] }>({
    date: toInputDate(new Date()),
    shiftTypeId: "",
    userIds: [],
  });
  const [editContext, setEditContext] = useState<{ date: string; shiftTypeId: string; shiftName: string } | null>(null);
  const [editForm, setEditForm] = useState<{ date: string; shiftTypeId: string }>({
    date: toInputDate(new Date()),
    shiftTypeId: "",
  });
  const [deleteContext, setDeleteContext] = useState<{ date: string; shiftTypeId: string; shiftName: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingShift, setIsUpdatingShift] = useState(false);
  const [isDeletingShift, setIsDeletingShift] = useState(false);

  const weekDates = useMemo(() => buildWeekDates(weekStart), [weekStart]);
  const authCinemaId = useAuthStore((state) => state.user?.cinemaId ?? "");
  const cinemaId = IS_MOCK_MODE ? authCinemaId || "MOCK_CINEMA_ID" : authCinemaId;
  const addNotification = useNotificationStore((state) => state.addNotification);
  const { hasPermission } = usePermissions();
  const canCreateSchedule = hasPermission(PERMISSIONS.WORK_SCHEDULE_CREATE);
  const canUpdateSchedule = hasPermission(PERMISSIONS.WORK_SCHEDULE_UPDATE);
  const canDeleteSchedule = hasPermission(PERMISSIONS.WORK_SCHEDULE_DELETE);

  const loadMockWeek = useCallback((startDate: Date) => {
    const dates = buildWeekDates(startDate);
    setIsLoading(true);

    const templates = MOCK_SHIFT_TEMPLATES;
    const staff = MOCK_STAFF_POOL;

    setShiftTemplates(templates);
    setStaffPool(staff);
    setCreateForm((prev) => ({
      ...prev,
      shiftTypeId: prev.shiftTypeId || templates[0]?.id || "",
      date: prev.date || dates[0],
    }));
    setSchedule(buildMockSchedule(dates, templates, staff));

    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const refreshWeekData = useCallback(
    async (startDate: Date) => {
      if (IS_MOCK_MODE) {
        loadMockWeek(startDate);
        return;
      }

      // Backend flow giu lai de ket noi lai khi co API
      if (!cinemaId) {
        setStaffPool([]);
        setSchedule([]);
        return;
      }

      const dates = buildWeekDates(startDate);
      setIsLoading(true);

      try {
        const staffPromise = getStaffsByCinema(cinemaId).catch(() => [] as StaffProfile[]);
        const [templatesData, scheduleData, staffData] = await Promise.all([
          workScheduleService.getShiftTemplates(cinemaId),
          workScheduleService.getSchedules(cinemaId, dates[0], dates[6]),
          staffPromise,
        ]);

        const filteredStaff = (staffData ?? [])
          .map(mapStaffProfileToMember)
          .filter((member) => member.cinemaId === cinemaId);

        const templates = templatesData ?? [];
        const schedules = scheduleData ?? [];

        setStaffPool(filteredStaff);
        setShiftTemplates(templates);
        setCreateForm((prev) => ({
          ...prev,
          shiftTypeId: prev.shiftTypeId || templates[0]?.id || "",
          date: prev.date || dates[0],
        }));
        setSchedule(buildScheduleFromApi(dates, templates, schedules));
      } catch (error) {
        console.error(error);
        addNotification({
          type: "error",
          title: "Khong the tai lich truc",
          message: "Vui long thu lai hoac kiem tra ket noi toi may chu.",
          duration: 4500,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, cinemaId, loadMockWeek]
  );

  useEffect(() => {
    refreshWeekData(weekStart);
  }, [refreshWeekData, weekStart]);

  const staffMap = useMemo(() => {
    const map = new Map<string, StaffMember>();
    staffPool.forEach((s) => map.set(s.id, s));
    return map;
  }, [staffPool]);

  const totalShifts = schedule.reduce((acc, day) => acc + day.slots.length, 0);
  const totalAssignments = schedule.reduce(
    (acc, day) => acc + day.slots.reduce((s, slot) => s + slot.assignments.length, 0),
    0
  );
  const isPublished = totalAssignments > 0;

  const moveWeek = (direction: "prev" | "next") => {
    const delta = direction === "prev" ? -7 : 7;
    const nextStart = new Date(weekStart);
    nextStart.setDate(weekStart.getDate() + delta);
    setWeekStart(nextStart);
    setSelector(null);
  };

  const updateSlotAssignments = (date: string, slotId: string, updater: (list: ShiftAssignment[]) => ShiftAssignment[]) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.date === date
          ? {
              ...day,
              slots: day.slots.map((slot) =>
                slot.id === slotId ? { ...slot, assignments: updater(slot.assignments) } : slot
              ),
            }
          : day
      )
    );
  };

  const selectedSlotInfo = useMemo(() => {
    if (!selector) return null;
    const day = schedule.find((d) => d.date === selector.date);
    if (!day) return null;
    const slot = day.slots.find((s) => s.id === selector.slotId);
    if (!slot) return null;
    return { day, slot };
  }, [schedule, selector]);

  const assignStaff = async (date: string, slotId: string, templateId: string, staffId: string) => {
    if (IS_MOCK_MODE) {
      setIsSaving(true);
      setSavingStaffId(staffId);
      setTimeout(() => {
        const staff = staffMap.get(staffId);
        updateSlotAssignments(date, slotId, (list) => {
          if (list.some((a) => a.userId === staffId)) return list;
          return [
            ...list,
            {
              scheduleId: `mock-${templateId}-${staffId}-${Date.now()}`,
              userId: staffId,
              userName: staff?.name,
            },
          ];
        });
        setIsSaving(false);
        setSavingStaffId(null);
        addNotification({
          type: "success",
          title: "Da them nhan vien",
          message: `${staff?.name || staffId} da duoc them vao ca (gia lap).`,
          duration: 2500,
        });
      }, 200);
      return;
    }

    if (!cinemaId) {
      addNotification({
        type: "error",
        title: "Chua xac dinh rap",
        message: "Khong the phan ca khi khong co ma rap.",
        duration: 3000,
      });
      return;
    }
    setIsSaving(true);
    setSavingStaffId(staffId);
    try {
      const [created] =
        (await workScheduleService.createSchedules(cinemaId, {
          userIds: [staffId],
          shiftTypeId: templateId,
          workDate: date,
        })) ?? [];

      if (created) {
        const staff = staffMap.get(staffId);
        updateSlotAssignments(date, slotId, (list) => [
          ...list,
          {
            scheduleId: created.id,
            userId: created.userId,
            userName: created.userName || staff?.name,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong the phan ca",
        message: "Vui long thu lai hoac kiem tra du lieu nhap.",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
      setSavingStaffId(null);
    }
  };

  const unassignStaff = async (date: string, slotId: string, staffId: string) => {
    const assignment = schedule
      .find((d) => d.date === date)
      ?.slots.find((s) => s.id === slotId)
      ?.assignments.find((a) => a.userId === staffId);

    if (!assignment) return;

    if (IS_MOCK_MODE) {
      setIsSaving(true);
      setSavingStaffId(staffId);
      setTimeout(() => {
        updateSlotAssignments(date, slotId, (list) => list.filter((a) => a.userId !== staffId));
        setIsSaving(false);
        setSavingStaffId(null);
        addNotification({
          type: "success",
          title: "Da xoa nhan vien",
          message: `Da loai ${staffMap.get(staffId)?.name || staffId} khoi ca (gia lap).`,
          duration: 2500,
        });
      }, 180);
      return;
    }

    if (!cinemaId) {
      addNotification({
        type: "error",
        title: "Chua xac dinh rap",
        message: "Khong the huy phan ca khi khong co ma rap.",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    setSavingStaffId(staffId);
    try {
      await workScheduleService.deleteSchedule(cinemaId, assignment.scheduleId);
      updateSlotAssignments(date, slotId, (list) => list.filter((a) => a.userId !== staffId));
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong the huy phan ca",
        message: "Vui long thu lai sau.",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
      setSavingStaffId(null);
    }
  };

  const toggleStaff = (staffId: string) => {
    if (!canUpdateSchedule) return;
    if (!selector || !selectedSlotInfo) return;
    const { day, slot } = selectedSlotInfo;
    const isChecked = slot.assignments.some((a) => a.userId === staffId);
    if (isChecked) {
      unassignStaff(day.date, slot.id, staffId);
    } else {
      assignStaff(day.date, slot.id, slot.templateId, staffId);
    }
  };

  const removeStaff = (date: string, slotId: string, staffId: string) => {
    if (!canUpdateSchedule) return;
    unassignStaff(date, slotId, staffId);
  };

  const openCreateDialog = () => {
    if (!canCreateSchedule) return;
    setCreateForm({
      date: weekDates[0] ?? toInputDate(new Date()),
      shiftTypeId: shiftTemplates[0]?.id ?? "",
      userIds: [],
    });
    setCreateModalOpen(true);
  };

  const toggleCreateStaff = (staffId: string) => {
    setCreateForm((prev) => {
      const exists = prev.userIds.includes(staffId);
      return {
        ...prev,
        userIds: exists ? prev.userIds.filter((id) => id !== staffId) : [...prev.userIds, staffId],
      };
    });
  };

  const handleCreateSchedule = async () => {
    if (!canCreateSchedule) return;
    if (!createForm.shiftTypeId || !createForm.date || createForm.userIds.length === 0) {
      addNotification({
        type: "error",
        title: "Thieu thong tin",
        message: "Vui long chon ngay, ca lam va it nhat 1 nhan vien.",
        duration: 4000,
      });
      return;
    }
    setIsCreating(true);
    if (IS_MOCK_MODE) {
      setTimeout(() => {
        setSchedule((prev) =>
          prev.map((day) =>
            day.date === createForm.date
              ? {
                  ...day,
                  slots: day.slots.map((slot) =>
                    slot.templateId === createForm.shiftTypeId
                      ? {
                          ...slot,
                          assignments: [
                            ...slot.assignments,
                            ...createForm.userIds.map((id, idx) => ({
                              scheduleId: `mock-${slot.templateId}-${id}-${Date.now()}-${idx}`,
                              userId: id,
                              userName: staffMap.get(id)?.name,
                            })),
                          ],
                        }
                      : slot
                  ),
                }
              : day
          )
        );

        addNotification({
          type: "success",
          title: "Da tao lich",
          message: "Lich lam moi duoc them vao giao dien gia lap.",
          duration: 3500,
        });
        setCreateModalOpen(false);
        setIsCreating(false);
      }, 250);
      return;
    }

    if (!cinemaId) return;
    try {
      await workScheduleService.createSchedules(cinemaId, {
        userIds: createForm.userIds,
        shiftTypeId: createForm.shiftTypeId,
        workDate: createForm.date,
      });
      addNotification({
        type: "success",
        title: "Da tao lich",
        message: "Lich lam moi da duoc cap nhat.",
        duration: 3500,
      });
      setCreateModalOpen(false);
      refreshWeekData(weekStart);
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong tao duoc lich",
        message: "Vui long kiem tra du lieu va thu lai.",
        duration: 4500,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (date: string, shiftTypeId: string, shiftName: string) => {
    if (!canUpdateSchedule) return;
    setEditContext({ date, shiftTypeId, shiftName });
    setEditForm({ date, shiftTypeId });
  };

  const handleUpdateShift = async () => {
    if (!canUpdateSchedule) return;
    if (!editContext) return;
    const payload: { shiftTypeId?: string; workDate?: string } = {};
    if (editForm.shiftTypeId !== editContext.shiftTypeId) {
      payload.shiftTypeId = editForm.shiftTypeId;
    }
    if (editForm.date !== editContext.date) {
      payload.workDate = editForm.date;
    }
    if (!payload.shiftTypeId && !payload.workDate) {
      addNotification({
        type: "error",
        title: "Khong co gi de cap nhat",
        message: "Vui long thay doi ca lam hoac ngay lam truoc khi luu.",
        duration: 3500,
      });
      return;
    }
    setIsUpdatingShift(true);
    if (IS_MOCK_MODE) {
      setTimeout(() => {
        setSchedule((prev) => {
          const next = prev.map((day) => ({
            ...day,
            slots: day.slots.map((slot) => ({ ...slot, assignments: [...slot.assignments] })),
          }));

          const sourceDay = next.find((d) => d.date === editContext.date);
          const sourceSlot = sourceDay?.slots.find((s) => s.templateId === editContext.shiftTypeId);
          if (!sourceDay || !sourceSlot) return prev;

          const assignmentsToMove = [...sourceSlot.assignments];
          sourceSlot.assignments = [];

          const targetDay = next.find((d) => d.date === (payload.workDate || editContext.date));
          const targetSlot = targetDay?.slots.find((s) => s.templateId === (payload.shiftTypeId || editContext.shiftTypeId));
          if (!targetDay || !targetSlot) return prev;

          targetSlot.assignments = [
            ...targetSlot.assignments,
            ...assignmentsToMove.map((a, idx) => ({
              ...a,
              scheduleId: `${(payload.shiftTypeId || editContext.shiftTypeId)}-${payload.workDate || editContext.date}-${idx}`,
            })),
          ];

          return next;
        });

        addNotification({
          type: "success",
          title: "Da cap nhat ca",
          message: "Thong tin duoc cap nhat trong giao dien gia lap.",
          duration: 3500,
        });
        setEditContext(null);
        setIsUpdatingShift(false);
      }, 280);
      return;
    }

    if (!cinemaId) return;
    try {
      await workScheduleService.updateShiftInstance(
        cinemaId,
        editContext.shiftTypeId,
        editContext.date,
        payload
      );
      addNotification({
        type: "success",
        title: "Da cap nhat ca",
        message: "Thong tin ca lam da duoc cap nhat.",
        duration: 3500,
      });
      setEditContext(null);
      refreshWeekData(weekStart);
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong the cap nhat",
        message: "Vui long kiem tra du lieu va thu lai.",
        duration: 4500,
      });
    } finally {
      setIsUpdatingShift(false);
    }
  };

  const handleDeleteShift = async () => {
    if (!canDeleteSchedule) return;
    if (!deleteContext) return;
    setIsDeletingShift(true);
    if (IS_MOCK_MODE) {
      setTimeout(() => {
        setSchedule((prev) =>
          prev.map((day) =>
            day.date === deleteContext.date
              ? {
                  ...day,
                  slots: day.slots.map((slot) =>
                    slot.templateId === deleteContext.shiftTypeId ? { ...slot, assignments: [] } : slot
                  ),
                }
              : day
          )
        );
        addNotification({
          type: "success",
          title: "Da xoa ca",
          message: "Da xoa phan cong ca trong giao dien gia lap.",
          duration: 3500,
        });
        setDeleteContext(null);
        setIsDeletingShift(false);
      }, 260);
      return;
    }

    if (!cinemaId) return;
    try {
      await workScheduleService.deleteShiftInstance(
        cinemaId,
        deleteContext.shiftTypeId,
        deleteContext.date
      );
      addNotification({
        type: "success",
        title: "Da xoa ca",
        message: "Ca lam va phan cong lien quan da duoc xoa.",
        duration: 3500,
      });
      setDeleteContext(null);
      refreshWeekData(weekStart);
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Khong the xoa ca",
        message: "Thu lai sau hoac kiem tra ket noi.",
        duration: 4500,
      });
    } finally {
      setIsDeletingShift(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Schedule Management"
        description="Lich tuan 7 ngay voi cac ca truc va chon nhan vien. (Dang dung du lieu gia lap)"
      />

      {IS_MOCK_MODE && (
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
          Du lieu dang duoc gia lap de xem UI. Bo qua ket noi backend, thao tac chi cap nhat trong giao dien.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Tuan dang xem</CardTitle>
            <CardDescription>
              {formatDayLabel(weekDates[0]).day} - {formatDayLabel(weekDates[6]).day}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => moveWeek("prev")}>
              <ArrowLeft className="h-4 w-4" />
              Tuan truoc
            </Button>
            <Button variant="outline" size="sm" onClick={() => moveWeek("next")}>
              Tuan sau
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span>
                {totalShifts} ca / {totalAssignments} luot phan cong
              </span>
            </div>
            {canCreateSchedule && (
              <Button
                size="sm"
                className="gap-2"
                onClick={openCreateDialog}
                disabled={isLoading || !cinemaId || !shiftTemplates.length}
              >
                <PlusCircle className="h-4 w-4" />
                Tao lich lam
              </Button>
            )}
            <Button variant="outline" size="sm" disabled={isLoading} onClick={() => refreshWeekData(weekStart)}>
              {isLoading ? "Dang tai du lieu mau..." : "Tai lai du lieu"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {!cinemaId && !IS_MOCK_MODE && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Khong the tai lich truc vi thieu ma rap trong tai khoan.
              </div>
            )}
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">Dang tai du lieu mau...</div>
            )}
            {!isLoading && !schedule.length && (
              <div className="py-6 text-center text-sm text-muted-foreground">Chua co du lieu lich truc.</div>
            )}
            {schedule.length > 0 && (
              <div className="grid min-w-[980px] grid-cols-7 gap-3">
                {schedule.map((day) => {
                  const label = formatDayLabel(day.date);
                  const dayStaffCount = day.slots.reduce((acc, s) => acc + s.assignments.length, 0);
                  return (
                    <div
                      key={day.date}
                      className={cn(
                        "rounded-xl border p-3 space-y-3 transition-colors",
                        isPublished ? "bg-muted/40" : "bg-amber-50 border-amber-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">{label.weekday}</p>
                          <p className="text-sm font-semibold text-foreground">{label.day}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                          {dayStaffCount} NV
                        </span>
                      </div>

                      <div className="space-y-2">
                        {day.slots.map((slot) => {
                          const hasAssignments = slot.assignments.length > 0;
                          return (
                            <div
                              role={canUpdateSchedule ? "button" : undefined}
                              tabIndex={0}
                              key={slot.id}
                              onClick={() => {
                                if (!canUpdateSchedule) return;
                                setSelector({ date: day.date, slotId: slot.id });
                              }}
                              onKeyDown={(e) => {
                                if (!canUpdateSchedule) return;
                                if (e.key === "Enter" || e.key === " ") {
                                  setSelector({ date: day.date, slotId: slot.id });
                                }
                              }}
                              className={cn(
                                "w-full text-left rounded-lg border bg-background p-3 shadow-sm transition-colors focus:outline-none",
                                canUpdateSchedule
                                  ? "hover:border-primary/50 hover:bg-primary/5 focus:ring-2 focus:ring-primary/50"
                                  : "cursor-default"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{slot.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {slot.startTime} - {slot.endTime}
                                  </p>
                                </div>
                                {(canUpdateSchedule || canDeleteSchedule) && (
                                  <div className="flex items-center gap-1">
                                    {canUpdateSchedule && (
                                      <button
                                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditDialog(day.date, slot.templateId, slot.name);
                                        }}
                                        title="Chinh sua ca"
                                        disabled={!hasAssignments}
                                      >
                                        <PenSquare className="h-4 w-4" />
                                      </button>
                                    )}
                                    {canDeleteSchedule && (
                                      <button
                                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteContext({ date: day.date, shiftTypeId: slot.templateId, shiftName: slot.name });
                                        }}
                                        title="Xoa ca lam"
                                        disabled={!hasAssignments}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {slot.assignments.map((assignment) => {
                                  const staff = staffMap.get(assignment.userId);
                                  return (
                                    <span
                                      key={assignment.scheduleId}
                                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                    >
                                      {assignment.userName || staff?.name || assignment.userId}
                                      {canUpdateSchedule && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeStaff(day.date, slot.id, assignment.userId);
                                          }}
                                          className="text-primary/70 hover:text-primary focus:outline-none"
                                          title="Loai khoi ca"
                                          disabled={isSaving && savingStaffId === assignment.userId}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </span>
                                  );
                                })}
                                {slot.assignments.length === 0 && (
                                  <span className="text-[11px] text-muted-foreground">Nhan de chon nhan vien cho ca</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Tao lich lam" maxWidth="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Ngay lam
              <input
                type="date"
                min={toInputDate(new Date())}
                value={createForm.date}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, date: e.target.value }))}
                className="rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Ca lam
              <select
                value={createForm.shiftTypeId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, shiftTypeId: e.target.value }))}
                className="rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {shiftTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({formatTimeLabel(tpl.startTime)} - {formatTimeLabel(tpl.endTime)})
                  </option>
                ))}
                {!shiftTemplates.length && <option value="">Chua co ca lam</option>}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Nhan vien lam ca</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {staffPool.length === 0 && (
                <p className="col-span-2 text-sm text-muted-foreground">Khong co danh sach nhan vien.</p>
              )}
              {staffPool.map((staff) => {
                const checked = createForm.userIds.includes(staff.id);
                return (
                  <label
                    key={staff.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 cursor-pointer",
                      checked && "border-primary bg-primary/10"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCreateStaff(staff.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{staff.name}</span>
                      <span className="text-xs text-muted-foreground">{staff.role || "Staff"}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Huy
            </Button>
            <Button onClick={handleCreateSchedule} disabled={isCreating}>
              {isCreating ? "Dang luu..." : "Tao lich"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(editContext)}
        onClose={() => setEditContext(null)}
        title={editContext ? `Chinh sua ca ${editContext.shiftName}` : "Chinh sua ca"}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Ngay lam
            <input
              type="date"
              value={editForm.date}
              min={toInputDate(new Date())}
              onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Ca lam
            <select
              value={editForm.shiftTypeId}
              onChange={(e) => setEditForm((prev) => ({ ...prev, shiftTypeId: e.target.value }))}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {shiftTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({formatTimeLabel(tpl.startTime)} - {formatTimeLabel(tpl.endTime)})
                </option>
              ))}
              {!shiftTemplates.length && <option value="">Chua co ca lam</option>}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditContext(null)}>
              Huy
            </Button>
            <Button onClick={handleUpdateShift} disabled={isUpdatingShift}>
              {isUpdatingShift ? "Dang luu..." : "Cap nhat"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleteContext)}
        onClose={() => setDeleteContext(null)}
        title="Xoa ca lam"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Ban co chac muon xoa ca{" "}
            <span className="font-semibold text-foreground">{deleteContext?.shiftName}</span> vao{" "}
            {deleteContext ? formatDayLabel(deleteContext.date).day : ""}? Tat ca nhan vien trong ca se bi huy.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteContext(null)}>
              Huy
            </Button>
            <Button variant="destructive" onClick={handleDeleteShift} disabled={isDeletingShift}>
              {isDeletingShift ? "Dang xoa..." : "Xoa ca"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(selector && selectedSlotInfo)}
        onClose={() => setSelector(null)}
        title={
          selectedSlotInfo
            ? `Chon nhan vien cho ${selectedSlotInfo.slot.name} - ${formatDayLabel(
                selectedSlotInfo.day.date
              ).day}`
            : undefined
        }
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {staffPool.length === 0 && (
              <p className="col-span-2 text-sm text-muted-foreground">Khong co danh sach nhan vien.</p>
            )}
            {staffPool.map((staff) => {
              const checked = selectedSlotInfo?.slot.assignments.some((a) => a.userId === staff.id) ?? false;
              return (
                <label
                  key={staff.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 cursor-pointer",
                    checked && "border-primary bg-primary/10"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isSaving && savingStaffId === staff.id}
                    onChange={() => toggleStaff(staff.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{staff.name}</span>
                    <span className="text-xs text-muted-foreground">{staff.role || "Staff"}</span>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelector(null)}>
              Dong
            </Button>
            <Button onClick={() => setSelector(null)}>Luu</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
