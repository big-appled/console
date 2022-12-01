import useActivePerspective from '@console/dynamic-plugin-sdk/src/perspective/useActivePerspective';
import { useModelFinder } from '@console/internal/module/k8s/k8s-models';
import { usePerspectives } from '@console/shared/src';
import { testHook } from '../../../../../__tests__/utils/hooks-utils';
import { usePinnedResources } from '../usePinnedResources';
import { useUserSettingsCompatibility } from '../useUserSettingsCompatibility';

const useActivePerspectiveMock = useActivePerspective as jest.Mock;
const usePerspectivesMock = usePerspectives as jest.Mock;
const useUserSettingsCompatibilityMock = useUserSettingsCompatibility as jest.Mock;
const useModelFinderMock = useModelFinder as jest.Mock;
const setPinnedResourcesMock = jest.fn();

jest.mock('@console/shared/src/hooks/perspective-utils', () => ({ usePerspectives: jest.fn() }));
jest.mock('@console/dynamic-plugin-sdk/src/perspective/useActivePerspective', () => ({
  default: jest.fn(),
}));
jest.mock('../useUserSettingsCompatibility', () => ({ useUserSettingsCompatibility: jest.fn() }));
jest.mock('@console/internal/module/k8s/k8s-models', () => ({ useModelFinder: jest.fn() }));

describe('usePinnedResources', () => {
  beforeEach(() => {
    // Return default perspective
    useActivePerspectiveMock.mockClear();
    useActivePerspectiveMock.mockReturnValue(['admin']);

    // Return defaultPins for dev perspective extension
    usePerspectivesMock.mockClear();
    usePerspectivesMock.mockReturnValue([
      {
        type: 'Perspective',
        properties: {
          id: 'dev',
          name: 'Developer',
          defaultPins: [{ kind: 'ConfigMap' }, { kind: 'Secret' }],
        },
      },
    ]);

    useModelFinderMock.mockReturnValue({
      findModel: () => ({ kind: 'Deployment' }),
    });
    useUserSettingsCompatibilityMock.mockClear();
    setPinnedResourcesMock.mockClear();
  });

  it('returns an empty array if user settings are not loaded yet', async () => {
    window.SERVER_FLAGS.perspectives =
      '[{ "id" : "dev", "visibility": {"state" : "Enabled" }, "pinnedResources" : [{"version" : "v1", "resource" : "deployments"}]}]';
    // Mock user settings
    useUserSettingsCompatibilityMock.mockReturnValue([null, setPinnedResourcesMock, false]);

    const { result } = testHook(() => usePinnedResources());

    // Expect empty data and loaded=false
    expect(result.current).toEqual([[], expect.any(Function), false]);

    // Setter was not used
    expect(setPinnedResourcesMock).toHaveBeenCalledTimes(0);
  });

  it('returns no default pins if there are no other pins defined and no extension could be found', async () => {
    window.SERVER_FLAGS.perspectives = '[{ "id" : "dev", "visibility": {"state" : "Enabled" }}]';
    // Mock empty old data
    useUserSettingsCompatibilityMock.mockReturnValue([{}, setPinnedResourcesMock, true]);

    const { result } = testHook(() => usePinnedResources());

    // Expect empty array
    expect(result.current).toEqual([[], expect.any(Function), true]);

    // Setter was not used
    expect(setPinnedResourcesMock).toHaveBeenCalledTimes(0);
  });

  it('returns some default pins if there are no other pins defined and the extension has default pins', async () => {
    window.SERVER_FLAGS.perspectives = '[{ "id" : "dev", "visibility": {"state" : "Enabled" }}]';
    // Mock empty old data
    useActivePerspectiveMock.mockReturnValue(['dev']);
    useUserSettingsCompatibilityMock.mockImplementation((configKey, storageKey, defaultPins) => [
      defaultPins,
      setPinnedResourcesMock,
      true,
    ]);

    const { result } = testHook(() => usePinnedResources());

    // Expect default pins
    expect(result.current).toEqual([
      ['core~~ConfigMap', 'core~~Secret'],
      expect.any(Function),
      true,
    ]);

    // Setter was not used
    expect(setPinnedResourcesMock).toHaveBeenCalledTimes(0);
  });

  it('returns customized pins if the pins are not customized by the user and the extension has default pins', async () => {
    window.SERVER_FLAGS.perspectives =
      '[{ "id" : "dev", "visibility": {"state" : "Enabled" }, "pinnedResources" : [{"version" : "v1", "resource" : "deployments", "group": "apps"}]}]';
    // Mock empty old data
    useActivePerspectiveMock.mockReturnValue(['dev']);
    useUserSettingsCompatibilityMock.mockImplementation((configKey, storageKey, defaultPins) => [
      defaultPins,
      setPinnedResourcesMock,
      true,
    ]);

    const { result } = testHook(() => usePinnedResources());

    // Expect pins customized by the admin
    expect(result.current).toEqual([['apps~v1~Deployment'], expect.any(Function), true]);

    // Setter was not used
    expect(setPinnedResourcesMock).toHaveBeenCalledTimes(0);
  });

  it('returns an array of pins saved in user settings for the current perspective', async () => {
    window.SERVER_FLAGS.perspectives =
      '[{ "id" : "dev", "visibility": {"state" : "Enabled" }, "pinnedResources" : [{"version" : "v1", "resource" : "deployments"}]}]';
    // Mock user settings data
    useActivePerspectiveMock.mockReturnValue(['dev']);
    useUserSettingsCompatibilityMock.mockReturnValue([
      { dev: ['ConfigMap', 'Secret', 'AnotherResource'] },
      setPinnedResourcesMock,
      true,
    ]);

    const { result } = testHook(() => usePinnedResources());

    // Expect pins from user settings
    expect(result.current).toEqual([
      ['ConfigMap', 'Secret', 'AnotherResource'],
      expect.any(Function),
      true,
    ]);

    // Setter was not used
    expect(setPinnedResourcesMock).toHaveBeenCalledTimes(0);
  });
});
