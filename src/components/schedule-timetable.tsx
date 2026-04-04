"use client";

import Link from "next/link";
import type { Schedule, Room, PeriodDef } from "@/lib/types";
import { DAY_OF_WEEK_LABELS, ROOMS, PERIODS } from "@/lib/types";

const WEEKDAYS = [1, 2, 3, 4, 5, 6] as const;

interface ScheduleTimetableProps {
  schedules: Schedule[];
}

function getDefaultTime(p: PeriodDef, room: Room): { start: string; end: string } {
  return room === "A教室"
    ? { start: p.aStart, end: p.aEnd }
    : { start: p.bStart, end: p.bEnd };
}

export function ScheduleTimetable({ schedules }: ScheduleTimetableProps) {
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
            <PeriodRows key={p.period} periodDef={p} find={find} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PeriodRows({
  periodDef,
  find,
}: {
  periodDef: PeriodDef;
  find: (day: number, period: number, room: Room) => Schedule | undefined;
}) {
  const rooms: { room: Room; bgClass: string; label: string }[] = [
    { room: "A教室", bgClass: "bg-blue-50", label: "A" },
    { room: "B教室", bgClass: "bg-emerald-50", label: "B" },
  ];

  return (
    <>
      {rooms.map((r, idx) => {
        const defaultTime = getDefaultTime(periodDef, r.room);
        return (
          <tr key={r.room} className={r.bgClass}>
            {/* Period label cell — spans 2 rows, only rendered on first sub-row */}
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

            {/* Day columns */}
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
}: {
  schedule: Schedule | undefined;
  day: number;
  period: number;
  room: Room;
  periodDef: PeriodDef;
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

  const labelText = schedule.label;

  return (
    <Link
      href={`/schedule/${schedule.id}/edit?dayOfWeek=${schedule.dayOfWeek}`}
      className="flex flex-col items-center justify-center w-full h-full min-h-[3rem] px-1 py-1 border border-solid border-gray-400 hover:shadow-md transition-shadow"
    >
      <span
        className={`text-xs text-center leading-tight ${
          schedule.isImportant
            ? "font-bold text-red-600"
            : "text-gray-900"
        }`}
      >
        {labelText}
      </span>
      <span className="text-[10px] text-gray-600 mt-0.5">
        {schedule.teacherName}
      </span>
      <span className="text-[10px] text-gray-500">
        ({schedule.enrolledStudentIds.length}/{schedule.maxStudents})
      </span>
      {hasCustomTime && (
        <span className="text-[10px] text-gray-500">
          {schedule.startTime}–{schedule.endTime}
        </span>
      )}
    </Link>
  );
}
