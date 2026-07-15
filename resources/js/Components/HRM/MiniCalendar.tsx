interface MiniCalendarProps {
  year: number;
  holidays: { date: string; name: string; type: string }[];
  onMonthClick?: (month: number) => void;
}

export function MiniCalendar({ year, holidays, onMonthClick }: MiniCalendarProps) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getDaysInMonth = (month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isHoliday = (day: number, month: number, type?: string) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(h => {
      const hDate = new Date(h.date);
      return h.date === dateStr || 
        (hDate.getMonth() === month && hDate.getDate() === day);
    });
  };

  const renderMonthGrid = (monthIndex: number) => {
    const daysInMonth = getDaysInMonth(monthIndex);
    const firstDay = getFirstDayOfMonth(monthIndex);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const holiday = isHoliday(day, monthIndex);
      const isCompany = holiday?.type === 'company';
      const isPublic = holiday?.type === 'public';
      
      days.push(
        <div
          key={day}
          className={`h-6 w-6 flex items-center justify-center text-xs rounded-full ${
            holiday
              ? isCompany
                ? 'bg-indigo-500 text-white'
                : 'bg-amber-500 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
          title={holiday?.name}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {months.map((month, index) => (
        <div
          key={month}
          className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onMonthClick?.(index)}
        >
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">{month}</h4>
          <div className="grid grid-cols-7 gap-1">
            {renderMonthGrid(index)}
          </div>
        </div>
      ))}
    </div>
  );
}