import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { MunicipioService } from './municipio.service';
import { DepartamentoEntity } from './entities/departamento.entity';
import { MunicipioEntity } from './entities/municipio.entity';

describe('MunicipioService', () => {
  let service: MunicipioService;
  let municipioRepo: jest.Mocked<Repository<MunicipioEntity>>;
  let departamentoRepo: jest.Mocked<Repository<DepartamentoEntity>>;
  let auditoriaService: jest.Mocked<AuditoriaService>;
  let dataSource: { transaction: jest.Mock };

  const user = {
    id: 1,
    email: 'admin@sehab.gov.co',
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
            if (entity === MunicipioEntity) return municipioRepo;
            return municipioRepo;
          },
        }),
      ),
    };

    municipioRepo = {
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ ...x, id: 5 })),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<MunicipioEntity>>;

    departamentoRepo = {
      exists: jest.fn(),
    } as unknown as jest.Mocked<Repository<DepartamentoEntity>>;

    auditoriaService = { log: jest.fn() } as unknown as jest.Mocked<AuditoriaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MunicipioService,
        { provide: getRepositoryToken(MunicipioEntity), useValue: municipioRepo },
        { provide: getRepositoryToken(DepartamentoEntity), useValue: departamentoRepo },
        { provide: AuditoriaService, useValue: auditoriaService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(MunicipioService);
  });

  it('debe lanzar 400 si departamento no existe', async () => {
    departamentoRepo.exists.mockResolvedValue(false);

    await expect(
      service.create(
        {
          departamento_id: 999,
          nombre: 'Mocoa',
          codigo_dane: '86001',
        },
        user,
        meta,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('debe lanzar 409 si codigo_dane duplicado', async () => {
    departamentoRepo.exists.mockResolvedValue(true);
    municipioRepo.findOne.mockResolvedValue({
      id: 2,
      codigoDane: '00086001',
    } as MunicipioEntity);

    await expect(
      service.create(
        { departamento_id: 1, nombre: 'Mocoa', codigo_dane: '86001' },
        user,
        meta,
      ),
    ).rejects.toMatchObject({
      response: { code: 'DANE_CONFLICT' },
      status: HttpStatus.CONFLICT,
    });
  });

  it('debe registrar auditoría al crear municipio', async () => {
    departamentoRepo.exists.mockResolvedValue(true);
    municipioRepo.findOne.mockResolvedValue(null);
    municipioRepo.save.mockResolvedValue({
      id: 5,
      departamentoId: 1,
      nombre: 'Mocoa',
      codigoDane: '00086001',
    } as MunicipioEntity);

    await service.create(
      { departamento_id: 1, nombre: 'Mocoa', codigo_dane: '86001' },
      user,
      meta,
    );

    expect(auditoriaService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        tablaAfectada: 'municipio',
        accion: 'CREATE',
      }),
      expect.anything(),
    );
  });

  it('debe lanzar NotFoundException al buscar inexistente', async () => {
    municipioRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });
});
