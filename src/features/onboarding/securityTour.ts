import { Step } from "react-joyride";

export const securityTourLocale = {
	back: "Atras",
	close: "Cerrar",
	last: "Finalizar",
	next: "Siguiente",
	skip: "Saltar",
};

export const securityTourStyles = {
	options: {
		zIndex: 10000,
		arrowColor: "#ffffff",
		backgroundColor: "#ffffff",
		overlayColor: "rgba(11,16,51,0.55)",
		primaryColor: "#fb923c",
		textColor: "#0f172a",
		width: 420,
		borderRadius: 16,
		fontFamily: "inherit",
		boxShadow: "0 16px 40px rgba(15, 23, 42, 0.24)",
	},
	buttonNext: {
		backgroundColor: "#fb923c",
		color: "#ffffff",
		fontWeight: 700,
		borderRadius: 8,
		fontSize: 18,
		padding: "10px 24px",
		border: "none",
	},
	buttonBack: {
		color: "#64748b",
		fontWeight: 600,
		fontSize: 16,
		marginRight: 12,
	},
	buttonClose: {
		color: "#64748b",
		fontWeight: 600,
		fontSize: 16,
	},
	tooltip: {
		borderRadius: 16,
		boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
		padding: "24px 28px",
	},
	tooltipTitle: {
		color: "#fb923c",
		fontWeight: 800,
		fontSize: 22,
		marginBottom: 8,
	},
	tooltipContent: {
		color: "#0f172a",
		fontSize: 17,
		marginBottom: 8,
	},
};

export const securityModulesTourSteps: Step[] = [
	{
		target: ".security-modules-header",
		title: "Modulos del sistema",
		content: "Aqui encuentras la descripcion general del catalogo de modulos.",
		placement: "bottom",
		disableBeacon: true,
	},
	{
		target: ".security-modules-create",
		title: "Crear modulo",
		content: "Usa este boton para registrar un nuevo modulo de acceso.",
		placement: "left",
	},
	{
		target: ".security-modules-filters",
		title: "Filtro por estado",
		content: "Alterna entre modulos activos e inactivos con estos botones.",
		placement: "bottom",
	},
	{
		target: ".security-modules-table",
		title: "Listado principal",
		content: "Consulta los modulos registrados y accede a sus acciones.",
		placement: "top",
	},
	{
		target: ".security-modules-pagination",
		title: "Paginacion",
		content: "Navega entre paginas para revisar todos los registros.",
		placement: "top",
	},
];

export const securityRolesTourSteps: Step[] = [
	{
		target: ".security-roles-header",
		title: "Roles de usuario",
		content: "Administra los roles disponibles dentro de la plataforma.",
		placement: "bottom",
		disableBeacon: true,
	},
	{
		target: ".security-roles-create",
		title: "Agregar rol",
		content: "Crea un nuevo rol asignando nombre y descripcion.",
		placement: "left",
	},
	{
		target: ".security-roles-search",
		title: "Busqueda",
		content: "Filtra el listado escribiendo parte del nombre o descripcion.",
		placement: "bottom",
	},
	{
		target: ".security-roles-table",
		title: "Listado de roles",
		content: "Consulta los roles, estados y acciones disponibles.",
		placement: "top",
	},
	{
		target: ".security-roles-pagination",
		title: "Control de paginas",
		content: "Avanza o retrocede para revisar todos los roles.",
		placement: "top",
	},
];

export const securityUsersTourSteps: Step[] = [
	{
		target: ".security-users-header",
		title: "Usuarios",
		content: "Revisa el resumen y acceso a la gestion de usuarios.",
		placement: "bottom",
		disableBeacon: true,
	},
	{
		target: ".security-users-create",
		title: "Crear usuario",
		content: "Abre el formulario para registrar un nuevo usuario.",
		placement: "left",
	},
	{
		target: ".security-users-filters",
		title: "Filtros",
		content: "Elige si deseas ver usuarios activos o inactivos.",
		placement: "bottom",
	},
	{
		target: ".security-users-search",
		title: "Busqueda rapida",
		content: "Encuentra usuarios escribiendo parte del nombre o codigo.",
		placement: "bottom",
	},
	{
		target: ".security-users-table",
		title: "Tabla de usuarios",
		content: "Consulta los datos principales y accede a las acciones.",
		placement: "top",
	},
	{
		target: ".security-users-pagination",
		title: "Paginacion",
		content: "Recorre la lista completa con estos controles.",
		placement: "top",
	},
];

export const securityPersonsTourSteps: Step[] = [
	{
		target: ".security-persons-header",
		title: "Personas",
		content: "Gestiona la informacion basica asociada a cada persona.",
		placement: "bottom",
		disableBeacon: true,
	},
	{
		target: ".security-persons-create",
		title: "Registrar persona",
		content: "Crea un registro nuevo con los datos de la persona.",
		placement: "left",
	},
	{
		target: ".security-persons-search",
		title: "Busqueda",
		content: "Filtra por nombres, apellidos o identificacion.",
		placement: "bottom",
	},
	{
		target: ".security-persons-table",
		title: "Listado de personas",
		content: "Visualiza cada registro y accede a las acciones disponibles.",
		placement: "top",
	},
	{
		target: ".security-persons-pagination",
		title: "Control de paginas",
		content: "Avanza o retrocede para revisar todos los registros.",
		placement: "top",
	},
];

export const securityPermissionsTourSteps: Step[] = [
	{
		target: ".security-rol-permission-header",
		title: "Permisos por rol",
		content: "Aqui ves un resumen de la gestion de permisos.",
		placement: "bottom",
		disableBeacon: true,
	},
	{
		target: ".security-rol-permission-create",
		title: "Agregar permiso",
		content: "Usa este boton para asignar un nuevo formulario y permiso.",
		placement: "left",
	},
	{
		target: ".security-rol-permission-search",
		title: "Busqueda",
		content: "Filtra la tabla escribiendo rol, formulario o permiso.",
		placement: "bottom",
	},
	{
		target: ".security-rol-permission-table",
		title: "Listado de permisos",
		content: "Consulta las combinaciones existentes y utiliza las acciones.",
		placement: "top",
	},
];

export const securitySummaryTourSteps: Step[] = [
	{
		target: ".security-summary-header",
		title: "Resumen de seguridad",
		content: "Este panel resume la actividad reciente y totales clave.",
		placement: "bottom",
		disableBeacon: true,
	},
	{
		target: ".security-summary-cards",
		title: "Indicadores",
		content: "Revisa las metricas principales de usuarios, roles y permisos.",
		placement: "bottom",
	},
	{
		target: ".security-summary-search",
		title: "Busqueda",
		content: "Filtra el historial escribiendo nombre, accion o modulo.",
		placement: "bottom",
	},
	{
		target: ".security-summary-table",
		title: "Historial",
		content: "Explora los eventos detallados y acciones relacionadas.",
		placement: "top",
	},
	{
		target: ".security-summary-pagination",
		title: "Paginacion",
		content: "Utiliza estos controles para recorrer todas las entradas.",
		placement: "top",
	},
];
