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
        "rounded-3xl border border-border bg-card p-6 shadow-sm",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 space-y-2">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {children}
    </motion.section>
  );
}
