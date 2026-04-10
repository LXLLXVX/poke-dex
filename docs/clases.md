# Diagrama de Clases (arquitectura backend)

```plantuml
@startuml
skinparam shadowing false
hide empty members

class PokemonController {
    +listPokemon(req,res,next)
    +getPokemon(req,res,next)
    +createPokemon(req,res,next)
    +updatePokemon(req,res,next)
    +deletePokemon(req,res,next)
}

class TrainerController {
    +listTrainers(req,res,next)
    +createTrainer(req,res,next)
    +updateTrainer(req,res,next)
    +deleteTrainer(req,res,next)
}

class TypeController {
    +listTypes(req,res,next)
    +createType(req,res,next)
    +updateType(req,res,next)
    +deleteType(req,res,next)
}

class TeamController {
    +listTeam(req,res,next)
    +createMember(req,res,next)
    +updateMember(req,res,next)
    +deleteMember(req,res,next)
}

class PokemonService {
    +listPokemon(filters)
    +getPokemonByNationalDex(nationalDex)
    +createPokemon(payload)
    +updatePokemon(nationalDex,payload)
    +deletePokemon(nationalDex)
}

class TrainerService {
    +listTrainers()
    +createTrainer(payload)
    +updateTrainer(id,payload)
    +deleteTrainer(id)
}

class TypeService {
    +listTypes()
    +createType(payload)
    +updateType(id,payload)
    +deleteType(id)
}

class TeamService {
    +listTeam()
    +addMember(payload)
    +updateMember(id,payload)
    +removeMember(id)
}

class PokemonModel {
    +findAll(filters)
    +findByNationalDex(nationalDex)
    +create(pokemon)
    +updateByNationalDex(nationalDex,pokemon)
    +removeByNationalDex(nationalDex)
}

class TrainerModel {
    +findAll()
    +findById(id)
    +create(payload)
    +update(id,payload)
    +remove(id)
}

class TypeModel {
    +findAll()
    +findById(id)
    +findByName(name)
    +create(payload)
    +update(id,payload)
    +remove(id)
}

class TeamMemberModel {
    +findAll()
    +countAll()
    +findById(id)
    +create(member)
    +update(id,member)
    +remove(id)
}

class HttpError {
    +httpError(status,message)
}

class MySqlPool {
    +query(sql,params)
    +execute(sql,params)
}

PokemonController --> PokemonService
TrainerController --> TrainerService
TypeController --> TypeService
TeamController --> TeamService

PokemonService --> PokemonModel
PokemonService --> HttpError
TrainerService --> TrainerModel
TrainerService --> HttpError
TypeService --> TypeModel
TypeService --> HttpError
TeamService --> TeamMemberModel
TeamService --> PokemonModel
TeamService --> HttpError

PokemonModel --> MySqlPool
TrainerModel --> MySqlPool
TypeModel --> MySqlPool
TeamMemberModel --> MySqlPool
@enduml
```
