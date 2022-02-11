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

import { BackupModel } from '../models';
import { BackupKind } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(BackupModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // srcClusterRef
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // repeat
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // copyMethod
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // exportData
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const BackupTableRow: React.FC<RowFunctionArgs<BackupKind>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(BackupModel)} name={obj.metadata.name} namespace={obj.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
          {obj.spec.srcClusterRef?.name}
        </TableData>
        <TableData className={tableColumnClasses[2]}>{obj.spec?.policy?.repeat? "True": "False"}</TableData>
        <TableData className={tableColumnClasses[3]}>{obj.spec?.policy?.copyMethod}</TableData>
        <TableData className={tableColumnClasses[4]}>{obj.spec?.exportPolicy?.exportData? "True": "False"}</TableData>
        <TableData className={tableColumnClasses[5]}>{obj.status?.state}</TableData>
        <TableData className={tableColumnClasses[6]}><Timestamp timestamp={obj.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[7]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(BackupModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const BackupList: React.FC = (props) => {
    const { t } = useTranslation();
    const BackupTableHeader = () => {
      return [
        {
          title: t('public~Name'),
          sortField: 'metadata.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[0] },
        },
        {
          title: t('public~srcCluster'),
          sortField: 'spec.srcClusterRef.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[1] },
        },
        {
            title: t('public~Repeat'),
            sortField: 'spec.policy.repeat',
            transforms: [sortable],
            props: { className: tableColumnClasses[2] },
        },
        {
            title: t('public~CopyMethod'),
            sortField: 'spec.policy.copyMethod',
            transforms: [sortable],
            props: { className: tableColumnClasses[3] },
        },
        {
            title: t('public~ExportData'),
            sortField: 'spec.exportPolicy.exportData',
            transforms: [sortable],
            props: { className: tableColumnClasses[4] },
        },
        {
          title: t('public~Status'),
          sortField: 'status.state',
          transforms: [sortable],
          props: { className: tableColumnClasses[5] },
        },
        {
            title: t('public~Created at'),
            sortField: 'metadata.creationTimestamp',
            transforms: [sortable],
            props: { className: tableColumnClasses[6] },
          },
        {
          title: '',
          props: { className: tableColumnClasses[7] },
        },
      ];
    };
    return (
      <Table
        {...props}
        aria-label={t('public~Backups')}
        Header={BackupTableHeader}
        Row={BackupTableRow}
        virtualize
      />
    );
};

export const BackupListPage: React.FC<BackupPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(BackupModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~Backups')}
        kind={referenceForModel(BackupModel)}
        ListComponent={BackupList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create Backup')}
        />
    );
};

export type BackupPageProps = {
    filterLabel: string;
    namespace: string;
};
