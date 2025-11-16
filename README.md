# Experiencias-Significativas-Vite-React

Experiencias Significativas, diseñada para registrar, gestionar y consultar experiencias de usuarios en distintos contextos educativos o sociales.

## Características Principales

- **Autenticación básica**: Inicio de sesión y registro de usuarios.
- **Protección de rutas**: El acceso al dashboard está protegido mediante un sistema de autenticación basado en contexto.
- **Diseño moderno**: Interfaz estilizada con Tailwind CSS.
- **Estructura modular**: Código organizado en componentes, contextos y hooks para facilitar la escalabilidad.
- **Manejo de errores**: Rutas no encontradas redirigen a una página de error 404.

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado lo siguiente:

- **Node.js**: Versión 16 o superior.
- **npm o yarn**: Para instalar dependencias.

## Instalación

1. Clona este repositorio:

   ```bash
  git clone https://github.com/Mari2303/Experiencias-Significativas-Front.git
   cd Experiencias-Significativas-Front
   ```

2. Instala las dependencias:

```bash
npm install
```

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre tu navegador y navega a:

```bash
http://localhost:5173
```

## **Estructura del Proyecto**

El proyecto está organizado de la siguiente manera:

```bash
src/
├── components/
│   ├── PrivateRoute.tsx
├── context/
│   ├── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
├── App.tsx
├── main.tsx
├── routes.tsx
└── index.css
```

## Funcionalidades

1. Login

- Ruta: /login
- Permite a los usuarios iniciar sesión.
- Redirige al dashboard si el inicio de sesión es exitoso.

2. Register

- Ruta: /register
- Permite a los usuarios registrarse.
- Redirige al login después del registro.

3. Dashboard

- Ruta: /dashboard
- Área protegida accesible solo para usuarios autenticados.
- Muestra widgets o información relevante.

4. Rutas Protegidas

- El acceso al dashboard está protegido mediante el componente PrivateRoute.
- Si un usuario no está autenticado, será redirigido al login.

5. Manejo de Errores

- Rutas no encontradas muestran una página de error 404.

## Tecnologías Utilizadas

**Frontend :**

- React : Biblioteca para construir interfaces de usuario.
- Vite : Herramienta de construcción rápida para proyectos frontend.
- TypeScript : Lenguaje tipado que mejora la seguridad y mantenibilidad del código.
- Tailwind CSS : Framework CSS para estilizar rápidamente la interfaz.
  **Estado Global :**
- React Context API : Manejo del estado de autenticación.
  **Rutas :**
- React Router DOM : Biblioteca para manejar la navegación entre páginas.

## Autor

Nombre : Maria Alejandra Marin 
Nombre : Catalina Cometa Fierro 
Nombre : Merari Urbano Quintero
GitHub : [Enlace a tu perfil de GitHub](https://github.com/Mari2303)

## Agradecimientos

- Vite : Por proporcionar una herramienta de construcción rápida y eficiente.
- Tailwind CSS : Por simplificar el diseño de interfaces modernas.
- React Community : Por su documentación y recursos.
