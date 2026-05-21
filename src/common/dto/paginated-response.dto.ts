export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], total: number, page: number, size: number) {
    this.data = data;
    this.meta = {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size) || 0,
    };
  }
}
