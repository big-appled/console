export const CEPH_HEALTHY = 'is healthy';
export const CEPH_DEGRADED = 'health is degraded';
export const CEPH_ERROR = 'health is in error state';
export const CEPH_UNKNOWN = 'is not available';
export const CEPH_BRAND_NAME = 'Red Hat Ceph Storage';
export const CEPH_STORAGE_NAMESPACE = 'openshift-storage';
export const PROJECTS = 'Projects';
export const STORAGE_CLASSES = 'Storage Classes';
export const PODS = 'Pods';
export const BY_USED = 'By Used Capacity';
export const BY_REQUESTED = 'By Requested Capacity';
export const OCS_OPERATOR = 'ocs-operator';
export const ODF_OPERATOR = 'odf-operator';
export const LSO_OPERATOR = 'local-storage-operator';
export const OCS_EXTERNAL_CR_NAME = 'ocs-external-storagecluster';
export const OCS_INTERNAL_CR_NAME = 'ocs-storagecluster';
export const NO_PROVISIONER = 'kubernetes.io/no-provisioner';
export const OCS_SUPPORT_ANNOTATION = 'features.ocs.openshift.io/enabled';
export const ODF_VENDOR_ANNOTATION = 'vendors.odf.openshift.io/kind';
export const OCS_DEVICE_SET_REPLICA = 3;
export const OCS_DEVICE_SET_ARBITER_REPLICA = 4;
export const OCS_DEVICE_SET_FLEXIBLE_REPLICA = 1;
export const ATTACHED_DEVICES_ANNOTATION = 'cluster.ocs.openshift.io/local-devices';
export const DASHBOARD_LINK = '/ocs-dashboards';
export const AVAILABLE = 'Available';
export const OSD_REMOVAL_TEMPLATE = 'ocs-osd-removal';
export const PVC_PROVISIONER_ANNOTATION = 'volume.beta.kubernetes.io/storage-provisioner';
export const CEPH_INTERNAL_CR_NAME = 'ocs-storagecluster-cephcluster';
export const CEPH_EXTERNAL_CR_NAME = 'ocs-external-storagecluster-cephcluster';
export const RGW_PROVISIONER = 'openshift-storage.ceph.rook.io/bucket';
export const NOOBAA_PROVISIONER = 'openshift-storage.noobaa.io/obc';
export const OSD_DOWN_ALERT = 'CephOSDDiskNotResponding';
export const OSD_DOWN_AND_OUT_ALERT = 'CephOSDDiskUnavailable';
export const MINIMUM_NODES = 3;
export const SECOND = 1000;
export const OCS_NS = 'openshift-storage';
export const NB_PROVISIONER = 'noobaa.io/obc';
export const ODF_MANAGED_LABEL = 'odf-managed-service';
export enum StoreType {
  BS = 'BackingStore',
  NS = 'NamespaceStore',
}
export const ODF_MODEL_FLAG = 'ODF_FLAG';
