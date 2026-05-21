import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { DepartamentoService } from './departamento.service';
import { DepartamentoEntity } from './entities/departamento.entity';
import { MunicipioEntity } from './entities/municipio.entity';

describe('DepartamentoService', () => {
  let service: DepartamentoService;
  let departamentoRepo: jest.Mocked<Repository<DepartamentoEntity>>;
  let municipioRepo: jest.Mocked<Repository<MunicipioEntity>>;
  let auditoriaService: jest.Mocked<AuditoriaService>;
  let dataSource: { transaction: jest.Mock };

  const user = {
    id: 1,
    email: 'admin@sehab.gov.co',
    nombre: 'Admin',
    rolId: 1,
    rolNombre: 'ADMIN' as const,
  };

  const meta = { ip: '127.0.0.1', userAgent: 'jest' };

  beforeEach(async () => {
    dataSource = {
      transaction: jest.fn((cb) =>
        cb({
          getRepository: (entity: unknown) => {
            if (entity === DepartamentoEntity) return departamentoRepo;
            if (entity === MunicipioEntity) return municipioRepo;
            return departamentoRepo;
          },
        }),
      ),
    };

    departamentoRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ ...x, id: 1 })),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<DepartamentoEntity>>;

    municipioRepo = {
      count: jest.fn(),
    } as unknown as jest.Mocked<Repository<MunicipioEntity>>;

    auditoriaService = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditoriaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartamentoService,
        { provide: getRepositoryToken(DepartamentoEntity), useValue: departamentoRepo },
        { provide: getRepositoryToken(MunicipioEntity), useValue: municipioRepo },
        { provide: AuditoriaService, useValue: auditoriaService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(DepartamentoService);
  });

  it('debe lanzar 409 si codigo_dane duplicado al crear', async () => {
    departamentoRepo.findOne.mockResolvedValue({
      id: 99,
      nombre: 'Otro',
      codigoDane: '00086',
    } as DepartamentoEntity);

    await expect(
      service.create({ nombre: 'Putumayo', codigo_dane: '86' }, user, meta),
    ).rejects.toMatchObject({
      response: {
        code: 'DANE_CONFLICT',
      },
      status: HttpStatus.CONFLICT,
    });
    expect(auditoriaService.log).not.toHaveBeenCalled();
  });

  it('debe lanzar 409 al eliminar departamento con municipios', async () => {
    departamentoRepo.findOne.mockResolvedValue({
      id: 1,
      nombre: 'Putumayo',
      codigoDane: '00086',
    } as DepartamentoEntity);
    municipioRepo.count.mockResolvedValue(2);

    await expect(service.remove(1, user, meta)).rejects.toMatchObject({
      response: { code: 'DEPARTMENT_HAS_MUNICIPALITIES' },
      status: HttpStatus.CONFLICT,
    });
  });

  it('debe registrar auditoría al crear departamento', async () => {
    departamentoRepo.findOne.mockResolvedValue(null);
    departamentoRepo.save.mockResolvedValue({
      id: 10,
      nombre: 'Putumayo',
      codigoDane: '00086',
    } as DepartamentoEntity);

    const result = await service.create(
      { nombre: 'Putumayo', codigo_dane: '86' },
      user,
      meta,
    );

    expect(result.id).toBe(10);
    expect(auditoriaService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        tablaAfectada: 'departamento',
        accion: 'CREATE',
        usuarioId: 1,
      }),
      expect.anything(),
    );
  });

  it('debe lanzar NotFoundException si no existe', async () => {
    departamentoRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
