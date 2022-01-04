import * as _ from 'lodash';
import { K8sModel } from '../../../api/common-types';
import * as k8sActions from '../../../app/k8s/actions/k8s';
import { SDKStoreState } from '../../../app/redux-types';
import { WatchK8sResource } from '../../../extensions/console-types';
import { CustomError } from '../../error/custom-error';
import { getReferenceForModel } from '../k8s-ref';
import { GetIDAndDispatch, MakeQuery, Query } from './k8s-watch-types';

export class NoModelError extends CustomError {
  constructor() {
    super('Model does not exist');
  }
}

export const makeReduxID = (k8sKind: K8sModel, query: Query, cluster?: string): string => {
  let qs = '';
  if (!_.isEmpty(query)) {
    qs = `---${JSON.stringify(query)}`;
  }

  return `${cluster || 'local-cluster'}:${getReferenceForModel(k8sKind || ({} as K8sModel))}${qs}`;
};

export const makeQuery: MakeQuery = (namespace, labelSelector, fieldSelector, name, limit) => {
  const query: Query = {};

  if (!_.isEmpty(labelSelector)) {
    query.labelSelector = labelSelector;
  }

  if (!_.isEmpty(namespace)) {
    query.ns = namespace;
  }

  if (!_.isEmpty(name)) {
    query.name = name;
  }

  if (fieldSelector) {
    query.fieldSelector = fieldSelector;
  }

  if (limit) {
    query.limit = limit;
  }

  return query;
};

export const getReduxData = (immutableData, resource: WatchK8sResource) => {
  if (!immutableData) {
    return null;
  }
  if (resource.isList) {
    return immutableData.toArray().map((a) => a.toJSON());
  }
  if (immutableData.toJSON) {
    return immutableData.toJSON();
  }
  return null;
};

export const getIDAndDispatch: GetIDAndDispatch<SDKStoreState> = (resource, k8sModel, cluster) => {
  if (!k8sModel || !resource) {
    return null;
  }
  const query = makeQuery(
    resource.namespace,
    resource.selector,
    resource.fieldSelector,
    resource.name,
    resource.limit,
  );
  const targetCluster = resource.cluster ?? cluster;
  const id = makeReduxID(k8sModel, query, targetCluster);
  const dispatch = resource.isList
    ? k8sActions.watchK8sList(id, { ...query, cluster: targetCluster }, k8sModel)
    : k8sActions.watchK8sObject(
        id,
        resource.name,
        resource.namespace,
        { ...query, cluster: targetCluster },
        k8sModel,
      );
  return { id, dispatch };
};
