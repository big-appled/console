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

import { MigHookModel } from '../models';
import { MigHookKind } from '../types';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(MigHookModel), ...common];

const tableColumnClasses = [
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // name
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // custom
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // operation
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // status
    'pf-m-hidden pf-m-visible-on-md pf-u-w-16-on-md', // creation timestamp
    Kebab.columnClass,
];

const MigHookTableRow: React.FC<RowFunctionArgs<MigHookKind>> = ({ obj }) => {
    return (
      <>
        <TableData className={classNames(tableColumnClasses[0], 'co-break-word')}>
          <ResourceLink kind={referenceForModel(MigHookModel)} name={obj?.metadata.name} namespace={obj?.metadata.namespace}>
          </ResourceLink>
        </TableData>
        <TableData className={tableColumnClasses[1]}>{obj?.spec?.custom? "True": "False"}</TableData>
        <TableData className={tableColumnClasses[2]}>{obj?.spec?.operation}</TableData>
        <TableData className={tableColumnClasses[3]}>{obj?.status?.conditions?.[0]?.type}</TableData>
        <TableData className={tableColumnClasses[4]}><Timestamp timestamp={obj?.metadata.creationTimestamp} /></TableData>
        <TableData className={tableColumnClasses[5]}>
          <ResourceKebab actions={menuActions} kind={referenceForModel(MigHookModel)} resource={obj} />
        </TableData>
      </>
    );
};

export const MigHookList: React.FC = (props) => {
    const { t } = useTranslation();
    const MigHookTableHeader = () => {
      return [
        {
          title: t('public~Name'),
          sortField: 'metadata.name',
          transforms: [sortable],
          props: { className: tableColumnClasses[0] },
        },
        {
            title: t('public~Customized'),
            sortField: 'spec.custom',
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
          sortField: 'status.conditions[0].type',
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
        aria-label={t('public~MigHooks')}
        Header={MigHookTableHeader}
        Row={MigHookTableRow}
        virtualize
      />
    );
};

export const MigHookListPage: React.FC<MigHookPageProps> = (props) => {
    const createProps = {
        to: `/k8s/ns/${props.namespace || 'default'}/${referenceForModel(MigHookModel)}/~new`,
    };
    const { t } = useTranslation();
    return (
        <ListPage
        {..._.omit(props, 'mock')}
        title={t('public~MigHooks')}
        kind={referenceForModel(MigHookModel)}
        ListComponent={MigHookList}
        canCreate={true}
        filterLabel={props.filterLabel}
        createProps={createProps}
        createButtonText={t('public~Create MigHook')}
        />
    );
};

export type MigHookPageProps = {
    filterLabel: string;
    namespace: string;
};
