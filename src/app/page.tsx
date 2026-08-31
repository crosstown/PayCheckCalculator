import Calculator from "@/components/Calculator";
import OvertimeExplainer from "@/components/OvertimeExplainer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      <Calculator />
      <OvertimeExplainer />
    </div>
  );
}
