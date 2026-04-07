"use client";

import { useState } from "react";
import Link from "next/link";
import type { Schedule, Room, PeriodDef, Student, AbsenceRecord } from "@/lib/types";
import { DAY_OF_WEEK_LABELS, PERIODS } from "@/lib/types";

const WEEKDAYS = [1, 2, 3, 4, 5, 6] as const;

interface ScheduleTimetableProps {
  schedules: Schedule[];
  students?: Student[];
  rescheduledAbsences?: AbsenceRecord[];
}

function getDefaultTime(p: PeriodDef, room: Room): { start: string; end: string } {
  return room === "A教室"
    ? { start: p.aStart, end: p.aEnd }
    : { start: p.bStart, end: p.bEnd };
}

export function ScheduleTimetable({ schedules, students, rescheduledAbsences }: ScheduleTimetableProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const studentMap = new Map<string, string>();
  if (students) {
    for (const s of students) {
      studentMap.set(s.id, `${s.lastName} ${s.firstName}`);
    }
  }

  const rescheduleMap = new Map<string, string[]>();
  if (rescheduledAbsences) {
    for (const absence of rescheduledAbsences) {
      if (absence.rescheduledScheduleId) {
        const names = rescheduleMap.get(absence.rescheduledScheduleId) ?? [];
        names.push(absence.studentName);
        rescheduleMap.set(absence.rescheduledScheduleId, names);
      }
    }
  }

  // Build lookup: key = "dayOfWeek-period-room"
  const lookup = new Map<string, Schedule>();
  for (const s of schedules) {
    lookup.set(`${s.dayOfWeek}-${s.period}-${s.room}`, s);
  }

  function find(day: number, period: number, room: Room): Schedule | undefined {
    return lookup.get(`${day}-${period}-${room}`);
  }

  return (
    <div className="overflow-x-auto">
      {/* Room color legend */}
      <div className="flex gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded border border-blue-200 bg-blue-50">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          A教室
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded border border-emerald-200 bg-emerald-50">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          B教室
        </span>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-2 text-gray-900 text-center min-w-[100px]">
              時限
            </th>
            {WEEKDAYS.map((day) => (
              <th
                key={day}
                className="border border-gray-300 px-2 py-2 text-gray-900 text-center min-w-[120px]"
              >
                {DAY_OF_WEEK_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((p) => (
            <PeriodRows
              key={p.period}
              periodDef={p}
              find={find}
              studentMap={studentMap}
              rescheduleMap={rescheduleMap}
              onSelect={setSelectedSchedule}
            />
          ))}
        </tbody>
      </table>

      {/* Detail modal */}
      {selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          studentMap={studentMap}
          rescheduleMap={rescheduleMap}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </div>
  );
}

function PeriodRows({
  periodDef,
  find,
  studentMap,
  rescheduleMap,
  onSelect,
}: {
  periodDef: PeriodDef;
  find: (day: number, period: number, room: Room) => Schedule | undefined;
  studentMap: Map<string, string>;
  rescheduleMap: Map<string, string[]>;
  onSelect: (s: Schedule) => void;
}) {
  const rooms: { room: Room; bgClass: string; label: string }[] = [
    { room: "A教室", bgClass: "bg-blue-50", label: "A" },
    { room: "B教室", bgClass: "bg-emerald-50", label: "B" },
  ];

  return (
    <>
      {rooms.map((r, idx) => {
        return (
          <tr key={r.room} className={r.bgClass}>
            {idx === 0 && (
              <td
                rowSpan={2}
                className="border border-gray-300 px-2 py-2 text-center align-middle"
              >
                <div className="font-semibold text-gray-900 text-sm">
                  {periodDef.label}
                </div>
                <div className="text-xs text-gray-900 mt-1">
                  <span className="text-blue-600 font-medium">A</span>{" "}
                  {periodDef.aStart}–{periodDef.aEnd}
                </div>
                <div className="text-xs text-gray-900">
                  <span className="text-emerald-600 font-medium">B</span>{" "}
                  {periodDef.bStart}–{periodDef.bEnd}
                </div>
              </td>
            )}

            {WEEKDAYS.map((day) => {
              const schedule = find(day, periodDef.period, r.room);
              return (
                <td
                  key={day}
                  className="border border-gray-300 p-0 h-14"
                >
                  <ScheduleCell
                    schedule={schedule}
                    day={day}
                    period={periodDef.period}
                    room={r.room}
                    periodDef={periodDef}
                    studentMap={studentMap}
                    rescheduleMap={rescheduleMap}
                    onSelect={onSelect}
                  />
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

function ScheduleCell({
  schedule,
  day,
  period,
  room,
  periodDef,
  studentMap,
  rescheduleMap,
  onSelect,
}: {
  schedule: Schedule | undefined;
  day: number;
  period: number;
  room: Room;
  periodDef: PeriodDef;
  studentMap: Map<string, string>;
  rescheduleMap: Map<string, string[]>;
  onSelect: (s: Schedule) => void;
}) {
  if (!schedule) {
    return (
      <Link
        href={`/schedule/new?dayOfWeek=${day}&period=${period}&room=${room}`}
        className="flex items-center justify-center w-full h-full min-h-[3rem] border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <span className="text-gray-400 text-xs">—</span>
      </Link>
    );
  }

  const defaultTime = getDefaultTime(periodDef, room);
  const hasCustomTime =
    schedule.startTime !== defaultTime.start || schedule.endTime !== defaultTime.end;

  return (
    <button
      type="button"
      onClick={() => onSelect(schedule)}
      className="flex flex-col items-center justify-center w-full h-full min-h-[3rem] px-1 py-1 border border-solid border-gray-400 hover:shadow-md transition-shadow cursor-pointer bg-transparent"
    >
      <span
        className={`text-xs text-center leading-tight ${
          schedule.isImportant
            ? "font-bold text-red-600"
            : "text-gray-900"
        }`}
      >
        {schedule.label}
      </span>
      <span className="text-[10px] text-gray-600 mt-0.5">
        {schedule.teacherName}
      </span>
      {(() => {
        const rescheduleCount = rescheduleMap.get(schedule.id)?.length ?? 0;
        return (
          <span className="text-[10px] text-gray-500">
            ({schedule.enrolledStudentIds.length}{rescheduleCount > 0 ? `+${rescheduleCount}` : ""}/{schedule.maxStudents})
          </span>
        );
      })()}
      {studentMap.size > 0 && schedule.enrolledStudentIds.length > 0 && (() => {
        const names = schedule.enrolledStudentIds
          .map((id) => studentMap.get(id))
          .filter((n): n is string => !!n);
        const display = names.slice(0, 2);
        const rest = names.length - 2;
        return (
          <span className="text-[9px] text-gray-500 text-center leading-tight">
            {display.join("、")}{rest > 0 && ` 他${rest}名`}
          </span>
        );
      })()}
      {rescheduleMap.get(schedule.id)?.length ? (
        <span className="text-[9px] text-purple-600 text-center leading-tight">
          {rescheduleMap.get(schedule.id)!.slice(0, 2).map(n => `${n}(振替)`).join("、")}
          {(rescheduleMap.get(schedule.id)!.length > 2) && ` 他${rescheduleMap.get(schedule.id)!.length - 2}名`}
        </span>
      ) : null}
      {hasCustomTime && (
        <span className="text-[10px] text-gray-500">
          {schedule.startTime}–{schedule.endTime}
        </span>
      )}
    </button>
  );
}

function ScheduleDetailModal({
  schedule,
  studentMap,
  rescheduleMap,
  onClose,
}: {
  schedule: Schedule;
  studentMap: Map<string, string>;
  rescheduleMap: Map<string, string[]>;
  onClose: () => void;
}) {
  const enrolledNames = schedule.enrolledStudentIds
    .map((id) => studentMap.get(id))
    .filter((n): n is string => !!n);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-bold text-gray-900">
            {schedule.label}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]}曜
            {schedule.startTime}–{schedule.endTime} ／ {schedule.room} ／ {schedule.teacherName}
          </p>
        </div>

        <div className="px-5 py-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            受講生徒（{enrolledNames.length}/{schedule.maxStudents}名）
          </h4>
          {enrolledNames.length === 0 ? (
            <p className="text-sm text-gray-500">登録生徒なし</p>
          ) : (
            <ul className="space-y-1">
              {enrolledNames.map((name, i) => (
                <li key={i} className="text-sm text-gray-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  {name}
                </li>
              ))}
            </ul>
          )}
          {rescheduleMap.get(schedule.id)?.length ? (
            <>
              <h4 className="text-sm font-semibold text-purple-700 mb-2 mt-4">
                振替生徒（{rescheduleMap.get(schedule.id)!.length}名）
              </h4>
              <ul className="space-y-1">
                {rescheduleMap.get(schedule.id)!.map((name, i) => (
                  <li key={`r-${i}`} className="text-sm text-purple-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-medium">
                      振
                    </span>
                    {name}(振替)
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex justify-between">
          <Link
            href={`/schedule/${schedule.id}/edit?dayOfWeek=${schedule.dayOfWeek}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            編集する →
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
