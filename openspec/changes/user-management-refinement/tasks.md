# Tasks: Refinamiento de Usuarios

## Fase 1: Especificación
- [ ] [MODIFY] [auth-spec.yaml](file:///c:/Users/HUGO06/Desktop/REPOS%20PERSONALES%20GITHUB/PROYECTOS/prj-final-front-back-g1_bidlive/openspec/specs/auth-spec.yaml): Añadir campos `bio`, `reputation`, `total_sales`.
- [ ] [RUN] `npm run spec:lint`: Validar cambios.
- [ ] [RUN] `npm run frontend:gen`: Sincronizar tipos del frontend.

## Fase 2: Backend (auth-service)
- [ ] [MODIFY] `models/User.js`: Añadir campos a la base de datos.
- [ ] [MODIFY] `controllers/profileController.js`: Retornar nuevos campos en la respuesta.
- [ ] [MODIFY] `controllers/authController.js`: Asegurar que el login/registro devuelva la estructura correcta.

## Fase 3: Frontend
- [ ] [MODIFY] `src/pages/Profile.tsx`: Mostrar reputación (estrellas) y biografía.
- [ ] [MODIFY] `src/components/EditProfileModal.tsx`: Añadir campo de biografía.

## Fase 4: Verificación
- [ ] Probar registro de nuevo usuario.
- [ ] Probar actualización de biografía.
- [ ] Verificar que la reputación se muestra correctamente en el perfil público.
