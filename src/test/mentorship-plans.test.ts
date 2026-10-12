import { describe, expect, it } from "vitest";

import { mentorshipPlans } from "@/lib/mentorship-plans";

describe("mentorship plan pricing", () => {
  it("sets the 12-month plan to $3,000", () => {
    expect(mentorshipPlans.find((plan) => plan.id === "annual")?.price).toBe(3000);
  });

  it("sets the 6-month plan to $1,500", () => {
    expect(mentorshipPlans.find((plan) => plan.id === "half-year")?.price).toBe(1500);
  });

  it("prorates the 3-month plan to $750", () => {
    expect(mentorshipPlans.find((plan) => plan.id === "quarterly")?.price).toBe(750);
  });

  it("prorates the 1-month plan to $250", () => {
    expect(mentorshipPlans.find((plan) => plan.id === "monthly")?.price).toBe(250);
  });
});
