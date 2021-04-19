import { commonFlows } from '../views/common';
import { store, Providers, testName } from '../views/store';
import { checkErrors } from '../../../integration-tests-cypress/support';

describe('Tests creation of Backing Stores', () => {
  before(() => {
    cy.login();
    cy.visit('/');
    cy.install();
  });

  after(() => {
    cy.logout();
  });

  afterEach(() => {
    cy.byLegacyTestID('actions-menu-button').click();
    cy.byTestActionID('Delete Backing Store').click();
    cy.byTestID('confirm-action').click();
    checkErrors();
  });

  beforeEach(() => {
    cy.visit('/');
    commonFlows.navigateToOCS();
    cy.byLegacyTestID('horizontal-link-Backing Store').click();
    cy.byTestID('item-create').click();
  });

  it('Test creation of AWS backing store', () => {
    store.createStore(Providers.AWS);
    cy.byLegacyTestID('resource-title').contains(testName);
    cy.exec(`oc delete secrets ${testName}-secret -n openshift-storage`);
  });

  it('Test creation of Azure backing store', () => {
    store.createStore(Providers.AZURE);
    cy.byLegacyTestID('resource-title').contains(testName);
    cy.exec(`oc delete secrets ${testName}-secret -n openshift-storage`);
  });

  it('Test creation of S3 Endpoint Type', () => {
    store.createStore(Providers.S3);
    cy.byLegacyTestID('resource-title').contains(testName);
    cy.exec(`oc delete secrets ${testName}-secret -n openshift-storage`);
  });

  it('Test creation of PVC Endpoint Type', () => {
    store.createStore(Providers.PVC);
    cy.byLegacyTestID('resource-title').contains(testName);
  });
});
