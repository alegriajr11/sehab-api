import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppRole } from '../../common/constants/app-role.constant';
import { AdminUserSeedService } from './admin-user-seed.service';
import { RolEntity } from '../usuario/entities/rol.entity';
import { UsuarioEntity } from '../usuario/entities/usuario.entity';

describe('AdminUserSeedService', () => {
  let service: AdminUserSeedService;
  let usuarioRepository: jest.Mocked<Repository<UsuarioEntity>>;
  let rolRepository: jest.Mocked<Repository<RolEntity>>;
  let queryBuilder: {
    innerJoin: jest.Mock;
    where: jest.Mock;
    getExists: jest.Mock;
  };

  const seedConfig = {
    adminOnBoot: true,
    adminNombre: 'Samir Alegria',
    adminEmail: 'edwar.alegria@hotmail.com',
    adminPassword: 'Samir11*',
    adminTelefono: '3142458160',
  };

  beforeEach(async () => {
    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getExists: jest.fn(),
    };

    usuarioRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      exists: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ ...x, id: 1 })),
    } as unknown as jest.Mocked<Repository<UsuarioEntity>>;

    rolRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        nombre: AppRole.ADMIN,
      } as RolEntity),
    } as unknown as jest.Mocked<Repository<RolEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserSeedService,
        { provide: getRepositoryToken(UsuarioEntity), useValue: usuarioRepository },
        { provide: getRepositoryToken(RolEntity), useValue: rolRepository },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => seedConfig),
          },
        },
      ],
    }).compile();

    service = module.get(AdminUserSeedService);
  });

  it('debe omitir si ya existe un usuario ADMIN', async () => {
    queryBuilder.getExists.mockResolvedValue(true);

    const result = await service.seedAdminUser();

    expect(result).toBe('skipped');
    expect(usuarioRepository.save).not.toHaveBeenCalled();
  });

  it('debe crear usuario ADMIN si no existe ninguno', async () => {
    queryBuilder.getExists.mockResolvedValue(false);
    usuarioRepository.exists.mockResolvedValue(false);

    const result = await service.seedAdminUser();

    expect(result).toBe('created');
    expect(usuarioRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'edwar.alegria@hotmail.com',
        nombre: 'Samir Alegria',
        rolId: 1,
        activo: true,
      }),
    );
  });

  it('debe omitir si el correo ya está en uso', async () => {
    queryBuilder.getExists.mockResolvedValue(false);
    usuarioRepository.exists.mockResolvedValue(true);

    const result = await service.seedAdminUser();

    expect(result).toBe('skipped');
    expect(usuarioRepository.save).not.toHaveBeenCalled();
  });
});
