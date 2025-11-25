export interface ExperienceLeaderDetail {
  nameLeaders: string;
}

export interface ExperienceInfoDetail {
  nameExperiences: string;
  developmenttime: string;
  stateExperienceId: number;
  evaluationResult: string;
  urlPdf?: string;
  leaders: ExperienceLeaderDetail[];
}

export interface InstitutionDetailItem {
  name: string;
}

export interface InstitutionInfoDetail {
  name: string;
  codeDane: string;
  departamentes: InstitutionDetailItem[];
  municipalities: InstitutionDetailItem[];
}

export interface DocumentInfoDetail {
  urlLink: string;
  urlPdf: string;
  urlPdfExperience: string;
}

export interface ExperienceDetailResponse {
  experienceId: number;
  experienceInfo: ExperienceInfoDetail;
  institutionInfo: InstitutionInfoDetail;
  documentInfo: DocumentInfoDetail[];
  criteriasDetail: any[]; // Si luego quieres tiparlo, me dices
}
