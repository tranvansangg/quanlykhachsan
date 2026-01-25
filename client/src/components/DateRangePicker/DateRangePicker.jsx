import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, differenceInDays, isBefore, startOfDay, addMonths } from 'date-fns';
import './DateRangePicker.css';

const DateRangePicker = ({ onDateChange, onClose, initialStartDate = null, initialEndDate = null }) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [hoverDate, setHoverDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState('startDate');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  // Initialize with today and tomorrow
  useEffect(() => {
    if (!initialStartDate || !initialEndDate) {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      setStartDate(today);
      setEndDate(tomorrow);
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    const dateToCheck = startOfDay(date);
    return dateToCheck > startDate && dateToCheck < endDate;
  };

  const isStartDate = (date) => {
    if (!startDate) return false;
    return startOfDay(date).getTime() === startOfDay(startDate).getTime();
  };

  const isEndDate = (date) => {
    if (!endDate) return false;
    return startOfDay(date).getTime() === startOfDay(endDate).getTime();
  };

  const isDisabledDate = (date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  const handleDateClick = (date) => {
    if (isDisabledDate(date)) return;

    const dateToSet = startOfDay(date);

    if (focusedInput === 'startDate') {
      if (endDate && isBefore(endDate, dateToSet)) {
        setStartDate(dateToSet);
        setEndDate(null);
        setFocusedInput('endDate');
      } else {
        setStartDate(dateToSet);
        setFocusedInput('endDate');
      }
    } else {
      if (isBefore(dateToSet, startDate)) {
        setStartDate(dateToSet);
        setFocusedInput('endDate');
      } else if (dateToSet.getTime() === startDate.getTime()) {
        return;
      } else {
        setEndDate(dateToSet);
        onDateChange({
          startDate: startDate,
          endDate: dateToSet,
          nights: differenceInDays(dateToSet, startDate),
        });
        setTimeout(onClose, 200);
      }
    }
  };

  const renderCalendar = (monthOffset) => {
    const displayMonth = addMonths(currentMonth, monthOffset);
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return { month: displayMonth, days };
  };

  const renderMonthDays = (monthData) => {
    const weeks = [];
    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    for (let i = 0; i < monthData.days.length; i += 7) {
      weeks.push(monthData.days.slice(i, i + 7));
    }

    return (
      <div className="drp-month">
        <div className="drp-month-title">
          {format(monthData.month, 'MMM yyyy')}
        </div>

        <div className="drp-weekdays">
          {dayNames.map((day) => (
            <div key={day} className="drp-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="drp-days">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="drp-week">
              {week.map((date, dayIdx) => {
                if (!date) {
                  return <div key={`empty-${dayIdx}`} className="drp-day drp-day-empty" />;
                }

                const isDisabled = isDisabledDate(date);
                const isStart = isStartDate(date);
                const isEnd = isEndDate(date);
                const isRange = isDateInRange(date);
                const isHover = hoverDate && isDateInRange(hoverDate) && startDate && !endDate
                  ? isBefore(date, hoverDate) || date.getTime() === hoverDate.getTime()
                  : false;

                return (
                  <button
                    key={date.toISOString()}
                    className={`drp-day ${isDisabled ? 'drp-day-disabled' : ''} ${
                      isStart ? 'drp-day-start' : ''
                    } ${isEnd ? 'drp-day-end' : ''} ${isRange ? 'drp-day-range' : ''} ${
                      isHover ? 'drp-day-hover' : ''
                    }`}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => {
                      if (startDate && !endDate) {
                        setHoverDate(date);
                      }
                    }}
                    onMouseLeave={() => setHoverDate(null)}
                    disabled={isDisabled}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const month1 = renderCalendar(0);
  const month2 = renderCalendar(1);

  const nights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  return (
    <div className="drp-container" ref={containerRef}>
      {/* Info Row */}
      <div className="drp-info">
        <div className="drp-info-item">
          <span className="drp-info-label">Check-in:</span>
          <span className="drp-info-value">
            {startDate ? format(startDate, 'dd MMM') : 'Select'}
          </span>
        </div>
        <div className="drp-info-item">
          <span className="drp-info-label">Check-out:</span>
          <span className="drp-info-value">
            {endDate ? format(endDate, 'dd MMM') : 'Select'}
          </span>
        </div>
        {nights > 0 && (
          <div className="drp-nights">
            {nights} night{nights !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="drp-nav">
        <button
          className="drp-nav-btn"
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          title="Previous month"
        >
          ←
        </button>
        <button
          className="drp-nav-btn"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          title="Next month"
        >
          →
        </button>
      </div>

      {/* Calendars */}
      <div className="drp-calendars">
        {renderMonthDays(month1)}
        {renderMonthDays(month2)}
      </div>
    </div>
  );
};

export default DateRangePicker;

