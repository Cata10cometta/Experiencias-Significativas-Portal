
// Types strictly matching backend PATCH schema for UpdateExperienceRequest

export interface UpdateExperienceRequest {
  experienceId: number;
  nameExperiences: string;
  code: string;
  thematicLocation: string;
  developmenttime: string;
  recognition: string;
  socialization: string;
  stateExperienceId: number;
  userId: number;
  leaders: Array<{
    nameLeaders: string;
    identityDocument: string;
    email: string;
    position: string;
    phone: number;
  }>;
  institutionUpdate: {
    name: string;
    address: string;
    phone: number;
    codeDane: string;
    emailInstitucional: string;
    nameRector: string;
    caracteristic: string;
    territorialEntity: string;
    testsKnow: string;
    addressInfoRequests: Array<{ name: string }>;
    communes: Array<{ name: string }>;
    departaments: Array<{ name: string }>;
    eeZones: Array<{ name: string }>;
    municipalities: Array<{ name: string }>;
    departamentes: string;
  };
  documentsUpdate: Array<{
    name: string;
    urlLink: string;
    urlPdf: string;
    urlPdfExperience: string;
  }>;
  objectivesUpdate: Array<{
    descriptionProblem: string;
    objectiveExperience: string;
    enfoqueExperience: string;
    methodologias: string;
    innovationExperience: string;
    pmi: string;
    nnaj: string;
    supportInformationsUpdate: Array<{
      summary: string;
      metaphoricalPhrase: string;
      testimony: string;
      followEvaluation: string;
    }>;
    monitoringsUpdate: Array<{
      monitoringEvaluation: string;
      result: string;
      sustainability: string;
      tranfer: string;
    }>;
  }>;
  developmentsUpdate: Array<{
    crossCuttingProject: string;
    population: string;
    pedagogicalStrategies: string;
    coverage: string;
    covidPandemic: string;
  }>;
  historyExperiencesUpdate: Array<{
    action: string;
    tableName: string;
    userId: number;
  }>;
  populationGradeIds: number[];
  thematicLineIds: number[];
  gradesUpdate: Array<{
    id: number;
    description: string;
  }>;
}
