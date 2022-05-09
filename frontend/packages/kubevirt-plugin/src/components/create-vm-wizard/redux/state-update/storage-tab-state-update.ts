import {
  AccessMode,
  CLOUDINIT_DISK,
  LABEL_CDROM_SOURCE,
  ROOT_DISK_INSTALL_NAME,
  ROOT_DISK_NAME,
  VolumeMode,
} from '../../../../constants';
import { DiskBus } from '../../../../constants/vm/storage/disk-bus';
import { DiskType } from '../../../../constants/vm/storage/disk-type';
import { winToolsContainerNames } from '../../../../constants/vm/wintools';
import { DataVolumeWrapper } from '../../../../k8s/wrapper/vm/data-volume-wrapper';
import { DiskWrapper } from '../../../../k8s/wrapper/vm/disk-wrapper';
import { VolumeWrapper } from '../../../../k8s/wrapper/vm/volume-wrapper';
import {
  SourceRefActions,
  SourceRefActionsNames,
} from '../../../../redux/actions/sourceRef-actions';
import { ValidationErrorType } from '../../../../selectors';
import {
  getDataVolumeAccessModes,
  getDataVolumeStorageClassName,
  getDataVolumeVolumeMode,
} from '../../../../selectors/dv/selectors';
import { iGetRelevantTemplate } from '../../../../selectors/immutable/template/combined';
import { isWindowsTemplate } from '../../../../selectors/vm-template/advanced';
import { getVolumeContainerImage } from '../../../../selectors/vm/volume';
import { isWinToolsImage } from '../../../../selectors/vm/winimage';
import { V1alpha1DataVolume } from '../../../../types/api/V1alpha1DataVolume';
import { toShallowJS } from '../../../../utils/immutable';
import { getEmptyAdditionalStorage, getEmptyInstallStorage } from '../../../../utils/storage';
import { getNextIDResolver } from '../../../../utils/utils';
import { TemplateValidations } from '../../../../utils/validations/template/template-validations';
import { StorageUISource } from '../../../modals/disk-modal/storage-ui-source';
import {
  getInitialData,
  iGetCommonData,
  iGetLoadedCommonData,
} from '../../selectors/immutable/selectors';
import {
  hasStoragesChanged,
  iGetProvisionSourceAdditionalStorage,
  iGetProvisionSourceStorage,
  iGetStorages,
} from '../../selectors/immutable/storage';
import {
  hasVMSettingsValueChanged,
  iGetRelevantTemplateSelectors,
  iGetVmSettingValue,
} from '../../selectors/immutable/vm-settings';
import { getStorages, getV2VConfigMap } from '../../selectors/selectors';
import { getTemplateValidation } from '../../selectors/template';
import { VMSettingsField, VMWizardProps, VMWizardStorage, VMWizardStorageType } from '../../types';
import {
  getNewProvisionSourceStorage,
  windowsToolsStorage,
} from '../initial-state/storage-tab-initial-state';
import { vmWizardInternalActions } from '../internal-actions';
import { InternalActionType, UpdateOptions } from '../types';

