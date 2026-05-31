export interface ReportDTO {
	id: string;
	content: string;
	from: any; // User object or ID
	sentDate: Date;
	targetType: string;
	targetId: string;
	status: string;
}

export interface CreateReportDTO {
	content: string;
	from: string;
	targetType: string;
	targetId: string;
}

export interface UpdateReportStatusDTO {
	id: string;
	status: string;
}
