import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

export function ToolCard({ title, description, children, className }: ToolCardProps) {
  return (
    <motion.section
      className={cn(
        "rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {children}
    </motion.section>
  );
}
