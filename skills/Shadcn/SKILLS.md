# 🎨 Guía de Instalación y Configuración: shadcn/ui

Esta guía detalla cómo integrar **shadcn/ui** en nuestro proyecto React + Vite, respetando la estructura de carpetas de **Clean Architecture**.

## 1. Inicializar shadcn/ui

Ejecuta el siguiente comando en la raíz del proyecto (donde se ubica el `package.json`):

\`\`\`bash
npx shadcn@latest init
\`\`\`

El CLI interactivo te hará varias preguntas. Para mantener la coherencia con nuestra arquitectura, **debes responder exactamente con los siguientes valores**:

- **Which style would you like to use?** › *[Tu elección: Default o New York]*
- **Which color would you like to use as base color?** › *[Tu elección: Zinc, Slate, etc.]*
- **Do you want to use CSS variables for colors?** › `yes`
- **Where is your global CSS file?** › `src/index.css` *(Asegúrate de que esta ruta coincida con tu archivo CSS global)*
- **Are you using a custom tailwind prefix eg. tw-?** › *(Déjalo en blanco)*
- **Where is your tailwind.config.js located?** › `tailwind.config.js`
- **Configure the import alias for components:** › `@/presentation/components`
- **Configure the import alias for utils:** › `@/lib/utils`
- **Are you using React Server Components?** › `no`
- **Write configuration to components.json.** › `yes`

*Nota Arquitectónica: Al configurar el alias `@/presentation/components`, shadcn creará automáticamente la subcarpeta `ui/` dentro de esta ruta al instalar el primer componente.*

## 2. Instalar Componentes

A diferencia de las librerías tradicionales de NPM, shadcn descarga el código fuente del componente directamente a tu proyecto. 

Para instalar componentes (por ejemplo, `button` e `input`), ejecuta:

\`\`\`bash
npx shadcn@latest add button input
\`\`\`

Esto generará los archivos correspondientes dentro de `src/presentation/components/ui/`.

## 3. Uso de Componentes

Una vez instalados, importa los componentes utilizando el alias configurado y úsalos en la capa de Presentación (`features`, `pages`, o `layouts`).

### Ejemplo de Implementación:

\`\`\`tsx
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";

export function LoginForm() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input type="email" placeholder="ejemplo@correo.com" />
      <Button type="submit">Iniciar Sesión</Button>
    </div>
  );
}
\`\`\`