export const prefillInitialDiskUpdater = ({ id, prevState, dispatch, getState }: UpdateOptions) => {
  const state = getState();
  const [, dataSourcesLoaded] = iGetCommonData(state, id, VMWizardProps.dataSources);
  const [, pvcsLoaded] = iGetCommonData(state, id, VMWizardProps.pvcs);
  if (
    !hasVMSettingsValueChanged(
      prevState,
      state,
      id,
      VMSettingsField.OPERATING_SYSTEM,
      VMSettingsField.FLAVOR,
      VMSettingsField.WORKLOAD_PROFILE,
      VMSettingsField.CLONE_COMMON_BASE_DISK_IMAGE,
      VMSettingsField.PROVISION_SOURCE_TYPE,
    ) &&
    !dataSourcesLoaded &&
    !pvcsLoaded
  ) {
    return;
  }

  const iOldSourceStorage = iGetProvisionSourceStorage(state, id);
  const oldSourceStorage: VMWizardStorage = iOldSourceStorage && iOldSourceStorage.toJSON();

  // Depends on OPERATING_SYSTEM CLONE_COMMON_BASE_DISK_IMAGE PROVISION_SOURCE_TYPE FLAVOR USER_TEMPLATE and WORKLOAD_PROFILE
  dispatch(SourceRefActions[SourceRefActionsNames.clearValues]());
  const newSourceStorage = getNewProvisionSourceStorage(state, id);
  if (newSourceStorage?.sourceRef) {
    dispatch(SourceRefActions[SourceRefActionsNames.updateValue](newSourceStorage?.sourceRef));
  }
  const oldType =
    (oldSourceStorage &&
      StorageUISource.fromTypes(
        new VolumeWrapper(oldSourceStorage.volume).getType(),
        new DataVolumeWrapper(oldSourceStorage.dataVolume).getType(),
      )) ||
    null;

  const newType =
    (newSourceStorage &&
      StorageUISource.fromTypes(
        new VolumeWrapper(newSourceStorage.volume).getType(),
        new DataVolumeWrapper(newSourceStorage.dataVolume).getType(),
      )) ||
    null;

  const baseDiskImageChanged =
    newSourceStorage?.dataVolume?.spec?.source?.pvc?.name !==
      oldSourceStorage?.dataVolume?.spec?.source?.pvc?.name &&
    newSourceStorage?.dataVolume?.spec?.source?.pvc?.namespace !==
      oldSourceStorage?.dataVolume?.spec?.source?.pvc?.namespace;

  if (newType !== oldType || baseDiskImageChanged) {
    const additionalStorage = iGetProvisionSourceAdditionalStorage(state, id)?.toJSON();
    const isCdRom = iGetVmSettingValue(state, id, VMSettingsField.IS_CDROM_BOOT_SOURCE);
    if (!newSourceStorage) {
      if (additionalStorage && !isCdRom) {
        dispatch(
          vmWizardInternalActions[InternalActionType.RemoveStorage](id, additionalStorage.id),
        );
      }
      // not a template provision source
      if (oldSourceStorage && oldSourceStorage.type === VMWizardStorageType.PROVISION_SOURCE_DISK) {
        dispatch(
          vmWizardInternalActions[InternalActionType.RemoveStorage](id, oldSourceStorage.id),
        );
      }
    } else {
      const iStorageClassConfigMap = iGetLoadedCommonData(
        state,
        id,
        VMWizardProps.storageClassConfigMap,
      );
      const idResolver = getNextIDResolver(getStorages(state, id));
      dispatch(
        vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
          id: oldSourceStorage ? oldSourceStorage.id : idResolver(),
          ...newSourceStorage,
        }),
      );
      if (newSourceStorage.disk.cdrom && !additionalStorage) {
        const emptyDisk = {
          id: idResolver(),
          type: VMWizardStorageType.PROVISION_SOURCE_ADDITIONAL_DISK,
          ...getEmptyInstallStorage(toShallowJS(iStorageClassConfigMap)),
        };

        dispatch(vmWizardInternalActions[InternalActionType.UpdateStorage](id, emptyDisk));
      } else if (additionalStorage && !isCdRom) {
        dispatch(
          vmWizardInternalActions[InternalActionType.RemoveStorage](id, additionalStorage.id),
        );
      }
    }
  }
};

const windowsToolsUpdater = ({ id, prevState, dispatch, getState }: UpdateOptions) => {
  const state = getState();
  if (iGetCommonData(state, id, VMWizardProps.isProviderImport)) {
    return;
  }
  if (!hasVMSettingsValueChanged(prevState, state, id, VMSettingsField.MOUNT_WINDOWS_GUEST_TOOLS)) {
    return;
  }
  const mountWindowsGuestTools = iGetVmSettingValue(
    state,
    id,
    VMSettingsField.MOUNT_WINDOWS_GUEST_TOOLS,
  );
  const windowsTools = getStorages(state, id).find((storage) => {
    const volumeImage = getVolumeContainerImage(storage.volume);
    return volumeImage && !!isWinToolsImage(volumeImage, getV2VConfigMap(state));
  });

  if (mountWindowsGuestTools && !windowsTools) {
    dispatch(
      vmWizardInternalActions[InternalActionType.UpdateStorage](
        id,
        windowsToolsStorage(winToolsContainerNames(getV2VConfigMap(state))),
      ),
    );
  }
  if (!mountWindowsGuestTools && windowsTools) {
    dispatch(vmWizardInternalActions[InternalActionType.RemoveStorage](id, windowsTools.id));
  }
};

