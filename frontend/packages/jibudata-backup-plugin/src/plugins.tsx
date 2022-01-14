import * as _ from 'lodash';
import { ClusterOperator } from '@console/internal/module/k8s';
import {
  Plugin,
  ModelDefinition,
  RoutePage,
  KebabActions,
  DashboardsOverviewResourceActivity,
  DashboardsOverviewHealthURLSubsystem,
  DashboardsOverviewHealthPrometheusSubsystem,
  DashboardsOverviewInventoryItem,
  DashboardsOverviewHealthOperator,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceTabPage,
} from '@console/plugin-sdk';
import * as models from './models';

type ConsumedExtensions =
  | ModelDefinition
  | RoutePage
  | KebabActions
  | DashboardsOverviewResourceActivity
  | DashboardsOverviewHealthURLSubsystem<any>
  | DashboardsOverviewHealthPrometheusSubsystem
  | DashboardsOverviewInventoryItem
  | DashboardsOverviewHealthOperator<ClusterOperator>
  | ResourceListPage
  | ResourceDetailsPage
  | ResourceTabPage;

const plugin: Plugin<ConsumedExtensions> = [
  {
    type: 'ModelDefinition',
    properties: {
      models: _.values(models),
    },
  },
];

export default plugin;