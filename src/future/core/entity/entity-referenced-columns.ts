import { ForceCastIfExtends } from "../util"
import {
  EntityColumnTypeMapByNames,
  EntityPrimaryColumnTypeMap,
} from "./entity-columns"
import { AnyEntity } from "./entity-core"
import {
  EntityRelation,
  EntityRelationManyToManyNotOwner,
  EntityRelationManyToManyOwner,
  EntityRelationManyToOne,
  EntityRelationOneToMany,
  EntityRelationOneToOneNotOwner,
  EntityRelationOneToOneOwner,
  EntityRelationReferencedColumn,
  EntityRelationReferencedTable,
} from "./entity-relations"

/**
 * Creates a column map for a given entity relation.
 * E.g. let's say we have a following relation:
 *
 *
 * export const PhotoEntity = entity({
 *   columns: {
 *     id: {
 *       primary: true,
 *       type: "int",
 *     },
 *     filename: {
 *       type: "varchar",
 *       nullable: true,
 *     },
 *   },
 *   relations: {
 *     users: {
 *       type: "many-to-many",
 *       owner: false,
 *       inverse: "photos" as const,
 *       reference: "UserEntity" as const,
 *     },
 *   },
 * })
 *
 * export const UserEntity = entity({
 *   columns: {
 *     id: {
 *       type: "int",
 *       primary: true,
 *       generated: true,
 *     },
 *     name: {
 *       type: "varchar",
 *     },
 *   },
 *   relations: {
 *     photos: {
 *       type: "many-to-many",
 *       owner: true,
 *       reference: "PhotoEntity" as const,
 *       referencedTable: {
 *         ownerColumns: [
 *           { referencedColumn: "id" as const },
 *           { referencedColumn: "name" as const },
 *         ],
 *         inverseColumns: [
 *           { referencedColumn: "id" } as const,
 *           { referencedColumn: "filename" } as const,
 *         ],
 *       },
 *     },
 *   },
 * })
 *
 * When this type will be called for this relation for the PhotoEntity a following type will be produced:
 * { id: number, filename: string }
 * And for the UserEntity a following type will be produced:
 * { id: number, name: string }
 *
 *
 */
export type EntityRelationReferencedColumnTypeMap<
  ReferencedEntity extends AnyEntity,
  Relation extends EntityRelation
> = Relation extends EntityRelationManyToManyOwner
  ? Relation["referencedTable"] extends EntityRelationReferencedTable
    ?
        | EntityRelationReferencedColumnMixedTypeMap<
            ReferencedEntity,
            ForceCastIfExtends<
              Relation["referencedTable"],
              EntityRelationReferencedTable
            >["inverseColumns"]
          >[]
        | undefined
    :
        | EntityPrimaryColumnTypeMap<
            ReferencedEntity["driver"]["types"],
            ReferencedEntity["driver"]["options"]["entities"]["entities"],
            ReferencedEntity
          >[]
        | undefined
  : Relation extends EntityRelationManyToManyNotOwner
  ? ReferencedEntity["relations"][Relation["inverse"]] extends EntityRelationManyToManyOwner
    ? ForceCastIfExtends<
        ReferencedEntity["relations"][Relation["inverse"]]["referencedTable"],
        EntityRelationReferencedTable
      >["ownerColumns"] extends
        | EntityRelationReferencedColumn
        | [...EntityRelationReferencedColumn[]]
      ?
          | EntityRelationReferencedColumnMixedTypeMap<
              ReferencedEntity,
              ForceCastIfExtends<
                ReferencedEntity["relations"][Relation["inverse"]]["referencedTable"],
                EntityRelationReferencedTable
              >["ownerColumns"]
            >[]
          | undefined
      :
          | EntityPrimaryColumnTypeMap<
              ReferencedEntity["driver"]["types"],
              ReferencedEntity["driver"]["options"]["entities"]["entities"],
              ReferencedEntity
            >[]
          | undefined
    : never
  : Relation extends EntityRelationManyToOne
  ?
      | EntityRelationReferencedColumnMixedTypeMap<
          ReferencedEntity,
          Relation["referencedColumns"]
        >
      | undefined
  : Relation extends EntityRelationOneToMany
  ?
      | EntityPrimaryColumnTypeMap<
          ReferencedEntity["driver"]["types"],
          ReferencedEntity["driver"]["options"]["entities"]["entities"],
          ReferencedEntity
        >[]
      | undefined
  : Relation extends EntityRelationOneToOneOwner
  ?
      | EntityRelationReferencedColumnMixedTypeMap<
          ReferencedEntity,
          Relation["referencedColumns"]
        >
      | undefined
  : Relation extends EntityRelationOneToOneNotOwner
  ?
      | EntityPrimaryColumnTypeMap<
          ReferencedEntity["driver"]["types"],
          ReferencedEntity["driver"]["options"]["entities"]["entities"],
          ReferencedEntity
        >[]
      | undefined
  : never

/**
 * Helper type for EntityRelationReferencedColumnTypeMap.
 */
export type EntityRelationReferencedColumnMixedTypeMap<
  ReferencedEntity extends AnyEntity,
  ReferencedColumnMixed extends
    | EntityRelationReferencedColumn[]
    | EntityRelationReferencedColumn
    | undefined
> = ReferencedColumnMixed extends EntityRelationReferencedColumn[]
  ? EntityColumnTypeMapByNames<
      ReferencedEntity["driver"]["types"],
      ReferencedEntity["driver"]["options"]["entities"]["entities"],
      ReferencedEntity,
      ForceCastIfExtends<
        ReferencedColumnMixed,
        EntityRelationReferencedColumn[]
      >[number]["referencedColumn"]
    >
  : ReferencedColumnMixed extends EntityRelationReferencedColumn
  ? EntityColumnTypeMapByNames<
      ReferencedEntity["driver"]["types"],
      ReferencedEntity["driver"]["options"]["entities"]["entities"],
      ReferencedEntity,
      ForceCastIfExtends<
        ReferencedColumnMixed,
        EntityRelationReferencedColumn
      >["referencedColumn"]
    >
  : EntityPrimaryColumnTypeMap<
      ReferencedEntity["driver"]["types"],
      ReferencedEntity["driver"]["options"]["entities"]["entities"],
      ReferencedEntity
    >