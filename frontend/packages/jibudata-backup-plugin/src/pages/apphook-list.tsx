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

import { AppHookModel } from '../models';
import { AppHookKind } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(AppHookModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // appProvider
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // operationType
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // secret name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const AppHookTableRow: React.FC<RowFunctionArgs<AppHookKind>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(AppHookModel)} name={obj?.metadata.name} namespace={obj?.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={tableColumnClasses[1]}>{obj?.spec?.appProvider}</TableData>
        <TableData className={tableColumnClasses[2]}>{obj?.spec?.operationType}</TableData>
        <TableData className={tableColumnClasses[3]}>{obj?.spec?.secret?.name}</TableData>
        <TableData className={tableColumnClasses[4]}>{obj?.status?.phase}</TableData>
        <TableData className={tableColumnClasses[5]}><Timestamp timestamp={obj?.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[6]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(AppHookModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const AppHookList: React.FC = (props) => {
    const { t } = useTranslation();
    const AppHookTableHeader = () => {
      return [
        {
          title: t('public~Name'),
          sortField: 'metadata.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[0] },
        },
        {
            title: t('public~Provider'),
            sortField: 'spec.appProvider',
            transforms: [sortable],
            props: { className: tableColumnClasses[1] },
        },
        {
            title: t('public~Operation'),
            sortField: 'spec.operationType',
            transforms: [sortable],
            props: { className: tableColumnClasses[2] },
        },
        {
            title: t('public~Secret'),
            sortField: 'spec.secret.name',
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
        aria-label={t('public~AppHooks')}
        Header={AppHookTableHeader}
        Row={AppHookTableRow}
        virtualize
      />
    );
};

export const AppHookListPage: React.FC<AppHookPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(AppHookModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~AppHooks')}
        kind={referenceForModel(AppHookModel)}
        ListComponent={AppHookList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create AppHook')}
        />
    );
};

export type AppHookPageProps = {
    filterLabel: string;
    namespace: string;
};
