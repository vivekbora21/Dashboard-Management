import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Loading from "../../../components/Loading";

const ChartLoader = () => (
  <div
    style={{
      width: "100%",
      height: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      borderRadius: "20px",
    }}
  >
    <Loading />
  </div>
);

const ChartWrapper = ({
  title,
  chartType,
  currentFilter,
  onTimeFilterChange,
  children,
  requiredPlan,
}) => {
  const { userPlan } = useAuth();
  const navigate = useNavigate();
  const PLAN_LEVELS = { free: 1, basic: 2, premium: 3 };

  const TimeFilter = ({ chartType, currentFilter }) => (
    <div className="time-filter">
      <select
        value={currentFilter}
        onChange={(e) => onTimeFilterChange(chartType, e.target.value)}
        className="time-filter-select"
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );

  return (
    <div
      className={`chart-wrapper ${
        PLAN_LEVELS[userPlan] < PLAN_LEVELS[requiredPlan] ? "locked" : ""
      }`}
    >
      <div className="chart-card">
        <div className="chart-header">
          <h3>{title}</h3>
          <TimeFilter chartType={chartType} currentFilter={currentFilter} />
        </div>
        <Suspense fallback={<ChartLoader />}>{children}</Suspense>
      </div>
      {PLAN_LEVELS[userPlan] < PLAN_LEVELS[requiredPlan] && (
        <div className="plan-lock-overlay">
          <p><h2>{title}</h2></p>
          <div className="plan-lock-icon">🔒</div>
          <p>Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan</p>
          <button className="plan-upgrade-btn" onClick={() => navigate("/dashboard/plans")}>
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ChartWrapper;