export const internalStorageDiskBusUpdater = ({
  id,
  prevState,
  dispatch,
  getState,
}: UpdateOptions) => {
  const state = getState();

  // we care only about the first TemplateValidation because storage shows up after the first step
  const oldValidations = getTemplateValidation(prevState, id);
  let newValidations = getTemplateValidation(state, id);

  if (
    TemplateValidations.areBusesEqual(oldValidations, newValidations) &&
    !hasStoragesChanged(prevState, state, id)
  ) {
    return;
  }

  if (!newValidations) {
    newValidations = new TemplateValidations();
  }

  let someBusChanged = false;

  const updatedStorages = getStorages(state, id).map(({ type, disk, ...storageBundle }) => {
    let finalDisk = disk;
    if (
      [
        VMWizardStorageType.PROVISION_SOURCE_DISK,
        VMWizardStorageType.V2V_VMWARE_IMPORT,
        VMWizardStorageType.V2V_OVIRT_IMPORT,
        VMWizardStorageType.WINDOWS_GUEST_TOOLS,
      ].includes(type)
    ) {
      const diskWrapper = new DiskWrapper(disk);
      const diskType = diskWrapper.getType();
      const diskBus = diskWrapper.getDiskBus();
      const resultValidation = newValidations.validateBus(diskType, diskBus);
      if (!resultValidation.isValid && resultValidation.type === ValidationErrorType.Error) {
        someBusChanged = true;
        finalDisk = new DiskWrapper(disk, true)
          .appendTypeData({
            bus: newValidations.getDefaultBus(diskType).getValue(),
          })
          .asResource();
      }
    }

    return {
      ...storageBundle,
      type,
      disk: finalDisk,
    };
  });

  if (someBusChanged) {
    dispatch(vmWizardInternalActions[InternalActionType.SetStorages](id, updatedStorages));
  }
};

const initialStorageDiskUpdater = ({ id, prevState, dispatch, getState }: UpdateOptions) => {
  const state = getState();

  if (!hasStoragesChanged(prevState, state, id)) {
    return;
  }

  const provisionSourceStorage = iGetProvisionSourceStorage(state, id)?.toJSON();

  if (provisionSourceStorage) {
    const removableRootDisk = iGetStorages(state, id)
      ?.toJSON()
      ?.find(
        (disk) =>
          disk?.type === VMWizardStorageType.TEMPLATE && disk?.volume?.name !== CLOUDINIT_DISK,
      );

    removableRootDisk &&
      dispatch(
        vmWizardInternalActions[InternalActionType.RemoveStorage](id, removableRootDisk?.id),
      );
  }
};

const initialStorageClassUpdater = ({ id, prevState, dispatch, getState }: UpdateOptions) => {
  const state = getState();
  const provisionSourceStorage = iGetProvisionSourceStorage(state, id)?.toJSON();

  const { commonTemplateName } = iGetCommonData(state, id, VMWizardProps.initialData).toJSON();

  if (!hasStoragesChanged(prevState, state, id) || !commonTemplateName || !provisionSourceStorage) {
    return;
  }

  const accessMode = AccessMode.fromString(
    getDataVolumeAccessModes(provisionSourceStorage?.dataVolume),
  );
  const volumeMode = VolumeMode.fromString(
    getDataVolumeVolumeMode(provisionSourceStorage?.dataVolume),
  );

  if (volumeMode && accessMode && !provisionSourceStorage?.dataVolume?.spec?.source?.pvc) {
    const updatedStorage = new DataVolumeWrapper(provisionSourceStorage.dataVolume)
      .setVolumeMode(volumeMode)
      .setAccessModes([accessMode])
      .asResource();
    dispatch(
      vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
        ...provisionSourceStorage,
        dataVolume: updatedStorage,
      }),
    );
  }
};

const initialDefaultStorageClassUpdater = ({
  id,
  prevState,
  dispatch,
  getState,
}: UpdateOptions) => {
  const state = getState();

  if (
    !hasVMSettingsValueChanged(prevState, state, id, VMSettingsField.DEFAULT_STORAGE_CLASS) &&
    !hasStoragesChanged(prevState, state, id)
  ) {
    return;
  }

  const storageClassName =
    iGetCommonData(state, id, VMWizardProps.initialData)?.toJS()?.storageClass ||
    iGetVmSettingValue(state, id, VMSettingsField.DEFAULT_STORAGE_CLASS);

  if (storageClassName) {
    const iProvisionSourceStorage = iGetProvisionSourceStorage(state, id);
    const provisionSourceStorage: VMWizardStorage =
      iProvisionSourceStorage && iProvisionSourceStorage.toJSON();

    if (
      provisionSourceStorage?.dataVolume &&
      !getDataVolumeStorageClassName(provisionSourceStorage.dataVolume)
    ) {
      const updatedStorage = new DataVolumeWrapper(provisionSourceStorage.dataVolume)
        .setStorageClassName(storageClassName)
        .asResource();

      dispatch(
        vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
          ...provisionSourceStorage,
          dataVolume: updatedStorage,
        }),
      );
    }
  }
};

