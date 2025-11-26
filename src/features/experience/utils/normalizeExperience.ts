// Helper to normalize backend experience detail JSON into the shape AddExperience expects


// Helper to normalize backend experience detail JSON into the shape AddExperience expects
export const normalizeToInitial = (src: any) => {
  if (!src || typeof src !== 'object') return src;

  // institutional identification
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
    return s;
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
    municipality:
      (Array.isArray(institutionSrc.municipalitis) && institutionSrc.municipalitis.length > 0 &&
        (institutionSrc.municipalitis[0].name || institutionSrc.municipalitis[0].city || institutionSrc.municipalitis[0].ciudad))
        || pick(institutionSrc, ['municipality', 'municipio', 'city', 'ciudad', 'municipalityName', 'municipioName'])
        || pick(src, ['municipality', 'municipio', 'city', 'ciudad'])
        || "",
    departament:
      (Array.isArray(institutionSrc.departaments) && institutionSrc.departaments.length > 0 &&
        (institutionSrc.departaments[0].name || institutionSrc.departaments[0].department || institutionSrc.departaments[0].departamento))
        || pick(institutionSrc, ['departament', 'department', 'departamento', 'departamentName'])
        || pick(src, ['departament', 'department', 'departamento'])
        || "",
    communes: pick(institutionSrc, ['communes', 'comunas', 'commune']) || pick(src, ['communes', 'comunas']) || [],
    eZone: pick(institutionSrc, [
      'eZone', 'zone', 'zona', 'eeZone', 'zonaEE', 'zona_ee', 'zoneEE', 'zone_ee', 'zoneExperience', 'experienceZone'
    ])
      || pick(src, [
        'eZone', 'zone', 'zona', 'eeZone', 'zonaEE', 'zona_ee', 'zoneEE', 'zone_ee', 'zoneExperience', 'experienceZone'
      ])
      || "",
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

  // Buscar en developments[0] si existe
  const dev0 = Array.isArray(src.developments) && src.developments.length > 0 ? src.developments[0] : {};

  // DEBUG: log values to verify what is being picked up
  if (typeof window !== 'undefined') {
    console.debug('normalizeToInitial: src.CrossCuttingProject', src.CrossCuttingProject);
    console.debug('normalizeToInitial: dev0.crossCuttingProject', dev0.crossCuttingProject);
    console.debug('normalizeToInitial: src.Population', src.Population);
    console.debug('normalizeToInitial: dev0.population', dev0.population);
  }

  // Helper: always return array (even if value is string)
  const ensureArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (val === undefined || val === null) return [];
    return [val];
  };

  const tematicaForm = {
    thematicLineIds: normalizeCheckboxIds(src.thematicLineIds || src.thematicLines || src.thematicLine),
    PedagogicalStrategies: normalizeCheckboxIds(src.PedagogicalStrategies || src.PedagogicalStrategies || dev0.pedagogicalStrategies),
    pedagogicalStrategies: normalizeCheckboxIds(src.pedagogicalStrategies || src.PedagogicalStrategies || dev0.pedagogicalStrategies),
    CrossCuttingProject: normalizeCheckboxIds(
      ensureArray(src.CrossCuttingProject) || ensureArray(src.crossCuttingProject) || ensureArray(src.crosscuttingProject) || ensureArray(dev0.crossCuttingProject)
    ),
    coordinationTransversalProjects: src.coordinationTransversalProjects || src.CoordinationTransversalProjects || dev0.coordinationTransversalProjects || "",
    coverage: src.coverage || src.Coverage || dev0.coverage || "",
    Coverage: src.Coverage || src.coverage || dev0.Coverage || "",
    CoverageText: src.CoverageText || src.coverageText || dev0.CoverageText || "",
    Population: normalizeCheckboxIds(
      ensureArray(src.Population) || ensureArray(src.population) || ensureArray(src.populationGradeIds) || ensureArray(dev0.population)
    ),
    PopulationGrade: normalizeCheckboxIds(
      ensureArray(src.PopulationGrade) || ensureArray(src.populationGrade) || ensureArray(dev0.populationGrade)
    ),
    population: normalizeCheckboxIds(
      ensureArray(src.population) || ensureArray(src.Population) || ensureArray(src.populationGradeIds) || ensureArray(dev0.population)
    ),
    populationGradeIds: normalizeCheckboxIds(
      ensureArray(src.populationGradeIds) || ensureArray(src.PopulationGradeIds) || ensureArray(dev0.populationGradeIds)
    ),
    populationGrades: normalizeCheckboxIds(
      ensureArray(src.populationGrades) || ensureArray(src.PopulationGrades) || ensureArray(dev0.populationGrades)
    ),
    experiencesCovidPandemic: src.experiencesCovidPandemic || src.experiences_covid_pandemic || src.covidPandemic || dev0.covidPandemic || "",
    recognition: src.recognition || src.Recognition || dev0.recognition || "",
    recognitionText: src.recognitionText || src.RecognitionText || dev0.recognitionText || "",
    socialization: normalizeCheckboxIds(
      ensureArray(src.socialization) || ensureArray(src.Socialization) || ensureArray(dev0.socialization)
    ),
    socializationLabels: normalizeCheckboxIds(
      ensureArray(src.socializationLabels) || ensureArray(src.SocializationLabels) || ensureArray(dev0.socializationLabels)
    ),
    grades: normalizeCheckboxIds(
      ensureArray(src.grades) || ensureArray(src.Grades) || ensureArray(dev0.grades)
    ),
    gradeId: normalizeCheckboxIds(
      ensureArray(src.gradeId) || ensureArray(src.GradeId) || ensureArray(dev0.gradeId)
    ),
    thematicLocation: src.thematicLocation || src.thematic_location || dev0.thematicLocation || "",
    thematicFocus: src.thematicFocus || src.thematicLine || src.thematic || src.thematicLocation || dev0.thematicFocus || "",
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
    const fromSupport = sup?.summary ?? sup?.resumen ?? sup?.summaries;
    if (Array.isArray(fromSupport) && fromSupport.length > 0) return fromSupport;
    if (fromSupport) return [fromSupport];
    const fromMonitoring = mon?.summary ?? mon?.resumen ?? mon?.summaries;
    if (Array.isArray(fromMonitoring) && fromMonitoring.length > 0) return fromMonitoring;
    if (fromMonitoring) return [fromMonitoring];
    return [] as any[];
  };

  const summaryArr = buildSummaryArray(rawMonitoring, rawSupport);

  const rawMonitoringCandidates = (
    rawMonitoring?.monitoringEvaluation || rawMonitoring?.monitoring || rawMonitoring?.seguimiento || rawMonitoring?.evaluacion || rawMonitoring?.evaluacionMonitoreo || src.monitoringEvaluation || src.seguimientoEvaluacion || src.seguimiento || rawSupport?.monitoringEvaluation || rawSupport?.monitoring || rawSupport?.seguimiento || null
  );

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

  const informacionApoyo = {
    summary: Array.isArray(rawSupport?.summary) ? rawSupport.summary : (rawSupport?.summary ? [rawSupport.summary] : []),
    metaphoricalPhrase: normalizeYesNo(rawSupport?.metaphoricalPhrase ?? src.metaphoricalPhrase ?? ''),
    testimony: normalizeYesNo(rawSupport?.testimony ?? src.testimony ?? ''),
    followEvaluation: normalizeYesNo(rawSupport?.followEvaluation ?? src.followEvaluation ?? ''),
    monitoringEvaluation: normalizeYesNo(rawMonitoring?.monitoringEvaluation ?? rawSupport?.monitoringEvaluation ?? src.monitoringEvaluation ?? rawSupport?.monitoring ?? src.monitoring ?? ''),
    sustainability: normalizeYesNo(rawMonitoring?.sustainability ?? rawSupport?.sustainability ?? src.sustainability ?? ''),
  };

  const pdfFile = (src.documents && src.documents.length > 0) ? src.documents[0] : (src.document || src.pdf || null);

  return {
    id: src.id || src.ID || src.experienceId || src.experienciaId || src._id || null,
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