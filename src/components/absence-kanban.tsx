"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import Link from "next/link";
import type { AbsenceRecord, AbsenceStatus } from "@/lib/types";

const COLUMNS: { id: AbsenceStatus; title: string; color: string; bgColor: string }[] = [
  { id: "reported", title: "欠席一覧", color: "border-red-400", bgColor: "bg-red-50" },
  { id: "rescheduled", title: "振替実施予定", color: "border-yellow-400", bgColor: "bg-yellow-50" },
  { id: "completed", title: "振替実施済み", color: "border-green-400", bgColor: "bg-green-50" },
];

interface AbsenceKanbanProps {
  initialAbsences: AbsenceRecord[];
}

export function AbsenceKanban({ initialAbsences }: AbsenceKanbanProps) {
  const [absences, setAbsences] = useState(initialAbsences);

  function getColumnItems(status: AbsenceStatus) {
    return absences
      .filter((a) => a.status === status)
      .sort((a, b) => b.originalDate.localeCompare(a.originalDate));
  }

  async function handleDragEnd(result: DropResult) {
    const { draggableId, destination, source } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as AbsenceStatus;
    const absence = absences.find((a) => a.id === draggableId);
    if (!absence) return;

    // 楽観的更新
    setAbsences((prev) =>
      prev.map((a) =>
        a.id === draggableId ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a
      )
    );

    try {
      const res = await fetch(`/api/absences/${absence.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: absence.studentId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // ロールバック
      setAbsences((prev) =>
        prev.map((a) =>
          a.id === draggableId ? { ...a, status: absence.status } : a
        )
      );
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4 min-h-[600px]">
        {COLUMNS.map((col) => {
          const items = getColumnItems(col.id);
          return (
            <div key={col.id} className={`rounded-lg border-t-4 ${col.color} bg-white shadow-sm`}>
              <div className={`px-4 py-3 ${col.bgColor} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{col.title}</h3>
                  <span className="text-sm font-medium text-gray-900 bg-white rounded-full px-2 py-0.5 shadow-sm">
                    {items.length}
                  </span>
                </div>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 space-y-3 min-h-[400px] transition-colors ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                  >
                    {items.map((absence, index) => (
                      <Draggable key={absence.id} draggableId={absence.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow ${
                              snapshot.isDragging ? "shadow-lg ring-2 ring-blue-300" : "hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-medium text-gray-900">
                                  {absence.studentName}
                                </span>
                                {absence.gradeLevel && (
                                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                    {absence.gradeLevel}
                                  </span>
                                )}
                              </div>
                              <Link
                                href={`/absences/${absence.id}/edit?studentId=${absence.studentId}`}
                                className="text-xs text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                編集
                              </Link>
                            </div>
                            <div className="space-y-1 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{absence.originalDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>📚</span>
                                <span>
                                  {absence.subject}
                                  {absence.schedulePeriod && (
                                    <span className="text-xs text-gray-500 ml-1">{absence.schedulePeriod}</span>
                                  )}
                                </span>
                              </div>
                              {absence.reason && (
                                <div className="flex items-start gap-2">
                                  <span>💬</span>
                                  <span className="line-clamp-2">{absence.reason}</span>
                                </div>
                              )}
                              {absence.rescheduledDate && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                  <span>🔄</span>
                                  <span>振替: {absence.rescheduledDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-center text-gray-900 text-sm py-8">
                        カードがありません
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
