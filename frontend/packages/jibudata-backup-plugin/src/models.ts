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