const initialStorageWindowsPVCUpdater = ({ id, prevState, dispatch, getState }: UpdateOptions) => {
  const state = getState();
  const relevantOptions = iGetRelevantTemplateSelectors(state, id);
  const iCommonTemplates = iGetLoadedCommonData(state, id, VMWizardProps.commonTemplates);
  const template = iCommonTemplates && iGetRelevantTemplate(iCommonTemplates, relevantOptions);
  const iStorageClassConfigMap = iGetLoadedCommonData(
    state,
    id,
    VMWizardProps.storageClassConfigMap,
  );

  if (!hasStoragesChanged(prevState, state, id)) {
    return;
  }
  const dataVolumes = iGetCommonData(state, id, VMWizardProps.dataVolumes).toJSON();
  const storages = getStorages(state, id);
  const removableRootDisk = storages?.find(
    ({ type, disk }) =>
      type === VMWizardStorageType.PROVISION_SOURCE_DISK &&
      disk?.name === ROOT_DISK_NAME &&
      !disk?.cdrom,
  );

  const isCdRom = dataVolumes.find((dv: V1alpha1DataVolume) => {
    const dvName = dv?.metadata?.name;
    const dvNamespace = dv?.metadata?.namespace;
    const rmRootDiskName = removableRootDisk?.dataVolume?.spec?.source?.pvc?.name;
    const rmRootDiskNamespace = removableRootDisk?.dataVolume?.spec?.source?.pvc?.namespace;

    return (
      dvName && dvNamespace && dvName === rmRootDiskName && dvNamespace === rmRootDiskNamespace
    );
  })?.metadata?.labels?.[LABEL_CDROM_SOURCE];

  if (isCdRom && removableRootDisk && iStorageClassConfigMap && template) {
    if (isWindowsTemplate(template.toJS())) {
      dispatch(
        vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
          id: getNextIDResolver(storages),
          type: VMWizardStorageType.PROVISION_SOURCE_ADDITIONAL_DISK,
          ...getEmptyInstallStorage(
            toShallowJS(iStorageClassConfigMap),
            DiskBus.fromString(removableRootDisk?.disk?.disk?.bus),
          ),
        }),
      );
    }
    const cdRomDisk = new DiskWrapper(removableRootDisk?.disk, true)
      .setType(DiskType.CDROM, { bus: removableRootDisk?.disk?.disk?.bus })
      .setName(ROOT_DISK_INSTALL_NAME)
      .asResource(true);
    removableRootDisk.volume = new VolumeWrapper(removableRootDisk.volume)
      .setName(ROOT_DISK_INSTALL_NAME)
      .asResource();
    dispatch(vmWizardInternalActions[InternalActionType.RemoveStorage](id, removableRootDisk?.id));
    dispatch(
      vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
        ...removableRootDisk,
        disk: cdRomDisk,
      }),
    );
  }
};

const initialStorageCdromImportUpdater = ({ id, prevState, dispatch, getState }: UpdateOptions) => {
  const state = getState();
  const isCdRom = getInitialData(state, id)?.source?.cdRom;

  if (!hasStoragesChanged(prevState, state, id)) {
    return;
  }
  const storages = getStorages(state, id);
  const rootCdRom = storages?.find(
    ({ type, disk }) =>
      type === VMWizardStorageType.PROVISION_SOURCE_DISK &&
      disk?.name === ROOT_DISK_NAME &&
      disk?.cdrom,
  );
  const rootProvisionAdditionalDisk = storages?.find(
    ({ type, disk }) =>
      type === VMWizardStorageType.PROVISION_SOURCE_ADDITIONAL_DISK &&
      disk?.name === ROOT_DISK_NAME,
  );

  if (rootCdRom && isCdRom) {
    const disk = new DiskWrapper(rootCdRom?.disk).setName(ROOT_DISK_INSTALL_NAME).asResource();
    const volume = new VolumeWrapper(rootCdRom.volume).setName(ROOT_DISK_INSTALL_NAME).asResource();
    dispatch(
      vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
        ...rootProvisionAdditionalDisk,
        disk: { ...rootProvisionAdditionalDisk?.disk, disk: { bus: DiskBus.SATA.getValue() } },
      }),
    );
    dispatch(
      vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
        ...rootCdRom,
        volume,
        disk,
      }),
    );
  }
};

