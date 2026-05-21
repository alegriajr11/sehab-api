import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_SEED_DATA } from './data/roles.seed-data';
import { RolesSeedService } from './roles-seed.service';
import { RolEntity } from '../usuario/entities/rol.entity';

describe('RolesSeedService', () => {
  let service: RolesSeedService;
  let rolRepository: jest.Mocked<Repository<RolEntity>>;

  beforeEach(async () => {
    rolRepository = {
      exists: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ ...x, id: 1 })),
    } as unknown as jest.Mocked<Repository<RolEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesSeedService,
        { provide: getRepositoryToken(RolEntity), useValue: rolRepository },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => ({ rolesOnBoot: true })),
          },
        },
      ],
    }).compile();

    service = module.get(RolesSeedService);
  });

  it('debe crear solo los roles que no existen', async () => {
    rolRepository.exists
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    const result = await service.seedRoles();

    expect(result.created).toBe(ROLES_SEED_DATA.length - 1);
    expect(result.skipped).toBe(1);
    expect(rolRepository.save).toHaveBeenCalledTimes(ROLES_SEED_DATA.length - 1);
  });

  it('no debe crear ningún rol si todos existen', async () => {
    rolRepository.exists.mockResolvedValue(true);

    const result = await service.seedRoles();

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(ROLES_SEED_DATA.length);
    expect(rolRepository.save).not.toHaveBeenCalled();
  });
});
