import { Box, Text } from "ink";
import React from "react";

interface FileListProps {
	files: string[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
	if (files.length === 0) {
		return null;
	}

	return (
		<Box flexDirection="column">
			{files.map((file, index) => (
				<Text key={index} color="green">
					✓ <Text color="cyan">{file}</Text>
				</Text>
			))}
		</Box>
	);
};
