import React from 'react';
import './DateFilter.css';

const DateFilter = ({ filters, setFilters }) => {
  const handleDateChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const clearDates = () => {
    setFilters({
      ...filters,
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="date-filter">
      <h3>Filter by Date Range</h3>
      <div className="date-filter-row">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
          />
        </div>
        {(filters.startDate || filters.endDate) && (
          <button className="btn btn-secondary" onClick={clearDates}>
            Clear Dates
          </button>
        )}
      </div>
    </div>
  );
};

export default DateFilter;

