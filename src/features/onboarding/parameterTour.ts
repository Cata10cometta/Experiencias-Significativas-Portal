import { Step } from 'react-joyride';

export const parameterTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const parameterTourStyles = {
  options: {
    zIndex: 10000,
    arrowColor: '#fff',
    backgroundColor: '#fff',
    overlayColor: 'rgba(11,16,51,0.55)',
    primaryColor: '#fb923c',
    textColor: '#22223b',
    width: 420,
    borderRadius: 16,
    fontFamily: 'inherit',
    boxShadow: '0 10px 36px rgba(2, 6, 23, 0.25)',
  },
  buttonNext: {
    backgroundColor: '#fb923c',
    color: '#fff',
    fontWeight: 800,
    borderRadius: 8,
    fontSize: 18,
    padding: '10px 24px',
    border: 'none',
  },
  buttonBack: {
    color: '#475569',
    fontWeight: 600,
    fontSize: 16,
    marginRight: 12,
  },
  buttonClose: {
    color: '#475569',
    fontWeight: 600,
    fontSize: 16,
  },
  tooltip: {
    borderRadius: 16,
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
    padding: '24px 28px',
  },
  tooltipTitle: {
    color: '#fb923c',
    fontWeight: 800,
    fontSize: 22,
    marginBottom: 8,
  },
  tooltipContent: {
    color: '#22223b',
    fontSize: 17,
    marginBottom: 8,
  },
};

export const parameterCriteriaTourSteps: Step[] = [
  {
    target: '.parameter-tabs-nav',
    title: 'Catálogos de parámetros',
    content: 'Usa estas pestañas para navegar entre los diferentes catálogos disponibles.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.parameter-criteria-header',
    title: 'Encabezado del catálogo',
    content: 'Aquí encontrarás la descripción general de la gestión de criterios.',
    placement: 'bottom',
  },
  {
    target: '.parameter-criteria-create',
    title: 'Agregar criterio',
    content: 'Registra un nuevo criterio indicando código, nombre y valores de evaluación.',
    placement: 'left',
  },
  {
    target: '.parameter-criteria-search',
    title: 'Búsqueda de criterios',
    content: 'Filtra la lista escribiendo parte del código, nombre o descripción.',
    placement: 'bottom',
  },
  {
    target: '.parameter-criteria-filters',
    title: 'Filtro por estado',
    content: 'Cambia rápidamente entre criterios activos e inactivos para gestionarlos.',
    placement: 'bottom',
  },
  {
    target: '.parameter-criteria-table',
    title: 'Listado de criterios',
    content: 'Consulta la información principal y accede a sus acciones con estos controles.',
    placement: 'top',
  },
  {
    target: '.parameter-criteria-pagination',
    title: 'Paginación',
    content: 'Navega entre páginas para revisar todos los registros disponibles.',
    placement: 'top',
  },
];

export const parameterGradesTourSteps: Step[] = [
  {
    target: '.parameter-tabs-nav',
    title: 'Catálogos de parámetros',
    content: 'Cambias de catálogo usando estas pestañas superiores.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.parameter-grades-header',
    title: 'Gestión de grados',
    content: 'Este encabezado resume el objetivo del catálogo de grados.',
    placement: 'bottom',
  },
  {
    target: '.parameter-grades-create',
    title: 'Agregar grado',
    content: 'Haz clic para registrar un nuevo grado con su código y nombre.',
    placement: 'left',
  },
  {
    target: '.parameter-grades-search',
    title: 'Buscar grados',
    content: 'Escribe cualquier dato relevante para encontrar un grado específico.',
    placement: 'bottom',
  },
  {
    target: '.parameter-grades-filters',
    title: 'Filtro por estado',
    content: 'Visualiza únicamente los grados activos o los que están inactivos.',
    placement: 'bottom',
  },
  {
    target: '.parameter-grades-table',
    title: 'Listado de grados',
    content: 'Revisa los códigos, nombres y acciones disponibles para cada grado.',
    placement: 'top',
  },
  {
    target: '.parameter-grades-pagination',
    title: 'Control de páginas',
    content: 'Explora todos los registros disponibles utilizando estos controles.',
    placement: 'top',
  },
];

