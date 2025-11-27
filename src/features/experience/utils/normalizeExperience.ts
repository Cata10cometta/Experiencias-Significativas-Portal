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

  // Extrae la propiedad `name` (u otras alternativas) si el valor es un objeto o un array de objetos.
  const extractNameIfObject = (val: any) => {
    if (val === undefined || val === null) return val;
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        if (val.length === 0) return '';
        const first = val[0];
        if (first && typeof first === 'object') return first.name ?? first.label ?? first.value ?? first.id ?? '';
        return val.map((it: any) => (typeof it === 'object' ? (it.name ?? it.label ?? it.value ?? it.id ?? '') : String(it))).filter(Boolean).join(', ');
      }
      return val.name ?? val.label ?? val.value ?? val.id ?? '';
    }
    return val;
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
    eZone: extractNameIfObject(
      pick(institutionSrc, [
        'eZone', 'zone', 'zona', 'eeZones', 'zonaEE', 'zona_ee', 'zoneEE', 'zone_ee', 'zoneExperience', 'experienceZone'
      ]) || pick(src, [
        'eZone', 'zone', 'zona', 'eeZone', 'zonaEE', 'zona_ee', 'zoneEE', 'zone_ee', 'zoneExperience', 'experienceZone'
      ]) || ""
    ),
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
    stateExperienceId: src.stateExperienceId ?? src.state ?? "",
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

  // Limpia una etiqueta/simple string: normaliza espacios y comas, y hace trim
  const cleanLabel = (s: any) => {
    if (s === undefined || s === null) return '';
    const str = String(s);
    // Reemplaza múltiples espacios por uno, normaliza espacios alrededor de comas y trim
    return str.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim();
  };

  // Buscar en developments[0] si existe
  const dev0 = Array.isArray(src.developments) && src.developments.length > 0 ? src.developments[0] : {};

  // Normalizamos el coverage: usamos la etiqueta *original* (trim) y no
  // aplicamos la limpieza que altera la puntuación (ej. espacio antes/depués de la coma).
  const rawCoverage = pick(src, ['coverage', 'Coverage']) || dev0.coverage || dev0.Coverage || '';
  const coverageRaw = rawCoverage === undefined || rawCoverage === null ? '' : rawCoverage;

  // Normalizamos recognition para que los radios reciban la misma etiqueta
  const rawRecognition = pick(src, ['recognition', 'Recognition']) || dev0.recognition || dev0.Recognition || src.recognitionText || src.RecognitionText || '';
  const recognitionLabel = cleanLabel(rawRecognition);

  // Extract grades from experienceGrades array (estructura del backend)
  const extractGradesFromExperienceGrades = () => {
    if (!Array.isArray(src.experienceGrades) || src.experienceGrades.length === 0) return [];
    return src.experienceGrades.map((eg: any) => ({
      gradeId: eg.gradeId || eg.grade?.id || 0,
      description: eg.description || eg.grade?.name || eg.grade?.description || ''
    }));
  };

  // Extract population names from experiencePopulations array
  const extractPopulationFromExperiencePopulations = () => {
    if (!Array.isArray(src.experiencePopulations) || src.experiencePopulations.length === 0) return [];
    return src.experiencePopulations.map((ep: any) => ep.populationGrade?.name || ep.populationGrade?.code || '');
  };

  // Extract population ids from experiencePopulations array
  const extractPopulationIdsFromExperiencePopulations = () => {
    if (!Array.isArray(src.experiencePopulations) || src.experiencePopulations.length === 0) return [];
    return src.experiencePopulations.map((ep: any) => ep.populationGrade?.id || ep.populationGradeId || ep.populationGrade?.code || '').filter(Boolean);
  };

  // Extract thematicLineIds from experienceLineThematics array
  const extractThematicLineIds = () => {
    if (!Array.isArray(src.experienceLineThematics) || src.experienceLineThematics.length === 0) return [];
    return src.experienceLineThematics.map((elt: any) => elt.lineThematicId || elt.lineThematic?.id || '');
  };

  // Extract cross-cutting projects from several possible backend shapes and return array of labels
  const extractCrossCuttingProjects = () => {
    const collected: string[] = [];

    const pushVal = (v: any) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((it) => { if (it !== undefined && it !== null) collected.push(String((typeof it === 'object' && it.name) ? it.name : it)); });
      } else if (typeof v === 'object') {
        // object may have name/label
        collected.push(String(v.name ?? v.label ?? v.description ?? v.value ?? ''));
      } else {
        collected.push(String(v));
      }
    };

    // Prefer explicit top-level arrays/fields
    pushVal(src.CrossCuttingProject || src.crossCuttingProject || src.crosscuttingProject || src.CrosscuttingProject);
    // developments[0] preferred
    if (dev0 && (dev0.crossCuttingProject || dev0.crossCuttingProject)) pushVal(dev0.crossCuttingProject || dev0.crossCuttingProject);
    // scan all developments in case there are many selected
    if (Array.isArray(src.developments)) {
      src.developments.forEach((d: any) => { if (d && d.crossCuttingProject !== undefined) pushVal(d.crossCuttingProject); });
    }

    // fallback to any other plausible field
    if (src.crossCuttingProjects) pushVal(src.crossCuttingProjects);

    // normalize results: trim and dedupe
    const normalized = collected
      .map(s => (s === undefined || s === null ? '' : String(s).trim()))
      .filter(Boolean);
    return Array.from(new Set(normalized));
  };

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
  // Extraer ids de líneas temáticas desde varias formas que puede devolver el backend
  const extractedThematicLineIds = extractThematicLineIds();
  // Determinar un valor único para 'thematicFocus' (preferir la primera línea temática asociada al experience)
  const thematicFocusValue = (Array.isArray(src.experienceLineThematics) && src.experienceLineThematics.length > 0)
    ? (src.experienceLineThematics[0].lineThematicId ?? src.experienceLineThematics[0].lineThematic?.id ?? extractedThematicLineIds[0] ?? '')
    : (Array.isArray(extractedThematicLineIds) && extractedThematicLineIds.length > 0 ? extractedThematicLineIds[0] : (src.thematicLineId || src.thematicLine || src.thematicLineIds?.[0] || ''));

  const tematicaForm = {
    thematicLineIds: normalizeCheckboxIds(ensureArray(src.thematicLineIds || src.thematicLines || src.thematicLine || extractedThematicLineIds)),
    // Pedagogical strategies in the backend may come as a string or array inside `src` or inside `developments[0]` (dev0).
    // The form expects an array of labels (strings), so use normalizeArrayOfStrings to preserve labels.
    PedagogicalStrategies: normalizeArrayOfStrings(src.PedagogicalStrategies || dev0.pedagogicalStrategies || src.pedagogicalStrategies),
    pedagogicalStrategies: normalizeArrayOfStrings(src.pedagogicalStrategies || src.PedagogicalStrategies || dev0.pedagogicalStrategies),
    // CrossCuttingProject: keep labels (the UI compares labels), so normalize to array of strings
    CrossCuttingProject: normalizeArrayOfStrings(extractCrossCuttingProjects()),
    coordinationTransversalProjects: src.coordinationTransversalProjects || src.CoordinationTransversalProjects || dev0.coordinationTransversalProjects || "",
    coverage: coverageRaw,
    Coverage: coverageRaw,
    CoverageText: src.CoverageText || src.coverageText || dev0.CoverageText || coverageRaw,
    // Population labels: extract from experiencePopulations or developments
    Population: normalizeArrayOfStrings(
      // Prefer development[0].population (dev0) if present, then src.population, then other sources
      ensureArray(dev0.population) || ensureArray(src.population) || ensureArray(src.Population) || extractPopulationFromExperiencePopulations() || ensureArray(src.populationGradeIds)
    ),
    PopulationGrade: normalizeCheckboxIds(
      ensureArray(src.PopulationGrade) || ensureArray(src.populationGrade) || ensureArray(dev0.populationGrade)
    ),
    population: normalizeArrayOfStrings(
      // Keep the raw values from the JSON as an array: prefer dev0.population first
      ensureArray(dev0.population) || ensureArray(src.population) || ensureArray(src.Population) || extractPopulationFromExperiencePopulations() || ensureArray(src.populationGradeIds)
    ),
    // populationGradeIds should be numeric ids used by the form
    populationGradeIds: (Array.isArray(src.experiencePopulations) && src.experiencePopulations.length > 0)
      ? extractPopulationIdsFromExperiencePopulations().map((id: any) => Number(id))
      : (Array.isArray(src.populationGradeIds) ? src.populationGradeIds.map((n: any) => Number(n)) : []),
    // populationGrades: labels (names)
    populationGrades: normalizeArrayOfStrings(src.populationGrades || src.PopulationGrades || extractPopulationFromExperiencePopulations() || dev0.populationGrades),
    experiencesCovidPandemic: src.experiencesCovidPandemic || src.experiences_covid_pandemic || src.covidPandemic || dev0.covidPandemic || "",
    recognition: recognitionLabel,
    recognitionText: src.recognitionText || src.RecognitionText || dev0.recognitionText || recognitionLabel,
    // socialization in backend may be a single string or array; form expects arrays of labels
    socialization: normalizeArrayOfStrings(src.socialization || src.Socialization || dev0.socialization),
    socializationLabels: normalizeArrayOfStrings(
      ensureArray(src.socializationLabels) || ensureArray(src.SocializationLabels) || ensureArray(dev0.socializationLabels) || ensureArray(src.socialization)
    ),
    // grades: form expects array of {gradeId, description}
    grades: (Array.isArray(src.experienceGrades) && src.experienceGrades.length > 0)
      ? extractGradesFromExperienceGrades()
      : (Array.isArray(src.grades) ? src.grades : (Array.isArray(dev0.grades) ? dev0.grades : [])),
    gradeId: normalizeCheckboxIds(
      ensureArray(src.gradeId) || ensureArray(src.GradeId) || ensureArray(dev0.gradeId)
    ),
    thematicLocation: src.thematicLocation || src.thematic_location || dev0.thematicLocation || "",
    // thematicFocus: store the id (number/string) of the selected thematic line so the UI
    // can map it to option ids. Keep empty string if none.
    thematicFocus: thematicFocusValue,
  };

  // niveles / grades: try to map backend grades to the form shape
  const defaultNiveles = { niveles: { Primaria: { checked: false, grados: [] }, Secundaria: { checked: false, grados: [] }, Media: { checked: false, grados: [] } } };
  let nivelesForm = src.nivelesForm || src.levels || src.niveles || defaultNiveles;
  const possibleGrades = src.grades || src.grados || src.gradesList || src.gradeIds || extractGradesFromExperienceGrades() || null;
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

  // Convierte una fecha ISO (yyyy-mm-ddTHH:mm:ss) en una duración { days, months, years }
  const isoDateToDuration = (iso: string) => {
    const empty = { days: '', months: '', years: '' };
    if (!iso || typeof iso !== 'string') return empty;
    // Extraer la fecha inicial (antes de la T si viene con hora)
    const datePart = iso.split('T')[0];
    const parsed = new Date(datePart);
    console.log(datePart, parsed);
    if (Number.isNaN(parsed.getTime())) return empty;
    const now = new Date();
    let years = now.getFullYear() - parsed.getFullYear();
    let months = now.getMonth() - parsed.getMonth();
    let days = now.getDate() - parsed.getDate();
    if (days < 0) {
      months -= 1;
      // días del mes anterior
      const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonthDays;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { days: String(days), months: String(months), years: String(years) };
  };

  const developmentSource = src.developmenttime || src.developmentTime || src.development || '';
  const tiempo = { developmenttime: (typeof developmentSource === 'string' && developmentSource.includes('T')) ? isoDateToDuration(developmentSource) : (typeof developmentSource === 'object' ? (developmentSource) : { days: '', months: '', years: '' }) };
  // Si identificacionForm ya existe (se definió arriba), actualizamos su campo development
  try {
    if (identificacionForm && typeof identificacionForm === 'object') {
      identificacionForm.development = (typeof developmentSource === 'string' && developmentSource.includes('T')) ? isoDateToDuration(developmentSource) : (typeof developmentSource === 'object' ? (developmentSource) : { days: '', months: '', years: '' });
    }
  } catch (e) {
    // noop
  }

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
    // --- CAMPOS REQUERIDOS POR EL BACKEND ---
    Leaders: Array.isArray(leaders) ? leaders : [],
    GradesUpdate: Array.isArray(src.GradesUpdate) ? src.GradesUpdate : [],
    DocumentsUpdate: Array.isArray(src.DocumentsUpdate) ? src.DocumentsUpdate : [],
    ThematicLineIds: Array.isArray(
      (tematicaForm && tematicaForm.thematicLineIds) ? tematicaForm.thematicLineIds : src.ThematicLineIds
    ) ? ((tematicaForm && tematicaForm.thematicLineIds) ? tematicaForm.thematicLineIds : src.ThematicLineIds) : [],
    ObjectivesUpdate: Array.isArray(src.ObjectivesUpdate) ? src.ObjectivesUpdate : [],
    InstitutionUpdate: typeof src.InstitutionUpdate === 'object' && src.InstitutionUpdate !== null ? src.InstitutionUpdate : {},
    DevelopmentsUpdate: Array.isArray(src.DevelopmentsUpdate) ? src.DevelopmentsUpdate : [],
    PopulationGradeIds: Array.isArray(
      (tematicaForm && tematicaForm.populationGradeIds) ? tematicaForm.populationGradeIds : src.PopulationGradeIds
    ) ? ((tematicaForm && tematicaForm.populationGradeIds) ? tematicaForm.populationGradeIds : src.PopulationGradeIds) : [],
    HistoryExperiencesUpdate: Array.isArray(src.HistoryExperiencesUpdate) ? src.HistoryExperiencesUpdate : [],
    // --- FIN CAMPOS REQUERIDOS ---
    _raw: src,
  };
};

export default normalizeToInitial;