const cdromImportUpdater = ({ id, prevState, dispatch, getState }: UpdateOptions) => {
  const state = getState();
  const isCdRom = iGetVmSettingValue(state, id, VMSettingsField.IS_CDROM_BOOT_SOURCE);

  if (
    !hasStoragesChanged(prevState, state, id) &&
    !hasVMSettingsValueChanged(prevState, state, id, VMSettingsField.IS_CDROM_BOOT_SOURCE)
  ) {
    return;
  }

  const storages = getStorages(state, id);
  // This is relevant when cdRom comes as false (unchecked in simple wizard)
  // And we set the checkbox to true on advanced wizard
  const rootStorage = storages?.find(
    ({ type, disk }) =>
      type === VMWizardStorageType.PROVISION_SOURCE_DISK && disk?.name === ROOT_DISK_NAME,
  );
  // This is relevant when cdRom comes as true (checked in simple wizard)
  const additionalDiskStorage = storages?.find(
    ({ type, disk }) =>
      type === VMWizardStorageType.PROVISION_SOURCE_ADDITIONAL_DISK &&
      disk?.name === ROOT_DISK_NAME,
  );
  const installCdromStorage = storages?.find(
    ({ type, disk }) =>
      type === VMWizardStorageType.PROVISION_SOURCE_DISK &&
      disk?.name === ROOT_DISK_INSTALL_NAME &&
      disk?.cdrom,
  );
  if (isCdRom && rootStorage) {
    const disk = new DiskWrapper(rootStorage?.disk)
      .setType(DiskType.CDROM, { bus: DiskBus.SATA })
      .setName(ROOT_DISK_INSTALL_NAME)
      .asResource();
    const volume = new VolumeWrapper(rootStorage?.volume)
      .setName(ROOT_DISK_INSTALL_NAME)
      .asResource();

    // Modify rootdisk storage to CD-ROM
    dispatch(
      vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
        ...rootStorage,
        volume,
        disk,
      }),
    );
    // Add additional storage
    if (!additionalDiskStorage) {
      const dvWrapper = new DataVolumeWrapper(rootStorage?.dataVolume, true);
      dispatch(
        vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
          id: getNextIDResolver(storages),
          type: VMWizardStorageType.PROVISION_SOURCE_ADDITIONAL_DISK,
          ...getEmptyAdditionalStorage(
            dvWrapper.getStorageClassName(),
            [AccessMode.fromString(dvWrapper?.getAccessModes()?.[0])],
            VolumeMode.fromString(dvWrapper?.getVolumeMode()),
          ),
        }),
      );
    }
  } else if (!isCdRom && installCdromStorage) {
    if (additionalDiskStorage) {
      dispatch(
        vmWizardInternalActions[InternalActionType.RemoveStorage](id, additionalDiskStorage.id),
      );
    }
    const disk = new DiskWrapper(installCdromStorage?.disk)
      .setType(DiskType.DISK, { bus: DiskBus.VIRTIO.getValue() })
      .setName(ROOT_DISK_NAME)
      .asResource();
    const volume = new VolumeWrapper(installCdromStorage?.volume)
      .setName(ROOT_DISK_NAME)
      .asResource();

    // Modify rootdisk storage to CD-ROM
    dispatch(
      vmWizardInternalActions[InternalActionType.UpdateStorage](id, {
        ...installCdromStorage,
        volume,
        disk,
      }),
    );
  }
};

export const updateStorageTabState = (options: UpdateOptions) =>
  [
    prefillInitialDiskUpdater,
    windowsToolsUpdater,
    internalStorageDiskBusUpdater,
    initialDefaultStorageClassUpdater,
    initialStorageClassUpdater,
    initialStorageDiskUpdater,
    initialStorageWindowsPVCUpdater,
    initialStorageCdromImportUpdater,
    cdromImportUpdater,
  ].forEach((updater) => {
    updater && updater(options);
  });