export const parameterLinesTourSteps: Step[] = [
  {
    target: '.parameter-tabs-nav',
    title: 'Catálogos de parámetros',
    content: 'Utiliza estas pestañas para cambiar entre los distintos catálogos.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.parameter-lines-header',
    title: 'Líneas temáticas',
    content: 'Aquí puedes ver la descripción general de este catálogo.',
    placement: 'bottom',
  },
  {
    target: '.parameter-lines-create',
    title: 'Agregar línea temática',
    content: 'Registra una nueva línea temática con su código y nombre.',
    placement: 'left',
  },
  {
    target: '.parameter-lines-search',
    title: 'Buscar líneas temáticas',
    content: 'Filtra la tabla escribiendo parte del código o el nombre.',
    placement: 'bottom',
  },
  {
    target: '.parameter-lines-filters',
    title: 'Filtro por estado',
    content: 'Alterna entre elementos activos e inactivos según necesites.',
    placement: 'bottom',
  },
  {
    target: '.parameter-lines-table',
    title: 'Listado principal',
    content: 'Consulta y gestiona cada línea temática desde esta tabla.',
    placement: 'top',
  },
  {
    target: '.parameter-lines-pagination',
    title: 'Paginación',
    content: 'Recorre los registros disponibles página por página.',
    placement: 'top',
  },
];

export const parameterPopulationTourSteps: Step[] = [
  {
    target: '.parameter-tabs-nav',
    title: 'Catálogos de parámetros',
    content: 'Navega entre los catálogos usando estas pestañas.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.parameter-population-header',
    title: 'Grados de población',
    content: 'Aquí se explica qué puedes gestionar en este catálogo.',
    placement: 'bottom',
  },
  {
    target: '.parameter-population-create',
    title: 'Agregar grado de población',
    content: 'Crea un nuevo grado de población con su código y nombre.',
    placement: 'left',
  },
  {
    target: '.parameter-population-search',
    title: 'Buscar grados de población',
    content: 'Filtra la lista escribiendo parte del nombre o código.',
    placement: 'bottom',
  },
  {
    target: '.parameter-population-filters',
    title: 'Activos e inactivos',
    content: 'Alterna entre los registros activos e inactivos.',
    placement: 'bottom',
  },
  {
    target: '.parameter-population-table',
    title: 'Listado de población',
    content: 'Administra cada registro desde esta tabla y sus acciones.',
    placement: 'top',
  },
  {
    target: '.parameter-population-pagination',
    title: 'Navegación por páginas',
    content: 'Recorre todos los registros disponibles con estos controles.',
    placement: 'top',
  },
];

export const parameterStatesTourSteps: Step[] = [
  {
    target: '.parameter-tabs-nav',
    title: 'Catálogos de parámetros',
    content: 'Controla qué catálogo deseas gestionar desde estas pestañas.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.parameter-states-header',
    title: 'Estados de experiencia',
    content: 'Este encabezado resume el propósito del catálogo de estados.',
    placement: 'bottom',
  },
  {
    target: '.parameter-states-create',
    title: 'Agregar estado',
    content: 'Registra un nuevo estado con su código y nombre.',
    placement: 'left',
  },
  {
    target: '.parameter-states-search',
    title: 'Búsqueda rápida',
    content: 'Filtra la tabla escribiendo parte del código o nombre.',
    placement: 'bottom',
  },
  {
    target: '.parameter-states-filters',
    title: 'Filtro por estado',
    content: 'Alterna entre estados activos e inactivos según necesites.',
    placement: 'bottom',
  },
  {
    target: '.parameter-states-table',
    title: 'Listado de estados',
    content: 'Consulta la información clave y gestiona cada estado desde aquí.',
    placement: 'top',
  },
  {
    target: '.parameter-states-pagination',
    title: 'Control de páginas',
    content: 'Revisa todos los registros usando estos controles de paginación.',
    placement: 'top',
  },
];
