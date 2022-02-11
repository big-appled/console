import { K8sKind } from '@console/internal/module/k8s';

export const BackupModel: K8sKind = {
  kind: 'Backup',
  label: 'Backup',
  labelPlural: 'backups',
  apiGroup: 'migration.yinhestor.com',
  apiVersion: 'v1alpha1',
  abbr: 'BKP',
  namespaced: true,
  crd: true,
  plural: 'backups',
};

export const BackupJobModel: K8sKind = {
    kind: 'BackupJob',
    label: 'BackupJob',
    labelPlural: 'backupjobs',
    apiGroup: 'migration.yinhestor.com',
    apiVersion: 'v1alpha1',
    abbr: 'BKPJ',
    namespaced: true,
    crd: true,
    plural: 'backupjobs',
};

export const DataExportModel: K8sKind = {
    kind: 'DataExport',
    label: 'DataExport',
    labelPlural: 'dataexports',
    apiGroup: 'migration.yinhestor.com',
    apiVersion: 'v1alpha1',
    abbr: 'DXP',
    namespaced: true,
    crd: true,
    plural: 'dataexports',
};

export const MigHookModel: K8sKind = {
    kind: 'MigHook',
    label: 'MigHook',
    labelPlural: 'mighooks',
    apiGroup: 'migration.yinhestor.com',
    apiVersion: 'v1alpha1',
    abbr: 'HK',
    namespaced: true,
    crd: true,
    plural: 'mighooks',
};

export const AppHookModel: K8sKind = {
    kind: 'AppHook',
    label: 'AppHook',
    labelPlural: 'apphooks',
    apiGroup: 'ys.jibudata.com',
    apiVersion: 'v1alpha1',
    abbr: 'AHK',
    namespaced: true,
    crd: true,
    plural: 'apphooks',
};

export const VeleroBackupModel: K8sKind = {
    kind: 'Backup',
    label: 'Backup',
    labelPlural: 'backups',
    apiGroup: 'velero.io',
    apiVersion: 'v1',
    abbr: 'VBKP',
    namespaced: true,
    crd: true,
    plural: 'backups',
};


