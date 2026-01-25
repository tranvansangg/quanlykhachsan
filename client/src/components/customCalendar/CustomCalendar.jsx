import React, { useState } from "react";
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
} from "date-fns";
import "./customCalendar.css";

const CustomCalendar = ({ startDate, endDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start, end });

  // Adjust to start from Sunday
  const firstDayOfWeek = start.getDay();
  const days = [
    ...Array(firstDayOfWeek).fill(null),
    ...daysInMonth,
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isInRange = (day) => {
    if (!day || !startDate || !endDate) return false;
    return day > startDate && day < endDate;
  };

  const isSelected = (day) => {
    if (!day) return false;
    return (
      (startDate && format(day, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd")) ||
      (endDate && format(day, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd"))
    );
  };

  const handleDateClick = (day) => {
    if (!day) return;
    onDateChange(day);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="customCalendar">
      {/* Month Header */}
      <div className="calendarHeader">
        <button className="navBtn" onClick={handlePrevMonth}>
          ←
        </button>
        <h3 className="monthName">{format(currentMonth, "MMMM yyyy")}</h3>
        <button className="navBtn" onClick={handleNextMonth}>
          →
        </button>
      </div>

      {/* Weekday Row */}
      <div className="weekDaysRow">
        {weekDays.map((day) => (
          <div key={day} className="weekDay">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="daysGrid">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`dayCell ${
              !day ? "empty" : ""
            } ${
              isSelected(day) ? "selected" : ""
            } ${
              isInRange(day) ? "inRange" : ""
            } ${
              day && isToday(day) ? "today" : ""
            }`}
            onClick={() => handleDateClick(day)}
          >
            {day ? format(day, "d") : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomCalendar;
