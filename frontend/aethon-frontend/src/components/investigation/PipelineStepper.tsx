import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "../../utils/classNames";
import type { PipelineStep } from "../../types";

interface PipelineStepperProps {
  steps: PipelineStep[];
}

const STEP_ICON = {
  pending: <Circle size={18} className="pipeline-step__icon pipeline-step__icon--pending" />,
  running: (
    <Loader2
      size={18}
      className="pipeline-step__icon pipeline-step__icon--running"
      aria-label="Running"
    />
  ),
  done: <CheckCircle2 size={18} className="pipeline-step__icon pipeline-step__icon--done" />,
  error: <XCircle size={18} className="pipeline-step__icon pipeline-step__icon--error" />,
};

export function PipelineStepper({ steps }: PipelineStepperProps) {
  return (
    <ol className="pipeline-stepper" aria-label="Investigation pipeline progress">
      {steps.map((step, i) => (
        <motion.li
          key={step.id}
          className={cn("pipeline-step", `pipeline-step--${step.status}`)}
          initial={{ opacity: 0.4, x: -8 }}
          animate={
            step.status !== "pending"
              ? { opacity: 1, x: 0 }
              : { opacity: 0.4, x: -8 }
          }
          transition={{ duration: 0.3, delay: i * 0.05 }}
          aria-current={step.status === "running" ? "step" : undefined}
        >
          <div className="pipeline-step__indicator">
            <AnimatePresence mode="wait">
              <motion.span
                key={step.status}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {STEP_ICON[step.status]}
              </motion.span>
            </AnimatePresence>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "pipeline-step__connector",
                  step.status === "done" && "pipeline-step__connector--done"
                )}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="pipeline-step__body">
            <span className="pipeline-step__label">{step.label}</span>
            {step.status === "running" && (
              <motion.span
                className="pipeline-step__sub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                Analyzing…
              </motion.span>
            )}
            {step.status === "done" && (
              <span className="pipeline-step__sub pipeline-step__sub--done">Complete</span>
            )}
            {step.status === "error" && (
              <span className="pipeline-step__sub pipeline-step__sub--error">Failed</span>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
