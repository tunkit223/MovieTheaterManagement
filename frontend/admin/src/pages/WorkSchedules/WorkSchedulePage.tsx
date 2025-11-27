import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, PlusCircle } from "lucide-react";
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

  return dates.map((date) => {
    const daySchedules = schedulesByDate.get(date) ?? [];
    return {
      date,
      slots: templates.map((tpl) => {
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

export function WorkSchedulePage() {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [staffPool, setStaffPool] = useState<StaffMember[]>([]);
  const [selector, setSelector] = useState<SlotSelector>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStaffId, setSavingStaffId] = useState<string | null>(null);

  const weekDates = useMemo(() => buildWeekDates(weekStart), [weekStart]);
  const cinemaId = useAuthStore((state) => state.user?.cinemaId ?? "");
  const addNotification = useNotificationStore((state) => state.addNotification);

  const refreshWeekData = useCallback(
    async (startDate: Date) => {
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
    [addNotification, cinemaId]
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
      const [created] = await workScheduleService.publishSchedules(cinemaId, [
        { userId: staffId, shiftTypeId: templateId, workDate: date },
      ]);

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
    if (!cinemaId) {
      addNotification({
        type: "error",
        title: "Chua xac dinh rap",
        message: "Khong the huy phan ca khi khong co ma rap.",
        duration: 3000,
      });
      return;
    }

    const assignment = schedule
      .find((d) => d.date === date)
      ?.slots.find((s) => s.id === slotId)
      ?.assignments.find((a) => a.userId === staffId);

    if (!assignment) return;

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
    unassignStaff(date, slotId, staffId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Schedule Management"
        description="Lich tuan 7 ngay voi cac ca truc va chon nhan vien."
      />

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
            <Button
              size="sm"
              className="gap-2"
              disabled={isLoading}
              onClick={() => refreshWeekData(weekStart)}
            >
              <PlusCircle className="h-4 w-4" />
              {isLoading ? "Dang tai..." : "Tai lai du lieu"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {!cinemaId && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Khong the tai lich truc vi thieu ma rap trong tai khoan.
              </div>
            )}
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">Dang tai lich truc tu backend...</div>
            )}
            {!isLoading && cinemaId && !schedule.length && (
              <div className="py-6 text-center text-sm text-muted-foreground">Chua co du lieu lich truc.</div>
            )}
            {cinemaId && schedule.length > 0 && (
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
                        {day.slots.map((slot) => (
                          <button
                            type="button"
                            key={slot.id}
                            onClick={() => setSelector({ date: day.date, slotId: slot.id })}
                            className="w-full text-left rounded-lg border bg-background p-3 shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{slot.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              </div>
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
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeStaff(day.date, slot.id, assignment.userId);
                                      }}
                                      className="text-primary/70 hover:text-primary focus:outline-none"
                                      title="Loai khoi ca"
                                      disabled={isSaving && savingStaffId === assignment.userId}
                                    >
                                      A-
                                    </button>
                                  </span>
                                );
                              })}
                              {slot.assignments.length === 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                  Nhan de chon nhan vien cho ca
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
