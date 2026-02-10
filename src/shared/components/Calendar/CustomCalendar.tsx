import { useEffect, useState } from 'react';
import './CustomCalendar.sass';

// Tipos para compatibilidade (pode usar dayjs depois)
type DateValue = Date | null;

type Props = {
  startDate: DateValue;
  endDate: DateValue;
  onSelectDate: (date: Date) => void;
  onCancel: () => void;
  onApply: (date: Date) => void;
};

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CustomCalendar = ({ startDate, endDate, onSelectDate, onCancel, onApply }: Props): JSX.Element => {
  const [currentDate, setCurrentDate] = useState<Date>(startDate || new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obter primeiro dia do mês e quantos dias tem o mês
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Gerar array de dias do mês
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Preencher com dias vazios no início
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null);

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    onSelectDate(selectedDate);
  };

  const isInRange = (day: number): boolean => {
    if (!startDate || !endDate) return false;
    const dayDate = new Date(year, month, day);
    return dayDate >= startDate && dayDate <= endDate;
  };

  const isStart = (day: number): boolean => {
    if (!startDate) return false;
    const dayDate = new Date(year, month, day);
    return dayDate.getTime() === startDate.getTime();
  };

  const isEnd = (day: number): boolean => {
    if (!endDate) return false;
    const dayDate = new Date(year, month, day);
    return dayDate.getTime() === endDate.getTime();
  };

  const isOnly = (day: number): boolean => {
    return isStart(day) && isEnd(day);
  };

  const handleMonthChange = (newMonth: number) => {
    setCurrentDate(new Date(year, newMonth, 1));
    setShowMonthPicker(false);
  };

  const handleYearChange = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
    setShowYearPicker(false);
  };

  const getYears = () => {
    const currentYear = year;
    return Array.from({ length: 12 }, (_, i) => currentYear - 6 + i);
  };

  useEffect(() => {
    if (startDate) {
      setCurrentDate(startDate);
    }
  }, [startDate]);

  return (
    <div className="custom-calendar">
      <div className="calendar-weekdays">
        {weekDays.map((d, idx) => (
          <div key={idx} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-header">
        <span
          className="calendar-header-month"
          onClick={() => {
            setShowMonthPicker(!showMonthPicker);
            setShowYearPicker(false);
          }}
        >
          {months[month]}
        </span>
        <span
          className="calendar-header-year"
          onClick={() => {
            setShowYearPicker(!showYearPicker);
            setShowMonthPicker(false);
          }}
        >
          {year}
        </span>
      </div>

      {showMonthPicker ? (
        <div className="month-picker">
          {months.map((monthName, idx) => (
            <div
              key={idx}
              className={`month-option ${idx === month ? 'active' : ''}`}
              onClick={() => handleMonthChange(idx)}
            >
              {monthName}
            </div>
          ))}
        </div>
      ) : showYearPicker ? (
        <div className="year-picker">
          {getYears().map((y) => (
            <div
              key={y}
              className={`year-option ${y === year ? 'active' : ''}`}
              onClick={() => handleYearChange(y)}
            >
              {y}
            </div>
          ))}
        </div>
      ) : (
        <div className="calendar-days">
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="calendar-day empty"></div>
          ))}
          {days.map((day) => {
            const dayClasses = ['calendar-day'];
            if (isOnly(day)) {
              dayClasses.push('start', 'end', 'only');
            } else {
              if (isStart(day)) dayClasses.push('start');
              if (isEnd(day)) dayClasses.push('end');
              if (isInRange(day) && !isStart(day) && !isEnd(day)) {
                dayClasses.push('range');
              }
            }

            return (
              <div
                key={day}
                className={dayClasses.join(' ')}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      )}

      <div className="calendar-footer">
        <div className="calendar-footer-actions">
          <button className="footer-button cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={`footer-button apply ${!startDate || !endDate ? 'disabled' : ''}`}
            onClick={() => {
              if (startDate && endDate) {
                onApply(endDate);
              }
            }}
            disabled={!startDate || !endDate}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;

