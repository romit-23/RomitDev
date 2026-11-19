import type { CSSProperties } from "react";
import { Activity, BrainCircuit, Code2, Cpu, Database, FileText, Layers, ScanLine, Sparkles } from "lucide-react";
import type { Project } from "@/app/content";

// Model providers named in the resume for each project.
const providers: Record<string, string[]> = {
  jobapply: ["Gemini", "OpenAI", "Anthropic", "Ollama"],
  "research-reader": ["Gemini", "OpenAI", "Anthropic", "Groq", "DeepSeek", "Ollama"],
};

/** A wire with a light pulse travelling along it. */
export function Pulse({ d, delay = 0 }: { d: string; delay?: number }) {
  return <><path className="wire" d={d} /><path className="pulse" d={d} pathLength={100} style={{ animationDelay: `${delay}s` }} /></>;
}

/** Schematic architecture for each project. Shows only what the resume describes: no scores or screenshots. */
export default function ProjectDiagram({ project }: { project: Project }) {
  const chips = providers[project.id];
  return (
    <div className={`diagram diagram-${project.id}`} aria-hidden="true">
      <div className="diagram-grid" />
      {project.id === "jobapply" && <>
        <div className="diagram-top"><span>jobapply / checkpointed pipeline</span><Code2 size={14} /></div>
        <div className="lanes">
          <svg className="lane-wires" viewBox="0 0 400 160" preserveAspectRatio="none">
            <Pulse d="M70 80 H160" />
            <Pulse d="M240 80 C 280 80, 290 45, 330 45" delay={0.5} />
            <Pulse d="M240 80 C 280 80, 290 115, 330 115" delay={1.1} />
          </svg>
          <span className="node node-in"><Database size={15} />5 job boards</span>
          <span className="node node-main"><BrainCircuit size={16} />Score fit</span>
          <span className="node node-lane l1">Resume</span>
          <span className="node node-lane l2">Cover letter</span>
        </div>
        <div className="chip-row">{chips.map(c => <span key={c}>{c}</span>)}</div>
      </>}
      {project.id === "research-reader" && <>
        <div className="diagram-top"><span>research-reader / paper</span><FileText size={14} /></div>
        <div className="paper">
          <div className="paper-page"><i /><i className="hl" /><i /><i className="short" /><i /><i className="hl hl-2" /><i className="short" /></div>
          <svg className="paper-wire" viewBox="0 0 80 120" preserveAspectRatio="none"><Pulse d="M0 40 C 40 40, 40 60, 80 60" /><Pulse d="M0 92 C 40 92, 40 60, 80 60" delay={0.9} /></svg>
          <div className="paper-ai">
            <span className="node node-main"><Sparkles size={15} />AI explain</span>
            <span className="paper-tasks"><span>Q&amp;A</span><span>Summaries</span></span>
          </div>
        </div>
        <div className="chip-row">{chips.map(c => <span key={c}>{c}</span>)}</div>
      </>}
      {project.id === "fraud" && <>
        <div className="diagram-top"><span>fraud detection / model pipeline</span><Activity size={14} /></div>
        <div className="txn-field">{Array.from({ length: 96 }, (_, i) => <i key={i} className={i === 61 ? "flag" : undefined} />)}</div>
        <div className="fraud-pipeline"><span><Database size={16} />Features</span><b /><span><Layers size={16} />SMOTE</span><b /><span className="node-hot"><Cpu size={16} />RF · XGBoost</span></div>
        <div className="fraud-stat"><strong>6.3M</strong><span>transactions</span><em>0.13% fraud rate</em></div>
      </>}
      {project.id === "guardnet" && <>
        <div className="diagram-top"><span>guardnet / architecture</span><ScanLine size={14} /></div>
        <div className="vision-flow">
          <span className="node"><ScanLine size={15} />CCTV</span><i className="flow-line" />
          <span className="node node-main"><Layers size={15} />ConvNeXt-Tiny</span><i className="flow-line" />
          <span className="node"><Activity size={15} />LSTM</span>
        </div>
        <div className="attention-visual">
          <div className="attention-bars">{Array.from({ length: 28 }, (_, i) => <span key={i} style={{ "--bar-height": `${18 + ((i * 37 + 13) % 77)}%`, "--delay": `${i * 0.07}s` } as CSSProperties} />)}</div>
          <span>temporal attention</span>
        </div>
      </>}
    </div>
  );
}
