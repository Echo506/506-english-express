# ⚡ 506 English Express

Plataforma web interactiva para aprender inglés paso a paso mediante situaciones reales, diálogos, vocabulario, gramática, pronunciación, cultura y actividades prácticas.

🌐 **Sitio en línea:**  
[https://echo506.github.io/506-english-express/](https://echo506.github.io/506-english-express/)

---

## 🎯 Objetivo

**506 English Express** ofrece una ruta progresiva de aprendizaje del inglés. El estudiante comienza con bases comunicativas y avanza hacia situaciones cotidianas, profesionales y de viaje.

El curso está diseñado para practicar inglés de forma activa mediante ejercicios, comprensión, escritura guiada y actividades desbloqueables.

---

## ✨ Características

- Curso organizado en unidades y entregas
- Diálogos basados en situaciones reales
- Vocabulario, gramática y pronunciación
- Actividades interactivas y práctica guiada
- Desbloqueo progresivo de lecciones
- Diseño responsive para computadora y móvil
- Tema visual azul cyber y modo verde cyber
- Inicio de sesión con Google mediante Supabase Auth
- Seguimiento de progreso por estudiante con Supabase
- Página de progreso para estudiantes autenticados

---

## 📚 Contenido del curso

| Unidad | Tema principal |
|---|---|
| Unidad 1 | Contactos y comunicación |
| Unidad 2 | Viajes y situaciones sociales |
| Unidad 3 | Experiencias y comunicación |
| Unidad 4 | Situaciones reales y cultura |

El contenido incluye temas como saludos, presentaciones, profesiones, nacionalidades, hoteles, restaurantes, alquiler de autos, noticias, carreteras, llamadas, publicidad, celebraciones y estructuras gramaticales.

---

## 🛠️ Tecnologías

- HTML5
- CSS3
- JavaScript
- Supabase
- Supabase Auth con Google OAuth
- Supabase Database para progreso estudiantil
- GitHub Pages
- Google Fonts: Orbitron y Rajdhani

---

## 📁 Estructura del proyecto

```text
506-english-express/
│
├── index.html
├── README.md
│
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── script.js
│   │   └── supabase-auth.js
│   ├── images/
│   └── video/
│
└── pages/
    ├── units.html
    ├── unit-1.html
    ├── unit-2.html
    ├── unit-3.html
    ├── unit-4.html
    ├── progress.html
    └── unit-1-delivery-1.html
```

---

## 🔐 Autenticación y progreso

El sitio utiliza **Supabase Auth** para permitir que los estudiantes inicien sesión con Google.

Cuando un estudiante completa una actividad, el proyecto puede guardar su avance en la tabla `student_progress` de Supabase. Los datos registrados pueden incluir:

- Nombre del estudiante
- Correo electrónico
- Unidad completada
- Identificador de actividad
- Título de actividad
- Estado de completado
- Puntaje
- Fecha de actualización

El progreso se asocia al usuario autenticado mediante su `user_id`.

---

## 🚀 Ejecutar localmente

1. Clona el repositorio:

```bash
git clone [https://github.com/echo506/506-english-express.git](https://github.com/echo506/506-english-express.git)
```

2. Entra a la carpeta:

```bash
cd 506-english-express
```

3. Abre `index.html` en el navegador.

Para una mejor experiencia de desarrollo, puedes usar la extensión **Live Server** de Visual Studio Code.

---

## 🌐 Publicación

El sitio se publica con **GitHub Pages**.

URL de producción:

```text
[https://echo506.github.io/506-english-express/](https://echo506.github.io/506-english-express/)
```

---

## 👤 Autor

**Wilfrido Pérez**

Proyecto educativo creado para apoyar el aprendizaje progresivo del inglés mediante práctica, interacción y situaciones comunicativas reales.

---

## 📄 Licencia

Este proyecto fue creado con fines educativos.
