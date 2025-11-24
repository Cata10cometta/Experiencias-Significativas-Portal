// Helper to normalize backend experience detail JSON into the shape AddExperience expects
export const normalizeToInitial = (src: any) => {
  if (!src || typeof src !== 'object') return src;

  // institutional identification
  // try many possible keys where the backend might place institution info
  const institutionCandidates = [
    'institution', 'institutional', 'institucion', 'institutionalIdentification', 'institutionInfo', 'institutionData', 'institucionIdentificacion', 'institutional_identification'
  ];
  let institutionSrc: any = src;
  for (const k of institutionCandidates) {
    if (src[k] && typeof src[k] === 'object') {
      institutionSrc = src[k];
      break;
    }
  }

  const pick = (obj: any, keys: string[], fallback?: any) => {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return fallback;
  };

  // Normalize various yes/no or boolean representations into 'si' | 'no' | ''
  const normalizeYesNo = (v: any) => {
    if (v === undefined || v === null) return '';
    if (typeof v === 'boolean') return v ? 'si' : 'no';
    if (typeof v === 'number') return (v === 1 || v === 1.0) ? 'si' : (v === 0 ? 'no' : String(v));
    const s = String(v).trim().toLowerCase();
    if (s === 'si' || s === 'sí' || s === 's' || s === 'yes' || s === 'y' || s === 'true' || s === '1') return 'si';
    if (s === 'no' || s === 'n' || s === 'false' || s === '0') return 'no';
    return s; // fallback: keep raw string (may be descriptive)
  };

  const identificacionInstitucional = {
    name: pick(institutionSrc, ['name', 'nombre', 'nameInstitution', 'razonSocial']) || pick(src, ['name', 'nombre']) || "",
    address: pick(institutionSrc, ['address', 'direccion', 'addressLine', 'address_full']) || pick(src, ['address', 'direccion']) || "",
    phone: pick(institutionSrc, ['phone', 'telefono', 'contactPhone']) || pick(src, ['phone', 'telefono']) || 0,
    codeDane: pick(institutionSrc, ['codeDane', 'codeDANE', 'codigoDane', 'codigo_dane']) || pick(src, ['codeDane', 'code', 'codigoDane']) || "",
    emailInstitucional: pick(institutionSrc, ['emailInstitucional', 'emailInstitutional', 'email', 'correo']) || pick(src, ['email', 'correo']) || "",
    nameRector: pick(institutionSrc, ['nameRector', 'nombreRector', 'rector', 'director']) || pick(src, ['nameRector', 'rector', 'director']) || "",
    caracteristic: pick(institutionSrc, ['caracteristic', 'characteristic', 'caracteristicas', 'characteristics']) || pick(src, ['caracteristic']) || "",
    territorialEntity: pick(institutionSrc, ['territorialEntity', 'entidadTerritorial', 'territorial_entity']) || pick(src, ['territorialEntity']) || "",
    municipality: pick(institutionSrc, ['municipality', 'municipio', 'city', 'ciudad', 'municipalityName', 'municipioName']) || pick(src, ['municipality', 'municipio', 'city', 'ciudad']) || "",
    departament: pick(institutionSrc, ['departament', 'department', 'departamento', 'departamentName']) || pick(src, ['departament', 'department', 'departamento']) || "",
    communes: pick(institutionSrc, ['communes', 'comunas', 'commune']) || pick(src, ['communes', 'comunas']) || [],
    eZone: pick(institutionSrc, ['eZone', 'zone', 'zona', 'eeZone']) || pick(src, ['eZone', 'zone', 'zona']) || "",
    testsKnow: pick(institutionSrc, ['testsKnow', 'participaEvento']) || pick(src, ['testsKnow']) || "",
  };

  // leaders - normalize to expected shape (nameLeaders, email, identityDocument, position, phone)
  const rawLeaders = src.leaders || src.lideres || src.leader || src.leadersList || [];
  const leaders = Array.isArray(rawLeaders) ? rawLeaders.map((l: any) => ({
    nameLeaders: l.nameLeaders || l.name || l.fullName || l.nombre || "",
    email: l.email || l.emailContact || l.correo || l.emailInstitucional || "",
    identityDocument: l.identityDocument || l.document || l.cedula || l.identificacion || "",
    position: l.position || l.role || l.cargo || "",
    phone: l.phone || l.telefono || l.contactPhone || 0,
  })) : [];

  // identification form
  const identificacionForm = {
    nameExperience: src.nameExperiences || src.nameExperience || src.name || "",
    development: { days: '', months: '', years: '' },
    estado: src.stateExperienceId ?? src.state ?? "",
  };

  // Helper to normalize array fields to array of strings
  const normalizeArrayOfStrings = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          return item.name || item.label || item.description || item.value || item.id || '';
        }
        return String(item);
      }).filter(Boolean);
    }
    // If it's a single string or value
    if (typeof val === 'string') return [val];
    return [];
  };

  // Helper to convertir label a id de checkbox
  const toCheckboxId = (label: string) =>
    label
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  const normalizeCheckboxIds = (val: any) => {
    const arr = normalizeArrayOfStrings(val);
    return arr.map(toCheckboxId);
  };

  const tematicaForm = {
    thematicLineIds: normalizeCheckboxIds(src.thematicLineIds || src.thematicLines || src.thematicLine),
    PedagogicalStrategies: normalizeCheckboxIds(src.PedagogicalStrategies || src.pedagogicalStrategies),
    pedagogicalStrategies: normalizeCheckboxIds(src.pedagogicalStrategies || src.PedagogicalStrategies),
    CrossCuttingProject: normalizeCheckboxIds(src.CrossCuttingProject || src.crossCuttingProject || src.crosscuttingProject),
    coordinationTransversalProjects: src.coordinationTransversalProjects || src.CoordinationTransversalProjects || "",
    coverage: src.coverage || src.Coverage || "",
    Coverage: src.Coverage || src.coverage || "",
    CoverageText: src.CoverageText || src.coverageText || "",
    Population: normalizeCheckboxIds(src.Population || src.population || src.populationGradeIds),
    PopulationGrade: normalizeCheckboxIds(src.PopulationGrade || src.populationGrade),
    population: normalizeCheckboxIds(src.population || src.Population || src.populationGradeIds),
    populationGradeIds: normalizeCheckboxIds(src.populationGradeIds || src.PopulationGradeIds),
    populationGrades: normalizeCheckboxIds(src.populationGrades || src.PopulationGrades),
    experiencesCovidPandemic: src.experiencesCovidPandemic || src.experiences_covid_pandemic || src.covidPandemic || "",
    recognition: src.recognition || src.Recognition || "",
    recognitionText: src.recognitionText || src.RecognitionText || "",
    socialization: normalizeCheckboxIds(src.socialization || src.Socialization),
    socializationLabels: normalizeCheckboxIds(src.socializationLabels || src.SocializationLabels),
    grades: normalizeCheckboxIds(src.grades || src.Grades),
    gradeId: normalizeCheckboxIds(src.gradeId || src.GradeId),
    thematicLocation: src.thematicLocation || src.thematic_location || "",
    thematicFocus: src.thematicFocus || src.thematicLine || src.thematic || src.thematicLocation || "",
  };

  // niveles / grades: try to map backend grades to the form shape
  const defaultNiveles = { niveles: { Primaria: { checked: false, grados: [] }, Secundaria: { checked: false, grados: [] }, Media: { checked: false, grados: [] } } };
  let nivelesForm = src.nivelesForm || src.levels || src.niveles || defaultNiveles;
  const possibleGrades = src.grades || src.grados || src.gradesList || src.gradeIds || null;
  if (Array.isArray(possibleGrades) && possibleGrades.length > 0) {
    try {
      const mapByLevel: any = { Primaria: [], Secundaria: [], Media: [] };
      possibleGrades.forEach((g: any) => {
        const levelKey = (g.level || g.nivel || (g.gradeLevel && String(g.gradeLevel)) || '').toString().toLowerCase();
        if (levelKey.includes('prim') || levelKey === '1') mapByLevel.Primaria.push({ gradeId: g.gradeId || g.id || g.grade || g.grade_id || 0, description: g.description || g.name || g.descriptionGrade || '' });
        else if (levelKey.includes('sec') || levelKey === '2') mapByLevel.Secundaria.push({ gradeId: g.gradeId || g.id || g.grade || g.grade_id || 0, description: g.description || g.name || g.descriptionGrade || '' });
        else if (levelKey.includes('med') || levelKey === '3') mapByLevel.Media.push({ gradeId: g.gradeId || g.id || g.grade || g.grade_id || 0, description: g.description || g.name || g.descriptionGrade || '' });
        else {
          mapByLevel.Primaria.push({ gradeId: g.gradeId || g.id || g.grade || g.grade_id || 0, description: g.description || g.name || '' });
        }
      });
      nivelesForm = { niveles: { Primaria: { checked: mapByLevel.Primaria.length > 0, grados: mapByLevel.Primaria }, Secundaria: { checked: mapByLevel.Secundaria.length > 0, grados: mapByLevel.Secundaria }, Media: { checked: mapByLevel.Media.length > 0, grados: mapByLevel.Media } } };
    } catch (e) {
      nivelesForm = nivelesForm || defaultNiveles;
    }
  }

  const grupoPoblacional = src.populationGradeIds || src.grupoPoblacional || src.population || [];

  const tiempo = { developmenttime: src.developmenttime || src.developmentTime || "" };

  const objectiveExperienceRaw = src.objectives?.[0] || src.objectiveExperience || src.objectives || {};
  const objectiveExperience = {
    descriptionProblem: objectiveExperienceRaw.descriptionProblem || objectiveExperienceRaw.problemDescription || objectiveExperienceRaw.descripcionProblema || "",
    objectiveExperience: objectiveExperienceRaw.objectiveExperience || objectiveExperienceRaw.objective || objectiveExperienceRaw.objetivo || "",
    enfoqueExperience: objectiveExperienceRaw.enfoqueExperience || objectiveExperienceRaw.focus || objectiveExperienceRaw.enfoque || "",
    methodologias: objectiveExperienceRaw.methodologias || objectiveExperienceRaw.methodologies || "",
    innovationExperience: objectiveExperienceRaw.innovationExperience || objectiveExperienceRaw.innovation || "",
    pmi: objectiveExperienceRaw.pmi || objectiveExperienceRaw.pmi || "",
    nnaj: objectiveExperienceRaw.nnaj || objectiveExperienceRaw.nnaj || "",
  };

  // Build seguimientoEvaluacion (used by FollowUpEvaluation)
  const rawMonitoring = src.objectives?.[0]?.monitorings?.[0] || src.seguimientoEvaluacion || src.monitorings?.[0] || src.monitoring || src.seguimiento || null;
  const rawSupport = src.objectives?.[0]?.supportInformations?.[0] || src.informacionApoyo || src.supportInformations?.[0] || src.supportInformation || src.support || null;

  // assemble summary array (UI expects summary[0].monitoringEvaluation)
  const buildSummaryArray = (mon: any, sup: any) => {
    // prefer explicit summary from support then monitoring then top-level
    const fromSupport = sup?.summary ?? sup?.resumen ?? sup?.summaries;
    if (Array.isArray(fromSupport) && fromSupport.length > 0) return fromSupport;
    if (fromSupport) return [fromSupport];
    const fromMonitoring = mon?.summary ?? mon?.resumen ?? mon?.summaries;
    if (Array.isArray(fromMonitoring) && fromMonitoring.length > 0) return fromMonitoring;
    if (fromMonitoring) return [fromMonitoring];
    return [] as any[];
  };

  const summaryArr = buildSummaryArray(rawMonitoring, rawSupport);

  // find candidate monitoring value from many possible keys
  const rawMonitoringCandidates = (
    rawMonitoring?.monitoringEvaluation || rawMonitoring?.monitoring || rawMonitoring?.seguimiento || rawMonitoring?.evaluacion || rawMonitoring?.evaluacionMonitoreo || src.monitoringEvaluation || src.seguimientoEvaluacion || src.seguimiento || rawSupport?.monitoringEvaluation || rawSupport?.monitoring || rawSupport?.seguimiento || null
  );

  // Normalizar summary para radios: monitoringEvaluation, metaphoricalPhrase, testimony, followEvaluation
  let normalizedSummary = [];
  if (Array.isArray(summaryArr) && summaryArr.length > 0) {
    const first = summaryArr[0];
    if (typeof first === 'object' && first !== null) {
      normalizedSummary = [{
        ...first,
        monitoringEvaluation: normalizeYesNo(first.monitoringEvaluation),
        metaphoricalPhrase: normalizeYesNo(first.metaphoricalPhrase),
        testimony: normalizeYesNo(first.testimony),
        followEvaluation: normalizeYesNo(first.followEvaluation),
        sustainability: normalizeYesNo(first.sustainability),
      }];
    } else if (typeof first === 'string' || typeof first === 'number' || typeof first === 'boolean') {
      normalizedSummary = [{ monitoringEvaluation: normalizeYesNo(first) }];
    } else {
      normalizedSummary = [{}];
    }
  } else {
    normalizedSummary = [{}];
  }

  const seguimientoEvaluacion = {
    monitoringEvaluation: normalizeYesNo(rawMonitoringCandidates ?? (summaryArr[0]?.monitoringEvaluation ?? '')),
    result: rawMonitoring?.result || rawMonitoring?.resulsExperience || src.result || '',
    sustainability: normalizeYesNo(
      (normalizedSummary[0] && normalizedSummary[0].sustainability) ??
      rawMonitoring?.sustainability ?? rawMonitoring?.sustainabilityExperience ?? src.sustainability ?? rawSupport?.sustainability ?? ''
    ),
    tranfer: rawMonitoring?.tranfer || rawMonitoring?.transfer || src.tranfer || rawSupport?.transfer || '',
    // summary normalizado para radios
    summary: normalizedSummary,
    metaphoricalPhrase: normalizeYesNo(
      (normalizedSummary[0] && normalizedSummary[0].metaphoricalPhrase) ??
      rawSupport?.metaphoricalPhrase ?? rawMonitoring?.metaphoricalPhrase ?? src.metaphoricalPhrase ?? ''
    ),
    testimony: normalizeYesNo(
      (normalizedSummary[0] && normalizedSummary[0].testimony) ??
      rawSupport?.testimony ?? rawMonitoring?.testimony ?? src.testimony ?? ''
    ),
    followEvaluation: normalizeYesNo(
      (normalizedSummary[0] && normalizedSummary[0].followEvaluation) ??
      rawSupport?.followEvaluation ?? rawMonitoring?.followEvaluation ?? src.followEvaluation ?? ''
    ),
  };

  // informacionApoyo also used by SupportInformationForm and should include monitoringEvaluation/sustainability when available
  const informacionApoyo = {
    summary: Array.isArray(rawSupport?.summary) ? rawSupport.summary : (rawSupport?.summary ? [rawSupport.summary] : []),
    metaphoricalPhrase: normalizeYesNo(rawSupport?.metaphoricalPhrase ?? src.metaphoricalPhrase ?? ''),
    testimony: normalizeYesNo(rawSupport?.testimony ?? src.testimony ?? ''),
    followEvaluation: normalizeYesNo(rawSupport?.followEvaluation ?? src.followEvaluation ?? ''),
    // compatibility: include monitoringEvaluation and sustainability keys used by monitoring components
    monitoringEvaluation: normalizeYesNo(rawMonitoring?.monitoringEvaluation ?? rawSupport?.monitoringEvaluation ?? src.monitoringEvaluation ?? rawSupport?.monitoring ?? src.monitoring ?? ''),
    sustainability: normalizeYesNo(rawMonitoring?.sustainability ?? rawSupport?.sustainability ?? src.sustainability ?? ''),
  };

  // pdf/document
  const pdfFile = (src.documents && src.documents.length > 0) ? src.documents[0] : (src.document || src.pdf || null);

  return {
    identificacionInstitucional,
    leaders,
    identificacionForm,
    tematicaForm,
    nivelesForm,
    grupoPoblacional,
    tiempo,
    objectiveExperience,
    seguimientoEvaluacion,
    informacionApoyo,
    pdfFile,
    documents: src.documents || [],
    _raw: src,
  };
};

export default normalizeToInitial;