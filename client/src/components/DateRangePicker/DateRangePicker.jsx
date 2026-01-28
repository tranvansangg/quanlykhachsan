import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, differenceInDays, isBefore, startOfDay, addMonths, isAfter, isSameDay } from 'date-fns';
import './DateRangePicker.css';

const DateRangePicker = ({ onDateChange, onClose, dates = null }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState('startDate');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  // Initialize with dates from props or today/tomorrow
  useEffect(() => {
    if (dates && dates.length > 0 && dates[0].startDate && dates[0].endDate) {
      setStartDate(startOfDay(new Date(dates[0].startDate)));
      setEndDate(startOfDay(new Date(dates[0].endDate)));
    } else {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      setStartDate(today);
      setEndDate(tomorrow);
    }
    setCurrentMonth(new Date());
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

  // Calculate nights using timestamp (correct calculation)
  const calculateNights = (start, end) => {
    if (!start || !end) return 0;
    const startTime = startOfDay(start).getTime();
    const endTime = startOfDay(end).getTime();
    const diffMs = endTime - startTime;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

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
    return isSameDay(startOfDay(date), startOfDay(endDate));
  };

  // Disable past dates (before today)
  const isDisabledDate = (date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  const handleDateClick = (date) => {
    if (isDisabledDate(date)) return;

    const dateToSet = startOfDay(date);

    if (focusedInput === 'startDate') {
      // If endDate exists and is before new startDate, swap them
      if (endDate && isBefore(endDate, dateToSet)) {
        setStartDate(dateToSet);
        setEndDate(null);
        setFocusedInput('endDate');
      } else {
        setStartDate(dateToSet);
        // If we have an endDate and it's the same as startDate, clear it
        if (endDate && isSameDay(dateToSet, endDate)) {
          setEndDate(null);
        }
        setFocusedInput('endDate');
      }
    } else {
      // For endDate selection
      // Don't allow checkout before or on the same day as checkin
      if (isBefore(dateToSet, startDate) || isSameDay(dateToSet, startDate)) {
        return;
      }

      setEndDate(dateToSet);
      const nights = calculateNights(startDate, dateToSet);
      
      // Ensure onDateChange is a function before calling
      if (typeof onDateChange === 'function') {
        onDateChange({
          startDate: startDate,
          endDate: dateToSet,
          nights: nights,
        });
      }
      setTimeout(onClose, 200);
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

    // Add empty slots for days before the first day of month
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null);
    }

    // Add all days of the month
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
                
                // Show hover effect for range selection
                const isHover = hoverDate && startDate && !endDate
                  ? !isBefore(date, startDate) && isBefore(date, hoverDate)
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
                    type="button"
                    aria-label={format(date, 'dd MMM yyyy')}
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

  // Calculate nights correctly using timestamp
  const nights = calculateNights(startDate, endDate);

  return (
    <div className="drp-container" ref={containerRef}>
      {/* Info Row - Booking.com style */}
      <div className="drp-info">
        <div className="drp-info-section">
          <div className="drp-info-item">
            <span className="drp-info-label">CHECK-IN:</span>
            <span className="drp-info-value">
              {startDate ? format(startDate, 'dd MMM') : 'Select'}
            </span>
          </div>
          <div className="drp-info-item">
            <span className="drp-info-label">CHECK-OUT:</span>
            <span className="drp-info-value">
              {endDate ? format(endDate, 'dd MMM') : 'Select'}
            </span>
          </div>
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
          type="button"
          aria-label="Previous month"
        >
          ←
        </button>
        <button
          className="drp-nav-btn"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          title="Next month"
          type="button"
          aria-label="Next month"
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

