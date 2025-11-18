// DTOs para crear experiencia alineados al backend
export interface Institution {
  name: string;
  address: string;
  phone: number;
  codeDane: string;
  emailInstitucional: string;
  departament: string;
  commune: string;
  municipality: string;
  nameRector: string;
  eZone: string;
  caracteristic: string;
  territorialEntity: string;
  testsKnow: string;
}

export interface NameItem {
  name: string;
}

export interface ExperienceDocument {
      name: string,
      urlLink: string,
      urlPdf: string,
      urlPdfExperience: string
}


export interface Grade {
  gradeId: number;
  description: string;
}

export interface Objective {
  descriptionProblem: string;
  objectiveExperience: string;
  enfoqueExperience: string;
  methodologias: string;
  innovationExperience: string;
  resulsExperience: string;
  sustainabilityExperience: string;
  tranfer: string;
  pmi?: string;
  nnaj?: string;
  supportInformations?: SupportInformation[];
  monitorings?: Monitoring[];
}

export interface SupportInformation {
  summary?: string;
  metaphoricalPhrase?: string;
  testimony?: string;
  followEvaluation?: string;
}

export interface Monitoring {
  monitoringEvaluation?: string;
  result?: string;
  sustainability?: string;
  tranfer?: string;
}

export interface Leader {
  nameLeaders: string;
  identityDocument: string;
  email: string;
  position: string;
  phone: number;
}

export interface Development {
  crossCuttingProject?: string;
  population?: string;
  pedagogicalStrategies?: string;
  coverage?: string;
  covidPandemic?: string;
}

export interface HistoryExperience {
  action: string;
  tableName: string;
  userId: number;
  
}

export interface Experience {
  id: number;
  nameExperiences: string;
  code: string;
  thematicLocation: string;
  developmenttime: string;
  recognition: string;
  socialization: string;
  userId: number;
  stateExperienceId: number;
  institution: Institution & {
    addresses?: NameItem[];
    communes?: NameItem[];
    departamentes?: NameItem[];
    eeZones?: NameItem[];
    municipalities?: NameItem[];
  };
  documents: ExperienceDocument[];
  objectives: Objective[];
  leaders?: Leader[];
  developments?: Development[];
  historyExperiences?: HistoryExperience[];
  populationGradeIds?: number[];
  thematicLineIds?: number[];
  grades?: Grade[];
}

