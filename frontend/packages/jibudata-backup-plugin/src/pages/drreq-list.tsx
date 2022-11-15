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

import { DrRequestModel } from '../models';
import { DrOperationRequest } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(DrRequestModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // dr instance name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // operation
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const DrReqTableRow: React.FC<RowFunctionArgs<DrOperationRequest>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(DrRequestModel)} name={obj.metadata.name} namespace={obj.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
          {obj.spec.drInstanceName}
        </TableData>
        <TableData className={tableColumnClasses[2]}> 
          {obj.spec.operation}
        </TableData>
        <TableData className={tableColumnClasses[3]}>{obj.status?.phase}</TableData>
        <TableData className={tableColumnClasses[4]}><Timestamp timestamp={obj.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[5]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(DrRequestModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const DrReqList: React.FC = (props) => {
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
            title: t('public~Operation'),
            sortField: 'spec.operation',
            transforms: [sortable],
            props: { className: tableColumnClasses[2] },
        },
        {
          title: t('public~Status'),
          sortField: 'status.phase',
          transforms: [sortable],
          props: { className: tableColumnClasses[3] },
        },
        {
            title: t('public~Created at'),
            sortField: 'metadata.creationTimestamp',
            transforms: [sortable],
            props: { className: tableColumnClasses[4] },
          },
        {
          title: '',
          props: { className: tableColumnClasses[5] },
        },
      ];
    };
    return (
      <Table
        {...props}
        aria-label={t('public~DrRequests')}
        Header={DrTableHeader}
        Row={DrReqTableRow}
        virtualize
      />
    );
};

export const DrRequestListPage: React.FC<DrReqPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(DrRequestModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~DrRequests')}
        kind={referenceForModel(DrRequestModel)}
        ListComponent={DrReqList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create Dr Request')}
        />
    );
};

export type DrReqPageProps = {
    filterLabel: string;
    namespace: string;
};
