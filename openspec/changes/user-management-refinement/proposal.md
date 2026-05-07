# Proposal: Refinamiento de Gestión de Usuarios y Reputación

## Objetivo
Cumplir con las Historias de Usuario US-3 (Perfil de Usuario) y US-4 (Sistema de Reputación) detalladas en el documento de estimación. Queremos que los usuarios tengan una identidad completa y que su comportamiento en la plataforma genere confianza.

## Cambios Principales
1.  **Perfil Extendido**: Añadir campo `bio` (biografía) y asegurar que el `avatar_url` sea manejado correctamente.
2.  **Sistema de Reputación**: Implementar un campo `reputation` (0-5 estrellas) que se calcule en base a:
    *   Subastas ganadas y pagadas.
    *   Ventas finalizadas con éxito.
3.  **Estado de Wallet**: Asegurar que el balance sea visible y preciso en el perfil.

## Valor de Negocio
La confianza es vital en un sistema de subastas. La reputación permite que los compradores y vendedores interactúen con seguridad.
