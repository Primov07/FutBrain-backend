export interface ReportDTO {
	id: string;
	content: string;
	from: string;
	to: string;
	targetType: string;
	status: string;
}

export interface CreateReportDTO {
	content: string;
	from: string;
	to: string;
    targetType: string;
    status: string;
}
