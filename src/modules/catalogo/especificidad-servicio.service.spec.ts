import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CriterioAplicacionEntity } from '../estandar/entities/criterio-aplicacion.entity';
import { ServicioHabilitadoEntity } from '../prestador/entities/servicio-habilitado.entity';
import { EspecificidadServicioEntity } from './entities/especificidad-servicio.entity';
import { ServicioCatalogoEntity } from './entities/servicio-catalogo.entity';
import { EspecificidadServicioService } from './especificidad-servicio.service';

describe('EspecificidadServicioService', () => {
  let service: EspecificidadServicioService;
  let especificidadRepo: jest.Mocked<Repository<EspecificidadServicioEntity>>;
  let servicioRepo: jest.Mocked<Repository<ServicioCatalogoEntity>>;
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
            if (entity === EspecificidadServicioEntity) return especificidadRepo;
            return especificidadRepo;
          },
        }),
      ),
    };

    especificidadRepo = {
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ ...x, id: 5 })),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<EspecificidadServicioEntity>>;

    servicioRepo = { exists: jest.fn() } as unknown as jest.Mocked<Repository<ServicioCatalogoEntity>>;
    auditoriaService = { log: jest.fn() } as unknown as jest.Mocked<AuditoriaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspecificidadServicioService,
        { provide: getRepositoryToken(EspecificidadServicioEntity), useValue: especificidadRepo },
        { provide: getRepositoryToken(ServicioCatalogoEntity), useValue: servicioRepo },
        { provide: getRepositoryToken(ServicioHabilitadoEntity), useValue: { exists: jest.fn() } },
        { provide: getRepositoryToken(CriterioAplicacionEntity), useValue: { exists: jest.fn() } },
        { provide: AuditoriaService, useValue: auditoriaService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(EspecificidadServicioService);
  });

  it('409 si combinación servicio+codigo duplicada', async () => {
    servicioRepo.exists.mockResolvedValue(true);
    especificidadRepo.findOne.mockResolvedValue({
      id: 2,
      servicioCatalogoId: 2,
      codigo: 'CARDIO-INT',
    } as EspecificidadServicioEntity);

    await expect(
      service.create(
        {
          servicio_catalogo_id: 2,
          codigo: 'cardio-int',
          nombre: 'Dup',
        },
        user,
        meta,
      ),
    ).rejects.toMatchObject({
      response: { code: 'ESPECIFICIDAD_CONFLICT' },
      status: HttpStatus.CONFLICT,
    });
  });

  it('registra auditoría al crear especificidad', async () => {
    servicioRepo.exists.mockResolvedValue(true);
    especificidadRepo.findOne.mockResolvedValue(null);

    await service.create(
      {
        servicio_catalogo_id: 2,
        codigo: 'CARDIO-INT',
        nombre: 'Cardio',
      },
      user,
      meta,
    );

    expect(auditoriaService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        tablaAfectada: 'especificidad_servicio',
        accion: 'CREATE',
      }),
      expect.anything(),
    );
  });
});
