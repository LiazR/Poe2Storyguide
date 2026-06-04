import { useState } from "react";
import type { SeasonQuest } from "@/types/content";

interface SeasonQuestPanelProps {
  seasonQuests: SeasonQuest[];
}

export function SeasonQuestPanel({ seasonQuests }: SeasonQuestPanelProps) {
  if (!seasonQuests || seasonQuests.length === 0) return null;

  const [activeQuestId, setActiveQuestId] = useState<string>(seasonQuests[0]?.id ?? "");

  const activeQuest =
    seasonQuests.find((q) => q.id === activeQuestId) ?? seasonQuests[0];

  return (
    <div className="season-content">
      <div className="season-tabs">
        {seasonQuests.map((quest, idx) => (
          <button
            key={quest.id}
            type="button"
            className={`season-tab ${activeQuestId === quest.id ? "active" : ""}`}
            onClick={() => setActiveQuestId(quest.id)}
          >
            <span className="season-tab-num">{idx + 1}</span>
            <span className="season-tab-title">{quest.title}</span>
          </button>
        ))}
      </div>

      {activeQuest && (
        <div className="season-detail">
          <h3 className="season-detail-title">{activeQuest.title}</h3>
          <p className="season-detail-overview">{activeQuest.overview}</p>

          {activeQuest.steps && activeQuest.steps.length > 0 && (
            <ol className="season-steps">
              {activeQuest.steps.map((step, idx) => (
                <li key={idx} className="season-step">
                  <div className="season-step-marker">{idx + 1}</div>
                  <div className="season-step-body">
                    <strong className="season-step-title">{step.title}</strong>
                    {step.body && <p className="season-step-text">{step.body}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {activeQuest.reward && (
            <div className="season-reward-summary">
              <span className="season-reward-summary-icon">&#9733;</span>
              <div>
                <div className="season-reward-summary-label">奖励汇总</div>
                <div className="season-reward-summary-text">{activeQuest.reward}</div>
              </div>
            </div>
          )}

          {activeQuest.note && (
            <div className="season-note">
              <span className="season-note-icon">!</span>
              <span>{activeQuest.note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
