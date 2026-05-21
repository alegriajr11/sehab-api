import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CriterioAplicacionEntity } from '../estandar/entities/criterio-aplicacion.entity';
import { PlanVisitasDetalleEntity } from '../planificacion/entities/plan-visitas-detalle.entity';
import { ServicioHabilitadoEntity } from '../prestador/entities/servicio-habilitado.entity';
import { GrupoServicioEntity } from './entities/grupo-servicio.entity';
import { ServicioCatalogoEntity } from './entities/servicio-catalogo.entity';
import { ServicioCatalogoService } from './servicio-catalogo.service';

describe('ServicioCatalogoService', () => {
  let service: ServicioCatalogoService;
  let servicioRepo: jest.Mocked<Repository<ServicioCatalogoEntity>>;
  let grupoRepo: jest.Mocked<Repository<GrupoServicioEntity>>;
  let habilitadoRepo: jest.Mocked<Repository<ServicioHabilitadoEntity>>;
  let auditoriaService: jest.Mocked<AuditoriaService>;
  let dataSource: { transaction: jest.Mock };

  const user = {
    id: 1,
    email: 'admin@test.com',
    nombre: 'Admin',
    rolId: 1,
    rolNombre: 'ADMIN' as const,
  };
  const meta = { ip: '127.0.0.1' };

  beforeEach(async () => {
    dataSource = {
      transaction: jest.fn((cb) =>
        cb({
          getRepository: (entity: unknown) => {
            if (entity === ServicioCatalogoEntity) return servicioRepo;
            if (entity === ServicioHabilitadoEntity) return habilitadoRepo;
            return servicioRepo;
          },
        }),
      ),
    };

    servicioRepo = {
      findOne: jest.fn(),
      exists: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ ...x, id: 10 })),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<ServicioCatalogoEntity>>;

    grupoRepo = { exists: jest.fn() } as unknown as jest.Mocked<Repository<GrupoServicioEntity>>;
    habilitadoRepo = { exists: jest.fn() } as unknown as jest.Mocked<Repository<ServicioHabilitadoEntity>>;

    auditoriaService = { log: jest.fn() } as unknown as jest.Mocked<AuditoriaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicioCatalogoService,
        { provide: getRepositoryToken(ServicioCatalogoEntity), useValue: servicioRepo },
        { provide: getRepositoryToken(GrupoServicioEntity), useValue: grupoRepo },
        { provide: getRepositoryToken(ServicioHabilitadoEntity), useValue: habilitadoRepo },
        { provide: getRepositoryToken(CriterioAplicacionEntity), useValue: { exists: jest.fn() } },
        { provide: getRepositoryToken(PlanVisitasDetalleEntity), useValue: { exists: jest.fn() } },
        { provide: AuditoriaService, useValue: auditoriaService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(ServicioCatalogoService);
  });

  it('409 si codigo_reps duplicado', async () => {
    grupoRepo.exists.mockResolvedValue(true);
    servicioRepo.findOne.mockResolvedValue({
      id: 99,
      codigoReps: 'REPS-1234',
    } as ServicioCatalogoEntity);

    await expect(
      service.create(
        {
          grupo_servicio_id: 1,
          codigo_reps: 'reps-1234',
          nombre: 'Test',
        },
        user,
        meta,
      ),
    ).rejects.toMatchObject({
      response: { code: 'SERVICE_CODE_CONFLICT' },
      status: HttpStatus.CONFLICT,
    });
  });

  it('400 si grupo no existe', async () => {
    grupoRepo.exists.mockResolvedValue(false);
    await expect(
      service.create(
        { grupo_servicio_id: 999, codigo_reps: 'REPS-NEW', nombre: 'Nuevo' },
        user,
        meta,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('409 al eliminar servicio en uso', async () => {
    servicioRepo.findOne.mockResolvedValue({
      id: 1,
      codigoReps: 'REPS-1',
    } as ServicioCatalogoEntity);
    habilitadoRepo.exists.mockResolvedValue(true);

    await expect(service.remove(1, user, meta)).rejects.toMatchObject({
      response: { code: 'SERVICE_IN_USE' },
      status: HttpStatus.CONFLICT,
    });
    expect(servicioRepo.remove).not.toHaveBeenCalled();
  });

  it('registra auditoría al crear', async () => {
    grupoRepo.exists.mockResolvedValue(true);
    servicioRepo.findOne.mockResolvedValue(null);

    await service.create(
      {
        grupo_servicio_id: 1,
        codigo_reps: 'REPS-NEW',
        nombre: 'Nuevo servicio',
      },
      user,
      meta,
    );

    expect(auditoriaService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        tablaAfectada: 'servicio_catalogo',
        accion: 'CREATE',
      }),
      expect.anything(),
    );
  });
});
