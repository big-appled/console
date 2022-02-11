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

import { BackupJobModel } from '../models';
import { BackupJobKind } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(BackupJobModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // srcClusterRef
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // backupRef
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // exportData
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // exportResult.exportStatus
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // stopTimestamp
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const BackupJobTableRow: React.FC<RowFunctionArgs<BackupJobKind>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(BackupJobModel)} name={obj?.metadata.name} namespace={obj?.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
          {obj.metadata?.labels?.["migcluster.yinhestor.com/cluster-name"]}
        </TableData>
        <TableData className={tableColumnClasses[2]}>{obj?.spec?.backupRef?.name}</TableData>
        <TableData className={tableColumnClasses[3]}>{obj?.spec?.exportData? "True": "False"}</TableData>
        <TableData className={tableColumnClasses[4]}>{obj?.status?.exportResult?.ExportStatus}</TableData>
        <TableData className={tableColumnClasses[5]}><Timestamp timestamp={obj?.status?.stopTimestamp}/></TableData>
        <TableData className={tableColumnClasses[6]}>{obj?.status?.phase + " " + obj?.status?.itinerary}</TableData>
        <TableData className={tableColumnClasses[7]}><Timestamp timestamp={obj?.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[8]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(BackupJobModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const BackupJobList: React.FC = (props) => {
    const { t } = useTranslation();
    const BackupJobTableHeader = () => {
      return [
        {
          title: t('public~Name'),
          sortField: 'metadata.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[0] },
        },
        {
          title: t('public~srcCluster'),
          sortField: 'metadata.labels["migcluster.yinhestor.com/cluster-name"]',
          transforms: [sortable],
          props: { className: tableColumnClasses[1] },
        },
        {
            title: t('public~backupRef'),
            sortField: 'spec.backupRef.name',
            transforms: [sortable],
            props: { className: tableColumnClasses[2] },
        },
        {
            title: t('public~ExportData'),
            sortField: 'spec.exportData',
            transforms: [sortable],
            props: { className: tableColumnClasses[3] },
        },
        {
            title: t('public~ExportStatus'),
            sortField: 'status.exportResult.ExportStatus',
            transforms: [sortable],
            props: { className: tableColumnClasses[4] },
        },
        {
            title: t('public~Expire Time'),
            sortField: 'status.stopTimestamp',
            transforms: [sortable],
            props: { className: tableColumnClasses[5] },
        },
        {
          title: t('public~Status'),
          sortField: 'status.phase',
          transforms: [sortable],
          props: { className: tableColumnClasses[6] },
        },
        {
            title: t('public~Created at'),
            sortField: 'metadata.creationTimestamp',
            transforms: [sortable],
            props: { className: tableColumnClasses[7] },
          },
        {
          title: '',
          props: { className: tableColumnClasses[8] },
        },
      ];
    };
    return (
      <Table
        {...props}
        aria-label={t('public~BackupJobs')}
        Header={BackupJobTableHeader}
        Row={BackupJobTableRow}
        virtualize
      />
    );
};

export const BackupJobListPage: React.FC<BackupJobPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(BackupJobModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~BackupJobs')}
        kind={referenceForModel(BackupJobModel)}
        ListComponent={BackupJobList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create BackupJob')}
        />
    );
};

export type BackupJobPageProps = {
    filterLabel: string;
    namespace: string;
};
