export interface UpdateExperience {
	experienceId: number;
	experience: {
		nameExperiences: string;
		developmenttime: string;
		nameFirstLeader: string;
		stateId: number;
		evaluationResult: string;

	};
	institution: {
		name: string;
		department: string;
		municipality: string;
		codeDane: string;
	};
	documents: Array<{
		urlPdf: string;
		urlLink: string;
	}>;
	criterias: Array<{
		name: string;
	}>;
}
