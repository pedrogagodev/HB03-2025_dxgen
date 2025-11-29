import { Box } from "ink";
import React, { useEffect, useState } from "react";
import { GenerateView } from "./GenerateView";

export type GenerateStage =
	| "building_query"
	| "running_pipeline"
	| "generating"
	| "writing_file"
	| "updating_usage"
	| "complete"
	| "error";

interface GenerateAppProps {
	onStageChange: (callback: (stage: GenerateStage) => void) => void;
	onError: (callback: (error: string) => void) => void;
	onComplete: (
		callback: (data: {
			filePath: string;
			usage?: UsageInfo;
		}) => void,
	) => void;
}

interface UsageInfo {
	current: number;
	limit: number;
	remaining: number;
}

export const GenerateApp: React.FC<GenerateAppProps> = ({
	onStageChange,
	onError,
	onComplete,
}) => {
	const [stage, setStage] = useState<GenerateStage>("building_query");
	const [error, setError] = useState<string | undefined>();
	const [resultPath, setResultPath] = useState<string | undefined>();
	const [usageInfo, setUsageInfo] = useState<UsageInfo | undefined>();

	useEffect(() => {
		onStageChange(setStage);
		onError(setError);
		onComplete((data) => {
			setResultPath(data.filePath);
			if (data.usage) {
				setUsageInfo(data.usage);
			}
			setStage("complete");
		});
	}, [onStageChange, onError, onComplete]);

	return (
		<Box>
			<GenerateView
				stage={stage}
				error={error}
				resultPath={resultPath}
				usageInfo={usageInfo}
			/>
		</Box>
	);
};
