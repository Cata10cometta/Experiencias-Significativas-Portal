export interface CriteriaEvaluation {
	score: number;
	descriptionContribution: string;
	evaluationId: number;
	criteriaId: number;
	id: number;
	state: boolean;
	createdAt: string | null;
	deletedAt: string | null;
}

export interface Evaluation {
	evaluationId: number;
	typeEvaluation: string;
	accompanimentRole: string;
	comments: string;
	evaluationResult: string;
	experienceId: number;
	experienceName: string;
	stateId: number;
	institutionName: string;
	criteriaEvaluations: CriteriaEvaluation[];
	thematicLineNames: string[];
	userId: number;
}
