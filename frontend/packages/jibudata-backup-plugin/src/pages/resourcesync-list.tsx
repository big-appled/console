import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { ListPage, Table, TableData, RowFunctionArgs } from '@console/internal/components/factory';
import {
    Kebab,
    ResourceKebab,
    ResourceLink,
    Timestamp,
} from '@console/internal/components/utils';
import {
    referenceForModel,
} from '@console/internal/module/k8s';

import { DrResourceSyncModel } from '../models';
import { ResourceSync } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(DrResourceSyncModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // dr instance name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // primaryName
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // phase
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const ResourceSyncTableRow: React.FC<RowFunctionArgs<ResourceSync>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(DrResourceSyncModel)} name={obj.metadata.name} namespace={obj.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
          {obj.spec.drInstanceName}
        </TableData>
        <TableData className={tableColumnClasses[2]}> 
          {obj.spec.primaryName}
        </TableData>
        <TableData className={tableColumnClasses[3]}> 
          {obj.status.phase}
        </TableData>
        <TableData className={tableColumnClasses[4]}>{obj.status?.state}</TableData>
        <TableData className={tableColumnClasses[5]}><Timestamp timestamp={obj.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[6]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(DrResourceSyncModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const ResourceSyncList: React.FC = (props) => {
    const { t } = useTranslation();
    const DrTableHeader = () => {
      return [
        {
          title: t('public~Name'),
          sortField: 'metadata.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[0] },
        },
        {
          title: t('public~DrInstance'),
          sortField: 'spec.drInstanceName',
          transforms: [sortable],
          props: { className: tableColumnClasses[1] },
        },
        {
            title: t('public~PrimaryName'),
            sortField: 'spec.primaryName',
            transforms: [sortable],
            props: { className: tableColumnClasses[2] },
        },
        {
            title: t('public~Phase'),
            sortField: 'status.phase',
            transforms: [sortable],
            props: { className: tableColumnClasses[3] },
        },
        {
          title: t('public~Status'),
          sortField: 'status.state',
          transforms: [sortable],
          props: { className: tableColumnClasses[4] },
        },
        {
            title: t('public~Created at'),
            sortField: 'metadata.creationTimestamp',
            transforms: [sortable],
            props: { className: tableColumnClasses[5] },
          },
        {
          title: '',
          props: { className: tableColumnClasses[6] },
        },
      ];
    };
    return (
      <Table
        {...props}
        aria-label={t('public~ResourceSync')}
        Header={DrTableHeader}
        Row={ResourceSyncTableRow}
        virtualize
      />
    );
};

export const ResourceSyncListPage: React.FC<ResourceSyncPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(DrResourceSyncModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~ResourceSync')}
        kind={referenceForModel(DrResourceSyncModel)}
        ListComponent={ResourceSyncList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create ResourceSync')}
        />
    );
};

export type ResourceSyncPageProps = {
    filterLabel: string;
    namespace: string;
};
