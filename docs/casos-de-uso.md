# Diagrama de Casos de Uso

```plantuml
@startuml
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle

actor "Usuario Web" as User
actor "Operador Backend" as Admin
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

User --> UC_LIST_POKEMON
User --> UC_FILTER_POKEMON
User --> UC_DETAIL_POKEMON
User --> UC_TYPES
User --> UC_TRAINERS
User --> UC_TEAM
User --> UC_HEALTH

Admin --> UC_BOOTSTRAP
Admin --> UC_MIGRATIONS
Admin --> UC_SEEDERS

UC_BOOTSTRAP .> UC_MIGRATIONS : <<include>>
UC_BOOTSTRAP .> UC_SEEDERS : <<include>>
UC_SEEDERS .> UC_IMPORT : <<include>>

PokeApi --> UC_IMPORT
@enduml
```
