import type { Metadata } from "next";
import Calculator from "@/components/Calculator";
import OvertimeExplainer from "@/components/OvertimeExplainer";
import ScheduleComparison from "@/components/ScheduleComparison";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      <Calculator />
      <ScheduleComparison />
      <OvertimeExplainer />
    </div>
  );
}
