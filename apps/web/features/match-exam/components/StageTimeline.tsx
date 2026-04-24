type Stage = {
  key: string;
  label: string;
};

type StageTimelineProps = {
  currentStage?: string;
};

const STAGES: Stage[] = [
  { key: "upload", label: "Upload" },
  { key: "processing", label: "Processing" },
  { key: "generating", label: "Generating" },
  { key: "ready", label: "Ready" },
];

export function StageTimeline({ currentStage = "processing" }: StageTimelineProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        {STAGES.map((stage, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={stage.key} className="flex flex-1 items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>

              <div className="flex-1">
                <p
                  className={`text-xs font-bold ${
                    isActive
                      ? "text-blue-700"
                      : isDone
                      ? "text-green-700"
                      : "text-gray-400"
                  }`}
                >
                  {stage.label}
                </p>

                <div className="mt-2 h-[2px] w-full bg-gray-200">
                  <div
                    className={`h-full ${
                      isDone || isActive ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}