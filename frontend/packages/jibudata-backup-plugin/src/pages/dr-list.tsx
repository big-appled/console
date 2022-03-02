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

import { DrModel } from '../models';
import { DrKind } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(DrModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // primary cluster
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // secondary cluster
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // dr config
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const DrTableRow: React.FC<RowFunctionArgs<DrKind>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(DrModel)} name={obj.metadata.name} namespace={obj.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
          {obj.status?.primaryState?.name + " " + obj.status?.primaryState?.status}
        </TableData>
        <TableData className={tableColumnClasses[2]}> 
          {obj.status?.secondaryState?.name + " " + obj.status?.secondaryState?.status}
        </TableData>
        <TableData className={tableColumnClasses[3]}>{obj.spec?.drConfig?.name}</TableData>
        <TableData className={tableColumnClasses[4]}>{obj.status?.state}</TableData>
        <TableData className={tableColumnClasses[5]}><Timestamp timestamp={obj.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[6]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(DrModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const DrList: React.FC = (props) => {
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
          title: t('public~Primary'),
          sortField: 'status.primaryState.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[1] },
        },
        {
            title: t('public~Secondary'),
            sortField: 'status.secondaryState.name',
            transforms: [sortable],
            props: { className: tableColumnClasses[2] },
        },
        {
            title: t('public~Config'),
            sortField: 'spec.drConfig.name',
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
        aria-label={t('public~Drs')}
        Header={DrTableHeader}
        Row={DrTableRow}
        virtualize
      />
    );
};

export const DrListPage: React.FC<DrPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(DrModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~Drs')}
        kind={referenceForModel(DrModel)}
        ListComponent={DrList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create Dr')}
        />
    );
};

export type DrPageProps = {
    filterLabel: string;
    namespace: string;
};
