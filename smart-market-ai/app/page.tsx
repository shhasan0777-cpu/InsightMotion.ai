"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  BadgePercent,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  FlaskConical,
  Globe,
  Home as HomeIcon,
  LayoutGrid,
  LineChart,
  Megaphone,
  Package,
  PlusSquare,
  Search,
  Sparkles,
  Trophy,
  User,

  MessageCircle,
  HelpCircle,
  Percent,
  FileText,
  Type,
  Layers,
  Image as ImageIcon,
  Video,
  Users,
  BarChart3,
  Boxes,
  Tags,
  Wallet,
  Calculator,
  Copy,
  UserPlus,
  BellRing,
  Plus,
  Check,
} from "lucide-react";
type Task = {
  id: string;
  title: string;
  description?: string | null;
  project?: string | null;
  type: string;
  priority: string;
  status: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  done: boolean;
  repeat?: string | null;
  executor?: string | null;
  reminder?: string | null;
};
export default function Home() {
  const [activePage, setActivePage] = useState("Главная");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);
  const [createTaskTime, setCreateTaskTime] = useState<string | null>(null);


  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <>
      <main className="h-screen bg-[#f7f9fc] text-slate-900 overflow-hidden">
        <div className="flex h-screen">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />

          <section className="flex-1 h-screen overflow-y-auto p-6">
            <header className="flex items-center gap-3 mb-8">
              <GlobalSearch />


              <div className="relative z-[200]">
                <TopIcon
                  icon={<CalendarDays size={18} />}
                  active={calendarOpen}
                  onClick={() => {
                    console.log("calendar clicked");
                    setCalendarOpen((prev) => !prev);
                  }}
                />

                {calendarOpen && (
                  <>
                    <button
                      onClick={() => setCalendarOpen(false)}
                      className="fixed inset-0 z-40 cursor-default"
                    />

                    <CalendarDropdown
                      onClose={() => setCalendarOpen(false)}
                      tasks={tasks}
                      onCreateTask={(date?: Date) => {
                        setCalendarOpen(false);
                        setCreateTaskDate(date || null);
                        setCreateTaskOpen(true);
                      }}
                      goToCalendar={() => {
                        setCalendarOpen(false);
                        setActivePage("Календарь задач");
                      }}
                    />    </>
                )}
              </div>
              <div className="h-14 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  A
                </div>

                <div>
                  <p className="text-sm font-bold">Алексей</p>
                  <p className="text-xs text-slate-500">Продавец</p>
                </div>

                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </header>

            {activePage === "Главная" ? (
              <DashboardContent />
            ) : activePage === "Календарь задач" ? (
              <TasksCalendarPage
                tasks={tasks}
                onCreateTask={(date?: Date, time?: string) => {
                  setCreateTaskDate(date || null);
                  setCreateTaskTime(time || null);
                  setCreateTaskOpen(true);
                }}
                loadTasks={loadTasks}
              />
            ) : (
              <PageStub title={activePage} />
            )}

          </section>
        </div>
      </main>
      {createTaskOpen && (
        <TaskModal
          initialDate={createTaskDate}
          initialTime={createTaskTime}
          onClose={() => {
            setCreateTaskOpen(false);
            setCreateTaskDate(null);
            setCreateTaskTime(null);
          }}
          onSaved={loadTasks}
        />
      )}
    </>
  );
}
function TasksCalendarPage({ tasks, onCreateTask, loadTasks }: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(new Date(today));
  const [viewMode, setViewMode] = useState("Месяц");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskCardKey, setExpandedTaskCardKey] = useState<string | null>(null);
  const [selectedGroupTaskIds, setSelectedGroupTaskIds] = useState<Record<string, string>>({});
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [hoveredGroupTaskIds, setHoveredGroupTaskIds] = useState<Record<string, string>>({});
  const [copiedTask, setCopiedTask] = useState<Task | null>(null);
  const [selectedPasteSlot, setSelectedPasteSlot] = useState<{
    date: Date;
    time: string;
  } | null>(null);
  const monthNames = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];

  const monthNamesTitle = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  async function pasteCopiedTask(slot?: { date: Date; time: string }) {
    const targetSlot = slot || selectedPasteSlot;

    if (!copiedTask || !targetSlot) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: copiedTask.title,
        description: copiedTask.description,
        project: copiedTask.project,
        type: copiedTask.type,
        priority: copiedTask.priority,
        status: "planned",
        date: dateKey(targetSlot.date),
        startTime: targetSlot.time,
        endTime: copiedTask.endTime,
        done: false,
        repeat: copiedTask.repeat,
        executor: copiedTask.executor,
        reminder: copiedTask.reminder,
      }),
    });

    setSelectedPasteSlot(null);
    await loadTasks();
  }

  function dateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getPriorityColor(priority: string) {
    if (priority === "Высокий" || priority === "high") return "#ef4444";
    if (priority === "Средний" || priority === "medium") return "#facc15";
    if (priority === "Низкий" || priority === "low") return "#22c55e";

    return "#cbd5e1";
  }

  function getGroupPriorityGradient(groupTasks: Task[]) {
    const colors = groupTasks.map((task) => getPriorityColor(task.priority));

    if (colors.length === 1) {
      return colors[0];
    }

    const step = 100 / colors.length;

    return `linear-gradient(to bottom, ${colors
      .map((color, index) => {
        const start = Math.round(index * step);
        const end = Math.round((index + 1) * step);
        return `${color} ${start}% ${end}%`;
      })
      .join(", ")})`;
  }
  function getPriorityStripe(priority: string) {
    if (priority === "Высокий" || priority === "high") return "bg-red-500";
    if (priority === "Средний" || priority === "medium") return "bg-yellow-400";
    if (priority === "Низкий" || priority === "low") return "bg-green-500";
    return "bg-slate-300";
  }
  function getPriorityBadgeClass(priority: string) {
    if (priority === "Высокий" || priority === "high") {
      return "bg-red-50 text-red-600 border-red-100";
    }

    if (priority === "Средний" || priority === "medium") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    if (priority === "Низкий" || priority === "low") {
      return "bg-green-50 text-green-600 border-green-100";
    }

    return "bg-slate-50 text-slate-500 border-slate-100";
  }
  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    await loadTasks();
  }
  async function postponeTask(task: Task) {
    const nextDate = new Date(task.date);
    nextDate.setDate(nextDate.getDate() + 1);

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateKey(nextDate),
      }),
    });

    await loadTasks();
  }
  async function completeTask(taskId: string, done?: boolean) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        done: !done,
        status: !done ? "done" : "planned",
      }),
    });

    await loadTasks();
  }

  function getTaskIcon(type: string) {
    switch (type) {
      case "Отзывы": return <MessageCircle size={13} />;
      case "Вопросы": return <HelpCircle size={13} />;
      case "Реклама": return <Megaphone size={13} />;
      case "Акции": return <Percent size={13} />;
      case "SEO описание": return <FileText size={13} />;
      case "SEO название": return <Type size={13} />;
      case "SEO карточка": return <Layers size={13} />;
      case "SEO кластеры": return <Search size={13} />;
      case "Инфографика": return <ImageIcon size={13} />;
      case "Видео": return <Video size={13} />;
      case "Конкуренты": return <Users size={13} />;
      case "Аналитика": return <BarChart3 size={13} />;
      case "Товары": return <Boxes size={13} />;
      case "Цены": return <Tags size={13} />;
      case "Финансы": return <Wallet size={13} />;
      case "Юнит-эко": return <Calculator size={13} />;
      case "Шаблоны": return <Copy size={13} />;
      default: return <CalendarDays size={13} />;
    }
  }
  function getTaskTextColor(type: string) {
    switch (type) {
      case "Отзывы":
        return "text-red-600";
      case "Вопросы":
        return "text-blue-600";
      case "Реклама":
        return "text-orange-600";
      case "Акции":
        return "text-pink-600";
      case "SEO описание":
      case "SEO название":
      case "SEO карточка":
      case "SEO кластеры":
        return "text-violet-600";
      case "Инфографика":
      case "Видео":
        return "text-purple-600";
      case "Аналитика":
        return "text-sky-600";
      case "Товары":
        return "text-emerald-600";
      case "Цены":
        return "text-yellow-700";
      case "Финансы":
        return "text-green-700";
      default:
        return "text-violet-600";
    }
  }
  function getGroupHoverColor(type: string) {
    switch (type) {
      case "Отзывы":
        return "from-red-50 via-red-50 to-red-100 text-red-700 border-red-200";
      case "Вопросы":
        return "from-blue-50 via-blue-50 to-blue-100 text-blue-700 border-blue-200";
      case "Реклама":
        return "from-orange-50 via-orange-50 to-orange-100 text-orange-700 border-orange-200";
      case "Акции":
        return "from-pink-50 via-pink-50 to-pink-100 text-pink-700 border-pink-200";
      case "SEO описание":
      case "SEO название":
      case "SEO карточка":
      case "SEO кластеры":
        return "from-violet-50 via-violet-50 to-violet-100 text-violet-700 border-violet-200";
      case "Инфографика":
      case "Видео":
        return "from-purple-50 via-purple-50 to-purple-100 text-purple-700 border-purple-200";
      case "Аналитика":
        return "from-sky-50 via-sky-50 to-sky-100 text-sky-700 border-sky-200";
      case "Товары":
        return "from-emerald-50 via-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200";
      case "Цены":
        return "from-yellow-50 via-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200";
      case "Финансы":
        return "from-green-50 via-green-50 to-green-100 text-green-700 border-green-200";
      default:
        return "from-violet-50 via-violet-50 to-violet-100 text-violet-700 border-violet-200";
    }
  }
  function getCategoryGradient(tasks: Task[]) {
    const colors = tasks.map((task) => {
      switch (task.type) {
        case "Отзывы":
          return "from-red-500";
        case "Акции":
          return "from-pink-500";
        case "Реклама":
          return "from-orange-500";
        case "Аналитика":
          return "from-sky-500";
        case "Товары":
          return "from-emerald-500";
        case "Финансы":
          return "from-green-500";
        case "Цены":
          return "from-yellow-500";
        case "Инфографика":
        case "Видео":
          return "from-purple-500";
        default:
          return "from-violet-500";
      }
    });

    const unique = [...new Set(colors)];

    if (unique.length === 1) {
      return "bg-gradient-to-br from-violet-950 via-indigo-900 to-violet-700";
    }

    const first = unique[0].replace("from-", "from-");
    const second = unique[1].replace("from-", "via-");
    const third = (unique[2] || unique[0]).replace("from-", "to-");

    return `bg-gradient-to-br ${first} ${second} ${third}`;
  }
  function getTaskColor(type: string) {
    switch (type) {
      case "Отзывы":
        return "bg-red-50 text-red-600 border-red-200";
      case "Вопросы":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "Реклама":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "Акции":
        return "bg-pink-50 text-pink-600 border-pink-200";
      case "SEO описание":
        return "bg-violet-50 text-violet-600 border-violet-200";
      case "SEO название":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "SEO карточка":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "SEO кластеры":
        return "bg-cyan-50 text-cyan-600 border-cyan-200";
      case "Инфографика":
        return "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200";
      case "Видео":
        return "bg-rose-50 text-rose-600 border-rose-200";
      case "Конкуренты":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "Аналитика":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "Товары":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "Цены":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Финансы":
        return "bg-green-50 text-green-700 border-green-200";
      case "Юнит-эко":
        return "bg-lime-50 text-lime-700 border-lime-200";
      case "Шаблоны":
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
      default:
        return "bg-violet-50 text-violet-600 border-violet-200";
    }
  }
  function getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const weekStart = getWeekStart(currentDate);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const allMonthDates = Array.from(
    { length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() },
    (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
  );

  const visibleDates =
    viewMode === "День"
      ? [currentDate]
      : viewMode === "Неделя"
        ? weekDates
        : viewMode === "Месяц"
          ? allMonthDates
          : [];

  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  const HOUR_HEIGHT = viewMode === "День" ? 56 : 78;

  async function moveTask(taskId: string, date: Date, time: string) {
    const nextDate = dateKey(date);

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: nextDate,
        startTime: time,
      }),
    });

    await loadTasks();
  }

  function timeToMinutes(time?: string | null) {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }
  function getTaskHeight(task: Task) {
    const start = timeToMinutes(task.startTime || "00:00");
    const end = timeToMinutes(task.endTime || task.startTime || "01:00");

    const duration = Math.max(end - start, 15);

    return (duration / 60) * HOUR_HEIGHT;
  }
  function getTaskTop(task: Task) {
    return (timeToMinutes(task.startTime || "00:00") / 60) * HOUR_HEIGHT;
  }

  function getTaskDurationHeight(task?: Task) {
    if (!task) return viewMode === "День" ? 72 : 76;
    return Math.max(getTaskHeight(task), viewMode === "День" ? 72 : 56);
  }

  function tasksForDate(date: Date) {
    return tasks.filter((task: Task) => {
      const taskDate = new Date(task.date);

      const sameDate =
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate();

      return sameDate && !isAllDayTask(task);
    });
  }
  function allDayTasksForDate(date: Date) {
    return tasks.filter((task: Task) => {
      const taskDate = new Date(task.date);

      const sameDate =
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate();

      return sameDate && isAllDayTask(task);
    });
  }

  function tasksForCell(date: Date) {
    return tasksForDate(date);
  }

  function shiftCalendar(direction: number) {
    const next = new Date(currentDate);

    if (viewMode === "День") next.setDate(next.getDate() + direction);
    else if (viewMode === "Неделя") next.setDate(next.getDate() + direction * 7);
    else if (viewMode === "Месяц") {
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
    } else {
      next.setDate(1);
      next.setMonth(next.getMonth() + direction * 6);
    }

    setCurrentDate(next);
  }

  function getDiffFromToday(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / 86400000);
  }

  function dayTitle(date: Date) {
    const diff = getDiffFromToday(date);
    const dateText = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()} г.`;

    if (diff === 0) return `Сегодня, ${dateText}`;
    if (diff === -1) return `Вчера, ${dateText}`;
    if (diff === 1) return `Завтра, ${dateText}`;

    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function calendarTitle() {
    if (viewMode === "День") return dayTitle(currentDate);

    if (viewMode === "Неделя") {
      const first = weekDates[0];
      const last = weekDates[6];
      return `${first.getDate()}–${last.getDate()} ${monthNames[last.getMonth()]} ${last.getFullYear()} г.`;
    }

    if (viewMode === "Месяц") {
      return `${monthNamesTitle[currentDate.getMonth()]} ${currentDate.getFullYear()} г.`;
    }

    return currentDate.getMonth() < 6
      ? `1 квартал — Январь–Июнь ${currentDate.getFullYear()} г.`
      : `2 квартал — Июль–Декабрь ${currentDate.getFullYear()} г.`;
  }

  function calendarGridColumns() {
    if (viewMode === "День") return "90px minmax(0, 1fr)";
    if (viewMode === "Неделя") return "70px repeat(7, minmax(0, 1fr))";
    return `70px repeat(${visibleDates.length}, 130px)`;
  }

  function calendarMinWidth() {
    if (viewMode === "День") return "w-full";
    if (viewMode === "Неделя") return "w-full";
    if (viewMode === "Месяц") return "min-w-max";
    return "w-full";
  }
  function taskSlotKey(date: Date, time?: string | null) {
    return `${dateKey(date)}-${time || "no-time"}`;
  }
  function isAllDayTask(task: Task) {
    return !task.startTime || task.startTime === "";
  }

  function getCurrentTimeTop() {
    const now = new Date();
    return ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT;
  }
  function isTaskCrossedByCurrentTime(task: Task) {
    if (!task.startTime) return false;
    if (task.done) return false;

    const now = new Date();
    const taskDate = new Date(task.date);

    const sameDate =
      taskDate.getFullYear() === now.getFullYear() &&
      taskDate.getMonth() === now.getMonth() &&
      taskDate.getDate() === now.getDate();

    if (!sameDate) return false;

    const lineTop = getCurrentTimeTop();
    const taskTop = getTaskTop(task);
    const taskBottom = taskTop + getTaskDurationHeight();

    return lineTop >= taskTop && lineTop <= taskBottom;
  }
  function currentTimeLabel() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
  function TaskCard({
    task,
    absolute = false,
    isGrouped = false,
    groupTasks = [],
    groupKey = "",
  }: {
    task: Task;
    absolute?: boolean;
    isGrouped?: boolean;
    groupTasks?: Task[];
    groupKey?: string;
  }) {

    const isGroup = isGrouped && groupTasks.length > 1;

    const compact = absolute && getTaskHeight(task) < 72;

    const cardKey = isGroup ? groupKey : task.id;

    const cardColorClass = isGroup
      ? `${getCategoryGradient(groupTasks)} text-white border-white/20`
      : getTaskColor(task.type);

    return (
      <div
        onMouseEnter={() => setHoveredTaskId(task.id)}
        onMouseLeave={() => setHoveredTaskId(null)}
        className={`${absolute
          ? viewMode === "День"
            ? "absolute left-[120px] w-[520px] z-20"
            : "absolute left-3 right-3 z-20"
          : "relative w-full mb-2"
          } group`}
        style={absolute ? { top: `${getTaskTop(task)}px` } : undefined}
      >
        <div
          draggable
          onDragStart={(e) => {
            setDraggingTaskId(task.id);
            e.dataTransfer.setData("taskId", task.id);
          }}
          onDragEnd={() => setDraggingTaskId(null)}
          className={`relative rounded-xl pl-[96px] pr-4 py-3 border text-[11px] font-semibold shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition cursor-grab active:cursor-grabbing overflow-visible ${cardColorClass}`}
          style={{
            height: absolute ? `${getTaskHeight(task)}px` : undefined,
            minHeight: absolute ? "56px" : undefined,
          }}
        >
          {!isGroup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                completeTask(task.id, task.done);
              }}
              className={`absolute left-3 top-3 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition ${task.done
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-slate-300 hover:border-violet-400"
                }`}
            >
              {task.done && <Check size={11} />}
            </button>
          )}

          <div
            className={`absolute left-10 top-2 w-10 h-10 rounded-xl flex items-center justify-center border ${
              isGroup
                ? "bg-white/20 border-white/20 text-white"
                : `${getTaskColor(task.type)} bg-white/70`
              }`}
          >
            <span className="[&>svg]:w-[18px] [&>svg]:h-[18px]">
              {isGroup ? <Layers size={18} /> : getTaskIcon(task.type)}
            </span>
          </div>

          {isTaskCrossedByCurrentTime(task) && (
            <span
              className="absolute -left-2.5 z-50 w-3 h-3 rounded-full bg-violet-600 ring-4 ring-violet-100"
              style={{
                top: `${getCurrentTimeTop() - getTaskTop(task) - 6}px`,
              }}
            />
          )}

          <div
            className={`h-full min-w-0 overflow-hidden flex pr-24 ${compact
              ? "flex-row items-center gap-4"
              : "flex-col justify-start pt-1"
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p
                className={`truncate font-black leading-tight ${compact ? "text-[11px] max-w-[120px]" : "text-[13px]"
                  } ${isGroup ? "text-white" : "text-slate-950"
                  }`}
              >
                {isGroup ? `Несколько задач · ${groupTasks.length}` : task.title}
              </p>

              {!isGroup && (
                <span
                  className={`absolute right-4 top-3 shrink-0 px-2.5 py-1 rounded-lg border text-[10px] font-black ${getPriorityBadgeClass(
                    task.priority
                  )}`}
                >
                  {task.priority || "Средний"}
                </span>
              )}
              {isGroup && (
                <span className="shrink-0 text-[10px] font-black bg-white/20 rounded-full px-2 py-0.5">
                  {groupTasks.length}
                </span>
              )}
            </div>

            <p
              className={`font-black whitespace-nowrap ${compact ? "text-[10px]" : "text-[11px] mt-1.5"
                } ${isGroup ? "text-white/80" : "text-slate-700"
                }`}
            >
              {task.startTime || "—"} – {task.endTime || "—"}
            </p>

            {!compact && (
              <p
                className={`text-[11px] font-black truncate mt-1 ${isGroup ? "text-white/80" : getTaskTextColor(task.type)
                  }`}
              >
                {isGroup
                  ? `${groupTasks.length} задачи`
                  : task.project || task.type || "Без проекта"}
              </p>
            )}
          </div>
        </div>

        <TaskHoverCard
          task={task}
          isGroup={isGroup}
          groupTasks={groupTasks}
          groupKey={cardKey}
          viewMode={viewMode}
        />
      </div>
    );
  }
  function TaskHoverCard({
    task,
    isGroup,
    groupTasks,
    groupKey,
    viewMode,
  }: {
    task: Task;
    isGroup: boolean;
    groupTasks: Task[];
    groupKey: string;
    viewMode: string;
  }) {
    const selectedId =
      hoveredGroupTaskIds[groupKey] ||
      selectedGroupTaskIds[groupKey] ||
      task.id;

    const activeTask =
      isGroup
        ? groupTasks.find((item) => item.id === selectedId) || groupTasks[0]
        : task;

    return (
      <div
        className={`absolute z-[999] w-[300px] rounded-[24px] bg-white border border-slate-100 shadow-2xl shadow-slate-300/60 p-5 pointer-events-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${viewMode === "День"
          ? "left-1/2 top-full mt-3 -translate-x-1/2 translate-y-2 group-hover:translate-y-0"
          : "left-full top-0 pl-3 translate-x-2 group-hover:translate-x-0"
          }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getTaskColor(activeTask.type)}`}>
            {getTaskIcon(activeTask.type)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 leading-snug">
              {activeTask.title}
            </p>
            <p className="text-sm font-bold text-indigo-900/55 mt-1">
              {activeTask.startTime || "—"} – {activeTask.endTime || "—"}
            </p>
          </div>
        </div>

        {isGroup && (
          <div className="mt-4 flex items-center gap-1.5 pointer-events-auto">
            {groupTasks.map((item) => {
              const active = item.id === activeTask.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => {
                    setHoveredGroupTaskIds((prev) => ({
                      ...prev,
                      [groupKey]: item.id,
                    }));
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGroupTaskIds((prev) => ({
                      ...prev,
                      [groupKey]: item.id,
                    }));
                  }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border transition ${active
                    ? `${getTaskColor(item.type)} shadow-sm`
                    : `${getTaskColor(item.type)} opacity-55 hover:opacity-100`
                    }`}
                >
                  {getTaskIcon(item.type)}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 space-y-4 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-black text-indigo-900/45">Проект</span>
            <span className="font-black text-slate-800 truncate">
              {activeTask.project || "Без проекта"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-black text-indigo-900/45">Приоритет</span>
            <span className="font-black text-slate-800 flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: getPriorityColor(activeTask.priority) }}
              />
              {activeTask.priority || "Средний"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-black text-indigo-900/45">Ответственный</span>
            <span className="font-black text-slate-800">
              {activeTask.executor || "Не назначен"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-black text-indigo-900/45">Повторение</span>
            <span className="font-black text-slate-800">
              {activeTask.repeat || "Нет"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-black text-indigo-900/45">Метка</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${getTaskColor(activeTask.type)}`}>
              {activeTask.type}
            </span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-4 gap-3 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingTask(activeTask);
            }}
            className="h-11 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center hover:bg-violet-50 hover:text-violet-600"
            title="Редактировать"
          >
            <FileText size={17} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCopiedTask(activeTask);
            }}
            className="h-11 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center hover:bg-violet-50 hover:text-violet-600"
            title="Копировать"
          >
            <Copy size={17} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              completeTask(activeTask.id, activeTask.done);
            }}
            className={`h-11 rounded-xl border flex items-center justify-center ${activeTask.done
              ? "bg-green-50 border-green-100 text-green-600"
              : "bg-white border-slate-200 text-slate-300 hover:border-green-200 hover:text-green-500"
              }`}
            title={activeTask.done ? "Выполнена" : "Выполнить"}
          >
            <Check size={17} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(activeTask.id);
            }}
            className="h-11 rounded-xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-100"
            title="Удалить"
          >
            <Archive size={17} />
          </button>
        </div>
      </div>
    );
  }
  function InfoLine({
    label,
    value,
    dark = false,
  }: {
    label: string;
    value: any;
    dark?: boolean;
  }) {
    return (
      <div className="grid grid-cols-[92px_1fr] gap-2">
        <span className={`font-black ${dark ? "text-white/55" : "text-slate-400"}`}>
          {label}:
        </span>
        <span className={`font-bold break-words ${dark ? "text-white" : "text-slate-700"}`}>
          {value}
        </span>
      </div>
    );
  }
  function TodayTasksPanel({ tasks, onCreateTask }: any) {
    const todayTasks = tasks.filter((task: Task) => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.toDateString() === today.toDateString();
    });

    function getPriorityBadge(priority: string) {
      if (priority === "Высокий" || priority === "high") {
        return "bg-red-50 text-red-600";
      }

      if (priority === "Средний" || priority === "medium") {
        return "bg-orange-50 text-orange-600";
      }

      if (priority === "Низкий" || priority === "low") {
        return "bg-green-50 text-green-600";
      }

      return "bg-slate-50 text-slate-500";
    }

    return (
      <aside className="space-y-4">
        <div className="rounded-[24px] bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  Задачи на сегодня
                </h3>
                <p className="text-xs font-bold text-indigo-900/50 mt-1">
                  {today.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    weekday: "long",
                  })}
                </p>
              </div>

              <span className="text-xs font-black text-violet-600">
                {todayTasks.length} задач
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {todayTasks.length > 0 ? (
              todayTasks.slice(0, 6).map((task: Task) => (
                <div
                  key={task.id}
                  className="px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition"
                >
                  <button
                    onClick={() => completeTask(task.id, task.done)}
                    className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${task.done
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-slate-200"
                      }`}
                  >
                    {task.done && <Check size={12} />}
                  </button>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getTaskColor(
                      task.type
                    )}`}
                  >
                    {getTaskIcon(task.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-black truncate ${task.done ? "text-slate-400 line-through" : "text-slate-900"
                          }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs font-black text-indigo-900/50 shrink-0">
                        {task.startTime || "—"}
                      </p>
                    </div>

                    <p className="text-xs font-semibold text-indigo-900/45 truncate mt-0.5">
                      {task.project || "Без проекта"}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black ${getTaskColor(
                          task.type
                        )}`}
                      >
                        {task.type}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority || "Средний"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm font-black text-slate-900">
                  На сегодня задач нет
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Создайте задачу на сегодня
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onCreateTask}
            className="w-full h-12 border-t border-slate-100 text-violet-600 font-black hover:bg-violet-50"
          >
            + Добавить задачу
          </button>
        </div>

        <div className="rounded-[24px] bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-950">
                Предстоящие
              </h3>
              <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black flex items-center justify-center">
                {Math.min(tasks.length, 9)}
              </span>
            </div>

            <span className="text-xs font-black text-violet-600">
              Смотреть все
            </span>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task: Task) => (
              <div key={task.id} className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {task.title}
                </p>
                <p className="text-xs font-black text-indigo-900/40">
                  {task.startTime || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Календарь задач
            </h1>

            <span className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-violet-200">
              {tasks.length}
            </span>
          </div>

          <p className="text-sm font-semibold text-indigo-900/50 mt-1">
            Планируйте задачи, контролируйте дедлайны и достигайте целей
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreateTask}
            className="h-11 px-6 rounded-xl bg-violet-600 text-white font-black shadow-lg shadow-violet-200 hover:bg-violet-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Создать задачу
          </button>

          <button className="h-11 px-5 rounded-xl bg-white border border-slate-200 text-indigo-900/70 font-black flex items-center gap-2 hover:bg-slate-50">
            <Search size={17} />
            Фильтр
          </button>

          <button className="h-11 px-5 rounded-xl bg-white border border-slate-200 text-indigo-900/70 font-black flex items-center gap-2 hover:bg-slate-50">
            Все проекты
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_330px] gap-4">
        <div className="min-w-0 rounded-[28px] bg-white border border-slate-100 shadow-xl shadow-slate-200/60 p-4 overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => shiftCalendar(-1)}
                className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 border border-slate-100 flex items-center justify-center transition"
              >
                <ChevronRight size={18} className="rotate-180" />
              </button>

              <button
                onClick={() => shiftCalendar(1)}
                className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 border border-slate-100 flex items-center justify-center transition"
              >
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => setCurrentDate(new Date(today))}
                className="h-11 px-5 rounded-2xl bg-slate-950 text-white font-black shadow-lg shadow-slate-200"
              >
                Сегодня
              </button>

              <div className="h-11 px-5 rounded-2xl bg-violet-50 text-violet-700 font-black flex items-center">
                {calendarTitle()}
              </div>
            </div>

            <div className="h-11 bg-slate-50 border border-slate-100 rounded-2xl p-1 flex items-center gap-1">
              {["День", "Неделя", "Месяц", "Квартал"].map((item) => (
                <button
                  key={item}
                  onClick={() => setViewMode(item)}
                  className={`h-9 px-5 rounded-xl text-xs font-black transition ${viewMode === item
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                    : "text-slate-500 hover:bg-white"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "Квартал" ? (
            (() => {
              const startMonth = currentDate.getMonth() < 6 ? 0 : 6;

              return (
                <div className="rounded-[24px] border border-slate-100 overflow-hidden bg-white">
                  <div className="overflow-auto max-h-[620px]">
                    <div className="min-w-[1450px]">
                      <div
                        className="sticky top-0 z-20 grid bg-white border-b border-slate-100"
                        style={{ gridTemplateColumns: "90px repeat(6, 1fr)" }}
                      >
                        <div className="h-16 border-r border-b border-slate-100 bg-white" />

                        {Array.from({ length: 6 }).map((_, i) => {
                          const monthDate = new Date(
                            currentDate.getFullYear(),
                            startMonth + i,
                            1
                          );

                          return (
                            <div
                              key={i}
                              className="h-16 border-r last:border-r-0 border-slate-100 flex items-center justify-center text-sm font-black text-violet-700 bg-violet-50/60"
                            >
                              {monthDate.toLocaleDateString("ru-RU", {
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          );
                        })}
                      </div>

                      {Array.from({ length: 31 }).map((_, dayIndex) => {
                        const day = dayIndex + 1;

                        return (
                          <div
                            key={day}
                            className="grid min-h-[58px] border-b last:border-b-0 border-slate-100"
                            style={{ gridTemplateColumns: "90px repeat(6, 1fr)" }}
                          >
                            <div className="border-r border-slate-100 px-4 py-4 text-xs font-black text-slate-400 bg-slate-50 sticky left-0 z-10">
                              {day}
                            </div>

                            {Array.from({ length: 6 }).map((_, monthIndex) => {
                              const cellDate = new Date(
                                currentDate.getFullYear(),
                                startMonth + monthIndex,
                                day
                              );

                              const isValidDay = cellDate.getDate() === day;
                              const isToday =
                                isValidDay && dateKey(cellDate) === dateKey(today);
                              const cellTasks = tasksForCell(cellDate);

                              return (
                                <div
                                  key={monthIndex}
                                  className={`relative border-r last:border-r-0 border-slate-100 p-2 ${isToday ? "bg-violet-50" : "hover:bg-slate-50"
                                    } ${!isValidDay ? "bg-slate-50/70" : ""}`}
                                >
                                  {isValidDay &&
                                    cellTasks.map((task: Task) => (
                                      <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="rounded-[24px] border border-slate-100 overflow-hidden bg-white">
              <div className="w-full overflow-auto max-h-[720px]">
                <div className={calendarMinWidth()}>
                  <div
                    className="sticky top-0 z-20 border-b border-slate-100 bg-white"
                    style={{
                      display: "grid",
                      gridTemplateColumns: calendarGridColumns(),
                    }}
                  >
                    <div className="h-16 border-r border-b border-slate-100 bg-white" />

                    {visibleDates.map((date, index) => {
                      const isToday = dateKey(date) === dateKey(today);

                      return (
                        <div
                          key={date.toISOString()}
                          className={`h-16 border-r last:border-r-0 border-slate-100 flex items-center justify-center font-black whitespace-nowrap ${isToday
                            ? "text-violet-700 bg-violet-50"
                            : "text-indigo-900/60 bg-white"
                            }`}
                        >
                          {viewMode === "День"
                            ? dayTitle(date)
                            : viewMode === "Месяц"
                              ? `${date.getDate()} ${monthNames[date.getMonth()]}`
                              : `${weekDays[index]} ${date.getDate()} ${monthNames[date.getMonth()]
                              }`}
                        </div>
                      );
                    })}
                  </div>

                  {viewMode !== "День" && (
                    <div
                      className="border-b border-slate-100 bg-white"
                      style={{
                        display: "grid",
                        gridTemplateColumns: calendarGridColumns(),
                      }}
                    >
                      <div className="h-14 border-r border-slate-100 flex items-center justify-center text-[11px] font-black text-indigo-900/50">
                        Весь день
                      </div>

                      {visibleDates.map((date) => {
                        const allDayTasks = allDayTasksForDate(date);

                        return (
                          <div
                            key={date.toISOString()}
                            className="h-14 border-r last:border-r-0 border-slate-100 p-2 flex items-center gap-2 overflow-hidden"
                          >
                            {allDayTasks.length > 0
                              ? allDayTasks.slice(0, 2).map((task: Task) => (
                                <div
                                  key={task.id}
                                  className={`h-7 max-w-[160px] rounded-lg border px-2 flex items-center gap-1 text-[10px] font-black truncate ${getTaskColor(
                                    task.type
                                  )}`}
                                >
                                  {getTaskIcon(task.type)}
                                  <span className="truncate">{task.title}</span>
                                </div>
                              ))
                              : null}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className="relative"
                    onMouseLeave={() => setSelectedPasteSlot(null)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: calendarGridColumns(),
                      height: `${24 * HOUR_HEIGHT}px`,
                    }}
                  >
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{ top: `${getCurrentTimeTop()}px` }}
                    >
                      <div className="relative h-0.5 bg-violet-500">
                        <span className="absolute -left-1 -top-3 rounded-lg bg-violet-600 text-white text-[10px] font-black px-2 py-1">
                          {currentTimeLabel()}
                        </span>
                      </div>
                    </div>

                    <div className="relative border-r border-slate-100 bg-white sticky left-0 z-30">
                      {hours.map((time) => (
                        <div
                          key={time}
                          className="border-b border-slate-100 text-xs font-bold text-indigo-900/45 flex items-start justify-center pt-4"
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>

                    {visibleDates.map((date) => {
                      const dayTasks = tasksForDate(date);
                      const isToday = dateKey(date) === dateKey(today);

                      return (
                        <div
                          key={date.toISOString()}
                          className={`relative border-r last:border-r-0 border-slate-100 ${isToday ? "bg-violet-50/25" : "bg-white"
                            }`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();

                            const taskId = e.dataTransfer.getData("taskId");
                            if (!taskId) return;

                            const rect = e.currentTarget.getBoundingClientRect();
                            const y = e.clientY - rect.top;
                            const hour = Math.max(
                              0,
                              Math.min(23, Math.floor(y / HOUR_HEIGHT))
                            );
                            const time = `${String(hour).padStart(2, "0")}:00`;

                            moveTask(taskId, date, time);
                          }}
                        >
                          {hours.map((time) => {
                            const isSelectedPasteSlot =
                              selectedPasteSlot &&
                              dateKey(selectedPasteSlot.date) === dateKey(date) &&
                              selectedPasteSlot.time === time;

                            return (
                              <div
                                key={time}
                                onClick={() => {
                                  if (copiedTask) {
                                    setSelectedPasteSlot({ date, time });
                                  }
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  onCreateTask(date, time);
                                }}
                                className={`relative border-b border-slate-100 transition ${isSelectedPasteSlot
                                  ? "bg-violet-50 ring-2 ring-inset ring-violet-300"
                                  : "hover:bg-violet-50/30"
                                  }`}
                                style={{ height: `${HOUR_HEIGHT}px` }}
                              >
                                {isSelectedPasteSlot && copiedTask && !hoveredTaskId && (
                                  <div className="absolute left-1/2 top-2 z-[80] flex items-center gap-2 -translate-x-1/2 -top-">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        pasteCopiedTask({ date, time });
                                      }}
                                      className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-200 hover:bg-violet-700"
                                      title="Вставить задачу"
                                    >
                                      <Copy size={16} />
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onCreateTask(date, time);
                                      }}
                                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-50"
                                      title="Создать задачу"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {(() => {
                            const groups: Record<string, Task[]> = {};

                            dayTasks.forEach((task: Task) => {
                              const key = taskSlotKey(date, task.startTime);

                              if (!groups[key]) {
                                groups[key] = [];
                              }

                              groups[key].push(task);
                            });

                            return Object.entries(groups).map(
                              ([groupKey, groupTasks]) => {
                                const selectedId =
                                  hoveredGroupTaskIds[groupKey] ||
                                  selectedGroupTaskIds[groupKey];

                                const activeTask =
                                  groupTasks.find(
                                    (task: Task) => task.id === selectedId
                                  ) || groupTasks[0];

                                return (
                                  <TaskCard
                                    key={groupKey}
                                    task={activeTask}
                                    absolute
                                    isGrouped={groupTasks.length > 1}
                                    groupTasks={groupTasks}
                                    groupKey={groupKey}
                                  />
                                );
                              }
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <TodayTasksPanel tasks={tasks} onCreateTask={onCreateTask} />
      </div>

      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={async () => {
            await loadTasks();
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
function CalendarDropdown({ onClose, tasks, onCreateTask, goToCalendar }: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(new Date(today));

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  const monthNamesGenitive = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  function isSameDate(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
  }

  function shiftSelectedDate(days: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  }

  function getSelectedLabel() {
    const diff = Math.round((selectedDate.getTime() - today.getTime()) / 86400000);

    if (diff === 0) return "Сегодня";
    if (diff === -1) return "Вчера";
    if (diff === 1) return "Завтра";
    if (diff === 2) return "Послезавтра";

    return `${selectedDate.getDate()} ${monthNamesGenitive[selectedDate.getMonth()]}`;
  }

  function getAddButtonText() {
    const diff = Math.round((selectedDate.getTime() - today.getTime()) / 86400000);

    if (diff === 0) return "Добавить задачу на сегодня";
    if (diff === 1) return "Добавить задачу на завтра";
    if (diff === 2) return "Добавить задачу на послезавтра";

    return `Добавить задачу на ${selectedDate.getDate()} ${monthNamesGenitive[selectedDate.getMonth()]}`;
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const calendarDays = [
    ...Array.from({ length: startOffset }, (_, i) => ({
      day: daysInPrevMonth - startOffset + i + 1,
      muted: true,
      date: new Date(year, month - 1, daysInPrevMonth - startOffset + i + 1),
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      muted: false,
      date: new Date(year, month, i + 1),
    })),
  ];

  while (calendarDays.length < 35) {
    const nextDay = calendarDays.length - startOffset - daysInMonth + 1;
    calendarDays.push({
      day: nextDay,
      muted: true,
      date: new Date(year, month + 1, nextDay),
    });
  }

  const selectedTasks = tasks.filter((task: Task) => {
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);

    return isSameDate(taskDate, selectedDate);
  });

  function TaskIcon({ type }: any) {
    const styles =
      type === "warn"
        ? "bg-orange-50 text-orange-500"
        : type === "image"
          ? "bg-violet-50 text-violet-600"
          : type === "chart"
            ? "bg-green-50 text-green-600"
            : "bg-blue-50 text-blue-600";

    return (
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles}`}>
        {type === "warn" && <FlaskConical size={16} />}
        {type === "image" && <Sparkles size={16} />}
        {type === "chart" && <LineChart size={16} />}
        {type === "doc" && <Archive size={16} />}
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-14 z-[300] w-[560px] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
      <div className="absolute -top-2 right-7 w-4 h-4 rotate-45 bg-white border-l border-t border-slate-200" />

      <div className="h-[58px] px-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-black text-slate-900">Календарь задач</h3>
          <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(new Date(today))}
            className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50"
          >
            {getSelectedLabel()}
          </button>

          <button
            onClick={() => shiftSelectedDate(-1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight size={15} className="rotate-180" />
          </button>

          <button
            onClick={() => shiftSelectedDate(1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight size={15} />
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[250px_1fr]">
        <div className="px-5 py-5 border-r border-slate-100">
          <div className="mb-5">
            <h4 className="text-base font-black text-slate-900">
              {monthNames[month]} {year}
            </h4>
          </div>

          <div className="grid grid-cols-7 text-center mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-xs font-bold text-slate-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-3 text-center">
            {calendarDays.map((item, i) => {
              const isSelected = isSameDate(item.date, selectedDate);
              const isToday = isSameDate(item.date, today);
              const isTaskDay = tasks.some((task: Task) => {
                const taskDate = new Date(task.date);
                taskDate.setHours(0, 0, 0, 0);

                return isSameDate(taskDate, item.date);
              });
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(new Date(item.date))}
                  className={`relative mx-auto w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition ${isSelected
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                    : item.muted
                      ? "text-slate-300 hover:bg-slate-50"
                      : isToday
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-800 hover:bg-slate-100"
                    }`}
                >
                  {item.day}

                  {isTaskDay && !isSelected && (
                    <span className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-base font-black text-slate-900">
              {getSelectedLabel()}
            </h4>
            <span className="text-xs font-bold text-slate-400">
              {selectedTasks.length} задачи
            </span>
          </div>

          {selectedTasks.length > 0 ? (
            <div className="space-y-4">
              {selectedTasks.map((task: Task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <TaskIcon type={task.type || "doc"} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 leading-tight">
                      {task.title}
                    </p>
                    <p className="text-xs font-semibold text-indigo-900/70 mt-0.5 truncate">
                      {task.project || "Без проекта"}
                    </p>
                  </div>

                  <p className="text-xs font-black text-indigo-900/60">
                    {task.startTime || "—"}
                  </p>
                </div>
              ))}
            </div>
          ) : (<div className="h-[210px] flex flex-col items-center justify-center text-center">
            <p className="text-sm font-black text-slate-900">
              У вас пока нет задач
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Создайте задачу для выбранной даты
            </p>

            <button
              onClick={() => onCreateTask(selectedDate)}
              className="mt-5 h-10 px-5 rounded-xl bg-violet-600 text-white text-xs font-black hover:bg-violet-700"
            >
              {getAddButtonText()}
            </button>
          </div>
          )}
        </div>
      </div>

      <button
        onClick={goToCalendar}
        className="w-full py-4 border-t border-slate-100 text-violet-600 font-black text-base hover:bg-violet-50 flex items-center justify-center gap-2"
      >
        Перейти в календарь задач →
      </button>

    </div>

  );
}
function TaskModal({ task, initialDate, initialTime, onClose, onSaved }: any) {
  const isEdit = !!task;

  const formatDateInput = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}.${d.getFullYear()}`;

  const [title, setTitle] = useState(task?.title || "");
  const [date, setDate] = useState(
    task?.date
      ? formatDateInput(new Date(task.date))
      : initialDate
        ? formatDateInput(new Date(initialDate))
        : formatDateInput(new Date())
  );
  const [startTime, setStartTime] = useState(
    task?.startTime || initialTime || "14:00"
  );
  const [endTime, setEndTime] = useState(task?.endTime || "15:00");
  const [project, setProject] = useState(task?.project || "");
  const [category, setCategory] = useState(task?.type || "Отзывы");
  const [priority, setPriority] = useState(task?.priority || "");
  const [repeat, setRepeat] = useState(task?.repeat || "Нет");
  const [executor, setExecutor] = useState(task?.executor || "");
  const [reminder, setReminder] = useState(task?.reminder || "");
  const [description, setDescription] = useState(task?.description || "");
  const [open, setOpen] = useState("");

  useEffect(() => {
    const close = () => setOpen("");
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const categories = [
    ["Отзывы", MessageCircle, "bg-red-50 text-red-500"],
    ["Вопросы", HelpCircle, "bg-blue-50 text-blue-500"],
    ["Реклама", Megaphone, "bg-orange-50 text-orange-500"],
    ["Акции", Percent, "bg-pink-50 text-pink-500"],
    ["SEO описание", FileText, "bg-violet-50 text-violet-600"],
    ["SEO название", Type, "bg-indigo-50 text-indigo-600"],
    ["SEO карточка", Layers, "bg-purple-50 text-purple-600"],
    ["SEO кластеры", Search, "bg-cyan-50 text-cyan-600"],
    ["Инфографика", ImageIcon, "bg-fuchsia-50 text-fuchsia-600"],
    ["Видео", Video, "bg-rose-50 text-rose-500"],
    ["Конкуренты", Users, "bg-slate-100 text-slate-600"],
    ["Аналитика", BarChart3, "bg-blue-50 text-blue-600"],
    ["Товары", Boxes, "bg-green-50 text-green-600"],
    ["Цены", Tags, "bg-yellow-50 text-yellow-600"],
    ["Финансы", Wallet, "bg-emerald-50 text-emerald-600"],
    ["Юнит-эко", Calculator, "bg-lime-50 text-lime-600"],
    ["Шаблоны", Copy, "bg-neutral-100 text-neutral-600"],
  ];

  const selectedCategory =
    categories.find((c) => c[0] === category) || categories[0];
  const CategoryIcon = selectedCategory[1] as any;

  const isValid =
    title.trim().length > 0 &&
    category.trim().length > 0 &&
    date.trim().length > 0 &&
    startTime.trim().length > 0;

  async function saveTask() {
    if (!isValid) return;

    let normalDate = date;

    if (date.includes(".")) {
      const [day, month, year] = date.split(".");
      normalDate = `${year}-${month}-${day}`;
    }

    await fetch(isEdit ? `/api/tasks/${task.id}` : "/api/tasks", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        date: normalDate,
        startTime,
        endTime,
        repeat,
        executor,
        reminder,
        project,
        type: category,
        priority: priority || "medium",
        description,
        status: task?.status || "planned",
      }),
    });

    await onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/35 backdrop-blur-[2px] flex items-center justify-center p-6">
      <div className="w-[560px] rounded-[28px] bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-950/25 border border-white/70 overflow-visible">
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">
            {isEdit ? "Изменить задачу" : "Создать задачу"}
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-indigo-900/60 hover:bg-slate-100 text-xl"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field label="Название задачи *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Ответить на отзывы WB"
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-violet-400 placeholder:text-slate-300"
            />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Проект">
              <DropBox
                value={project || "Добавить проект"}
                empty={!project}
                icon={<Plus size={15} />}
                open={open === "project"}
                onClick={() => setOpen(open === "project" ? "" : "project")}
              >
                <DropItem onClick={() => { setProject("Косметика Premium"); setOpen(""); }}>
                  Косметика Premium
                </DropItem>
                <DropItem onClick={() => { setProject("WB Кампания №3"); setOpen(""); }}>
                  WB Кампания №3
                </DropItem>
                <DropItem onClick={() => { setProject("Новый проект"); setOpen(""); }}>
                  + Добавить проект
                </DropItem>
              </DropBox>
            </Field>

            <Field label="Категория">
              <DropBox
                value={category || "Выберите категорию"}
                empty={!category}
                icon={<CategoryIcon size={15} />}
                color={selectedCategory[2] as string}
                open={open === "category"}
                onClick={() => setOpen(open === "category" ? "" : "category")}
              >
                <div className="max-h-56 overflow-y-auto">
                  {categories.map(([name, Icon, color]: any) => (
                    <DropItem
                      key={name}
                      onClick={() => {
                        setCategory(name);
                        setOpen("");
                      }}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon size={14} />
                      </span>
                      {name}
                    </DropItem>
                  ))}
                </div>
              </DropBox>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Дата и время">
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="25.05.2024"
                className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-violet-400"
              />
            </Field>

            <Field label=" ">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-[88px] h-10 rounded-lg border border-slate-200 px-2 text-sm font-bold outline-none"
                />
                <span className="text-slate-400 font-bold">—</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-[88px] h-10 rounded-lg border border-slate-200 px-2 text-sm font-bold outline-none"
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Повтор">
              <DropBox
                value={repeat || "Не повторять"}
                empty={!repeat}
                open={open === "repeat"}
                onClick={() => setOpen(open === "repeat" ? "" : "repeat")}
              >
                {["Не повторять", "Каждый день", "Каждую неделю"].map((item) => (
                  <DropItem
                    key={item}
                    onClick={() => {
                      setRepeat(item);
                      setOpen("");
                    }}
                  >
                    {item}
                  </DropItem>
                ))}
              </DropBox>
            </Field>

            <Field label="Приоритет">
              <DropBox
                value={priority || "Выбрать приоритет"}
                empty={!priority}
                color={
                  priority === "Низкий"
                    ? "bg-green-50 text-green-600 border border-green-100"
                    : priority === "Средний"
                      ? "bg-yellow-50 text-yellow-600 border border-yellow-100"
                      : priority === "Высокий"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-slate-50 text-slate-400"
                }
                icon={<span className="w-2.5 h-2.5 rounded-full bg-current" />}
                open={open === "priority"}
                onClick={() => setOpen(open === "priority" ? "" : "priority")}
              >
                <DropItem onClick={() => { setPriority("Низкий"); setOpen(""); }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Низкий
                </DropItem>

                <DropItem onClick={() => { setPriority("Средний"); setOpen(""); }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  Средний
                </DropItem>

                <DropItem onClick={() => { setPriority("Высокий"); setOpen(""); }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Высокий
                </DropItem>
              </DropBox>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Исполнитель">
              <DropBox
                value={executor || "Добавить пользователя"}
                empty={!executor}
                icon={<UserPlus size={15} />}
                open={open === "executor"}
                onClick={() => setOpen(open === "executor" ? "" : "executor")}
              >
                <DropItem onClick={() => { setExecutor("Я (Алексей)"); setOpen(""); }}>
                  Я (Алексей)
                </DropItem>
                <DropItem onClick={() => { setExecutor("Новый пользователь"); setOpen(""); }}>
                  + Добавить пользователя
                </DropItem>
              </DropBox>
            </Field>

            <Field label="Напоминание">
              <DropBox
                value={reminder || "Добавить контакты"}
                empty={!reminder}
                icon={<BellRing size={15} />}
                open={open === "reminder"}
                onClick={() => setOpen(open === "reminder" ? "" : "reminder")}
              >
                <DropItem onClick={() => { setReminder("За 30 минут в Telegram"); setOpen(""); }}>
                  За 30 минут в Telegram
                </DropItem>
                <DropItem onClick={() => { setReminder("Добавить контакты"); setOpen(""); }}>
                  + Добавить контакты
                </DropItem>
              </DropBox>
            </Field>
          </div>

          <Field label="Описание">
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Добавьте описание задачи..."
                className="w-full h-18 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-violet-400 resize-none placeholder:text-slate-300"
              />
              <span className="absolute right-3 bottom-2 text-[11px] font-bold text-indigo-900/35">
                {description.length}/500
              </span>
            </div>
          </Field>

          <div className="relative rounded-2xl border border-violet-200 bg-violet-50/60 p-4 overflow-hidden">
            <p className="text-sm font-black text-violet-700 mb-3">
              AI помощник рекомендует
            </p>

            <div className="space-y-2 text-xs font-bold text-slate-700 pr-24">
              {[
                "Автонапоминание в Telegram",
                "Добавить чек-лист",
                "Создать повтор каждую неделю",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-violet-600 text-white flex items-center justify-center text-[11px] shadow-sm">
                    ✓
                  </span>
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <div className="absolute right-0 top-14 z-[300] w-[560px] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
              🤖
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="h-10 px-8 rounded-xl bg-white border border-slate-200 text-slate-800 font-black hover:bg-slate-50"
            >
              Отмена
            </button>

            <button
              onClick={saveTask}
              disabled={!isValid}
              className={`h-10 px-7 rounded-xl font-semibold transition ${isValid
                ? "bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              {isEdit ? "Сохранить" : "Создать задачу"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-slate-500 mb-1.5">{label}</p>      {children}
    </div>
  );
}
function DropBox({ value, icon, color, empty, open, onClick, children }: any) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }} className={`group w-full h-11 rounded-2xl border bg-white px-3 text-sm font-semibold flex items-center justify-between transition ${open
          ? "border-violet-300 ring-4 ring-violet-100"
          : "border-slate-200 hover:border-violet-200 hover:bg-violet-50/30"
          } ${empty ? "text-slate-400" : "text-slate-900"}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon && (
            <span
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${color || "bg-violet-50 text-violet-600"
                }`}
            >
              {icon}
            </span>
          )}

          <span className="truncate">{value}</span>
        </span>

        <ChevronDown
          size={15}
          className={`text-slate-400 transition ${open ? "rotate-180 text-violet-500" : ""
            }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-12 z-[200] rounded-2xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/80 p-1.5 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ children, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-10 px-3 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-2 transition"
    >
      {children}
    </button>
  );
}
function Sidebar({ activePage, setActivePage }: any) {
  return (
    <aside className="w-[235px] h-screen shrink-0 bg-white border-r border-slate-100 px-3 py-3 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center">
          <Bot size={22} />
        </div>

        <div>
          <h2 className="text-lg font-black leading-4">Smart Market</h2>
          <p className="text-[11px] font-semibold text-indigo-500 mt-1">
            AI Platform
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        <MenuGroup title="ГЛАВНОЕ">
          <NavItem icon={<HomeIcon size={15} />} title="Главная" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<PlusSquare size={15} />} title="Создать" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<LayoutGrid size={15} />} title="Шаблоны" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<Clock3 size={15} />} title="История" badge="24" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<Archive size={15} />} title="Хранилище" activePage={activePage} setActivePage={setActivePage} />
        </MenuGroup>

        <MenuGroup title="ПРОДВИЖЕНИЕ">
          <NavItem icon={<Megaphone size={15} />} title="Продвижение" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<BadgePercent size={15} />} title="Реклама" activePage={activePage} setActivePage={setActivePage} />
        </MenuGroup>

        <MenuGroup title="АНАЛИТИКА">
          <NavItem icon={<LineChart size={15} />} title="Аналитика" badge="NEW" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<Trophy size={15} />} title="Конкуренты" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<Package size={15} />} title="Товары" activePage={activePage} setActivePage={setActivePage} />
        </MenuGroup>

        <MenuGroup title="AI ИНСТРУМЕНТЫ">
          <NavItem icon={<Sparkles size={15} />} title="AI Ассистент" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<FlaskConical size={15} />} title="Нейро студия" badge="СКОРО" purple activePage={activePage} setActivePage={setActivePage} />
        </MenuGroup>

        <MenuGroup title="АККАУНТ">
          <NavItem icon={<CreditCard size={15} />} title="Оплата" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<Globe size={15} />} title="Поддержка" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={<User size={15} />} title="Кабинет" arrow activePage={activePage} setActivePage={setActivePage} />
        </MenuGroup>
      </div>

      <div className="mt-2 rounded-xl border border-slate-100 shadow-sm p-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
            A
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 leading-3">Токенов</p>
            <p className="text-lg font-black leading-5">125 000</p>
            <p className="text-[9px] text-slate-400 leading-3">≈ 312 генераций</p>
          </div>
        </div>

        <button className="mt-2 w-full h-8 rounded-lg bg-green-600 text-white text-[11px] font-bold">
          Пополнить
        </button>
      </div>
    </aside>
  );
}
const searchItems = [
  { title: "Описание товара", type: "Инструмент", path: "/tools/product-description" },
  { title: "SEO ключи", type: "Инструмент", path: "/tools/seo" },
  { title: "Инфографика", type: "Инструмент", path: "/tools/infographic" },
  { title: "Видео карточка", type: "Инструмент", path: "/tools/video-card" },
  { title: "Реклама", type: "Раздел", path: "/ads" },
  { title: "Ответы на отзывы", type: "Инструмент", path: "/reviews/answers" },
  { title: "Анализ конкурентов", type: "Аналитика", path: "/analytics/competitors" },
  { title: "AI Фото товара", type: "Инструмент", path: "/tools/ai-photo" },
  { title: "A/B тесты", type: "Инструмент", path: "/tools/ab-tests" },
  { title: "Продвижение", type: "Раздел", path: "/promotion" },
  { title: "Товары", type: "Раздел", path: "/products" },
  { title: "AI Ассистент", type: "AI", path: "/ai-assistant" },

  { title: "Косметика Premium", type: "Проект", path: "/projects/cosmetics-premium" },
  { title: "Электроника Store", type: "Проект", path: "/projects/electronics-store" },
  { title: "Детские товары", type: "Проект", path: "/projects/kids" },

  { title: "Wildberries", type: "Интеграция", path: "/integrations/wildberries" },
  { title: "Ozon", type: "Интеграция", path: "/integrations/ozon" },
  { title: "Яндекс Маркет", type: "Интеграция", path: "/integrations/yandex-market" },
  { title: "Telegram", type: "Интеграция", path: "/integrations/telegram" },
  { title: "Google Sheets", type: "Интеграция", path: "/integrations/google-sheets" },

  { title: "Отчёты", type: "Документы", path: "/reports" },
  { title: "Файлы и документы", type: "Документы", path: "/files" },
  { title: "Календарь задач", type: "Задачи", path: "/calendar" },
  { title: "Оплата", type: "Аккаунт", path: "/billing" },
  { title: "Настройки", type: "Аккаунт", path: "/settings" },
];
function GlobalSearch() {
  const [query, setQuery] = useState("");

  const results = searchItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative flex-1">
      <div className="h-14 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 flex items-center gap-3">
        <Search size={18} className="text-slate-400" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по инструментам, шаблонам, товарам и документам..."
          className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
        />

      </div>

      {query.length > 0 && (
        <div className="absolute top-16 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50">
          {results.length > 0 ? (
            results.slice(0, 8).map((item) => (
              <button
                key={item.path}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-left"
              >
                <div>
                  <p className="font-bold text-sm text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.type}</p>
                </div>

                <span className="text-violet-600 text-sm font-bold">
                  Открыть →
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              Ничего не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
} function DashboardContent() {
  return (
    <>
      <div className="grid grid-cols-[1fr_260px] gap-4 mb-5">
        <div>
          <h1 className="text-4xl font-black">Добро пожаловать, Алексей! 👋</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Сегодня отличный день для роста вашего бизнеса.
          </p>
        </div>

        <MiniTopCard
          title="Тариф"
          value="Pro бизнес"
          sub="до 20 июня 2026"
          crown
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard emoji="🔥" title="Продажи сегодня" value="128 450 ₽" sub="+12.4%" />
        <MetricCard emoji="✨" title="Конверсия" value="18,6%" sub="+2.1%" />
        <MetricCard emoji="⭐" title="Новые отзывы" value="23" sub="+7" />
        <MetricCard emoji="⚠️" title="Что требует внимания" value="5" sub="задач" orange />
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-5 mb-5">
        <Panel title="Быстрый старт" action="Все инструменты →">
          <div className="grid grid-cols-6 gap-3">
            <QuickTool emoji="📈" title="Описание товара" />
            <QuickTool emoji="🔍" title="SEO ключи" />
            <QuickTool emoji="🖼️" title="Инфографика" />
            <QuickTool emoji="💬" title="Видео карточка" />
            <QuickTool emoji="📣" title="Реклама" />
            <QuickTool emoji="🔁" title="Ответы на отзывы" />
            <QuickTool emoji="📊" title="Анализ конкурентов" />
            <QuickTool emoji="📷" title="AI Фото товара" badge="NEW" />
            <QuickTool emoji="🧪" title="A/B тесты" />
            <QuickTool emoji="🚀" title="Продвижение" badge="NEW" />
            <QuickTool emoji="📦" title="Товары" />
            <QuickTool emoji="🤖" title="AI Ассистент" />
          </div>

          <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 flex items-center justify-between text-sm">
            <span>💡 Подсказка от AI: Обновите SEO для 5 товаров — это может увеличить показы на 18%</span>
            <button className="text-violet-600 font-bold">Смотреть задачи</button>
          </div>
        </Panel>

        <Panel title="Что требует внимания">
          <Attention value="8" title="отзывов без ответа" action="Ответить →" />
          <Attention value="2" title="товара теряют позиции" action="Посмотреть →" />
          <Attention value="1" title="реклама сливает бюджет" action="Оптимизировать →" />

          <div className="mt-4 rounded-2xl bg-orange-50 p-4">
            <p className="text-sm text-slate-500">Тариф закончится через</p>
            <p className="text-3xl font-black">3 дня</p>
            <p className="text-violet-600 font-bold text-sm mt-2">Продлить тариф →</p>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-[1fr_1fr_260px] gap-5 mb-5">
        <Panel title="Рост благодаря Smart Market" action="За 30 дней⌄">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Growth value="+18%" label="CTR" />
            <Growth value="+11%" label="Продажи" />
            <Growth value="+127" label="Заказы" />
            <Growth value="23ч" label="Экономия" />
          </div>
          <div className="h-[230px] rounded-3xl bg-gradient-to-t from-violet-100 to-white border border-slate-100 flex items-end p-5">
            <div className="w-full h-40 rounded-2xl bg-white/70 flex items-center justify-center text-violet-600 font-black">
              График роста продаж
            </div>
          </div>
        </Panel>

        <Panel title="Мои проекты" action="Все проекты →">
          <ProjectItem emoji="💄" title="Косметика Premium" market="Wildberries" count="128 товаров" />
          <ProjectItem emoji="🎧" title="Электроника Store" market="Ozon" count="74 товара" />
          <ProjectItem emoji="🧸" title="Детские товары" market="Wildberries" count="56 товаров" draft />
          <button className="w-full mt-4 h-11 rounded-2xl border border-violet-100 text-violet-600 font-bold">
            + Создать проект
          </button>
        </Panel>

        <Panel title="Достижения">
          <div className="rounded-3xl bg-violet-50 p-4">
            <p className="text-3xl">🏆</p>
            <p className="font-black mt-2">PRO продавец</p>
            <p className="text-xs text-slate-500">Уровень 4 из 6</p>
            <div className="h-2 bg-white rounded-full mt-4">
              <div className="h-2 bg-violet-600 rounded-full w-[70%]" />
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-100 p-4">
            <p className="text-sm font-bold">Баланс токенов</p>
            <p className="text-2xl font-black mt-2">125 000</p>
            <p className="text-xs text-green-600 font-bold">+12 500 за неделю</p>
            <button className="mt-4 w-full h-10 rounded-xl border border-violet-200 text-violet-600 font-bold text-sm">
              Пополнить баланс
            </button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Panel title="AI рекомендации">
          <Recommendation title="Обновите SEO у 5 товаров" level="Высокий" />
          <Recommendation title="Запустите видео карточку" level="Средний" />
          <Recommendation title="Протестируйте цену конкурента" level="Средний" />
          <Recommendation title="Включите автоответы на отзывы" level="Низкий" />
        </Panel>

        <Panel title="Последняя активность" action="Смотреть всё →">
          <ActivityItem title="Создано описание товара" />
          <ActivityItem title="Сгенерирована инфографика" />
          <ActivityItem title="Загружен файл прайс-листа" />
          <ActivityItem title="Ответ на отзыв сгенерирован AI" />
          <ActivityItem title="Запущена рекламная кампания" />
        </Panel>

        <Panel title="AI Ассистент">
          <div className="rounded-3xl bg-slate-50 p-4 flex items-center gap-3">
            <div className="text-4xl">🤖</div>
            <div>
              <p className="font-bold">Привет! 👋</p>
              <p className="text-xs text-slate-500">Я ваш AI-помощник. Чем могу помочь?</p>
            </div>
          </div>
          <button className="mt-4 w-full h-11 rounded-xl border border-violet-200 text-violet-600 font-bold">
            Написать ассистенту
          </button>
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Panel title="Инсайты для роста">
          <Insight title="CTR ваших карточек вырос на 12%" />
          <Insight title="Инфографика повышает конверсию" />
          <Insight title="Вы активнее всего работаете с WB" />
        </Panel>

        <Panel title="Горячие возможности" action="Смотреть все →">
          <Opportunity title="Новый инструмент: Генератор Reels" />
          <Opportunity title="AI Фото товара" />
          <Opportunity title="Новый шаблон: WB 2026" />
        </Panel>

        <Panel title="Интеграции" action="Управление →">
          <div className="grid grid-cols-2 gap-3">
            <Integration title="Wildberries" connected />
            <Integration title="Ozon" connected />
            <Integration title="Telegram" connected />
            <Integration title="Google Sheets" connected />
            <Integration title="Яндекс Маркет" />
            <Integration title="API Webhook" />
          </div>
        </Panel>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 flex items-center justify-between overflow-hidden">
        <div>
          <p className="text-5xl mb-3">🚀</p>
          <h2 className="text-3xl font-black">Вы теряете продажи без AI-рекламы</h2>
          <p className="text-white/80 mt-2">Запустите эффективную рекламу за 1 минуту и увеличьте продажи.</p>
          <button className="mt-5 bg-white text-violet-700 rounded-xl px-5 py-3 font-bold">
            Запустить рекламу
          </button>
        </div>

        <div className="w-[280px] bg-white text-slate-900 rounded-3xl p-4">
          <p className="text-sm font-bold">Крем для лица</p>
          <p className="text-xs text-slate-500">Premium Care</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <p className="text-xs text-slate-500">Продажи</p>
              <p className="font-black">12 450 ₽</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Конверсия</p>
              <p className="font-black text-green-600">+32%</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function ActivityItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0">
      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
        ✅
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{title}</p>
        <p className="text-xs text-slate-400">Только что</p>
      </div>
    </div>
  );
}
function PageStub({ title }: any) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-slate-500 mt-2">
        Раздел «{title}» активен. Здесь дальше сделаем полноценную страницу.
      </p>
    </div>
  );
}
function Panel({ title, action, children }: any) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black">{title}</h3>
        {action && <p className="text-xs text-violet-600 font-bold">{action}</p>}
      </div>
      {children}
    </div>
  );
}

function MiniTopCard({ title, value, sub, crown }: any) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-xl font-black mt-1">{value}</p>
        <p className={crown ? "text-xs text-slate-500" : "text-xs text-green-600 font-bold"}>{sub}</p>
      </div>
      <div className="text-3xl">{crown ? "👑" : "💲"}</div>
    </div>
  );
}

function MetricCard({ emoji, title, value, sub, orange }: any) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-5">
      <p className="text-xl">{emoji}</p>
      <p className="text-xs text-slate-500 mt-3">{title}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
      <p className={`text-xs font-bold mt-2 ${orange ? "text-orange-500" : "text-green-600"}`}>{sub}</p>
    </div>
  );
}

function QuickTool({ emoji, title, badge }: any) {
  return (
    <div className="h-[90px] rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-100 flex flex-col items-center justify-center text-center relative">
      {badge && <span className="absolute top-2 right-2 text-[9px] bg-green-100 text-green-600 rounded-full px-2 font-black">{badge}</span>}
      <div className="text-2xl">{emoji}</div>
      <p className="text-[11px] font-black mt-2 px-1">{title}</p>
    </div>
  );
}

function Attention({ value, title, action }: any) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black">{value}</div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-violet-600 font-bold">{action}</p>
      </div>
    </div>
  );
}

function Growth({ value, label }: any) {
  return (
    <div>
      <p className="text-lg font-black text-green-600">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ProjectItem({ emoji, title, market, count, draft }: any) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">{emoji}</div>
      <div className="flex-1">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-slate-500">{market}</p>
        <p className="text-xs text-slate-400">{count}</p>
      </div>
      <span className={`text-[10px] px-2 py-1 rounded-full font-black ${draft ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-600"}`}>
        {draft ? "Черновик" : "Активный"}
      </span>
    </div>
  );
}

function Recommendation({ title, level }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100">
      <p className="text-sm font-bold">{title}</p>
      <span className="text-[10px] bg-orange-50 text-orange-500 rounded-full px-2 py-1 font-black">{level}</span>
    </div>
  );
}

function Insight({ title }: any) {
  return (
    <div className="flex gap-3 py-3">
      <div className="text-green-600">✅</div>
      <p className="text-sm font-bold">{title}</p>
    </div>
  );
}

function Opportunity({ title }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100">
      <p className="text-sm font-bold">{title}</p>
      <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-black">NEW</span>
    </div>
  );
}

function Integration({ title, connected }: any) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-sm font-bold">{title}</p>
      <p className={`text-xs font-bold mt-1 ${connected ? "text-green-600" : "text-slate-400"}`}>
        {connected ? "Подключено" : "Подключить"}
      </p>
    </div>
  );
}
function MenuGroup({ title, children }: any) {
  return (
    <div>
      <p className="text-[9px] font-black text-indigo-400 mb-1 tracking-wide">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({ icon, title, badge, activePage, setActivePage, arrow, purple }: any) {
  const active = activePage === title;

  return (
    <button
      onClick={() => setActivePage(title)}
      className={`w-full h-[28px] rounded-lg px-2 flex items-center gap-2 text-[11px] font-bold cursor-pointer ${active
        ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
        : "text-slate-800 hover:bg-slate-50"
        }`}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">{title}</span>

      {badge && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-black ${active
            ? "bg-white/20 text-white"
            : purple
              ? "bg-violet-100 text-violet-600"
              : "bg-green-100 text-green-600"
            }`}
        >
          {badge}
        </span>
      )}

      {arrow && <ChevronRight size={14} />}
    </button>
  );
}

function TopIcon({ icon, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl border shadow-sm flex items-center justify-center ${active
        ? "bg-violet-600 text-white border-violet-600"
        : "bg-white text-slate-700 border-slate-100 hover:bg-slate-50"
        }`}
    >
      {icon}
    </button>
  );
} function SectionTitle({ title, action }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold">{title}</h3>
      {action && <p className="text-sm text-slate-500 font-bold">{action}</p>}
    </div>
  );
}

function ToolCard({ emoji, title, desc }: any) {
  return (
    <div className="h-[135px] rounded-3xl bg-white border border-slate-100 shadow-sm p-5">
      <div className="text-2xl">{emoji}</div>
      <h4 className="font-bold mt-3">{title}</h4>
      <p className="text-xs text-slate-500 mt-2">{desc}</p>
    </div>
  );
}

function StatCard({ title, value, sub }: any) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-3xl font-bold mt-3">{value}</p>
      <p className="text-xs text-green-600 mt-2 font-semibold">{sub}</p>
    </div>
  );
}