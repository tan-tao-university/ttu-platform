import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpsertContentTranslationDto } from '../../../src/content/dto/upsert-content-translation.dto';

async function validateDto(overrides: Partial<UpsertContentTranslationDto>) {
  const dto = plainToInstance(UpsertContentTranslationDto, {
    slug: 'test-article',
    path: '/tin-tuc/test-article',
    title: 'Test article',
    body: { type: 'doc' },
    ...overrides,
  });
  return validate(dto);
}

describe('UpsertContentTranslationDto', () => {
  it('accepts a well-formed slug and path', async () => {
    expect(await validateDto({})).toHaveLength(0);
  });

  it.each(['Test-Article', 'test_article', 'test article', '-leading-hyphen', ''])(
    'rejects slug %p',
    async (slug) => {
      const errors = await validateDto({ slug });
      expect(errors.some((e) => e.property === 'slug')).toBe(true);
    },
  );

  it.each([
    'tin-tuc/test-article', // doc 05 §17: path must start with "/"
    '/tin-tuc?foo=bar', // no query string
    '/tin-tuc#section', // no hash
  ])('rejects path %p', async (path) => {
    const errors = await validateDto({ path });
    expect(errors.some((e) => e.property === 'path')).toBe(true);
  });

  it('rejects a body that is not an object', async () => {
    const errors = await validateDto({ body: 'not an object' as never });
    expect(errors.some((e) => e.property === 'body')).toBe(true);
  });
});
