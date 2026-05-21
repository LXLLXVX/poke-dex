# Diagrama de Casos de Uso

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle

actor "Usuario Autenticado\n(trainer)" as AuthUser
actor "Usuario Anónimo\n(guest)" as Guest
actor "Administrador\n(admin)" as Admin
actor "PokeAPI" as PokeApi

rectangle "Poke Team Lab" {
    usecase "Consultar Pokédex" as UC_LIST_POKEMON
    usecase "Filtrar Pokémon\n(search / types / paginación)" as UC_FILTER_POKEMON
    usecase "Ver detalle de Pokémon" as UC_DETAIL_POKEMON

    usecase "Gestionar Tipos\n(CRUD)" as UC_TYPES
    usecase "Gestionar Entrenadores\n(CRUD)" as UC_TRAINERS
    usecase "Gestionar Equipo\n(CRUD, max 6)" as UC_TEAM

    usecase "Ver estado API\n(/health)" as UC_HEALTH

    usecase "Inicializar Base de Datos" as UC_BOOTSTRAP
    usecase "Ejecutar Migraciones" as UC_MIGRATIONS
    usecase "Ejecutar Seeders" as UC_SEEDERS
    usecase "Importar Pokémon Gen I" as UC_IMPORT
}

Guest --> UC_LIST_POKEMON
Guest --> UC_FILTER_POKEMON
Guest --> UC_DETAIL_POKEMON
Guest --> UC_HEALTH

AuthUser --> UC_LIST_POKEMON
AuthUser --> UC_FILTER_POKEMON
AuthUser --> UC_DETAIL_POKEMON
AuthUser --> UC_TYPES
AuthUser --> UC_TRAINERS
AuthUser --> UC_TEAM
AuthUser --> UC_HEALTH

Admin --> UC_LIST_POKEMON
Admin --> UC_FILTER_POKEMON
Admin --> UC_DETAIL_POKEMON
Admin --> UC_TYPES
Admin --> UC_TRAINERS
Admin --> UC_TEAM
Admin --> UC_HEALTH

Admin --> UC_BOOTSTRAP
Admin --> UC_MIGRATIONS
Admin --> UC_SEEDERS

UC_BOOTSTRAP .> UC_MIGRATIONS : <<include>>
UC_BOOTSTRAP .> UC_SEEDERS : <<include>>
UC_SEEDERS .> UC_IMPORT : <<include>>

PokeApi --> UC_IMPORT

'note top'
Roles:
- `Administrador`: tareas administrativas (migraciones, seeders, bootstrap).
- `Usuario Autenticado (trainer)`: acceso a endpoints protegidos (crear/editar equipo, acciones restringidas en trainers).
- `Usuario Anónimo (guest)`: acceso de solo lectura (listar y ver Pokémon / tipos).
end note
@enduml
```
