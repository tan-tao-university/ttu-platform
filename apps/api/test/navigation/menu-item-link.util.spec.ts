import { ApiError } from '@/common/http/api-error';
import { assertValidLinkTarget, resolveMenuItemHref } from '@/navigation/menu-item-link.util';

describe('assertValidLinkTarget', () => {
  it.each([
    { linkType: 'PAGE' as const, pageId: 'page-1' },
    { linkType: 'CONTENT' as const, contentId: 'content-1' },
    { linkType: 'EXTERNAL' as const, externalUrl: 'https://ttu.edu.vn' },
    { linkType: 'CUSTOM_PATH' as const },
    { linkType: 'GROUP' as const },
  ])('accepts a well-formed $linkType item', (dto) => {
    expect(() => assertValidLinkTarget(dto)).not.toThrow();
  });

  it.each(['PAGE', 'CONTENT', 'EXTERNAL'] as const)(
    'rejects a %s item missing its required target field',
    (linkType) => {
      expect(() => assertValidLinkTarget({ linkType })).toThrow(ApiError);
    },
  );

  it.each([
    { linkType: 'PAGE' as const, contentId: 'content-1' },
    { linkType: 'CONTENT' as const, externalUrl: 'https://ttu.edu.vn' },
    { linkType: 'EXTERNAL' as const, pageId: 'page-1' },
    { linkType: 'CUSTOM_PATH' as const, pageId: 'page-1' },
    { linkType: 'GROUP' as const, contentId: 'content-1' },
  ])('rejects a $linkType item carrying a target field for a different link type', (dto) => {
    expect(() => assertValidLinkTarget(dto)).toThrow(ApiError);
  });

  it('rejects a PAGE item that also sets externalUrl, even with pageId present', () => {
    expect(() =>
      assertValidLinkTarget({ linkType: 'PAGE', pageId: 'page-1', externalUrl: 'https://x.com' }),
    ).toThrow(ApiError);
  });
});

describe('resolveMenuItemHref', () => {
  it('resolves EXTERNAL to its externalUrl, ignoring resolvedPath', () => {
    const href = resolveMenuItemHref(
      { linkType: 'EXTERNAL', externalUrl: 'https://ttu.edu.vn' },
      { customPath: null },
      '/some/unrelated/path',
    );
    expect(href).toBe('https://ttu.edu.vn');
  });

  it('resolves CUSTOM_PATH to the translation customPath', () => {
    const href = resolveMenuItemHref(
      { linkType: 'CUSTOM_PATH', externalUrl: null },
      { customPath: '/tuyen-sinh' },
      null,
    );
    expect(href).toBe('/tuyen-sinh');
  });

  it.each(['CONTENT', 'PAGE'] as const)(
    'resolves %s to the resolved public_routes path when published',
    (linkType) => {
      const href = resolveMenuItemHref(
        { linkType, externalUrl: null },
        { customPath: null },
        '/tin-tuc/khai-giang',
      );
      expect(href).toBe('/tin-tuc/khai-giang');
    },
  );

  it.each(['CONTENT', 'PAGE'] as const)(
    'resolves %s to null when the target has not been published yet',
    (linkType) => {
      const href = resolveMenuItemHref({ linkType, externalUrl: null }, { customPath: null }, null);
      expect(href).toBeNull();
    },
  );

  it('resolves GROUP to null regardless of any other field', () => {
    const href = resolveMenuItemHref(
      { linkType: 'GROUP', externalUrl: 'https://ignored.example' },
      { customPath: '/ignored' },
      '/ignored',
    );
    expect(href).toBeNull();
  });
});
