import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Loader, Circle, ClipboardPaste } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeEmail } from '@/services/caseService';

type StepStatus = 'pending' | 'running' | 'done';
interface PipelineStep {
  name: string;
  description: string;
  status: StepStatus;
}

const initialSteps: PipelineStep[] = [
  { name: 'Email parsing', description: 'Extracting email components and metadata', status: 'pending' },
  { name: 'Header analysis', description: 'Validating SPF, DKIM, DMARC authentication', status: 'pending' },
  { name: 'Sender intelligence', description: 'Checking domain age, reputation, and WHOIS', status: 'pending' },
  { name: 'URL analysis', description: 'Following redirects and scanning landing pages', status: 'pending' },
  { name: 'Attachment analysis', description: 'Scanning for malware signatures and anomalies', status: 'pending' },
  { name: 'AI threat assessment', description: 'Running ML model for final classification', status: 'pending' },
];

export default function InvestigatePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const simulatePipeline = useCallback(async () => {
    setAnalyzing(true);
    setCaseId('AE-043');

    for (let i = 0; i < initialSteps.length; i++) {
      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx < i ? 'done' : idx === i ? 'running' : 'pending',
        }))
      );
      setProgress(Math.round(((i + 0.5) / initialSteps.length) * 100));
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    }

    setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' as StepStatus })));
    setProgress(100);
    await new Promise((r) => setTimeout(r, 500));
    navigate('/cases/AE-042');
  }, [navigate]);

  const handleSubmit = async () => {
    if (mode === 'upload' && !file) return;
    if (mode === 'paste' && !pasteContent.trim()) return;

    try {
      const formData = new FormData();
      if (mode === 'upload' && file) {
        formData.append('file', file);
      } else {
        formData.append('raw_email', pasteContent);
      }
      simulatePipeline();
      await analyzeEmail(formData);
    } catch {
      // Pipeline simulation handles the flow
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const stepIcon = (status: StepStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle size={18} style={{ color: 'var(--risk-low)' }} />;
      case 'running':
        return <Loader size={18} style={{ color: 'var(--accent-signal)', animation: 'spin 1s linear infinite' }} />;
      default:
        return <Circle size={18} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
        Analyze email
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Upload a suspicious email file or paste raw headers for AI-powered threat analysis
      </p>

      {!analyzing && (
        <>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('upload')} style={{ fontSize: 13 }}>
              <Upload size={14} /> Upload file
            </button>
            <button className={`btn ${mode === 'paste' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('paste')} style={{ fontSize: 13 }}>
              <ClipboardPaste size={14} /> Paste raw email
            </button>
          </div>

          {mode === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent-signal)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius)',
                backgroundColor: dragOver ? 'rgba(63, 208, 201, 0.05)' : 'var(--bg-surface)',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: 16,
              }}
            >
              <input
                id="file-input"
                type="file"
                accept=".eml,.msg,.txt"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <FileText size={24} style={{ color: 'var(--accent-signal)' }} />
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Drag and drop .eml, .msg, or .txt file here
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>or</div>
                  <span className="btn btn-ghost" style={{ fontSize: 13 }}>Browse files</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                    .eml, .msg, .txt — max 25MB
                  </div>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste email headers or full raw email content here..."
              className="input input-mono"
              style={{ height: 200, resize: 'vertical', marginBottom: 16 }}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '10px 24px' }}>
              Analyze
            </button>
          </div>
        </>
      )}

      {/* Analysis Pipeline */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 24 }}
          >
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent-signal)' }}>{caseId}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{progress}% complete</span>
              </div>
              <div style={{ height: 4, backgroundColor: 'var(--bg-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', backgroundColor: 'var(--accent-signal)', borderRadius: 2 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map((step, i) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    borderLeft: `2px solid ${step.status === 'done' ? 'var(--risk-low)' : step.status === 'running' ? 'var(--accent-signal)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  {stepIcon(step.status)}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {step.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
