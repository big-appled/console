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

import { DataExportModel } from '../models';
import { DataExportKind } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(DataExportModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // backupjobRef
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // retention
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // stopTimestamp
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const DataExportTableRow: React.FC<RowFunctionArgs<DataExportKind>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(DataExportModel)} name={obj?.metadata.name} namespace={obj?.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={tableColumnClasses[1]}>{obj?.spec?.backupJobRef?.name}</TableData>
        <TableData className={tableColumnClasses[2]}>{obj?.spec?.policy?.retention}</TableData>
        <TableData className={tableColumnClasses[3]}><Timestamp timestamp={obj?.status?.stopTimestamp}/></TableData>
        <TableData className={tableColumnClasses[4]}>{obj?.status?.phase}</TableData>
        <TableData className={tableColumnClasses[5]}><Timestamp timestamp={obj?.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[6]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(DataExportModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const DataExportList: React.FC = (props) => {
    const { t } = useTranslation();
    const DataExportTableHeader = () => {
      return [
        {
          title: t('public~Name'),
          sortField: 'metadata.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[0] },
        },
        {
            title: t('public~backupJobRef'),
            sortField: 'spec.backupJobRef.name',
            transforms: [sortable],
            props: { className: tableColumnClasses[1] },
        },
        {
            title: t('public~Retention'),
            sortField: 'spec.policy.retention',
            transforms: [sortable],
            props: { className: tableColumnClasses[2] },
        },
        {
            title: t('public~Expire Time'),
            sortField: 'status.stopTimestamp',
            transforms: [sortable],
            props: { className: tableColumnClasses[3] },
        },
        {
          title: t('public~Status'),
          sortField: 'status.phase',
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
        aria-label={t('public~DataExports')}
        Header={DataExportTableHeader}
        Row={DataExportTableRow}
        virtualize
      />
    );
};

export const DataExportListPage: React.FC<DataExportPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(DataExportModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~DataExports')}
        kind={referenceForModel(DataExportModel)}
        ListComponent={DataExportList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create DataExport')}
        />
    );
};

export type DataExportPageProps = {
    filterLabel: string;
    namespace: string;
};
