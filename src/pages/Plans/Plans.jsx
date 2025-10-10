import React, { useState, useEffect } from "react";
import { getPlans, assignPlan, getUserCurrentPlan } from "../../api";
import { toast } from "react-toastify";
import { Loader2, Crown, Users, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./Plans.css";

const Plans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPlans().then(setPlans).catch(() => toast.error("Failed to load plans")),
      user?.id ? getUserCurrentPlan(user.id).then(plan => {
        setCurrentPlan(plan);
        setSelectedPlan(plan.id);
      }).catch(() => setCurrentPlan(null)) : Promise.resolve()
    ]).finally(() => setLoading(false));
  }, [user?.id]);

  const handleAssign = async () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }
    setAssignLoading(true);
    try {
      await assignPlan(user.id, selectedPlan);
      toast.success("Plan assigned successfully to your account!");
      setSelectedPlan(""); 
    } catch (error) {
      toast.error("Failed to assign plan");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="plans-container">
      <div className="plans-wrapper">
        <div className="plans-header">
          <h1>
            <Crown className="crown-icon" size={32} />
            My Subscription Plans
          </h1>
          <p>Choose the perfect plan for your needs</p>
        </div>

        {currentPlan && (
          <div className="current-plan-display">
            <h3>Your Current Plan: {currentPlan.name}</h3>
            <p>Expires on: {new Date(currentPlan.expiry).toLocaleDateString()}</p>
          </div>
        )}

        {loading ? (
          <div className="plans-loading">
            <Loader2 className="loading-spinner" size={40} />
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="plan-card"
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="plan-card-header">
                  <h2 className="plan-card-title">
                    {plan.name}
                  </h2>
                  {plan.name.toLowerCase() === "premium" ? (
                    <Crown className="premium-icon" />
                  ) : (
                    <Users className="standard-icon" />
                  )}
                </div>
                <p className="plan-price">
                  ${plan.price}
                  <span> /mo</span>
                </p>
                <p className="plan-description">
                  {plan.description || "No description available."}
                </p>
                <div className="plan-features">
                  {plan.features || "Standard features included"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Section */}
        <div className="assign-section">
          <h2>
            <Users className="users-icon" size={24} />
            Select Your Plan
          </h2>

          <div className="assign-form">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="assign-select"
            >
              <option value="">Select Plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}/mo
                </option>
              ))}
            </select>

            <button
              onClick={handleAssign}
              disabled={assignLoading || !selectedPlan}
              className="assign-button"
            >
              {assignLoading ? <Loader2 className="button-spinner" size={18} /> : <ArrowRight size={18} />}
              {assignLoading ? "Assigning..." : "Assign Plan to My Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
