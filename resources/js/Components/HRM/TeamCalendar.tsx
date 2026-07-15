interface LeaveRequest {
  start_date: string;
  end_date: string;
  employee?: { first_name: string };
}

interface TeamCalendarProps {
  leaveRequests: LeaveRequest[];
}

export function TeamCalendar({ leaveRequests }: TeamCalendarProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getLeaveForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return leaveRequests.filter(lr => {
      const start = new Date(lr.start_date);
      const end = new Date(lr.end_date);
      return date >= start && date <= end;
    });
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-slate-100 dark:border-slate-800" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const leaves = getLeaveForDay(day);
      const isToday = day === today.getDate();
      days.push(
        <div
          key={day}
          className={`h-20 border border-slate-100 dark:border-slate-800 p-1 overflow-hidden ${
            isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-900'
          }`}
        >
          <span className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
            {day}
          </span>
          <div className="mt-1 space-y-1">
            {leaves.slice(0, 2).map((lr: any, idx: number) => (
              <div
                key={idx}
                className="text-[10px] px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded truncate"
                title={lr.employee?.first_name}
              >
                {lr.employee?.first_name?.charAt(0)}.
              </div>
            ))}
            {leaves.length > 2 && (
              <span className="text-[10px] text-slate-400">+{leaves.length - 2} more</span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {months[currentMonth]} {currentYear}
        </h3>
      </div>
      <div className="grid grid-cols-7">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">{renderDays()}</div>
    </div>
  );
}