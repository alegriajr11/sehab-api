import {
  ComplejidadEntity,
  DepartamentoEntity,
  EspecificidadServicioEntity,
  GrupoServicioEntity,
  ModalidadServicioEntity,
  MunicipioEntity,
  ServicioCatalogoEntity,
} from '../../modules/catalogo/entities';
import {
  PrestadorEntity,
  SedeEntity,
  ServicioHabilitadoEntity,
} from '../../modules/prestador/entities';
import {
  CapacidadInstaladaEntity,
  CapacidadMovimientoEntity,
  CapacidadTipoEntity,
} from '../../modules/capacidad/entities';
import {
  CriterioAplicacionEntity,
  CriterioEntity,
  CriterioVersionEntity,
  EstandarEntity,
} from '../../modules/estandar/entities';
import {
  ActaFirmaEntity,
  ActaVisitaEntity,
  AutoevaluacionEntity,
  AutoevaluacionItemEntity,
  VisitaEntity,
  VisitaParticipanteEntity,
  VisitaResultadoItemEntity,
} from '../../modules/evaluacion/entities';
import {
  PlanVisitasDetalleEntity,
  PlanVisitasEntity,
} from '../../modules/planificacion/entities';
import { NovedadEntity } from '../../modules/novedad/entities';
import {
  CertificadoHabilitacionEntity,
  DistintivoHabilitacionEntity,
} from '../../modules/certificado/entities';
import { MediaEntity } from '../../modules/media/entities';
import {
  AuditoriaEntity,
  RolEntity,
  UsuarioEntity,
} from '../../modules/usuario/entities';
import {
  ActividadCriterioEntity,
  ActividadEntity,
} from '../../modules/pamec/entities';
import { FirmaDigitalEntity } from '../../modules/firma/entities';

/**
 * Registro central de entidades para TypeORM (migraciones y conexión).
 */
export const sehabEntities = [
  DepartamentoEntity,
  MunicipioEntity,
  GrupoServicioEntity,
  ServicioCatalogoEntity,
  ModalidadServicioEntity,
  ComplejidadEntity,
  EspecificidadServicioEntity,
  PrestadorEntity,
  SedeEntity,
  ServicioHabilitadoEntity,
  CapacidadTipoEntity,
  CapacidadInstaladaEntity,
  CapacidadMovimientoEntity,
  EstandarEntity,
  CriterioEntity,
  CriterioVersionEntity,
  CriterioAplicacionEntity,
  AutoevaluacionEntity,
  AutoevaluacionItemEntity,
  VisitaEntity,
  VisitaParticipanteEntity,
  ActaVisitaEntity,
  ActaFirmaEntity,
  VisitaResultadoItemEntity,
  PlanVisitasEntity,
  PlanVisitasDetalleEntity,
  NovedadEntity,
  CertificadoHabilitacionEntity,
  DistintivoHabilitacionEntity,
  MediaEntity,
  RolEntity,
  UsuarioEntity,
  AuditoriaEntity,
  ActividadEntity,
  ActividadCriterioEntity,
  FirmaDigitalEntity,
];
