import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Upload } from "lucide-react";
import { analyzeEmail } from "../../services/caseService";
import { connectSocket, disconnectSocket } from "../../lib/socket";
import { UploadDropzone } from "../../components/email/UploadDropzone";
import { PasteEmailForm } from "../../components/email/PasteEmailForm";
import { PipelineStepper } from "../../components/investigation/PipelineStepper";
import { Button } from "../../components/ui/Button";
import type { PipelineStep } from "../../types";

const PIPELINE_STEPS_INIT: PipelineStep[] = [
  { id: "parse", label: "Parsing email structure", status: "pending" },
  { id: "headers", label: "Header analysis", status: "pending" },
  { id: "sender", label: "Sender intelligence", status: "pending" },
  { id: "url", label: "URL analysis", status: "pending" },
  { id: "attachment", label: "Attachment analysis", status: "pending" },
  { id: "ai", label: "AI threat assessment", status: "pending" },
];

type InputMode = "upload" | "paste";

export function InvestigatePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InputMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_STEPS_INIT);
  const [error, setError] = useState<string | null>(null);
  const socketCleanup = useRef<(() => void) | null>(null);

  function updateStep(id: string, status: PipelineStep["status"]) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  }

  /** Simulate the pipeline in mock mode since no socket backend exists yet */
  async function simulatePipeline(caseId: string) {
    const ids = ["parse", "headers", "sender", "url", "attachment", "ai"];
    for (const id of ids) {
      updateStep(id, "running");
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      updateStep(id, "done");
    }
    await new Promise((r) => setTimeout(r, 300));
    navigate(`/cases/${caseId}`);
  }

  async function runAnalysis(formData: FormData) {
    setAnalyzing(true);
    setError(null);
    setSteps(PIPELINE_STEPS_INIT);

    try {
      const { caseId } = await analyzeEmail(formData);

      const useMock = import.meta.env.VITE_USE_MOCK === "true";
      if (useMock) {
        await simulatePipeline(caseId);
        return;
      }

      // Live: subscribe to Socket.IO pipeline events
      const socket = connectSocket();
      socket.emit("subscribe:investigation", { caseId });

      socket.on("investigation:step", ({ step, status }: { step: string; status: PipelineStep["status"] }) => {
        updateStep(step, status);
        if (step === "ai" && status === "done") {
          disconnectSocket();
          setTimeout(() => navigate(`/cases/${caseId}`), 400);
        }
      });

      socketCleanup.current = () => {
        socket.off("investigation:step");
        disconnectSocket();
      };
    } catch {
      setError("Analysis failed — check your connection or try uploading a different file.");
      setAnalyzing(false);
    }
  }

  async function handleFile(f: File) {
    setFile(f);
  }

  async function handleUploadSubmit() {
    if (!file) return;
    const fd = new FormData();
    fd.append("email", file);
    await runAnalysis(fd);
  }

  async function handlePasteSubmit(rawEmail: string) {
    const fd = new FormData();
    fd.append("rawEmail", rawEmail);
    await runAnalysis(fd);
  }

  const hasStarted = steps.some((s) => s.status !== "pending");

  return (
    <div className="page investigate-page">
      <div className="page__header">
        <h1 className="page__title">
          <Search size={20} aria-hidden="true" />
          Investigate email
        </h1>
        <p className="page__subtitle">
          Upload or paste a suspicious email to start analysis.
        </p>
      </div>

      <div className="investigate-page__layout">
        {/* Input panel */}
        <div className="investigate-page__input-panel">
          {!hasStarted && (
            <>
              <div className="investigate-page__mode-tabs" role="tablist" aria-label="Email input mode">
                <button
                  role="tab"
                  aria-selected={mode === "upload"}
                  className={`investigate-page__tab ${mode === "upload" ? "investigate-page__tab--active" : ""}`}
                  onClick={() => setMode("upload")}
                  id="tab-upload"
                  aria-controls="panel-upload"
                >
                  <Upload size={14} aria-hidden="true" />
                  Upload file
                </button>
                <button
                  role="tab"
                  aria-selected={mode === "paste"}
                  className={`investigate-page__tab ${mode === "paste" ? "investigate-page__tab--active" : ""}`}
                  onClick={() => setMode("paste")}
                  id="tab-paste"
                  aria-controls="panel-paste"
                >
                  <Search size={14} aria-hidden="true" />
                  Paste raw email
                </button>
              </div>

              {mode === "upload" && (
                <div role="tabpanel" id="panel-upload" aria-labelledby="tab-upload">
                  <UploadDropzone onFile={handleFile} disabled={analyzing} />
                  {file && (
                    <Button
                      variant="primary"
                      onClick={handleUploadSubmit}
                      disabled={analyzing}
                      loading={analyzing}
                      className="investigate-page__submit"
                    >
                      Analyze email
                    </Button>
                  )}
                </div>
              )}

              {mode === "paste" && (
                <div role="tabpanel" id="panel-paste" aria-labelledby="tab-paste">
                  <PasteEmailForm onSubmit={handlePasteSubmit} disabled={analyzing} />
                </div>
              )}
            </>
          )}

          {error && (
            <p className="page-error" role="alert">{error}</p>
          )}
        </div>

        {/* Pipeline panel */}
        {hasStarted && (
          <div className="investigate-page__pipeline-panel">
            <h2 className="investigate-page__pipeline-title">Analysis in progress</h2>
            <PipelineStepper steps={steps} />
          </div>
        )}
      </div>
    </div>
  );
}
